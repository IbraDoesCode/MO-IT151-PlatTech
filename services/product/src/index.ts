import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./utils/mongo";
import productRoute from "./routes/product.route";
import logger from "./utils/logger";
import httpLogger from "./middleware/httpLogger";
import rateLimiter from "./middleware/rateLimitter";
import cartRoute from "./routes/cart.route";
import cartItemRoute from "./routes/cartItem.routes"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(httpLogger);
app.use(rateLimiter);

app.use("/product", productRoute);
app.use("/cart", cartRoute);
app.use("/cart", cartItemRoute);

app.listen(PORT, async () => {
  await connectDB();
  logger.info(`Server running on port ${PORT}`);
});
