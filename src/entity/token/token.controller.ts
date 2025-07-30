import { Controller, Inject, Get, Param } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

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
}
