import { axios, _ } from 'coa-helper'
import { secure } from 'coa-secure'
import { escape } from 'querystring'
import { Stream } from 'stream'
import { CoaAliOss } from '../typings'

export class CoaAliOssBin {

  public readonly config: CoaAliOss.Config

  constructor (config: CoaAliOss.Config) {
    this.config = config
  }

  async getStream (remote: string) {
    const configs = this.requestConfigs('GET', remote)
    // 如果不存在x-oss-process，则进行转义处理，保证签名成功
    if (!remote.includes('x-oss-process=')) remote = escape(remote)
    const { data } = await axios.get(remote, { ...configs, responseType: 'stream' })
    return data as Stream
  }

  async getBuffer (remote: string) {
    const configs = this.requestConfigs('GET', remote)
    const { data } = await axios.get(escape(remote), { ...configs, responseType: 'arraybuffer' })
    return data as Buffer
  }

  async head (remote: string, headers = {}) {
    const configs = this.requestConfigs('HEAD', remote, headers)
    return await axios.head(escape(remote), configs).catch(e => e)
  }

  async put (remote: string, data?: Buffer | Stream, headers = {}) {
    const configs = this.requestConfigs('PUT', remote, headers)
    await axios.put(escape(remote), data, configs)
  }

  async delete (remote: string) {
    const configs = this.requestConfigs('DELETE', remote)
    await axios.delete(escape(remote), configs)
  }

  // 获取一个新的上传token
  getNewToken (dir: string, ms: number = 24 * 3600 * 1e3) {

    dir = dir.trim().replace(/\/+/g, '/')

    const accessid = this.config.accessKeyId
    const host = this.config.origin
    const origin = this.config.origin
    const endpoint = `http://${this.config.bucket}.${this.config.region}.aliyuncs.com/`

    const expire = _.now() + ms //设置失效时间为1天
    const policyText = {
      'expiration': new Date(expire).toISOString(), //设置该Policy的失效时间，超过这个失效时间之后，就没有办法通过这个policy上传文件了
      'conditions': [
        // ["content-length-range", 0, 1048576000], // 设置上传文件的大小限制
        ['starts-with', '$key', dir], // 设置上传文件的文件目录限制
      ],
    }

    const policy = secure.base64_encode(JSON.stringify(policyText))
    const signature = secure.sha1_hmac(policy, this.config.accessKeySecret, 'base64')

    return { accessid, policy, signature, expire, host, origin, endpoint, dir }
  }

  // request配置
  requestConfigs (method: string, object: string, headers: { [header: string]: string } = {}) {

    headers['Date'] = new Date().toUTCString()
    headers['Content-MD5'] = ''
    headers['Content-Type'] = ''
    headers['Authorization'] = this.signature(method, object, headers)

    const baseURL = `http://${this.config.bucket}.${this.config.region}.aliyuncs.com/`
    const maxContentLength = 1024 * 1024 * 1024 * 100 // 1024M * 100 = 100G
    const maxBodyLength = 1024 * 1024 * 1024 * 10 // 1024M * 10 = 10G

    return { headers, baseURL, maxContentLength, maxBodyLength }
  }

  // 签名
  private signature (method: string, object: string, headers: { [header: string]: string }) {

    const x_oss_list = [] as string[], signs = [] as string[]

    _.forEach(headers, (v, k) => {
      k.startsWith('x-oss') && x_oss_list.push(k + ':' + v)
    })

    signs.push(method || '')
    signs.push(headers['Content-Md5'] || '')
    signs.push(headers['Content-Type'] || '')
    signs.push(headers['Date'] || '')
    signs.push(...x_oss_list.sort())
    signs.push(`/${this.config.bucket}/${object}`)

    const signature = secure.sha1_hmac(signs.join('\n'), this.config.accessKeySecret, 'base64')

    return `OSS ${this.config.accessKeyId}:${signature}`
  }

}