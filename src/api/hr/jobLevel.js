import request from '@/utils/request'

// 查询全部职称管理列表
export function allListJobLevel(query) {
  return request({
    url: '/hr/jobLevel/allList',
    method: 'get',
    params: query
  })
}

// 查询职称管理列表
export function listJobLevel(query) {
  return request({
    url: '/hr/jobLevel/list',
    method: 'get',
    params: query
  })
}

// 查询职称管理详细
export function getJobLevel(jobLevelId) {
  return request({
    url: '/hr/jobLevel/' + jobLevelId,
    method: 'get'
  })
}

// 新增职称管理
export function addJobLevel(data) {
  return request({
    url: '/hr/jobLevel',
    method: 'post',
    data: data
  })
}

// 修改职称管理
export function updateJobLevel(data) {
  return request({
    url: '/hr/jobLevel',
    method: 'put',
    data: data
  })
}

// 删除职称管理
export function delJobLevel(jobLevelId) {
  return request({
    url: '/hr/jobLevel/' + jobLevelId,
    method: 'delete'
  })
}
