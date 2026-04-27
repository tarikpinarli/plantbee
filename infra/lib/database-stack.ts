import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

interface DatabaseStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
}

export class DatabaseStack extends cdk.Stack {
  readonly instance: rds.DatabaseInstance;
  readonly passwordParam: ssm.IStringParameter;
  readonly username = 'plantbee';
  readonly databaseName = 'plantbee';

  constructor(scope: Construct, id: string, props: DatabaseStackProps) {
    super(scope, id, props);

    this.passwordParam = ssm.StringParameter.fromSecureStringParameterAttributes(
      this,
      'DbPasswordParam',
      { parameterName: '/plantbee/db/password' },
    );

    this.instance = new rds.DatabaseInstance(this, 'Postgres', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_15,
      }),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      allocatedStorage: 20,
      maxAllocatedStorage: 100,
      databaseName: this.databaseName,
      credentials: rds.Credentials.fromPassword(
        this.username,
        cdk.SecretValue.ssmSecure(this.passwordParam.parameterName),
      ),
      backupRetention: cdk.Duration.days(7),
      deletionProtection: false,
      removalPolicy: cdk.RemovalPolicy.SNAPSHOT,
      storageEncrypted: true,
      publiclyAccessible: false,
      multiAz: true,
    });
  }
}
