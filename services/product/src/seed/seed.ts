import mongoose from "mongoose";
import Product from "../models/product.model";
import dotenv from "dotenv";
import { connectDB } from "../utils/mongo";
import { resolveBrand, resolveCategory } from "../utils/resolveRefs";

dotenv.config({ path: "./.env" });

const seedProducts = async () => {
  await connectDB();
  await Product.deleteMany();

  console.debug("ℹ️  Seeding database...");

  // max no. of products available in dummyjson
  const response = await fetch(
    "https://dummyjson.com/products?limit=194&select=title,description,category,brand,price,rating,thumbnail"
  );

  const { products } = await response.json();
  console.log(`ℹ️  fetched total of ${products.length} products`);

  const mappedProducts = await Promise.all(
    products.map(async (product: any) => {
      const brandId = (await resolveBrand(product.brand))._id;
      const categoryId = (await resolveCategory(product.category))._id;

      return {
        name: product.title,
        brand: brandId,
        description: product.description,
        category: categoryId,
        price: product.price,
        rating: product.rating,
        image_url: product.thumbnail,
      };
    })
  );

  await Product.insertMany(mappedProducts);
  console.log("🌱 Seeded products successfully.");

  mongoose.connection.close();
};

seedProducts().catch((err) => {
  console.error("❌ Seeding failed:", err);
  mongoose.connection.close();
});
