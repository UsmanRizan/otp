import bcrypt from "bcryptjs";

import { createAndSendOTP, verifyOTP } from "../services/otpService.js";
import { env } from "../config/env.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const normalizePhone = (phone) => phone.trim().replace(/\s+/g, "");

export const sendOTPController = async (req, res) => {
  try {
    const { phone } = req.body;
    const normalizedPhone = normalizePhone(phone);

    const existingUser = await User.findOne({
      $or: [{ phone }, { phone: normalizedPhone }],
    });

    if (existingUser) {
      return res.json({
        success: true,
        passwordRequired: true,
        message: "Password required",
      });
    }

    await createAndSendOTP(phone);

    res.json({
      success: true,
      passwordRequired: false,
      message: "OTP sent",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

export const verifyOTPController = async (req, res) => {
  const { phone, otp } = req.body;
  const normalizedPhone = normalizePhone(phone);

  try {
    const token = verifyOTP(phone, otp);

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await User.findOneAndUpdate(
      { $or: [{ phone }, { phone: normalizedPhone }] },
      {
        $setOnInsert: {
          phone: normalizedPhone,
          role: "player",
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    res.json({
      success: true,
      token,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
};

export const setPasswordController = async (req, res) => {
  const { password } = req.body;
  const authHeader = req.headers.authorization;

  try {
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Missing authorization token",
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const normalizedPhone = normalizePhone(decoded.phone);

    if (!decoded?.phone) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findOneAndUpdate(
      { $or: [{ phone: decoded.phone }, { phone: normalizedPhone }] },
      {
        $set: {
          password: hashedPassword,
        },
        $setOnInsert: {
          phone: normalizedPhone,
          role: "player",
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    res.json({
      success: true,
      message: "Password saved",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to save password",
    });
  }
};

export const loginWithPasswordController = async (req, res) => {
  const { phone, password } = req.body;
  const normalizedPhone = normalizePhone(phone);

  try {
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const user = await User.findOne({
      $or: [{ phone }, { phone: normalizedPhone }],
    }).select("+password phone role");

    if (!user?.password) {
      return res.status(400).json({
        success: false,
        message: "Password not set for this account",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign({ phone: user.phone }, env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      token,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to login with password",
    });
  }
};
