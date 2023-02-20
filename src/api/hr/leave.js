import request from '@/utils/request'

// 查询请假审批管理列表
export function listLeave(query) {
  return request({
    url: '/hr/leave/list',
    method: 'get',
    params: query
  })
}

// 查询请假审批管理详细
export function getLeave(leaveId) {
  return request({
    url: '/hr/leave/' + leaveId,
    method: 'get'
  })
}

// 新增请假审批管理
export function addLeave(data) {
  return request({
    url: '/hr/leave',
    method: 'post',
    data: data
  })
}

// 修改请假审批管理
export function updateLeave(data) {
  return request({
    url: '/hr/leave',
    method: 'put',
    data: data
  })
}

// 删除请假审批管理
export function delLeave(leaveId) {
  return request({
    url: '/hr/leave/' + leaveId,
    method: 'delete'
  })
}
