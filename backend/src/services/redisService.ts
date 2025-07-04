import { createClient, RedisClientType } from 'redis';

export class RedisService {
  private client: RedisClientType;
  private connected: boolean = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        connectTimeout: 5000,
        lazyConnect: true,
      },
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('✅ Connected to Redis');
      this.connected = true;
    });

    this.client.on('disconnect', () => {
      console.log('❌ Disconnected from Redis');
      this.connected = false;
    });
  }

  async connect(): Promise<void> {
    try {
      if (!this.connected) {
        await this.client.connect();
      }
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.connected) {
        await this.client.disconnect();
      }
    } catch (error) {
      console.error('Failed to disconnect from Redis:', error);
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      console.error('Redis SET error:', error);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  async hSet(key: string, field: string, value: string): Promise<void> {
    try {
      await this.client.hSet(key, field, value);
    } catch (error) {
      console.error('Redis HSET error:', error);
      throw error;
    }
  }

  async hGet(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hGet(key, field);
    } catch (error) {
      console.error('Redis HGET error:', error);
      return null;
    }
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hGetAll(key);
    } catch (error) {
      console.error('Redis HGETALL error:', error);
      return {};
    }
  }

  async lPush(key: string, ...values: string[]): Promise<void> {
    try {
      await this.client.lPush(key, values);
    } catch (error) {
      console.error('Redis LPUSH error:', error);
      throw error;
    }
  }

  async lRange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lRange(key, start, stop);
    } catch (error) {
      console.error('Redis LRANGE error:', error);
      return [];
    }
  }

  async lLen(key: string): Promise<number> {
    try {
      return await this.client.lLen(key);
    } catch (error) {
      console.error('Redis LLEN error:', error);
      return 0;
    }
  }

  // Operation-specific methods
  async storeOperation(operationId: string, operation: any, ttlSeconds: number = 300): Promise<void> {
    await this.set(`operation:${operationId}`, JSON.stringify(operation), ttlSeconds);
  }

  async getOperation(operationId: string): Promise<any | null> {
    const data = await this.get(`operation:${operationId}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteOperation(operationId: string): Promise<void> {
    await this.del(`operation:${operationId}`);
  }

  async cacheAccountInfo(tonPubkey: string, accountInfo: any, ttlSeconds: number = 60): Promise<void> {
    await this.set(`account:${tonPubkey}`, JSON.stringify(accountInfo), ttlSeconds);
  }

  async getCachedAccountInfo(tonPubkey: string): Promise<any | null> {
    const data = await this.get(`account:${tonPubkey}`);
    return data ? JSON.parse(data) : null;
  }

  async addOperationToHistory(tonPubkey: string, operation: any): Promise<void> {
    await this.lPush(`history:${tonPubkey}`, JSON.stringify(operation));
    
    // Keep only last 100 operations
    const length = await this.lLen(`history:${tonPubkey}`);
    if (length > 100) {
      await this.client.lTrim(`history:${tonPubkey}`, 0, 99);
    }
  }

  async getOperationHistory(tonPubkey: string, page: number = 0, limit: number = 10): Promise<any[]> {
    const start = page * limit;
    const stop = start + limit - 1;
    
    const operations = await this.lRange(`history:${tonPubkey}`, start, stop);
    return operations.map(op => JSON.parse(op));
  }

  async getOperationHistoryCount(tonPubkey: string): Promise<number> {
    return await this.lLen(`history:${tonPubkey}`);
  }

  // Rate limiting
  async checkRateLimit(key: string, maxRequests: number, windowSeconds: number): Promise<boolean> {
    const current = await this.get(`rate_limit:${key}`);
    
    if (!current) {
      await this.set(`rate_limit:${key}`, '1', windowSeconds);
      return true;
    }
    
    const count = parseInt(current);
    if (count >= maxRequests) {
      return false;
    }
    
    await this.client.incr(`rate_limit:${key}`);
    return true;
  }

  isConnected(): boolean {
    return this.connected;
  }
}