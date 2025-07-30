import { Controller, Inject, Post, Body } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

import { QuoteDTO, SwapDTO } from './trade.dto';
import { TradeService } from './trade.service';

@Controller('/trade')
export class TradeController {
  @Inject()
  ctx: Context;

  @Inject()
  service: TradeService;

  @Post('/quote')
  async quote(@Body() quote: QuoteDTO) {
    return await this.service.quote(quote);
  }

  @Post('/swap')
  async swap(@Body() swap: SwapDTO) {
    return await this.service.swap(swap);
  }
}