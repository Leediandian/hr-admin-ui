import request from '@/utils/request'

// 查询工作时间管理列表
export function listWorkTime(query) {
  return request({
    url: '/hr/workTime/list',
    method: 'get',
    params: query
  })
}

// 查询工作时间管理详细
export function getWorkTime(id) {
  return request({
    url: '/hr/workTime/' + id,
    method: 'get'
  })
}

// 新增工作时间管理
export function addWorkTime(data) {
  return request({
    url: '/hr/workTime',
    method: 'post',
    data: data
  })
}

// 修改工作时间管理
export function updateWorkTime(data) {
  return request({
    url: '/hr/workTime',
    method: 'put',
    data: data
  })
}

// 删除工作时间管理
export function delWorkTime(id) {
  return request({
    url: '/hr/workTime/' + id,
    method: 'delete'
  })
}
