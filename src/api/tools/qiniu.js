import request from '@/utils/request'

export function get() {
  return request({
    url: 'api/qiNiuContent/config',
    method: 'get'
  })
}

/**
 * 分页查询文件列表
 * @param params
 */
export function getFileList(params) {
  return request({
    url: 'api/qiNiuContent',
    method: 'get',
    params
  })
}

/**
 * 访客分页查询文件列表
 * @param params
 */
export function getVisitorFileList(params) {
  return request({
    url: 'api/qiNiuContent/visitor',
    method: 'get',
    params
  })
}

export function update(data) {
  return request({
    url: 'api/qiNiuContent/config',
    data,
    method: 'put'
  })
}

export function download(id) {
  return request({
    url: 'api/qiNiuContent/download/' + id,
    method: 'get'
  })
}

export function sync() {
  return request({
    url: 'api/qiNiuContent/synchronize',
    method: 'post'
  })
}

export function del(ids) {
  return request({
    url: 'api/qiNiuContent',
    method: 'delete',
    data: ids
  })
}

export default { del, download, sync }
