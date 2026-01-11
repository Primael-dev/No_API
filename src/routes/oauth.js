import express from "express";
import {
  googleRedirect,
  googleCallback,
  oauthSuccess
} from "../controllers/oauthController.js";

const router = express.Router();

router.get("/google", googleRedirect);
router.get("/google/callback", googleCallback);
router.get("/google/success", oauthSuccess);

export default router;
