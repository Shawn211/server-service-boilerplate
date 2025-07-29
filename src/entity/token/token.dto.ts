import { Rule, RuleType } from '@midwayjs/validate';

export class QuoteDTO {
  @Rule(RuleType.string().required())
  chain: string;

  @Rule(RuleType.string().required())
  inTokenAddress: string;

  @Rule(RuleType.string().required())
  outTokenAddress: string;

  @Rule(RuleType.string().required())
  amount: number;

  @Rule(RuleType.string())
  gasPrice?: number;

  @Rule(RuleType.string().required())
  slippage: number;
}
