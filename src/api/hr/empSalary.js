import request from '@/utils/request'

// 查询员工账套管理列表
export function listEmpSalary(query) {
  return request({
    url: '/hr/empSalary/list',
    method: 'get',
    params: query
  })
}

// 查询员工账套管理详细
export function getEmpSalary(id) {
  return request({
    url: '/hr/empSalary/' + id,
    method: 'get'
  })
}

// 新增员工账套管理
export function addEmpSalary(data) {
  return request({
    url: '/hr/empSalary',
    method: 'post',
    data: data
  })
}

// 修改员工账套管理
export function updateEmpSalary(data) {
  return request({
    url: '/hr/empSalary',
    method: 'put',
    data: data
  })
}

// 删除员工账套管理
export function delEmpSalary(id) {
  return request({
    url: '/hr/empSalary/' + id,
    method: 'delete'
  })
}
