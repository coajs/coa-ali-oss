// @ts-nocheck

import { CoaAliOssBin, CoaAliOssObjectService } from '..'

// bucket配置
const ossBucketConfig = {
  accessKeyId: 'LTAIOKxxxxxxWSue9q',
  accessKeySecret: 'pyTLRH0sGooAxxxxxxxxxxxxxxxxxANqPedamD',
  region: 'oss-cn-shanghai',
  bucket: 'example-name',
  origin: 'https://example.domain.com/'
}

// 创建一个配置实例
const ossBucketBin = new CoaAliOssBin(ossBucketConfig)

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