import { prop, getModelForClass } from '@typegoose/typegoose';
import normalize from '../../utils/mongoose-plugins/normalize';

/**
 * @id number 代币 ID
 * @code string 代币码
 * @name string 代币名称
 * @address string 代币合约地址
 * @decimals number 代币小数位数
 * @symbol string 代币符号
 * @icon string 代币图标
 * @usdPrice string 美元价格
 * @chain string 链码
 * @createtime string 创建时间
 * @usd string 美元价格
 */
export class Token {
  @prop({ required: true })
  id!: number;

  @prop({ required: true })
  code!: string;

  @prop({ required: true, unique: true, index: true })
  name!: string;

  @prop({ required: true })
  address!: string;

  @prop({ required: true })
  decimals!: number;

  @prop({ required: true })
  symbol!: string;

  @prop({ required: true })
  icon!: string;

  @prop({ required: true, index: true })
  chain!: string;

  @prop({ required: true })
  createtime!: string;

  @prop({ required: true })
  usd!: string;
}

// 应用 normalize 插件
const TokenModel = getModelForClass(Token, {
  schemaOptions: {
    collection: 'Token', // 表名统一 PascalCase
    timestamps: true,
  },
});

// 应用 normalize 插件
TokenModel.schema.plugin(normalize);

export { TokenModel }; 
