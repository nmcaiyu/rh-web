import request from '@/utils/request'

// 查询租户信息列表
export function listTenant(query) {
  return request({
    url: '/landlord/tenant/list',
    method: 'get',
    params: query
  })
}

// 查询租户信息详细
export function getTenant(id) {
  return request({
    url: '/landlord/tenant/' + id,
    method: 'get'
  })
}

// 新增租户信息
export function addTenant(data) {
  return request({
    url: '/landlord/tenant',
    method: 'post',
    data: data
  })
}

// 修改租户信息
export function updateTenant(data) {
  return request({
    url: '/landlord/tenant',
    method: 'put',
    data: data
  })
}

// 删除租户信息
export function delTenant(id) {
  return request({
    url: '/landlord/tenant/' + id,
    method: 'delete'
  })
}
