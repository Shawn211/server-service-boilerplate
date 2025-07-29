import { IProcessor, Processor } from '@midwayjs/bull';
import { FORMAT, Inject, MidwayError } from '@midwayjs/core';
import { RedisService } from '@midwayjs/redis';
import { Network, NetworkModel } from '../entity/common/network.entity';
import { Token, TokenModel } from '../entity/token/token.entity';

@Processor('tokenSchedule', {
  repeat: {
    cron: FORMAT.CRONTAB.EVERY_PER_5_MINUTE,
  },
})
export class TokenProcessor implements IProcessor {
  private readonly API_BASE_URL = 'https://open-api.openocean.finance';

  @Inject()
  redisService: RedisService;

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

  async execute() {
    const networks = await this.getNetworks();
    for (const network of networks) {
      const response = await fetch(`${this.API_BASE_URL}/v4/${network.chainCode}/tokenList`);
      if (!response.ok) {
        throw new MidwayError(`HTTP error: ${response.status}`);
      }

      const tokenList: Token[] = await response.json();

      // 更新 mongodb
      const bulkOps = tokenList.map(token => ({
        updateOne: {
          filter: { chain: network.chainCode, name: token.name },
          update: { $set: token },
          upsert: true
        }
      }));
      await TokenModel.bulkWrite(bulkOps);

      // 更新 redis
      const cacheKey = `tokens:${network.chainCode}`;
      await this.redisService.set(cacheKey, JSON.stringify(tokenList));

      // 间隔 1s
      await new Promise(res => setTimeout(res, 1000));
    }
  }
}
