import { Init, Provide } from '@midwayjs/core';
import { NetworkModel } from '../common/network.entity';

@Provide()
export class TokenService {
  @Init()
  async init() {}

  async getNetworks() {
    return await NetworkModel.find({}).lean();
  }

  async getToken() {}
}
