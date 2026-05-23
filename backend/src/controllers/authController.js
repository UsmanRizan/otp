import { createAndSendOTP, verifyOTP } from "../services/otpService.js";

export const sendOTPController = async (req, res) => {
  try {
    const { phone } = req.body;

    await createAndSendOTP(phone);

    res.json({
      success: true,
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

export const verifyOTPController = (req, res) => {
  const { phone, otp } = req.body;

  const token = verifyOTP(phone, otp);

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  }

  res.json({
    success: true,
    token,
  });
};
