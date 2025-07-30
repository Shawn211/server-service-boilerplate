import { Controller, Inject, Get, Post, Query, Body, SetHeader } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

import { QuoteDTO, SwapDTO } from './trade.dto';
import { TradeService } from './trade.service';

@Controller('/trade')
export class TradeController {
  @Inject()
  ctx: Context;

  @Inject()
  service: TradeService;

  @Get('/quote')
  @SetHeader({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })
  async quote(@Query() quote: QuoteDTO) {
    await this.service.quote(quote);
  }

  @Post('/swap')
  async swap(@Body() swap: SwapDTO) {
    return await this.service.swap(swap);
  }
}