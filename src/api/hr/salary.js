import request from '@/utils/request'

// 查询薪资账套管理列表
export function listSalary(query) {
  return request({
    url: '/hr/salary/list',
    method: 'get',
    params: query
  })
}

// 查询薪资账套管理详细
export function getSalary(salaryId) {
  return request({
    url: '/hr/salary/' + salaryId,
    method: 'get'
  })
}

// 新增薪资账套管理
export function addSalary(data) {
  return request({
    url: '/hr/salary',
    method: 'post',
    data: data
  })
}

// 修改薪资账套管理
export function updateSalary(data) {
  return request({
    url: '/hr/salary',
    method: 'put',
    data: data
  })
}

// 删除薪资账套管理
export function delSalary(salaryId) {
  return request({
    url: '/hr/salary/' + salaryId,
    method: 'delete'
  })
}
