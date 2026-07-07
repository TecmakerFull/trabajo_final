import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import "dotenv/config";

import sequelize from "./config/database.js";
import "./models/User.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import logger from "./config/logger.js";
import swaggerSpec from "./config/swagger.js";

const app = express();
const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// Guardamos la instancia de io en app para accederla desde los controllers
app.set("io", io);

io.on("connection", (socket) => {
  logger.info(`Cliente conectado a WebSockets: ${socket.id}`);
  socket.on("disconnect", () => {
    logger.info(`Cliente desconectado de WebSockets: ${socket.id}`);
  });
});

app.use(express.json());

// Morgan integrado con Winston
app.use(
  morgan("dev", {
    stream: { write: (msg) => logger.http(msg.trim()) },
  }),
);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas
app.use("/api", authRoutes);

// Error Handler
app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info("Conexión a PostgreSQL establecida correctamente");

    await sequelize.sync({ force: false });
    logger.info("Modelos sincronizados con la base de datos");

    // En lugar de app.listen usamos httpServer.listen para soportar socket.io
    httpServer.listen(PORT, () => {
      logger.info(`Servidor corriendo en http://localhost:${PORT}`);
      logger.info(`Documentación en http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    logger.error(`Error al conectar con PostgreSQL: ${error.message}`);
    process.exit(1);
  }
};

startServer();
