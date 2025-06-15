import mongoose from "mongoose";
import logger from "./logger";

export const connectDB = async () => {
  const URI =
    process.env.IS_DOCKERIZED === "true"
      ? process.env.DOCKERIZED_MONGO_URI
      : process.env.LOCAL_MONGO_URI;

  try {
    logger.info(`Establishing database connection to ${URI}`);
    await mongoose.connect(URI!);
    logger.info(`Successfully connected to ${URI}`);
  } catch (error) {
    logger.error(`Error establishing database connection to ${URI}`);
    process.exit(1);
  }
};
