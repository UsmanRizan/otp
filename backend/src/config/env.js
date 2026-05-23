import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT,
  TEXTLK_API_TOKEN: process.env.TEXTLK_API_TOKEN,
  JWT_SECRET: process.env.JWT_SECRET,
  MONGO_URI: process.env.MONGO_URI,
};
