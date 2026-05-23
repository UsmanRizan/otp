import axios from "axios";
import { env } from "../config/env.js";

export const sendSMS = async (phone, otp) => {
  return axios.post(
    "https://app.text.lk/api/v3/sms/send",
    {
      recipient: phone,
      sender_id: "TextLKDemo",
      type: "plain",
      message: `Your OTP is ${otp}`,
    },
    {
      headers: {
        Authorization: `Bearer ${env.TEXTLK_API_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    },
  );
};
