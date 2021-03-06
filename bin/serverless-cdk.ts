#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { ServerlessCdkStack } from '../lib/serverless-cdk-stack';

const app = new cdk.App();
new ServerlessCdkStack(app, 'ServerlessCdkStack',
    {
        env: {
        account: process.env.AWS_ACCOUNT,
        region: 'eu-central-1',
    }
});
