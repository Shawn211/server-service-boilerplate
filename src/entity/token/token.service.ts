import { Init, Provide, Inject, MidwayHttpError } from '@midwayjs/core';
import { RedisService } from '@midwayjs/redis';

import { Network, NetworkModel } from '../common/network.entity';
import { Token, TokenModel } from './token.entity';
import { QuoteDTO } from './token.dto';

type GasPriceResponse = {
  code: number,
  data: {
    standard: number,
    fast: number,
    instant: number
  },
  without_decimals: {
    standard: number,
    fast: number,
    instant: number
  }
}

type QuoteResponse = {
  code: number,
  data: any,
}

@Provide()
export class TokenService {
  private readonly API_BASE_URL = 'https://open-api.openocean.finance';

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

  async quote(quote: QuoteDTO) {
    if (!quote.gasPrice) {
      const gasPriceResponse = await fetch(`${this.API_BASE_URL}/v4/${quote.chain}/gasPrice`);
      if (!gasPriceResponse.ok) {
        throw new MidwayHttpError(`HTTP error: ${gasPriceResponse.status}`, 403, 'onchain_default');
      }

      const gasPriceData: GasPriceResponse = await gasPriceResponse.json();
      quote.gasPrice = gasPriceData.without_decimals.standard;
    }

    const quoteQuery = new URLSearchParams(quote as any as Record<string, string>).toString()
    const quoteResponse = await fetch(`${this.API_BASE_URL}/v4/${quote.chain}/quote?${quoteQuery}`);
    // todo 待补充 Price Quote 请求提示需要 Token Approve 的异常响应
    if (!quoteResponse.ok) {
      throw new MidwayHttpError(`HTTP error: ${quoteResponse.status}`, 403, 'onchain_default');
    }

    const quoteData: QuoteResponse = await quoteResponse.json();
    return quoteData.data;
  }
}
