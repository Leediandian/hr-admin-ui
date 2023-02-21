<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label="员工名称" prop="employeeName">
        <el-input v-model="queryParams.employeeName" placeholder="请输入员工名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="请假类型" prop="leaveType">
        <el-select v-model="queryParams.leaveType" placeholder="请选择请假类型" clearable>
          <el-option v-for="dict in employee_leave_type" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="请假状态" prop="leaveStatus">
        <el-select v-model="queryParams.leaveStatus" placeholder="请选择请假状态" clearable>
          <el-option v-for="dict in employee_leave_status" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['hr:leave:add']">新增请假审批</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['hr:leave:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['hr:leave:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['hr:leave:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="leaveList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="请假编号" align="center" prop="leaveId" />
      <el-table-column label="员工名称" align="center" prop="employeeName" />
      <el-table-column label="请假天数" align="center" prop="days" />
      <el-table-column label="请假类型" align="center" prop="leaveType">
        <template #default="scope">
          <dict-tag :options="employee_leave_type" :value="scope.row.leaveType" />
        </template>
      </el-table-column>
      <el-table-column label="请假的开始日期" align="center" prop="startDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="请假的结束日期" align="center" prop="endDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="请假状态" align="center" prop="leaveStatus">
        <template #default="scope">
          <dict-tag :options="employee_leave_status" :value="scope.row.leaveStatus" />
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="250">
        <template #default="scope">
          <el-button link type="primary" icon="Switch" @click="handleUpdate(scope.row)"
            v-hasPermi="['hr:overtime:edit']">审批</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['hr:overtime:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['hr:overtime:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改请假审批管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="leaveRef" :model="form" :rules="rules" :disabled="form.leaveStatus!='0'">
        <el-form-item label="员工" prop="employeeId">
          <el-autocomplete v-model="form.employeeName" :fetch-suggestions="getEmployeeList" placeholder="请输入员工名称"
            @select="handleSelect" clearable :disabled="title=='修改请假审批管理'">
            <template #suffix>
              <el-icon class="el-input__icon">
                <edit />
              </el-icon>
            </template>
            <template #default="{ item }">
              <span class="link">{{ item.name }}</span> ---
              <span class="value">{{ item.dept.deptName }}</span>
            </template>
          </el-autocomplete>
        </el-form-item>

        <el-form-item label="请假类型" prop="leaveType">
          <el-select v-model="form.leaveType" placeholder="请选择请假类型" clearable>
            <el-option v-for="dict in employee_leave_type" :key="dict.value" :label="dict.label"
              :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="请假天数" prop="days">
          <el-input v-model="form.days" placeholder="请输入请假天数" @input="limitInput($event, 'days')" clearable />
        </el-form-item>
        <el-form-item label="请假的开始日期" prop="startDate">
          <el-date-picker clearable v-model="form.startDate" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD"
            placeholder="请选择请假的开始日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="请假的结束日期" prop="endDate">
          <el-date-picker clearable v-model="form.endDate" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD"
            placeholder="请选择请假的结束日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="请假状态" prop="leaveStatus">
          <el-select v-model="form.leaveStatus" placeholder="请选择请假状态" clearable disabled >
            <el-option v-for="dict in employee_leave_status" :key="dict.value" :label="dict.label"
              :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="请假原因" prop="leaveReason">
          <el-input v-model="form.leaveReason" type="textarea" placeholder="请输入请假原因" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Leave">
import { listLeave, getLeave, delLeave, addLeave, updateLeave } from "@/api/hr/leave";
import { listEmployee } from "@/api/hr/employee";

const { proxy } = getCurrentInstance();
//员工请假状态列表
const { employee_leave_status } = proxy.useDict("employee_leave_status");
//员工请假类型列表
const { employee_leave_type } = proxy.useDict("employee_leave_type");
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
// 请假审批管理表格数据
const leaveList = ref([]);
const employeeList = ref([]);

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
    days: null,
    leaveType: null,
    startDate: null,
    endDate: null,
    leaveStatus: null,
  },
  rules: {
    employeeId: [
      { required: true, message: "员工不能为空", trigger: "change" }
    ],
    bonus: [
      { required: true, message: "加班奖金不能为空", trigger: "blur" }
    ]
  },
});
const { queryParams, form, rules } = toRefs(data);
/** 查询请假审批管理列表 */
function getList () {
  loading.value = true;
  listLeave(queryParams.value).then(response => {
    leaveList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 查询员工档案管理列表 */
function getEmployeeList (queryString, cb) {
  let queryParams = { name: queryString }
  listEmployee(queryParams).then(response => {
    employeeList.value = response.rows;
    cb(employeeList.value)
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
    leaveId: null,
    employeeId: null,
    employeeName:"",
    days: null,
    leaveType: null,
    leaveReason:null,
    startDate: null,
    endDate: null,
    leaveStatus: "0",
    remark: null,
    createTime: null,
    updateTime: null,
    isDeleted: null
  };
  proxy.resetForm("lerveRef");
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
  ids.value = selection.map(item => item.leaveId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 新增按钮操作 */
function handleAdd () {
  reset();
  open.value = true;
  title.value = "添加请假审批管理";
}
/** 修改按钮操作 */
function handleUpdate (row) {
  reset();
  const leaveId = row.leaveId || ids.value
  getLeave(leaveId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改请假审批管理";
  });
}
/** 提交按钮 */
function submitForm () {
  proxy.$refs["leaveRef"].validate(valid => {
    if (valid) {
      if (form.value.leaveId != null) {
        updateLeave(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addLeave(form.value).then(response => {
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
  const leaveIds = row.leaveId || ids.value;
  proxy.$modal.confirm('是否确认删除请假审批管理编号为"' + leaveIds + '"的数据项？').then(function () {
    return delLeave(leaveIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}
/** 导出按钮操作 */
function handleExport () {
  proxy.download('hr/leave/export', {
    ...queryParams.value
  }, `leave_${new Date().getTime()}.xlsx`)
}
function limitInput (value, name) {
  form.value[name] =
    ("" + value) // 第一步：转成字符串
      .replace(/[^\d^\.]+/g, "") // 第二步：把不是数字，不是小数点的过滤掉
      .replace(/^0+(\d)/, "$1") // 第三步：第一位0开头，0后面为数字，则过滤掉，取后面的数字
      .replace(/^\./, "0.") // 第四步：如果输入的第一位为小数点，则替换成 0. 实现自动补全
      .match(/^\d*(\.?\d{0,2})/g)[0] || ""; // 第五步：最终匹配得到结果 以数字开头，只有一个小数点，而且小数点后面只能有0到2位小数
}

getList();
</script>
