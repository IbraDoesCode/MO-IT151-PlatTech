import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./utils/mongo";
import productRoute from "./routes/product.route";
import logger from "./utils/logger";
import httpLogger from "./middleware/httpLogger";
import rateLimiter from "./middleware/rateLimitter";
import cartRoute from "./routes/cart.route";
import favoriteRoute from "./routes/favorite.routes";
import adminRoute from "./routes/admin.route";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(httpLogger);
app.use(rateLimiter);

app.use("/products", productRoute);
app.use("/cart", cartRoute);
app.use("/favorites", favoriteRoute);

app.use("/admin", adminRoute);

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.listen(PORT, async () => {
  await connectDB();
  logger.info(`Server running on port ${PORT}`);
});
