<!--
 * @Author: diandian
 * @Date: 2023-02-20 15:40:20
 * @LastEditors: diandain 498728659@qq.com
 * @LastEditTime: 2023-02-27 00:45:48
 * @FilePath: \hr-admin-ui\src\views\index.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <div class="app-container home">
    <el-card>
      <div class="box-card">
        <div class="box-card-left">
          <div class="box-card-left-title">您好，{{ userStore.user.nickName }}，请开始一天的工作吧</div>
          <div class="box-card-left-rows">
            <div>用户账号:{{ userStore.user.userName }}</div>
            <div>所属部门:{{ userStore.user.dept.deptName }}</div>
          </div>
          <div class="box-card-left-rows">
            <div>角色:{{ userStore.roles }}</div>
          </div>
          <div class="box-card-left-rows">
            <div>上次登录时间:{{ parseTime(userStore.user.loginDate) }}</div>
            <div>登录Ip:{{ userStore.user.loginIp }}</div>
          </div>
          <div class="box-card-left-rows">
            <div style="display: flex;align-items: center;"><el-icon class="box-card-left-icon">
                <user />
              </el-icon>员工总数({{ countData.obj.employeeCont }})</div>
            <div style="display: flex;align-items: center;"><el-icon class="box-card-left-icon">
                <user />
              </el-icon>系统用户总数({{ countData.obj.userCont }})</div>
          </div>
          <div class="box-card-left-rows">
            <div style="display: flex;align-items: center;"><el-icon class="box-card-left-icon">
                <user />
              </el-icon>本月入职人数({{ countData.obj.beginWorkNum }})</div>
            <div style="display: flex;align-items: center;"><el-icon class="box-card-left-icon">
                <user />
              </el-icon>本月离职人数({{ countData.obj.notWorkNum }})</div>
          </div>
        </div>
        <img class="box-card-right" src="../assets/images/dashboard.png">
      </div>
    </el-card>
    <el-card style="margin-top: 20px;height: 450px;" v-if="userStore.user.userName != 'admin'">
      <el-calendar v-model="attendanceData.date" class="el-calendar-tables">
        <template #date-cell="{ data }">
          <span>{{ data.date.getDate() }}</span>
          <dict-tag v-show="data.type === 'current-month'"
            v-for="(value, key) in attendanceData.list[data.date.getDate() - 1]"
            v-if="attendanceData.list[data.date.getDate() - 1]" :options="employee_attendance_status" :value="value" />
        </template>
      </el-calendar>
    </el-card>
    <el-card style="margin-top: 20px;">
      <template #header><span>数据可视化</span></template>
      <div class="el-table el-table--enable-row-hover el-table--medium">
        <div ref="deptEchart" style="height: 420px;" />
      </div>
      <div style="display: flex;justify-content: space-between;align-items: center;">
        <div ref="ageEchart" style="height: 420px;width: 550px;" />
        <div ref="tEchart" style="height: 420px;width: 550px;" />
      </div>
    </el-card>
  </div>
</template>

<script setup name="Index">
import { getCountData, getDepartmentData, getAttendanceData } from "@/api/hr/home";
import useUserStore from '@/store/modules/user'
import * as echarts from 'echarts';

const { proxy } = getCurrentInstance();
const userStore = useUserStore()
//员工考勤状态
const { employee_attendance_status } = proxy.useDict("employee_attendance_status");

const deptList = ref([]);
//部门情况
const deptEchart = ref(null);
//年龄分布
const ageEchart = ref(null);
//学历分布
const tEchart = ref(null);
const attendanceData = reactive({
  list: [],
  date: ""
})
const countData = reactive({
  obj: {}
})
const data = reactive({
  queryParams: {
    workId: undefined,
    month: null
  },
});
const { queryParams } = toRefs(data);

watch(() => attendanceData.date,
  (newValue, oldValue) => {
    getStaffAttendance();
  });

function init () {
  getCountList();
  if (userStore.user.userName != "admin") {
    getAttendanceList();
  }
  getDepartmentList();
}

