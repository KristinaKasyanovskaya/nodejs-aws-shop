import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { handler } from "../lambda/getProductsList";

describe("getProductsList", () => {
  it("should return statusCode 200 and a list of products", async () => {
    const mockEvent = {} as APIGatewayProxyEvent;

    const result: APIGatewayProxyResult = await handler(mockEvent);

    expect(result.statusCode).toBe(200);
    expect(result.headers?.["Content-Type"]).toBe("application/json"); 
    expect(result.body).toBeDefined();

    const body = JSON.parse(result.body);

    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    body.forEach((product: any) => {
      expect(product).toHaveProperty("id", expect.any(String));
      expect(product).toHaveProperty("title", expect.any(String));
      expect(product).toHaveProperty("description", expect.any(String));
      expect(product).toHaveProperty("price", expect.any(Number));
      expect(product).toHaveProperty("count", expect.any(Number));
    });
  });
});
