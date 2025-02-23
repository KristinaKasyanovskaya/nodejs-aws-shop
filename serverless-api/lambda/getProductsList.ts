import { APIGatewayProxyHandler } from "aws-lambda";
import * as AWS from "aws-sdk";

const dynamo = new AWS.DynamoDB.DocumentClient();
const PRODUCTS_TABLE = process.env.PRODUCTS_TABLE_NAME!;
const STOCKS_TABLE = process.env.STOCKS_TABLE_NAME!;

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const productsData = await dynamo.scan({ TableName: PRODUCTS_TABLE }).promise();
    const stocksData = await dynamo.scan({ TableName: STOCKS_TABLE }).promise();

    const stockMap = (stocksData.Items || []).reduce((acc, stock) => {
      acc[stock.product_id] = stock.count;
      return acc;
    }, {} as Record<string, number>);

    const products = productsData.Items?.map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      count: stockMap[product.id] || 0,
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(products),
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
