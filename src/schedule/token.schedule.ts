import { IProcessor, Processor } from '@midwayjs/bull';
import { FORMAT, Inject, MidwayError } from '@midwayjs/core';
import { RedisService } from '@midwayjs/redis';
import { createHash } from 'crypto';
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

  // todo 待完成针对多渠道商定时同步支持网络的支持 token 功能
  async execute() {
    const networks = await this.getNetworks();
    for (const network of networks) {
      const response = await fetch(`${this.API_BASE_URL}/v4/${network.chainCode}/tokenList`);
      if (!response.ok) {
        throw new MidwayError(`HTTP error: ${response.status}`);
      }

      const tokenList: Token[] = await response.json();

      // 网络支持 token 更新检测
      const hash = createHash('md5').update(JSON.stringify(tokenList)).digest('hex');
      const hashKey = `tokens:${network.chainCode}:hash`;
      const cachedHash = await this.redisService.get(hashKey);
      if (cachedHash === hash) {
        continue;
      }
      await this.redisService.set(hashKey, hash);

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
