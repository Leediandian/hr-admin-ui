import request from '@/utils/request'

// 查询员工奖惩管理列表
export function listEmployeeec(query) {
  return request({
    url: '/hr/employeeec/list',
    method: 'get',
    params: query
  })
}

// 查询员工奖惩管理详细
export function getEmployeeec(employeeecId) {
  return request({
    url: '/hr/employeeec/' + employeeecId,
    method: 'get'
  })
}

// 新增员工奖惩管理
export function addEmployeeec(data) {
  return request({
    url: '/hr/employeeec',
    method: 'post',
    data: data
  })
}

// 修改员工奖惩管理
export function updateEmployeeec(data) {
  return request({
    url: '/hr/employeeec',
    method: 'put',
    data: data
  })
}

// 删除员工奖惩管理
export function delEmployeeec(employeeecId) {
  return request({
    url: '/hr/employeeec/' + employeeecId,
    method: 'delete'
  })
}
