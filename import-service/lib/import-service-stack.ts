import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sns from "aws-cdk-lib/aws-sns";
import * as snsSubscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3notifications from "aws-cdk-lib/aws-s3-notifications";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "ImportBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    const catalogItemsQueue = new sqs.Queue(this, "CatalogItemsQueue", {
      visibilityTimeout: cdk.Duration.seconds(30),
      receiveMessageWaitTime: cdk.Duration.seconds(10),
    });

    const createProductTopic = new sns.Topic(this, "CreateProductTopic");

    createProductTopic.addSubscription(
      new snsSubscriptions.EmailSubscription("your-email@example.com")
    );

    const importFileParser = new lambdaNodejs.NodejsFunction(this, "ImportFileParser", {
      entry: "lambda/importFileParser.ts",
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        SQS_QUEUE_URL: catalogItemsQueue.queueUrl,
      },
    });

    catalogItemsQueue.grantSendMessages(importFileParser);

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3notifications.LambdaDestination(importFileParser),
      { prefix: "uploaded/" }
    );

    const catalogBatchProcess = new lambdaNodejs.NodejsFunction(this, "CatalogBatchProcess", {
      entry: "lambda/catalogBatchProcess.ts",
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        SNS_TOPIC_ARN: createProductTopic.topicArn,
      },
    });

    catalogItemsQueue.grantConsumeMessages(catalogBatchProcess);
    createProductTopic.grantPublish(catalogBatchProcess);

    catalogBatchProcess.addEventSource(
      new lambdaEventSources.SqsEventSource(catalogItemsQueue, {
        batchSize: 5,
      })
    );
  }
}
