import { Provide, Inject, MidwayHttpError } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
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
  ctx: Context;

  @Inject()
  redisService: RedisService;

  // todo 待优化成多渠道商支持
  async quote(quote: QuoteDTO) {
    this.ctx.req.on('close', () => {
      // todo 待完善多渠道商询价场景下，客户端断连则终止未完成的询价请求
    });
    /**
     * todo 多渠道商支持逻辑
     * 1. 查询渠道商支持 token 表，获取支持当前询价 token 的多个渠道商配置
     * 2. 根据配置对应进行请求询价，每个请求响应格式化统一结构后 SSE 推送
     * 以下为单渠道商询价 SSE 推送逻辑
     */
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
    this.ctx.res.write(`data: ${JSON.stringify(quoteData.data)}\n\n`);
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