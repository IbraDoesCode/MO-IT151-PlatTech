import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./utils/mongo";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.get("/", (_, res) => {
  res.send("Hello from product service");
});

app.listen(PORT, async () => {
  await connectDB();
  console.log(`server running on port ${PORT}`);
});
