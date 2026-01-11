import { Router } from "express";
import { AuthController } from "#controllers/authController";
import { authMiddleware } from "../middleware/auth.js";
import { asyncHandler } from "#utils/async-handler";

const router = Router();

// Inscription
router.post("/register", asyncHandler(AuthController.register));

// Connexion
router.post("/login", asyncHandler(AuthController.login));

// Déconnexion
router.post("/logout", authMiddleware, asyncHandler(AuthController.logout));

export function registerAuthRoutes(server) {
  app.use("/api/auth", router);
}

export default router;