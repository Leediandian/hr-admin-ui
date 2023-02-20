import request from '@/utils/request'

// 查询员工调动列表
export function listEmployeeRemove(query) {
  return request({
    url: '/hr/employeeRemove/list',
    method: 'get',
    params: query
  })
}

// 查询员工调动详细
export function getEmployeeRemove(id) {
  return request({
    url: '/hr/employeeRemove/' + id,
    method: 'get'
  })
}

// 新增员工调动
export function addEmployeeRemove(data) {
  return request({
    url: '/hr/employeeRemove',
    method: 'post',
    data: data
  })
}

// 修改员工调动
export function updateEmployeeRemove(data) {
  return request({
    url: '/hr/employeeRemove',
    method: 'put',
    data: data
  })
}

// 删除员工调动
export function delEmployeeRemove(id) {
  return request({
    url: '/hr/employeeRemove/' + id,
    method: 'delete'
  })
}