function getAttendanceList () {
  queryParams.value.workId = userStore.user.userName
  getAttendanceData(queryParams.value).then(response => {
    attendanceData.list = response.data
  });
}
function getDepartmentList () {
  getDepartmentData().then(response => {
    deptList.value = response.data
    const deptIntance = echarts.init(deptEchart.value, "macarons");
    deptIntance.setOption({
      title: {
        text: '部门人数比例',
        subtext: '',
        left: 'center'
      },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      legend: {
        right: 20,
        top: 20,
        bottom: 20,
        type: 'scroll',
        orient: 'vertical',
        data: deptList.value.filter(item => item.name)
      },
      series: [
        {
          name: '部门情况',
          type: 'pie',
          roseType: 'radius',
          radius: [15, 95],
          center: ['50%', '38%'],
          data: deptList.value,
          animationEasing: 'cubicInOut',
          animationDuration: 2600
        }
      ]
    });
  });
}
function getCountList () {
  getCountData().then(response => {
    countData.obj = response.data

    const ageList = []
    const ageMap = new Map(Object.entries(response.data.ageMap))
    for (let [key, value] of ageMap) {
      ageList.push({name:key,value:value})
    }
    const tList = []
    const tMap = new Map(Object.entries(response.data.tiptopDegreeMap))
    for (let [key, value] of tMap) {
      tList.push({name:key,value:value})
    }

    const ageIntance = echarts.init(ageEchart.value, "macarons");
    ageIntance.setOption({
      title: {
        text: '员工年龄比例',
        subtext: '',
        left: 'center'
      },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      legend: {
        right: 20,
        top: 20,
        bottom: 20,
        type: 'scroll',
        orient: 'vertical',
        data: ageList.filter(item=>item.name)
      },
      series: [
        {
          name: '员工年龄比例',
          type: 'pie',
          roseType: 'radius',
          radius: [15, 95],
          center: ['50%', '38%'],
          data: ageList,
          animationEasing: 'cubicInOut',
          animationDuration: 2600
        }
      ]
    });

    const tIntance = echarts.init(tEchart.value, "macarons");
    tIntance.setOption({
      title: {
        text: '员工学历比例',
        subtext: '',
        left: 'center'
      },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      legend: {
        right: 20,
        top: 20,
        bottom: 20,
        type: 'scroll',
        orient: 'vertical',
        data: tList.filter(item=>item.name)
      },
      series: [
        {
          name: '员工学历比例',
          type: 'pie',
          roseType: 'radius',
          radius: [15, 95],
          center: ['50%', '38%'],
          data: tList,
          animationEasing: 'cubicInOut',
          animationDuration: 2600
        }
      ]
    });

  });
}
// 获取指定月份员工的考勤数据
function getStaffAttendance () {
  let d = attendanceData.date
  let month = ''
  if (d.getMonth() < 9) {
    month = d.getFullYear() + "0" + (d.getMonth() + 1)
  } else {
    month = d.getFullYear() + "" + (d.getMonth() + 1)
  }
  getAttendanceData({ workId: userStore.user.userName, month: month }).then(response => {
    attendanceData.list = response.data
  })
}

init();
</script>

<style scoped lang="scss">
.home {
  .box-card {
    height: 260px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #777;

    .box-card-left {
      height: 100%;
      display: flex;
      flex-direction: column;

      .box-card-left-title {
        font-size: 22px;
        color: #343844;
      }

      .box-card-left-rows {
        margin-top: 18px;
        color: #6b7687;
        width: 600px;
        align-items: center;
        display: flex;
        justify-content: space-between;

        .box-card-left-icon {
          margin-right: 8px;
        }
      }
    }


    .box-card-right {
      height: 600px;
      width: 600px;
      margin-top: 28px;
    }
  }

  // :deep(.el-calendar-table) {
  //   :deep(.el-calendar-day) {
  //     height: 54px !important;
  //   }
  // }


}
</style>

<style>
.el-calendar-table .el-calendar-day {
  height: 55px !important;
  align-items: center;
  display: flex;
  flex-flow: column;
}
</style>