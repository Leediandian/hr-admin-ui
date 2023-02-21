<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label="员工名称" prop="employeeName">
        <el-input v-model="queryParams.employeeName" placeholder="请输入员工名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="奖罚日期" prop="ecDate">
        <el-date-picker clearable v-model="queryParams.ecDate" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD"
          placeholder="请选择奖罚日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="奖惩类型" prop="ecType">
        <el-select v-model="queryParams.ecType" placeholder="请选择奖惩类型" clearable>
          <el-option v-for="dict in employee_ec_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="奖惩类别" prop="generalType">
        <el-select v-model="queryParams.generalType" placeholder="请选择奖惩类别" clearable>
          <el-option v-for="dict in employee_general_ec_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['hr:employeeec:add']">新增员工奖惩</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['hr:employeeec:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['hr:employeeec:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['hr:employeeec:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="employeeecList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="奖惩编号" align="center" prop="employeeecId" />
      <el-table-column label="员工名称" align="center" prop="employeeName" />
      <el-table-column label="奖罚日期" align="center" prop="ecDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.ecDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="奖惩类型" align="center" prop="ecType">
        <template #default="scope">
          <dict-tag :options="employee_ec_type" :value="scope.row.ecType" />
        </template>
      </el-table-column>
      <el-table-column label="奖惩类别" align="center" prop="generalType">
        <template #default="scope">
          <dict-tag :options="employee_general_ec_type" :value="scope.row.generalType" />
        </template>
      </el-table-column>
      <el-table-column label="奖罚原因" align="center" prop="ecReason" />
      <el-table-column label="奖罚金额" align="center" prop="ecNum" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['hr:employeeec:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['hr:employeeec:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改员工奖惩管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="employeeecRef" :model="form" :rules="rules">
        <el-form-item label="员工名称" prop="employeeId">
          <el-autocomplete v-model="form.employeeName" :fetch-suggestions="getEmployeeList" placeholder="请输入员工名称"
            @select="handleSelect" clearable>
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
        <el-form-item label="奖罚日期" prop="ecDate">
          <el-date-picker clearable v-model="form.ecDate" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD"
            placeholder="请选择奖罚日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="奖惩类型" prop="ecType">
          <el-select v-model="form.ecType" placeholder="请选择奖惩类型" clearable>
            <el-option v-for="dict in employee_ec_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="奖惩类别" prop="generalType">
          <el-select v-model="form.generalType" placeholder="请选择奖惩类别" clearable>
            <el-option v-for="dict in employee_general_ec_type" :key="dict.value" :label="dict.label"
              :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="奖惩金额" prop="ecReason">
          <el-input v-model.number="form.ecNum" placeholder="请输入奖惩金额" />
        </el-form-item>
        <el-form-item label="奖罚原因" prop="ecReason">
          <el-input v-model="form.ecReason" placeholder="请输入奖罚原因" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
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

<script setup name="Employeeec">
import { listEmployeeec, getEmployeeec, delEmployeeec, addEmployeeec, updateEmployeeec } from "@/api/hr/employeeec";
import { listEmployee } from "@/api/hr/employee";
const { proxy } = getCurrentInstance();
const { employee_general_ec_type } = proxy.useDict("employee_general_ec_type");
const { employee_ec_type } = proxy.useDict("employee_ec_type");

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
// 员工奖惩管理表格数据
const employeeecList = ref([]);
// 员工列表
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
    ecDate: null,
    ecReason: null,
    generalType: null,
    ecType: null,
  },
  rules: {
    employeeId: [
      { required: true, message: "员工不能为空", trigger: "change" }
    ],
    generalType: [
      { required: true, message: "奖惩类别不能为空", trigger: "change" }
    ],
    ecType: [
      { required: true, message: "奖惩类型不能为空", trigger: "change" }
    ],
  },
});
const { queryParams, form, rules } = toRefs(data);

/** 查询员工奖惩管理列表 */
function getList () {
  loading.value = true;
  listEmployeeec(queryParams.value).then(response => {
    employeeecList.value = response.rows;
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
    employeeecId: null,
    employeeId: null,
    employeeName: "",
    ecDate: null,
    ecReason: null,
    generalType: null,
    ecType: null,
    remark: null,
    ecNum: 0
  };
  proxy.resetForm("employeeecRef");
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
  ids.value = selection.map(item => item.employeeecId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 新增按钮操作 */
function handleAdd () {
  reset();
  open.value = true;
  title.value = "添加员工奖惩管理";
}
/** 修改按钮操作 */
function handleUpdate (row) {
  reset();
  const employeeecId = row.employeeecId || ids.value
  getEmployeeec(employeeecId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改员工奖惩管理";
  });
}
/** 提交按钮 */
function submitForm () {
  proxy.$refs["employeeecRef"].validate(valid => {
    if (valid) {
      if (form.value.employeeecId != null) {
        updateEmployeeec(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addEmployeeec(form.value).then(response => {
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
  const employeeecIds = row.employeeecId || ids.value;
  proxy.$modal.confirm('是否确认删除员工奖惩管理编号为"' + employeeecIds + '"的数据项？').then(function () {
    return delEmployeeec(employeeecIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}
/** 导出按钮操作 */
function handleExport () {
  proxy.download('hr/employeeec/export', {
    ...queryParams.value
  }, `employeeec_${new Date().getTime()}.xlsx`)
}
getList();
</script>
