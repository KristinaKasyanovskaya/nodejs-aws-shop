import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class ServerlessApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const getProductsListLambda = new lambda.Function(this, 'GetProductsListHandler', {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset('lambda'),
            handler: 'getProductsList.handler',
        });

        const getProductsByIdLambda = new lambda.Function(this, 'GetProductsByIdHandler', {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset('lambda'),
            handler: 'getProductsById.handler',
        });

        const api = new apigateway.RestApi(this, 'ProductsApi', {
            restApiName: 'Products Service',
        });

        const productsResource = api.root.addResource('products');
        productsResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsListLambda));

        const productResource = productsResource.addResource('{productId}');
        productResource.addMethod('GET', new apigateway.LambdaIntegration(getProductsByIdLambda));
    }
}
