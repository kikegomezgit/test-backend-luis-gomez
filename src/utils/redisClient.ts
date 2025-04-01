import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

redisClient.connect();

export default redisClient;

// docker ps
// # If not running:
// docker run -d -p 6379:6379 --name redis redis
