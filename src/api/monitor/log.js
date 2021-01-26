import request from '@/utils/request'

/**
 * 查询所有日志
 */
export function queryLogInfo(params) {
  return request({
    url: 'api/logs',
    method: 'get',
    params
  })
}

/**
 * 查看错误详情
 * @param id
 */
export function getErrDetail(id) {
  return request({
    url: 'api/logs/error/' + id,
    method: 'get'
  })
}

/**
 * 清空错误日志
 */
export function delAllError() {
  return request({
    url: 'api/logs/del/error',
    method: 'delete'
  })
}

/**
 * 清空日志
 */
export function delAllInfo() {
  return request({
    url: 'api/logs/del/info',
    method: 'delete'
  })
}
