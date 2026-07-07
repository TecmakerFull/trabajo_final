import express from "express";
import sequelize from "./config/database.js";
import "./models/User.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", authRoutes);
app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexión a PostgreSQL establecida correctamente");

    await sequelize.sync({ force: false });
    console.log("Modelos sincronizados con la base de datos");

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al conectar con PostgreSQL:", error.message);
    process.exit(1);
  }
};

startServer();
