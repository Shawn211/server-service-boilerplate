import { Init, Provide, Inject } from '@midwayjs/core';
import { NetworkModel } from '../common/network.entity';
import { RedisService } from '@midwayjs/redis';

@Provide()
export class TokenService {
  @Init()
  async init() {}

  @Inject()
  redisService: RedisService;

  async getNetworks() {
    const cacheKey = 'networks:all';
    const data = await this.redisService.get(cacheKey);
    if (data) {
      return JSON.parse(data);
    }
    const result = await NetworkModel.find({}).lean();
    await this.redisService.set(cacheKey, JSON.stringify(result));
    return result;
  }

  async getToken() {}
}
