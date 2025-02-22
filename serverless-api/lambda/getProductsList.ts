import { APIGatewayProxyHandler } from "aws-lambda";
import { products } from "./products";

export const handler: APIGatewayProxyHandler = async () => {
    return {
        statusCode: 200,
        body: JSON.stringify(products),
        headers: {
            "Content-Type": "application/json",
        },
    };
};
