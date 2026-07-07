import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "2h" },
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "createdAt"],
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, password, currentPassword } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    if (password) {
      const currentValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );

      if (!currentValid) {
        return res
          .status(401)
          .json({ error: "La contraseña actual no es correcta" });
      }

      user.password = await bcrypt.hash(password, 10);
    }

    if (name !== undefined) {
      user.name = name;
    }

    await user.save();

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    await user.destroy();

    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};
