import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as efs from 'aws-cdk-lib/aws-efs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

interface BackendStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  database: rds.DatabaseInstance;
  dbUsername: string;
  dbName: string;
  dbPasswordParam: ssm.IStringParameter;
  repository: ecr.IRepository;
}

export class BackendStack extends cdk.Stack {
  readonly loadBalancerDnsName: string;

  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    const oauthClientIdParam = ssm.StringParameter.fromSecureStringParameterAttributes(
      this,
      'OAuthClientIdParam',
      { parameterName: '/plantbee/oauth/client_id' },
    );

    const oauthClientSecretParam = ssm.StringParameter.fromSecureStringParameterAttributes(
      this,
      'OAuthClientSecretParam',
      { parameterName: '/plantbee/oauth/client_secret' },
    );

    const sessionSecretParam = ssm.StringParameter.fromSecureStringParameterAttributes(
      this,
      'SessionSecretParam',
      { parameterName: '/plantbee/session/secret' },
    );

    const redirectUriParam = ssm.StringParameter.fromSecureStringParameterAttributes(
      this,
      'OAuthRedirectUriParam',
      { parameterName: '/plantbee/oauth/redirect_uri' },
    );

    const allowedOriginsParam = ssm.StringParameter.fromSecureStringParameterAttributes(
      this,
      'AllowedOriginsParam',
      { parameterName: '/plantbee/allowed_origins' },
    );

    const fileSystem = new efs.FileSystem(this, 'UploadsFs', {
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
      throughputMode: efs.ThroughputMode.BURSTING,
      encrypted: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const accessPoint = fileSystem.addAccessPoint('UploadsAp', {
      path: '/uploads',
      createAcl: { ownerUid: '1000', ownerGid: '1000', permissions: '0755' },
      posixUser: { uid: '1000', gid: '1000' },
    });

    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: props.vpc,
      containerInsightsV2: ecs.ContainerInsights.DISABLED,
    });

    const taskDef = new ecs.FargateTaskDefinition(this, 'ApiTaskDef', {
      cpu: 256,
      memoryLimitMiB: 512,
      volumes: [
        {
          name: 'uploads',
          efsVolumeConfiguration: {
            fileSystemId: fileSystem.fileSystemId,
            transitEncryption: 'ENABLED',
            authorizationConfig: {
              accessPointId: accessPoint.accessPointId,
              iam: 'ENABLED',
            },
          },
        },
      ],
    });

    fileSystem.grantRootAccess(taskDef.taskRole);
    fileSystem.grant(taskDef.taskRole, 'elasticfilesystem:ClientMount', 'elasticfilesystem:ClientWrite');

    const logGroup = new logs.LogGroup(this, 'ApiLogs', {
      logGroupName: '/plantbee/api',
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const dbHost = props.database.dbInstanceEndpointAddress;
    const dbPort = props.database.dbInstanceEndpointPort;

    const alb = new elbv2.ApplicationLoadBalancer(this, 'Alb', {
      vpc: props.vpc,
      internetFacing: true,
    });

    const container = taskDef.addContainer('api', {
      image: ecs.ContainerImage.fromEcrRepository(props.repository, 'latest'),
      logging: ecs.LogDriver.awsLogs({ streamPrefix: 'api', logGroup }),
      environment: {
        PORT: '8080',
        DB_HOST: dbHost,
        DB_PORT: dbPort,
        DB_USER: props.dbUsername,
        DB_NAME: props.dbName,
        UPLOAD_DIR: '/app/uploads',
      },
      secrets: {
        DB_PASSWORD: ecs.Secret.fromSsmParameter(props.dbPasswordParam),
        CLIENT_ID: ecs.Secret.fromSsmParameter(oauthClientIdParam),
        CLIENT_SECRET: ecs.Secret.fromSsmParameter(oauthClientSecretParam),
        SESSION_SECRET: ecs.Secret.fromSsmParameter(sessionSecretParam),
        REDIRECT_URI: ecs.Secret.fromSsmParameter(redirectUriParam),
        ALLOWED_ORIGINS: ecs.Secret.fromSsmParameter(allowedOriginsParam),
      },
      command: [
        'sh',
        '-c',
        'export DATABASE_URL="postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require"; exec /app/server',
      ],
      healthCheck: {
        command: ['CMD-SHELL', 'wget -qO- http://localhost:8080/health || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
        retries: 3,
        startPeriod: cdk.Duration.seconds(30),
      },
    });

    container.addPortMappings({ containerPort: 8080 });
    container.addMountPoints({
      containerPath: '/app/uploads',
      sourceVolume: 'uploads',
      readOnly: false,
    });

    const serviceSg = new ec2.SecurityGroup(this, 'ServiceSg', {
      vpc: props.vpc,
      description: 'plantbee API service',
      allowAllOutbound: true,
    });

    const service = new ecs.FargateService(this, 'ApiService', {
      cluster,
      taskDefinition: taskDef,
      desiredCount: 1,
      assignPublicIp: false,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [serviceSg],
      minHealthyPercent: 50,
      maxHealthyPercent: 200,
      circuitBreaker: { rollback: true },
    });

    fileSystem.connections.allowDefaultPortFrom(serviceSg);

    const dbSg = props.database.connections.securityGroups[0];
    if (dbSg) {
      new ec2.CfnSecurityGroupIngress(this, 'DbIngressFromService', {
        groupId: dbSg.securityGroupId,
        sourceSecurityGroupId: serviceSg.securityGroupId,
        ipProtocol: 'tcp',
        fromPort: 5432,
        toPort: 5432,
        description: 'Allow ECS service to reach Postgres',
      });
    }

    const listener = alb.addListener('HttpListener', {
      port: 80,
      open: true,
    });

    listener.addTargets('ApiTargets', {
      port: 8080,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [service],
      healthCheck: {
        path: '/health',
        healthyHttpCodes: '200',
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(5),
      },
      deregistrationDelay: cdk.Duration.seconds(30),
    });

    this.loadBalancerDnsName = alb.loadBalancerDnsName;

    new cdk.CfnOutput(this, 'ApiUrl', { value: `http://${alb.loadBalancerDnsName}` });
    new cdk.CfnOutput(this, 'EcsClusterName', { value: cluster.clusterName });
    new cdk.CfnOutput(this, 'EcsServiceName', { value: service.serviceName });
  }
}
