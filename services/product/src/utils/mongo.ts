import mongoose from "mongoose";

export const connectDB = async () => {
  const URI =
    process.env.IS_DOCKERIZED === "true"
      ? process.env.DOCKERIZED_MONGO_URI
      : process.env.LOCAL_MONGO_URI;

  try {
    console.info(`ℹ️  Establishing database connection to ${URI}`);
    await mongoose.connect(URI!);
    console.info(`✅ Successfully connected to ${URI}`);
  } catch (error) {
    console.error(`❌ Error establishing database connection to ${URI}`);
    process.exit(1);
  }
};
