import swaggerJSDoc from "swagger-jsdoc";

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "API REST de Usuarios",
      version: "1.0.0",
      description: "API de administración de usuarios con JWT, Winston, Morgan y WebSockets",
    },
    servers: [{ url: "http://localhost:3000" }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
});

export default swaggerSpec;
