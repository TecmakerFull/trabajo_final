import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "Formato de token inválido. Usar: Bearer <token>" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};
