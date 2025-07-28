import { Controller, Get, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

import { TokenService } from './token.service';

@Controller('/token')
export class UserController {
  @Inject()
  ctx: Context;

  @Inject()
  service: TokenService;

  @Get('/networks')
  async getNetworks() {
    return await this.service.getNetworks();
  }

  @Get('/list/:chain')
  async getTokenList() {
    const { chain } = this.ctx.params;
    return await this.service.getTokenList(chain);
  }
}
