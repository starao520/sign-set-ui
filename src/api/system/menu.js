import request from '@/utils/request'

export function getMenusTree(pid) {
  return request({
    url: 'api/menus/lazy?pid=' + pid,
    method: 'get'
  })
}

/**
 * 查询简化菜单树
 */
export function getSimpleMenusTree() {
  return request({
    url: 'api/menus/tree',
    method: 'get'
  })
}

/**
 * 查询当前角色的最下级菜单列表
 * @param params
 */
export function getLowerMenus(params) {
  return request({
    url: 'api/menus/lower',
    method: 'get',
    params
  })
}

export function getMenus(params) {
  return request({
    url: 'api/menus',
    method: 'get',
    params
  })
}

export function getMenuSuperior(ids) {
  const data = ids.length || ids.length === 0 ? ids : Array.of(ids)
  return request({
    url: 'api/menus/superior',
    method: 'post',
    data
  })
}

export function buildMenus() {
  return request({
    url: 'api/menus/build',
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: 'api/menus',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/menus',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/menus',
    method: 'put',
    data
  })
}

export default { add, edit, del, getMenusTree, getMenuSuperior, getMenus }
