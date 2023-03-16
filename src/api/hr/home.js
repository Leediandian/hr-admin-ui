/*
 * @Author: diandian
 * @Date: 2023-02-26 00:18:50
 * @LastEditors: diandain 498728659@qq.com
 * @LastEditTime: 2023-02-26 22:11:42
 * @FilePath: \hr-admin-ui\src\api\hr\home.js
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
 */
import request from '@/utils/request'

// 获取统计数据
export function getCountData(query) {
  return request({
    url: '/hr/home/count',
    method: 'get',
    params: query
  })
}


// 统计各部门员工人数
export function getDepartmentData(query) {
  return request({
    url: '/hr/home/department',
    method: 'get',
    params: query
  })
}


// 获取员工考勤数据
export function getAttendanceData(query) {
  return request({
    url: '/hr/home/attendance',
    method: 'get',
    params: query
  })
}

