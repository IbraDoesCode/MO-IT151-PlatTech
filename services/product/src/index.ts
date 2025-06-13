import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./utils/mongo";
import productRoute from "./routes/product.route";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.get("/", (_, res) => {
  res.send("Hello from product service");
});

app.use("/product", productRoute);

app.listen(PORT, async () => {
  await connectDB();
  console.log(`server running on port ${PORT}`);
});
