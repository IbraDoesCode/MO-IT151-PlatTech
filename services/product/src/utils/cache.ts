import logger from "./logger";
import redis from "./redis";

export const PRODUCT_BY_ID_PREFIX = "product:id:";
export const PRODUCT_QUERY_PREFIX = "products:query:";
// This SET will hold all the keys generated for product listings
export const ACTIVE_PRODUCT_LISTING_KEYS_SET = "active_product_listing_keys";
export const TIME_TO_LIVE = 300;

/**
 * Invalidates product-related caches in Redis.
 * This function no longer uses KEYS and instead relies on a master set
 * to track and invalidate product listing caches.
 * @param productId Optional. The ID of the product to invalidate specific caches for.
 */
export const invalidateProductCache = async (productIds?: string[]) => {
  try {
    // Invalidate individual product cache by ID
    if (productIds?.length) {
      const keys = productIds.map((id) => `${PRODUCT_BY_ID_PREFIX}${id}`);
      await redis.del(...keys);
      logger.info(`Invalidated ${keys.length} individual product cache keys.`);
    }

    // Retrieve all members from the master set of product listing keys
    const productQueryKeysToInvalidate = await redis.smembers(
      ACTIVE_PRODUCT_LISTING_KEYS_SET
    );

    logger.info(productQueryKeysToInvalidate);

    if (productQueryKeysToInvalidate.length > 0) {
      // Delete all the cached entries
      await redis.del(...productQueryKeysToInvalidate);
      logger.info(
        `Invalidated ${productQueryKeysToInvalidate.length} product listing caches.`
      );
    }

    // After invalidating, clear the master set itself, as all entries are now stale.
    await redis.del(ACTIVE_PRODUCT_LISTING_KEYS_SET);
    logger.info(`Cleared the master set of product listing keys.`);
  } catch (error) {
    logger.error("Failed to invalidate product cache", error);
  }
};
