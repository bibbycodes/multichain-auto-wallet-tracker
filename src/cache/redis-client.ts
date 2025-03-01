import IORedis from 'ioredis';
import {env} from "../lib/services/util/env/env";
import {Singleton} from "../lib/services/util/singleton";

interface RedisConfig {
  host: string;
  port: number;
  db: number; // Optional database number (default: 0)
}

export class RedisClient extends Singleton {
  private redis: IORedis;

  constructor(environ: { redis: RedisConfig } = { redis: env.redis }) {
    super();
    // Build the Redis connection URL
    const redisUrl = `redis://${environ.redis.host}:${environ.redis.port}`;

    // Optional: If authentication or specific database is needed
    const options = {
      maxRetriesPerRequest: null, // Disable automatic retries
      db: environ.redis.db || 0,      // Default to DB 0 if not specified
    };

    // Initialize the Redis client with the URL and options
    this.redis = new IORedis(redisUrl, options);

    // Log successful connection
    this.redis.on('connect', () => {
      console.log('Successfully connected to Redis at', redisUrl);
    });

    // Handle errors
    this.redis.on('error', (err) => {
      console.error('Error connecting to Redis:', err);
    });
  }
  
  client(): IORedis {
    return this.redis
  }

  async setKey(key: string, value: string) {
    try {
      const result = await this.redis.set(key, value);
      console.log('Key set result:', result);
    } catch (err) {
      console.error('Error setting key:', err);
    }
  }

  async getKey(key: string) {
    try {
      const value = await this.redis.get(key);
      console.log('Key value:', value);
      return value;
    } catch (err) {
      console.error('Error getting key:', err);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
    }
  }

  // Method to get an object by key
  async getObject<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) as T : null;
    } catch (error) {
      console.error(`Error getting object with key ${key}:`, error);
      return null;
    }
  }
}
