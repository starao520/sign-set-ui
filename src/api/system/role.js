import request from '@/utils/request'

// 获取所有的Role
export function getAll() {
  return request({
    url: 'api/roles/all',
    method: 'get'
  })
}

/**
 * 分页查询角色列表
 * @param params
 */
export function getRolesByPage(params) {
  return request({
    url: 'api/roles/page',
    method: 'get',
    params
  })
}

//  查询角色
export function getRole(params) {
  return request({
    url: 'api/roles',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/roles',
    method: 'post',
    data
  })
}

export function get(id) {
  return request({
    url: 'api/roles/' + id,
    method: 'get'
  })
}

export function getLevel() {
  return request({
    url: 'api/roles/level',
    method: 'get'
  })
}

export function del(ids) {
  return request({
    url: 'api/roles',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/roles',
    method: 'put',
    data
  })
}

export function editMenu(data) {
  return request({
    url: 'api/roles/menu',
    method: 'put',
    data
  })
}

export default { add, edit, del, get, editMenu, getLevel }
