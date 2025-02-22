import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { handler } from "../lambda/getProductsById";

describe("getProductsById", () => {
  it("should return product if found", async () => {
    const mockEvent = {
      pathParameters: { productId: "1" },
    } as unknown as APIGatewayProxyEvent;

    const result: APIGatewayProxyResult = await handler(mockEvent);

    expect(result.statusCode).toBe(200);
    expect(result.headers?.["Content-Type"]).toBe("application/json");

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty("id", "1");
    expect(body).toHaveProperty("title", "Book One");
    expect(body).toHaveProperty("description", "A thrilling mystery novel that keeps you on edge.");
    expect(body).toHaveProperty("price", 29);
  });

  it("should return another product if found", async () => {
    const mockEvent = {
      pathParameters: { productId: "5" },
    } as unknown as APIGatewayProxyEvent;

    const result: APIGatewayProxyResult = await handler(mockEvent);

    expect(result.statusCode).toBe(200);
    expect(result.headers?.["Content-Type"]).toBe("application/json");

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty("id", "5");
    expect(body).toHaveProperty("title", "Book Five");
    expect(body).toHaveProperty("description", "A thought-provoking exploration of human psychology.");
    expect(body).toHaveProperty("price", 40);
  });

  it("should return 404 if product not found", async () => {
    const mockEvent = {
      pathParameters: { productId: "999" },
    } as unknown as APIGatewayProxyEvent;

    const result: APIGatewayProxyResult = await handler(mockEvent);

    expect(result.statusCode).toBe(404);
    expect(result.headers?.["Content-Type"]).toBe("application/json");

    const body = JSON.parse(result.body);
    expect(body).toHaveProperty("message", "Product not found");
  });
});
