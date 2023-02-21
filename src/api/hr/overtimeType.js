import request from '@/utils/request'


// 查询全部加班类型列表
export function allListOvertimeType(query) {
  return request({
    url: '/hr/overtimeType/allList',
    method: 'get',
    params: query
  })
}

// 查询加班类型列表
export function listOvertimeType(query) {
  return request({
    url: '/hr/overtimeType/list',
    method: 'get',
    params: query
  })
}

// 查询加班类型详细
export function getOvertimeType(overtimeTypeId) {
  return request({
    url: '/hr/overtimeType/' + overtimeTypeId,
    method: 'get'
  })
}

// 新增加班类型
export function addOvertimeType(data) {
  return request({
    url: '/hr/overtimeType',
    method: 'post',
    data: data
  })
}

// 修改加班类型
export function updateOvertimeType(data) {
  return request({
    url: '/hr/overtimeType',
    method: 'put',
    data: data
  })
}

// 删除加班类型
export function delOvertimeType(overtimeTypeId) {
  return request({
    url: '/hr/overtimeType/' + overtimeTypeId,
    method: 'delete'
  })
}
