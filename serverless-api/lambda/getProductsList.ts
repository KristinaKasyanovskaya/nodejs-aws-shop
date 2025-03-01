import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { REGION, PRODUCTS_TABLE, STOCKS_TABLE } from "./consts";


const client = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Incoming Request:", JSON.stringify(event));

  try {
    const [productsResult, stocksResult] = await Promise.all([
      docClient.send(new ScanCommand({ TableName: PRODUCTS_TABLE })),
      docClient.send(new ScanCommand({ TableName: STOCKS_TABLE })),
    ]);

    const products = productsResult.Items || [];
    const stocksMap = new Map(
      (stocksResult.Items || []).map((stock) => [stock.product_id, stock.count])
    );


    const productsWithStock = products.map((product) => ({
      ...product,
      count: stocksMap.get(product.id) || 0,
    }));

    return createResponse(200, productsWithStock);
  } catch (error) {
    console.error("Error fetching products:", error);
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
