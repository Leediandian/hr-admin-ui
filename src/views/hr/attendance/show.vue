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

    <el-table v-loading="loading" :data="attendanceMonthList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="员工工号" fixed align="center" prop="workId" width="140" />
      <el-table-column label="员工名称" fixed align="center" prop="employeeName" />

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
import { listEmployee } from "@/api/hr/employee";
const { proxy } = getCurrentInstance();

//员工考勤状态
const { employee_attendance_status } = proxy.useDict("employee_attendance_status");

// 选中数组
const ids = ref([]);
// 非单个禁用
const single = ref(true);
// 非多个禁用
const multiple = ref(true);
// 显示搜索条件
const showSearch = ref(true);
// 总条数
const total = ref(0);
// 员工考勤管理表格数据
const attendanceMonthList = ref([]);
// 总条数
const dayNum = ref(0);
// 弹出层标题
const title = ref("");
// 是否显示弹出层
const open = ref(false);
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

function handleSelect (item) {
  form.value.employeeId = item.employeeId
  form.value.employeeName = item.name
}
// 取消按钮
function cancel () {
  open.value = false;
  reset();
}
// 表单重置
function reset () {
  form.value = {
    id: null,
    employeeId: null,
    employeeName: "",
    morStartTime: null,
    morEndTime: null,
    aftStartTime: null,
    aftEndTime: null,
    attendanceDate: null,
    attendanceStatus: null,
    remark: null,
    createTime: null,
    updateTime: null,
    isDeleted: null
  };
  proxy.resetForm("attendanceRef");
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
// 多选框选中数据
function handleSelectionChange (selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 新增按钮操作 */
function handleAdd () {
  reset();
  open.value = true;
  title.value = "添加员工考勤管理";
}
/** 修改按钮操作 */
function handleUpdate (row) {
  reset();
  const id = row.id || ids.value
  getAttendance(id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改员工考勤管理";
  });
}
/** 提交按钮 */
function submitForm () {
  proxy.$refs["attendanceRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateAttendance(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addAttendance(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}
/** 删除按钮操作 */
function handleDelete (row) {
  const ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除员工考勤管理编号为"' + ids + '"的数据项？').then(function () {
    return delAttendance(ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}


/** 导出按钮操作 */
function handleExport () {
  proxy.download('hr/attendance/export', {
    ...queryParams.value
  }, `attendance_${new Date().getTime()}.xlsx`)
}


getList();
</script>
