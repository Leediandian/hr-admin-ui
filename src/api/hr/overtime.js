import request from '@/utils/request'

// 查询员工加班管理列表
export function listOvertime(query) {
  return request({
    url: '/hr/overtime/list',
    method: 'get',
    params: query
  })
}

// 查询员工加班管理详细
export function getOvertime(id) {
  return request({
    url: '/hr/overtime/' + id,
    method: 'get'
  })
}

// 新增员工加班管理
export function addOvertime(data) {
  return request({
    url: '/hr/overtime',
    method: 'post',
    data: data
  })
}

// 修改员工加班管理
export function updateOvertime(data) {
  return request({
    url: '/hr/overtime',
    method: 'put',
    data: data
  })
}

// 删除员工加班管理
export function delOvertime(id) {
  return request({
    url: '/hr/overtime/' + id,
    method: 'delete'
  })
}
