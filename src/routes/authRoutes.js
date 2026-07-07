import { Router } from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  deleteProfile,
} from "../controllers/authController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";
import {
  reglasRegistro,
  reglasLogin,
  reglasActualizacion,
} from "../middlewares/validators.js";

const router = Router();

/**
 * @openapi
 * /api/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Registra un nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Error de validación o email existente
 */
router.post("/register", reglasRegistro, register);

/**
 * @openapi
 * /api/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Inicia sesión y devuelve un token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       400:
 *         description: Credenciales inválidas
 */
router.post("/login", reglasLogin, login);

/**
 * @openapi
 * /api/profile:
 *   get:
 *     tags:
 *       - Perfil
 *     summary: Obtiene el perfil del usuario autenticado
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del perfil
 *       401:
 *         description: Token no proporcionado
 */
router.get("/profile", verificarToken, getProfile);

/**
 * @openapi
 * /api/profile:
 *   put:
 *     tags:
 *       - Perfil
 *     summary: Actualiza el perfil del usuario autenticado
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *               currentPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *       400:
 *         description: Faltan datos requeridos
 */
router.put("/profile", verificarToken, reglasActualizacion, updateProfile);

/**
 * @openapi
 * /api/profile:
 *   delete:
 *     tags:
 *       - Perfil
 *     summary: Elimina la cuenta del usuario autenticado
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario eliminado
 */
router.delete("/profile", verificarToken, deleteProfile);

export default router;
