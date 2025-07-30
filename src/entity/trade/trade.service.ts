import { Provide, Inject, MidwayHttpError } from '@midwayjs/core';
import { RedisService } from '@midwayjs/redis';

import { QuoteDTO, SwapDTO } from './trade.dto';

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
  data: Record<string, any>,
}

type SwapResponse = {
  code: number,
  data: Record<string, any>,
}

@Provide()
export class TradeService {
  private readonly API_BASE_URL = 'https://open-api.openocean.finance';

  @Inject()
  redisService: RedisService;

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

  async swap(swap: SwapDTO) {
    const swapQuery = new URLSearchParams(swap as any as Record<string, string>).toString()
    const swapResponse = await fetch(`${this.API_BASE_URL}/v4/${swap.chain}/swap?${swapQuery}`);
    if (!swapResponse.ok) {
      throw new MidwayHttpError(`HTTP error: ${swapResponse.status}`, 403, 'onchain_default');
    }

    const swapData: SwapResponse = await swapResponse.json();
    return swapData.data;
  }
}