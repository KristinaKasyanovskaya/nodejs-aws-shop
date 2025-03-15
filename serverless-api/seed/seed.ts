import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { PRODUCTS_TABLE, REGION, STOCKS_TABLE } from "../lambda/consts";

const getRandomStock = () => Math.floor(Math.random() * 100) + 1;
const getRandomPrice = () => Math.floor(Math.random() * 500) + 50;
const client = new DynamoDBClient({
  region: REGION,
});
const docClient = DynamoDBDocumentClient.from(client);


const generateProducts = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: uuidv4(),
    title: `Product ${i + 1}`,
    description: `Description for Product ${i + 1}`,
    price: getRandomPrice(),
  }));

const populateDB = async () => {
  try {
    const products = generateProducts(10);
    const productPutCommands = products.map((product) =>
      docClient.send(new PutCommand({ TableName: PRODUCTS_TABLE, Item: product }))
    );

    const stockPutCommands = products.map((product) =>
      docClient.send(
        new PutCommand({
          TableName: STOCKS_TABLE,
          Item: { product_id: product.id, count: getRandomStock() },
        })
      )
    );

    await Promise.all([...productPutCommands, ...stockPutCommands]);

    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Error inserting data:", error);
  }
};

populateDB();