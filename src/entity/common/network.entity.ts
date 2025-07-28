import { prop, getModelForClass } from '@typegoose/typegoose';
import normalize from '../../utils/mongoose-plugins/normalize';

/**
 * @chainName string 链名
 * @chainCode string 链码
 * @chainId string 链 ID
 * @nativeTokenAddress string 链原生代币地址
 */
export class Network {
  @prop({ required: true })
  chainName!: string;

  @prop({ required: true, unique: true, index: true })
  chainCode!: string;

  @prop({ required: true })
  chainId!: string;

  @prop({ required: true })
  nativeTokenAddress!: string;
}

// 应用 normalize 插件
const NetworkModel = getModelForClass(Network, {
  schemaOptions: {
    collection: 'Network', // 表名统一 PascalCase
    timestamps: true,
  },
});

// 应用 normalize 插件
NetworkModel.schema.plugin(normalize);

export { NetworkModel }; 
