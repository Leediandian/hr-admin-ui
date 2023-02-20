import request from '@/utils/request'

// 查询员工调薪列表
export function listAdjustSalary(query) {
  return request({
    url: '/hr/adjustSalary/list',
    method: 'get',
    params: query
  })
}

// 查询员工调薪详细
export function getAdjustSalary(id) {
  return request({
    url: '/hr/adjustSalary/' + id,
    method: 'get'
  })
}

// 新增员工调薪
export function addAdjustSalary(data) {
  return request({
    url: '/hr/adjustSalary',
    method: 'post',
    data: data
  })
}

// 修改员工调薪
export function updateAdjustSalary(data) {
  return request({
    url: '/hr/adjustSalary',
    method: 'put',
    data: data
  })
}

// 删除员工调薪
export function delAdjustSalary(id) {
  return request({
    url: '/hr/adjustSalary/' + id,
    method: 'delete'
  })
}
