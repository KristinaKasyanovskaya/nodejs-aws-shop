import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { APIGatewayProxyHandler } from "aws-lambda";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: "us-east-1" });

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const fileName = event.queryStringParameters?.name;
    if (!fileName) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing 'name' query parameter" }),
      };
    }

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `uploaded/${fileName}`,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: signedUrl }),
    };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
