import { SQSEvent } from "aws-lambda";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const sns = new SNSClient({ region: "us-east-1" });
const topicArn = process.env.SNS_TOPIC_ARN || "";

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    try {
      const product = JSON.parse(record.body);

      console.log("Saving product:", product);

      await sns.send(
        new PublishCommand({
          TopicArn: topicArn,
          Message: JSON.stringify({ message: "Product created", product }),
          Subject: "New Product Created",
        })
      );

      console.log(`Product saved and notification sent: ${product.title}`);
    } catch (error) {
      console.error("Error processing product:", error);
    }
  }
};
