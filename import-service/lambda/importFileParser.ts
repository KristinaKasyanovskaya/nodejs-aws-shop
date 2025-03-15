import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { S3Event } from "aws-lambda";
import * as csv from "csv-parser";
import { Readable } from "stream";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const s3 = new S3Client({ region: "us-east-1" });
const sqs = new SQSClient({ region: "us-east-1" });
const queueUrl = process.env.SQS_QUEUE_URL || "";

export const handler = async (event: S3Event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = record.s3.object.key;

    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    const { Body } = await s3.send(command);
    
    if (!Body) throw new Error("No body in S3 response");

    const stream = Body as Readable;

    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(csv())
        .on("data", async (data) => {
          await sqs.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: JSON.stringify(data) }));
        })
        .on("end", resolve)
        .on("error", reject);
    });

    console.log(`Finished processing ${key}`);
  }
};
