import express from "express";

import {
  loginWithPasswordController,
  sendOTPController,
  setPasswordController,
  verifyOTPController,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/send-otp", sendOTPController);

router.post("/verify-otp", verifyOTPController);

router.post("/set-password", setPasswordController);

router.post("/login-password", loginWithPasswordController);

export default router;
