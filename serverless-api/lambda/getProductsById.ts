import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { PRODUCTS_TABLE, REGION, STOCKS_TABLE } from "./consts";

const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Incoming Request:", JSON.stringify(event));

  const productId = event.pathParameters?.productId;

  if (!productId) {
    return createResponse(400, { message: "Product ID is required" });
  }

  try {
    const [productResult, stockResult] = await Promise.all([
      docClient.send(new GetCommand({ TableName: PRODUCTS_TABLE, Key: { id: productId } })),
      docClient.send(new GetCommand({ TableName: STOCKS_TABLE, Key: { product_id: productId } })),
    ]);

    if (!productResult.Item) {
      return createResponse(404, { message: "Product not found" });
    }

    const productWithStock = {
      ...productResult.Item,
      count: stockResult.Item?.count || 0,
    };

    return createResponse(200, productWithStock);
  } catch (error) {
    console.error("Error fetching product:", error);
    return createResponse(500, { message: "Internal Server Error" });
  }
};

const createResponse = (statusCode: number, body: object): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  body: JSON.stringify(body),
});