import dotenv from "dotenv";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import Product from "../models/product.model";
import { connectDB } from "../utils/mongo";

dotenv.config();

const seedProducts = async () => {
  await connectDB();

  console.debug("ℹ️  Seeding database...");

  const products = Array.from({ length: 250 }).map(() => ({
    name: faker.commerce.productName(),
    brand: faker.company.name(),
    description: faker.commerce.productDescription(),
    category: faker.commerce.department(),
    price: parseFloat(faker.commerce.price()),
    rating: faker.number.float({ min: 0, max: 5, fractionDigits: 1 }),
    image_url: faker.image.urlPicsumPhotos(),
  }));

  await Product.insertMany(products);
  console.log("🌱  Seeded products successfully.");

  mongoose.connection.close();
};

seedProducts().catch((err) => {
  console.error("❌ Seeding failed:", err);
  mongoose.connection.close();
});
