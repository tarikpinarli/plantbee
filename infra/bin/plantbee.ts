#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CicdStack } from '../lib/cicd-stack';
import { NetworkStack } from '../lib/network-stack';
import { DatabaseStack } from '../lib/database-stack';
import { RegistryStack } from '../lib/registry-stack';
import { BackendStack } from '../lib/backend-stack';
import { FrontendStack } from '../lib/frontend-stack';

const app = new cdk.App();

const account = process.env.CDK_DEFAULT_ACCOUNT;
const region = process.env.CDK_DEFAULT_REGION ?? 'ap-northeast-2';
const env = { account, region };

const githubOwner = app.node.tryGetContext('githubOwner') ?? 'hyun-1324';
const githubRepo = app.node.tryGetContext('githubRepo') ?? 'plantbee';

new CicdStack(app, 'Plantbee-Cicd', {
  env,
  githubOwner,
  githubRepo,
  branch: 'production',
});

const registry = new RegistryStack(app, 'Plantbee-Registry', { env });

const network = new NetworkStack(app, 'Plantbee-Network', { env });

const database = new DatabaseStack(app, 'Plantbee-Database', {
  env,
  vpc: network.vpc,
});

const frontend = new FrontendStack(app, 'Plantbee-Frontend', { env });

new BackendStack(app, 'Plantbee-Backend', {
  env,
  vpc: network.vpc,
  database: database.instance,
  dbUsername: database.username,
  dbName: database.databaseName,
  dbPasswordParam: database.passwordParam,
  repository: registry.repository,
  allowedOrigins: [`https://${frontend.distributionDomainName}`],
});
