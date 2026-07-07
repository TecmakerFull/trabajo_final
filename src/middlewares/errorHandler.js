import logger from "../config/logger.js";

export const errorHandler = (err, req, res, next) => {
  logger.error(`Error no controlado: ${err.message}\n${err.stack}`);

  res.status(500).json({
    error: err.message || "Error interno del servidor",
  });
};
