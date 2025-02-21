import { APIGatewayProxyHandler } from "aws-lambda";

const products = [
    { id: "1", name: "Product 1", price: 100 },
    { id: "2", name: "Product 2", price: 200 },
    { id: "3", name: "Product 3", price: 300 }
];

export const handler: APIGatewayProxyHandler = async (event) => {
    const { productId } = event.pathParameters || {};

    const product = products.find(p => p.id === productId);

    if (!product) {
        return {
            statusCode: 404,
            body: JSON.stringify({ message: "Product not found" }),
            headers: { "Content-Type": "application/json" }
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify(product),
        headers: { "Content-Type": "application/json" },
    };
};
