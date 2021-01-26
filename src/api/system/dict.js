import request from '@/utils/request'

/**
 * 查询所有字典
 */
export function getDicts() {
  return request({
    url: 'api/dict/all',
    method: 'get'
  })
}

/**
 * 查询字典
 * @param params
 */
export function queryDicts(params) {
  return request({
    url: 'api/dict',
    method: 'get',
    params
  })
}

/**
 * 添加字典
 * @param data
 */
export function add(data) {
  return request({
    url: 'api/dict',
    method: 'post',
    data
  })
}

/**
 * 删除字典
 * @param ids
 */
export function del(ids) {
  return request({
    url: 'api/dict/',
    method: 'delete',
    data: ids
  })
}

/**
 * 修改字典
 * @param data
 */
export function edit(data) {
  return request({
    url: 'api/dict',
    method: 'put',
    data
  })
}

export default { add, edit, del }
