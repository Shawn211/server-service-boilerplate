需求收集:

✅ 基础框架 - midway

✅ 参数校验 - validate

✅ 接口文档 - swagger

✅ 请求/错误包装

✅ 缓存 - redis

✅ 国际化 - i18n

✅ 数据库 - typegoose + mongoose

✅ 定时任务 - bull

✅ lint - eslint + prettier

# 部署流程

## 环境准备
- nodejs v22.17.1
- docker
- docker-compose

## 本地部署
```bash
yarn install
docker-compose -f docker-compose.yml up -d
yarn local
```

## OpenOcean 支持网络数据初始化
```bash
npx ts-node src/scripts/prepare-networks.ts
```
