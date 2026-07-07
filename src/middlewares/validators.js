import { body, validationResult } from "express-validator";

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};

export const reglasRegistro = [
  body("name").trim().notEmpty().withMessage("El nombre es requerido"),
  body("email")
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("El email no tiene formato válido"),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .isLength({ min: 5 })
    .withMessage("La contraseña debe tener al menos 5 caracteres"),
  handleValidationErrors,
];

export const reglasLogin = [
  body("email")
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("El email no tiene formato válido"),
  body("password").notEmpty().withMessage("La contraseña es requerida"),
  handleValidationErrors,
];

export const reglasActualizacion = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("El nombre no puede estar vacío"),
  body("password")
    .optional()
    .isLength({ min: 5 })
    .withMessage("La contraseña debe tener al menos 5 caracteres"),
  body("currentPassword").custom((value, { req }) => {
    if (req.body.password && !value) {
      throw new Error(
        "Debe enviar currentPassword para cambiar la contraseña",
      );
    }
    return true;
  }),
  handleValidationErrors,
];
