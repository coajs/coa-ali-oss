import { CoaError } from 'coa-error'
import { $, _, axios } from 'coa-helper'
import * as fs from 'fs'
import * as path from 'path'
import { CoaAliOssBin } from './CoaAliOssBin'

export class CoaAliOssObjectService {

  private readonly bin: CoaAliOssBin

  constructor (bin: CoaAliOssBin) {
    this.bin = bin
  }

  // 获取上传图片所需的token
  token (dir = 'dir') {
    return this.bin.getNewToken(dir)
  }

  // 从服务器获取数据
  async get (remote: string) {
    return await this.bin.getBuffer(remote)
  }

  // 从服务器获取元信息数据
  async head (remote: string) {
    return await this.bin.head(remote)
  }

  // 将服务器文件下载到本地
  async download (remote: string, local: string) {

    const res = await this.bin.getStream(remote)

    // 创建本地文件夹
    fs.mkdirSync(path.dirname(local), { recursive: true })
    const writer = fs.createWriteStream(local)

    // 等待文件写入完成
    await new Promise(resolve => res.pipe(writer).on('close', resolve))
  }

  // 将Buffer写入服务器
  async put (remote: string, data: Buffer) {
    await this.bin.put(remote, data)
  }

  // 将本地文件上传到服务器
  async upload (remote: string, local: string, deleteSource: boolean = true) {

    const data = fs.createReadStream(local)

    await this.bin.put(remote, data)

    deleteSource && fs.unlinkSync(local)
  }

  // 将服务器上文件复制到另一个地方
  async copy (dist: string, src: string, bucket = this.bin.config.bucket) {
    const source = `/${bucket}/${src}`
    await this.bin.put(dist, undefined, { 'x-oss-copy-source': source })
  }

  // 获取图片的基本信息
  async imageInfo (remote: string) {

    const url = this.bin.config.origin + remote + '?x-oss-process=image/info'
    const { data } = await axios.get(url).catch(async () => CoaError.message('OssImage.NoImage', '图片不存在'))
    const info = _.isPlainObject(data) ? $.camelCaseKeys(data) : data as { [k: string]: any }
    const width = _.toNumber(info.imageWidth.value)
    const height = _.toNumber(info.imageHeight.value)
    const fileSize = _.toNumber(info.fileSize.value)

    return { width, height, fileSize }
  }

  // 删除服务器上的文件
  async delete (remote: string) {
    await this.bin.delete(remote)
  }
}