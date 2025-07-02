import { RedisMemoryServer } from "redis-memory-server";
import Redis from "ioredis";
import logger from "./logger";

let redis: Redis;
let host: string;
let port: number;

if (process.env.IS_DOCKERIZED === "true") {
  host = process.env.REDIS_HOST!;
  port = Number(process.env.REDIS_HOST);
} else {
  const redisMemory = await RedisMemoryServer.create();
  host = await redisMemory.getHost();
  port = await redisMemory.getPort();
}

logger.info(`Redis initialized on ${host}:${port}`);

redis = new Redis({
  host,
  port,
});

export default redis;
