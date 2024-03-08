import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';


export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket
    const balanceStatusBucket = new s3.Bucket(this, 'BalanceStatusBucket', {
      bucketName: 'balance-status-410143457'
    });

    //IAM Role
    const iamBalanceStatusRole = new iam.Role(this, 'iamBalanceStatusRole',{
      roleName: 'iam-balance-statussrole',
      description: 'role for lambda to access S3 bucket',
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    })
    //Attach policy to this role
    iamBalanceStatusRole.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'));

    //Lambda 
    const getBalanceLambda = new lambda.Function(this, 'getBalanceLambda', {
      handler: 'lambda_function.lambda_handler_function',
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset('../services/'),
      role: iamBalanceStatusRole,
    })

    // API Gateway
    const balanceApiGateway = new apigateway.LambdaRestApi(this, 'balanceSpiGateway', {
      handler:  getBalanceLambda,
      restApiName: 'balance-status-api',
      deploy: true,
      proxy: false,
    })
    const bankstatus = balanceApiGateway.root.addResource('bankstatus');
    bankstatus.addMethod('GET');
    
  }
}
