import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  client: Redis;

  constructor(private readonly appConfig: ConfigService) {
    this.client = new Redis({
      host: this.appConfig.get('REDIS_HOST'),
      port: this.appConfig.get('REDIS_PORT'),
    });
  }

  async close() {
    this.client.quit();
  }
}
