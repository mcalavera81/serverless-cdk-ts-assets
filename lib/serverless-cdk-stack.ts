import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as lambdaNode from '@aws-cdk/aws-lambda-nodejs';
import * as apiGW from '@aws-cdk/aws-apigatewayv2';
import * as apiGWIntegrations from '@aws-cdk/aws-apigatewayv2-integrations';


export class ServerlessCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'Table', {
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    const postFunction = new lambdaNode.NodejsFunction(this, 'PostFunction', {
      runtime: lambda.Runtime.NODEJS_12_X,
      // name of the exported function
      handler: 'post',
      // file to use as entry point for our Lambda function
      entry: __dirname + '/../lambda/lib/tasks.ts',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    // Grant full access to the data
    table.grantReadWriteData(postFunction);  
    
    const getFunction = new lambdaNode.NodejsFunction(this, 'GetFunction', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'get',
      entry: __dirname + '/../lambda/lib/tasks.ts',
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    // Grant only read access for this function
    table.grantReadData(getFunction);
    
    const api = new apiGW.HttpApi(this, 'Api');

    api.addRoutes({
      path: '/tasks',
      methods: [apiGW.HttpMethod.POST],
      integration: new apiGWIntegrations.LambdaProxyIntegration({handler: postFunction})
    });
    api.addRoutes({
      path: '/tasks',
      methods: [apiGW.HttpMethod.GET],
      integration: new apiGWIntegrations.LambdaProxyIntegration({handler: getFunction})
    });
    
    new cdk.CfnOutput(this, 'TableName', {value: table.tableName});
    new cdk.CfnOutput(this, 'ApiUrl', {value: api.url!});


  }
}
