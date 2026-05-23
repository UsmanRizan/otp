import app from "./src/app.js";
import { env } from "./src/config/env.js";
import { connectDB } from "./src/db/connectDb.js";

await connectDB();

app.listen(env.PORT, () => {
  console.log(`Server running on ${env.PORT}`);
});
