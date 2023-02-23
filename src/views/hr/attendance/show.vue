<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label="员工名称" prop="employeeName">
        <el-input v-model="queryParams.employeeName" placeholder="请输入员工名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>

      <el-form-item label="考勤日期" prop="month">
        <el-date-picker clearable v-model="queryParams.month" type="date" value-format="YYYYMM" format="YYYYMM"
          placeholder="请选择考勤日期">
        </el-date-picker>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['hr:attendance:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="attendanceMonthList" >
      <el-table-column label="员工工号" fixed align="center" prop="workId" width="140" />
      <el-table-column label="员工名称" fixed align="center" prop="employeeName" />
      <el-table-column label="部门名称"  align="center" prop="deptName" width="130" />
      <el-table-column label="职位"  align="center" prop="postName" width="130" />
      <el-table-column v-for="index in dayNum" :label="index + '日'" :key="index" min-width="55">
        <template #default="scope">
          <dict-tag :options="employee_attendance_status" :value="scope.row.attendanceList[index - 1].value" />
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

  </div>
</template>

<script setup name="Show">
import { monthOfList } from "@/api/hr/attendance";
const { proxy } = getCurrentInstance();

//员工考勤状态
const { employee_attendance_status } = proxy.useDict("employee_attendance_status");


// 显示搜索条件
const showSearch = ref(true);
// 总条数
const total = ref(0);
// 员工考勤管理表格数据
const attendanceMonthList = ref([]);
// 总条数
const dayNum = ref(0);

const loading = ref(true);
// 查询参数/表单参数/表单校验
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    employeeId: null,
    employeeName: null,
    month: null
  },
  rules: {
    employeeId: [
      { required: true, message: "员工不能为空", trigger: "change" }
    ],
    attendanceDate: [
      { required: true, message: "考勤日期不能为空", trigger: "change" }
    ],
    attendanceStatus: [
      { required: true, message: "考勤状态不能为空", trigger: "change" }
    ],
  },
});
const { queryParams, form, rules } = toRefs(data);

/** 查询每月员工考勤管理列表 考勤表现 */
function getList () {
  loading.value = true;
  monthOfList(queryParams.value).then(response => {
    attendanceMonthList.value = response.rows;
    dayNum.value = response.rows[0].dayNum
    total.value = response.total;
    loading.value = false;
  });
}


/** 搜索按钮操作 */
function handleQuery () {
  queryParams.value.pageNum = 1;
  getList();
}
/** 重置按钮操作 */
function resetQuery () {
  proxy.resetForm("queryForm");
  handleQuery();
}

/** 月考勤统计数据 导出按钮操作 */
function handleExport () {
  loading.value = true;
  proxy.download('hr/attendance/exportMonthList', {
    ...queryParams.value
  }, `员工${ proxy.parseTime(new Date(), '{y}年{m}月')}考勤统计.xlsx`)
  loading.value = false;
}

getList();
</script>
