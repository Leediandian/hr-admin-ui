/*
 * @Author: diandian
 * @Date: 2023-02-20 15:40:19
 * @LastEditors: diandain 498728659@qq.com
 * @LastEditTime: 2023-02-25 18:35:54
 * @FilePath: \hr-admin-ui\src\api\hr\employee.js
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
 */
import request from '@/utils/request'

// 查询员工档案管理列表
export function listEmployee(query) {
  return request({
    url: '/hr/employee/list',
    method: 'get',
    params: query
  })
}

// 查询员工档案管理详细
export function getEmployee(employeeId) {
  return request({
    url: '/hr/employee/' + employeeId,
    method: 'get'
  })
}

// 新增员工档案管理
export function addEmployee(data) {
  return request({
    url: '/hr/employee',
    method: 'post',
    data: data
  })
}

// 修改员工档案管理
export function updateEmployee(data) {
  return request({
    url: '/hr/employee',
    method: 'put',
    data: data
  })
}

// 删除员工档案管理
export function delEmployee(employeeId) {
  return request({
    url: '/hr/employee/' + employeeId,
    method: 'delete'
  })
}
