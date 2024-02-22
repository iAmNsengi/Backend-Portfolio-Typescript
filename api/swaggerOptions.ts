import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Portfolio Backend Documentation",
      version: "1.0.0",
      description:
        "Hello, welcome to my API documentation created using Swagger!",
    },
    components: {
      securitySchemas: {
        bearerAuth: {
          type: "https",
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

export default options;
