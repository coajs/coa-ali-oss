# coa-ali-oss

[![GitHub license](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)](LICENSE)
[![npm version](https://img.shields.io/npm/v/coa-ali-oss.svg?style=flat-square)](https://www.npmjs.org/package/coa-ali-oss)
[![npm downloads](https://img.shields.io/npm/dm/coa-ali-oss.svg?style=flat-square)](http://npm-stat.com/charts.html?package=coa-ali-oss)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/coajs/coa-ali-oss/pulls)

轻量的阿里云OSS库 for Node.js

来源于一个实际生产项目，将常用的API和业务解耦后封装成此库，尚未覆盖到阿里云OSS的全部操作。后续会根据实际使用情况优化和扩充新的服务。若需用到其他完整接口，可以直接使用阿里云官方SDK [ali-oss](https://github.com/ali-sdk/ali-oss)

## 特征

- **轻量** 相对于官方的SDK，无第三方依赖，更轻量
- **COA友好** 配合COA使用，效率更高，报错信息更友好
- **TypeScript** 使用TypeScript编写，类型约束，IDE友好

## 用法

### 安装

```shell
yarn add coa-ali-oss
```

### 创建配置实例

```typescript
import { CoaAliOssBin } from 'coa-ali-oss'

// bucket配置
const ossBucketConfig = {
  accessKeyId: 'LTAIOKxxxxxxWSue9q',
  accessKeySecret: 'pyTLRH0sGooAxxxxxxxxxxxxxxxxxANqPedamD',
  region: 'oss-cn-shanghai',
  bucket: 'bucket-name',
  origin: 'https://example.coajs.com/'
}

// 创建一个配置实例
const ossBucketBin = new CoaAliOssBin(ossBucketConfig)
```

### 操作Object

操作Object的原始API详见 [阿里云帮助文档](https://help.aliyun.com/document_detail/31978.html)

```typescript
import { CoaAliOssObjectService } from 'coa-ali-oss'

// 创建一个Object服务
const objectService = new CoaAliOssObjectService(ossBucketBin)

// 获取前端上传图片所需的token，图片路径前缀必传
// 前端上传图片机制详见 https://help.aliyun.com/document_detail/31926.html
await objectService.token('user/avatar')

// 从服务器获取数据
await objectService.get('user/avatar/001.png')

// 从服务器获取元信息数据
await objectService.head('user/avatar/001.png')

// 将服务器文件下载到本地
await objectService.download('user/avatar/001.png', '/local-path/avatar/001.png')

// 将Buffer写入服务器
await objectService.put('user/avatar/002.png', Buffer.from([/*buffer数据*/]))

// 将本地文件上传到服务器
await objectService.download('user/avatar/002.png', '/local-path/avatar/002.png')

// 将服务器上文件复制到另一个地方
await objectService.copy('user/avatar/001.png', 'new/avatar/001.png')

// 删除服务器上的文件
await objectService.delete('user/avatar/002.png')

// 获取图片的基本信息
await objectService.imageInfo('user/avatar/001.png') // { width:1280, height:720, fileSize:160000 }
```