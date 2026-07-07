import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import logger from "../config/logger.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const usuarioExistente = await User.findOne({ where: { email } });
    if (usuarioExistente) {
      logger.warn(`Intento de registro con email existente: ${email}`);
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoUsuario = await User.create({
      name,
      email,
      password: passwordHash,
    });

    logger.info(`Nuevo usuario registrado: ${email}`);
    
    const io = req.app.get("io");
    if (io) {
      io.emit("user_event", { type: "register", userId: nuevoUsuario.id, timestamp: new Date() });
    }

    res.status(201).json({
      id: nuevoUsuario.id,
      name: nuevoUsuario.name,
      email: nuevoUsuario.email,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const usuario = await User.findOne({ where: { email } });

    if (!usuario) {
      logger.warn(`Intento de login fallido para email no existente: ${email}`);
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      logger.warn(`Intento de login fallido por contraseña incorrecta: ${email}`);
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    logger.info(`Login exitoso para usuario: ${email}`);

    res.status(200).json({
      token,
      user: {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const usuario = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "createdAt"],
    });

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json(usuario);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, password, currentPassword } = req.body;

    const usuario = await User.findByPk(req.user.id);

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (password) {
      const passwordActualValida = await bcrypt.compare(
        currentPassword,
        usuario.password,
      );

      if (!passwordActualValida) {
        logger.warn(`Usuario ${usuario.email} intentó actualizar contraseña con currentPassword incorrecta`);
        return res
          .status(401)
          .json({ error: "La contraseña actual no es correcta" });
      }

      usuario.password = await bcrypt.hash(password, 10);
    }

    if (name !== undefined) {
      usuario.name = name;
    }

    await usuario.save();
    
    logger.info(`Perfil actualizado para usuario: ${usuario.email}`);

    const io = req.app.get("io");
    if (io) {
      io.emit("user_event", { type: "update", userId: usuario.id, timestamp: new Date() });
    }

    res.status(200).json({
      id: usuario.id,
      name: usuario.name,
      email: usuario.email,
      updatedAt: usuario.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProfile = async (req, res, next) => {
  try {
    const usuario = await User.findByPk(req.user.id);

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    await usuario.destroy();
    
    logger.info(`Cuenta eliminada para usuario: ${usuario.email}`);

    const io = req.app.get("io");
    if (io) {
      io.emit("user_event", { type: "delete", userId: usuario.id, timestamp: new Date() });
    }

    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};
