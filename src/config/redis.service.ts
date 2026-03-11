import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private client: RedisClientType;
  private isConnected = false;
  private readonly logger = new Logger(RedisService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get('REDIS_URL');
    
    if (!redisUrl) {
      this.logger.warn('Redis URL not configured. Cache disabled.');
      return;
    }

    try {
      this.client = createClient({
        url: redisUrl,
        password: this.configService.get('REDIS_PASSWORD'),
      });

      this.client.on('error', (err) => {
        this.logger.error('Redis connection error:', err.message);
        this.isConnected = false;
      });

      await this.client.connect();
      this.isConnected = true;
      this.logger.log('Redis connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error.message);
      this.isConnected = false;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected) return null;
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.isConnected) return;
    if (ttl) {
      await this.client.setEx(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) return;
    await this.client.del(key);
  }

  async hIncrBy(key: string, field: string, increment: number): Promise<number> {
    if (!this.isConnected) return 0;
    try {
      return await this.client.hIncrBy(key, field, increment);
    } catch (error) {
      this.logger.error(`Redis HINCRBY error: ${error.message}`);
      return 0;
    }
  }

  async hGet(key: string, field: string): Promise<string | null> {
    if (!this.isConnected) return null;
    try {
      return await this.client.hGet(key, field);
    } catch (error) {
      this.logger.error(`Redis HGET error: ${error.message}`);
      return null;
    }
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    if (!this.isConnected) return {};
    try {
      return await this.client.hGetAll(key);
    } catch (error) {
      this.logger.error(`Redis HGETALL error: ${error.message}`);
      return {};
    }
  }

  async hSet(key: string, field: string, value: string): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client.hSet(key, field, value);
    } catch (error) {
      this.logger.error(`Redis HSET error: ${error.message}`);
    }
  }

  async hDel(key: string, ...fields: string[]): Promise<void> {
    if (!this.isConnected) return;
    try {
      for (const field of fields) {
        await this.client.hDel(key, field);
      }
    } catch (error) {
      this.logger.error(`Redis HDEL error: ${error.message}`);
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    if (!this.isConnected) return;
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      this.logger.error(`Redis EXPIRE error: ${error.message}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    try {
      return (await this.client.exists(key)) === 1;
    } catch (error) {
      this.logger.error(`Redis EXISTS error: ${error.message}`);
      return false;
    }
  }

  async incr(key: string): Promise<number> {
    if (!this.isConnected) return 0;
    try {
      return await this.client.incr(key);
    } catch (error) {
      this.logger.error(`Redis INCR error: ${error.message}`);
      return 0;
    }
  }

  isReady(): boolean {
    return this.isConnected;
  }
}
