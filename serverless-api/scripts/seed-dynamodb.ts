import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const dynamoDb = new DynamoDBClient({ region: "us-east-1" });

const products = [
  {
    id: uuidv4(),
    title: "Book One",
    description: "A thrilling mystery novel",
    price: 29,
  },
  {
    id: uuidv4(),
    title: "Book Two",
    description: "A deep dive into science",
    price: 35,
  },
];

const stocks = products.map((product) => ({
  product_id: product.id,
  count: Math.floor(Math.random() * 10) + 1,
}));

async function seedTable(tableName: string, items: any[]) {
  for (const item of items) {
    const params = {
      TableName: tableName,
      Item: Object.fromEntries(
        Object.entries(item).map(([key, value]) => [key, { S: String(value) }])
      ),
    };
    await dynamoDb.send(new PutItemCommand(params));
  }
}

(async () => {
  console.log("Seeding products...");
  await seedTable("products", products);
  
  console.log("Seeding stocks...");
  await seedTable("stocks", stocks);

  console.log("✅ Seeding complete!");
})();
