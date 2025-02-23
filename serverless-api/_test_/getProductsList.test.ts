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

    expect(body[0]).toHaveProperty("id", "1");
    expect(body[0]).toHaveProperty("title", "Book One");
    expect(body[0]).toHaveProperty("description", "A thrilling mystery novel that keeps you on edge.");
    expect(body[0]).toHaveProperty("price", 29);

    expect(body[4]).toHaveProperty("id", "5");
    expect(body[4]).toHaveProperty("title", "Book Five");
    expect(body[4]).toHaveProperty("description", "A thought-provoking exploration of human psychology.");
    expect(body[4]).toHaveProperty("price", 40);
  });
});
