import mongoose from "mongoose";

import { env } from "../config/env.js";

export const connectDB = async () => {
  if (!env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  await mongoose.connect(env.MONGO_URI);
};
