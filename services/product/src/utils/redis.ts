import Redis from "ioredis";

const redis = new Redis({
  host: process.env.IS_DOCKERIZED ? process.env.REDIS_HOST : "127.0.0.1",
  port: Number(process.env.REDIS_PORT || 6379),
});

export default redis;
