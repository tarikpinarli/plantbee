import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

interface CicdStackProps extends cdk.StackProps {
  githubOwner: string;
  githubRepo: string;
  branch: string;
}

export class CicdStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CicdStackProps) {
    super(scope, id, props);

    const provider = new iam.OpenIdConnectProvider(this, 'GithubOidc', {
      url: 'https://token.actions.githubusercontent.com',
      clientIds: ['sts.amazonaws.com'],
    });

    const subjectClaims = [
      `repo:${props.githubOwner}/${props.githubRepo}:ref:refs/heads/${props.branch}`,
      `repo:${props.githubOwner}/${props.githubRepo}:environment:production`,
    ];

    const role = new iam.Role(this, 'GithubDeployRole', {
      roleName: 'plantbee-github-deploy',
      assumedBy: new iam.FederatedPrincipal(
        provider.openIdConnectProviderArn,
        {
          StringEquals: {
            'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
          },
          StringLike: {
            'token.actions.githubusercontent.com:sub': subjectClaims,
          },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
      managedPolicies: [iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
      maxSessionDuration: cdk.Duration.hours(1),
    });

    new cdk.CfnOutput(this, 'GithubDeployRoleArn', { value: role.roleArn });
  }
}
