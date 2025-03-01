import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { handler } from "../lambda/getProductsById";
import { handler as getProductsListHandler } from "../lambda/getProductsList";

describe("getProductsById", () => {
  let productId: string;

  beforeAll(async () => {
    const result: APIGatewayProxyResult = await getProductsListHandler({} as APIGatewayProxyEvent);
    const products = JSON.parse(result.body);
    
    if (products.length > 0) {
      productId = products[0].id;
    }
  });

  it("should return product if found", async () => {
    if (!productId) {
      fail("No products found in the database, cannot test getProductsById");
    }

    const mockEvent = {
      pathParameters: { productId },
    } as unknown as APIGatewayProxyEvent;

    const result: APIGatewayProxyResult = await handler(mockEvent);

    expect(result.statusCode).toBe(200);
    expect(result.headers?.["Content-Type"]).toBe("application/json");

    const body = JSON.parse(result.body);

    expect(body).toHaveProperty("id", productId);
    expect(body).toHaveProperty("title", expect.any(String));
    expect(body).toHaveProperty("description", expect.any(String));
    expect(body).toHaveProperty("price", expect.any(Number));
    expect(body).toHaveProperty("count", expect.any(Number));
  });

  it("should return 404 if product not found", async () => {
    const mockEvent = {
      pathParameters: { productId: "non-existing-id" },
    } as unknown as APIGatewayProxyEvent;

    const result: APIGatewayProxyResult = await handler(mockEvent);

    expect(result.statusCode).toBe(404);
    expect(result.headers?.["Content-Type"]).toBe("application/json");

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty("message", "Product not found");
  });
});
