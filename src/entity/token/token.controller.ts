import { Controller, Inject, Get, Post, Param, Body } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

import { QuoteDTO } from './token.dto';
import { TokenService } from './token.service';

@Controller('/token')
export class TokenController {
  @Inject()
  ctx: Context;

  @Inject()
  service: TokenService;

  @Get('/networks')
  async getNetworks() {
    return await this.service.getNetworks();
  }

  @Get('/list/:chain')
  async getTokenList(@Param('chain') chain: string) {
    return await this.service.getTokenList(chain);
  }

  @Post('/quote')
  async quote(@Body() quote: QuoteDTO) {
    return await this.service.quote(quote);
  }
}
