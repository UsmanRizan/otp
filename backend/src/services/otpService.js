import jwt from "jsonwebtoken";

import { otpStore } from "../store/otpStore.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendSMS } from "./smsService.js";

import { env } from "../config/env.js";

export const createAndSendOTP = async (phone) => {
  const otp = generateOTP();

  otpStore[phone] = otp;

  await sendSMS(phone, otp);

  return true;
};

export const verifyOTP = (phone, otp) => {
  if (otpStore[phone] === otp) {
    delete otpStore[phone];

    const token = jwt.sign({ phone }, env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return token;
  }

  return null;
};
