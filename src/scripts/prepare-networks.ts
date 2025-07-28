/* eslint-disable no-process-env */
import * as fs from 'fs';
import * as path from 'path';
import { mongoose } from '@typegoose/typegoose';
import { Network, NetworkModel } from '../entity/common/network.entity';

require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || '';

async function run() {
  // 1. 读取 networks.json
  const jsonPath = path.resolve(__dirname, './networks.json');
  const networks: Network[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  // 2. 连接数据库
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI 未设置');
  }
  await mongoose.connect(MONGODB_URI, {
    user: process.env.MONGODB_USER,
    pass: process.env.MONGODB_PASSWORD,
  });

  // 3. 获取数据库所有数据
  const dbNetworks = await NetworkModel.find({}).lean();
  const dbMap = new Map(dbNetworks.map(n => [n.chainCode, n]));

  let insertCount = 0;
  let updateCount = 0;
  let skipCount = 0;

  for (const localNet of networks) {
    const dbNet = dbMap.get(localNet.chainCode);
    if (!dbNet) {
      await NetworkModel.create(localNet);
      insertCount++;
    } else {
      // 只对比本地 json 字段
      let changed = false;
      for (const key of Object.keys(localNet)) {
        if (localNet[key] !== dbNet[key]) {
          changed = true;
          break;
        }
      }
      if (changed) {
        await NetworkModel.updateOne({ chainCode: localNet.chainCode }, localNet, { upsert: true });
        updateCount++;
      } else {
        skipCount++;
      }
    }
  }

  // 4. 断开连接
  await mongoose.disconnect();
  // eslint-disable-next-line no-console
  console.log(`网络配置已写入数据库，新增: ${insertCount}，更新: ${updateCount}，跳过: ${skipCount}`);
}

run().catch(err => {
  // eslint-disable-next-line no-console
  console.error('写入网络配置失败:', err);
  process.exit(1);
});
