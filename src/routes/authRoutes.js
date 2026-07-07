import { Router } from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
  deleteProfile,
} from "../controllers/authController.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import {
  registerRules,
  loginRules,
  updateProfileRules,
} from "../middlewares/validators.js";

const router = Router();

router.post("/register", registerRules, register);
router.post("/login", loginRules, login);
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfileRules, updateProfile);
router.delete("/profile", authenticateToken, deleteProfile);

export default router;
