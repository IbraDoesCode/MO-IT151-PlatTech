import mongoose from "mongoose";
import Product from "../models/product.model";
import dotenv from "dotenv";
import { connectDB } from "../utils/mongo";
import { resolveBrand, resolveCategory } from "../utils/resolveRefs";
import Brand from "../models/brand.model";
import Category from "../models/category.model";
import Cart from "../models/cart.model";
import Favorite from "../models/favorite.model";
import Review from "../models/review.model";

dotenv.config({ path: "./.env" });

const seedProducts = async () => {
  await Promise.all([
    connectDB(),
    Product.deleteMany(),
    Brand.deleteMany(),
    Category.deleteMany(),
    Cart.deleteMany(),
    Favorite.deleteMany(),
    Review.deleteMany(),
  ]);

  console.debug("ℹ️  Seeding database...");

  // max no. of products available in dummyjson
  const response = await fetch(
    "https://dummyjson.com/products?limit=194&select=title,description,category,brand,price,rating,thumbnail,stock,images,reviews"
  );

  const { products } = await response.json();
  console.log(`ℹ️  fetched total of ${products.length} products`);

  const allReviews: any[] = [];

  const mappedProducts = await Promise.all(
    products.map(async (product: any) => {
      const brandId = (await resolveBrand(product.brand))._id;
      const categoryId = (await resolveCategory(product.category))._id;

      const newProduct = new Product({
        name: product.title,
        brand: brandId,
        description: product.description,
        category: categoryId,
        price: product.price,
        rating: product.rating,
        quantity: product.stock,
        image_url: product.thumbnail,
        images: product.images,
      });

      if (Array.isArray(product.reviews)) {
        const reviews = product.reviews.map((review: any) => ({
          product: newProduct._id,
          name: review.reviewerName,
          email: review.reviewerEmail,
          comment: review.comment,
          rating: review.rating,
          date: review.date,
        }));

        allReviews.push(...reviews);
      }

      return newProduct;
    })
  );

  await Product.insertMany(mappedProducts);
  console.log("🌱 Seeded products successfully.");

  if (allReviews.length > 0) {
    await Review.insertMany(allReviews);
    console.log("🌱 Seeded reviews successfully.");
  }

  mongoose.connection.close();
};

seedProducts().catch((err) => {
  console.error("❌ Seeding failed:", err);
  mongoose.connection.close();
});
