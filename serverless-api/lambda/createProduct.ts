import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const dynamo = new AWS.DynamoDB.DocumentClient();

const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME!;
const STOCKS_TABLE_NAME = process.env.STOCKS_TABLE_NAME!;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Incoming request:", event);

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid request: No body provided" }),
      };
    }

    const { title, description, price, count } = JSON.parse(event.body);

    if (!title || typeof title !== "string" || title.trim() === "") {
      return { statusCode: 400, body: JSON.stringify({ message: "Invalid title" }) };
    }
    if (!price || typeof price !== "number" || price <= 0) {
      return { statusCode: 400, body: JSON.stringify({ message: "Invalid price" }) };
    }
    if (!count || typeof count !== "number" || count < 0) {
      return { statusCode: 400, body: JSON.stringify({ message: "Invalid stock count" }) };
    }

    const id = uuidv4();

    const transactionParams: AWS.DynamoDB.DocumentClient.TransactWriteItemsInput = {
      TransactItems: [
        {
          Put: {
            TableName: PRODUCTS_TABLE_NAME,
            Item: {
              id,
              title,
              description,
              price,
            },
          },
        },
        {
          Put: {
            TableName: STOCKS_TABLE_NAME,
            Item: {
              product_id: id,
              count,
            },
          },
        },
      ],
    };

    await dynamo.transactWrite(transactionParams).promise();

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Product created successfully", id }),
    };
  } catch (error) {
    console.error("Error processing request:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
