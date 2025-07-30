import { Init, Provide, Inject, MidwayHttpError } from '@midwayjs/core';
import { RedisService } from '@midwayjs/redis';

import { Network, NetworkModel } from '../common/network.entity';
import { Token, TokenModel } from './token.entity';

@Provide()
export class TokenService {
  @Inject()
  redisService: RedisService;

  @Init()
  async init() {}

  async getNetworks(): Promise<Network[]> {
    const cacheKey = 'networks:all';
    const data = await this.redisService.get(cacheKey);
    if (data) {
      return JSON.parse(data);
    }
    const result = await NetworkModel.find({}).lean();
    await this.redisService.set(cacheKey, JSON.stringify(result));
    return result;
  }

  async getTokenList(chain: string) {
    const cacheKey = `tokens:${chain}`;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // 检测是否存在
    const networks = await this.getNetworks();
    if (!networks.find((item) => item.chainCode === chain)) {
      throw new MidwayHttpError(`Network not found: ${chain}`, 404);
    }

    const tokenList: Token[] = await TokenModel.find({ chain }).lean();
    await this.redisService.set(cacheKey, JSON.stringify(tokenList), 'EX', 3600);
    return tokenList;
  }
}
