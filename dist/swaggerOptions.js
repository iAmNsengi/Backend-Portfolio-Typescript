"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Portfolio Backend Documentation",
            version: "1.0.0",
            description: "Hello, welcome to my API documentation created using Swagger!",
        },
        components: {
            securitySchemas: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        servers: [
            {
                url: "https://nsengi.onrender.com",
                description: "Render server",
            },
        ],
    },
    // Path to the API routes files
    apis: ["./api/routes/*.ts"],
};
exports.default = options;
