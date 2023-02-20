import request from '@/utils/request'

// 查询员工考勤管理列表
export function listAttendance(query) {
  return request({
    url: '/hr/attendance/list',
    method: 'get',
    params: query
  })
}

// 查询员工考勤管理详细
export function getAttendance(id) {
  return request({
    url: '/hr/attendance/' + id,
    method: 'get'
  })
}

// 新增员工考勤管理
export function addAttendance(data) {
  return request({
    url: '/hr/attendance',
    method: 'post',
    data: data
  })
}

// 修改员工考勤管理
export function updateAttendance(data) {
  return request({
    url: '/hr/attendance',
    method: 'put',
    data: data
  })
}

// 删除员工考勤管理
export function delAttendance(id) {
  return request({
    url: '/hr/attendance/' + id,
    method: 'delete'
  })
}
