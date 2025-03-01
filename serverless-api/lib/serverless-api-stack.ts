import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductsList = new lambda.Function(this, "getProductsList", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "getProductsList.handler",
      code: lambda.Code.fromAsset("lambda"),
      functionName: "getProductsList",
    });

    const getProductById = new lambda.Function(this, "getProductById", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "getProductById.handler",
      code: lambda.Code.fromAsset("lambda"),
      functionName: "getProductById",
    });

    const createProduct = new lambda.Function(this, "createProduct", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "createProduct.handler",
      code: lambda.Code.fromAsset("lambda"),
      functionName: "createProduct",
    });

    [getProductsList, getProductById, createProduct].forEach((lambdaFn) => {
      lambdaFn.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "dynamodb:*",
          ],
          resources: ["*"],
        })
      );
    });

    const api = new apigateway.RestApi(this, "ProductsApi", {
      restApiName: "Products Service API",
      deployOptions: {
        stageName: "dev",
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const productsResource = api.root.addResource("products");
    productsResource.addMethod("GET", new apigateway.LambdaIntegration(getProductsList));
    productsResource.addMethod("POST", new apigateway.LambdaIntegration(createProduct));

    const productByIdResource = productsResource.addResource("{productId}");
    productByIdResource.addMethod("GET", new apigateway.LambdaIntegration(getProductById));
  }
}
