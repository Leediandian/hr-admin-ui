<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label="员工名称" prop="employeeName">
        <el-input v-model="queryParams.employeeName" placeholder="请输入员工名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="薪资账套名称" prop="salaryName">
        <el-input v-model="queryParams.salaryName" placeholder="请输入薪资账套名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['hr:empSalary:add']">绑定员工工资账套</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['hr:empSalary:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['hr:empSalary:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['hr:empSalary:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="empSalaryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="员工薪资编号" align="center" prop="id" />
      <el-table-column label="员工名称" align="center" prop="employeeName" />
      <el-table-column label="薪资账套名称" align="center" prop="salaryName" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['hr:empSalary:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['hr:empSalary:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改员工账套管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="empSalaryRef" :model="form" :rules="rules">
        <el-form-item label="员工名称" prop="employeeId">
          <el-autocomplete v-model="form.employeeName" :fetch-suggestions="getEmployeeList" placeholder="请输入员工名称"
            @select="handleSelect" clearable :disabled="title=='修改员工账套管理'" >
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

        <el-form-item label="薪资账套名称" prop="salaryId">
          <el-autocomplete v-model="form.salaryName" :fetch-suggestions="getSalaryList" placeholder="请输入薪资账套名称"
            @select="handleSelect1" clearable >
            <template #suffix>
              <el-icon class="el-input__icon">
                <edit />
              </el-icon>
            </template>
            <template #default="{ item }">
              <span class="link">{{ item.salaryName }}</span> ---
              <span class="value">基础工资：{{ item.basicSalary }}</span>
            </template>
          </el-autocomplete>
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

<script setup naem="EmpSalary">
import { listEmpSalary, getEmpSalary, delEmpSalary, addEmpSalary, updateEmpSalary } from "@/api/hr/empSalary";
import { listEmployee } from "@/api/hr/employee";
import { listSalary} from "@/api/hr/salary";

const { proxy } = getCurrentInstance();
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
// 员工账套管理表格数据
const empSalaryList = ref([]);
const employeeList = ref([]);
const salaryList = ref([]);
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
    salaryId: null,
    employeeName:null,
    salaryName:null,
  },
  rules: {
    salaryId: [
      { required: true, message: "薪资账套名称不能为空", trigger: "change" }
    ],
    employeeId: [
      { required: true, message: "员工不能为空", trigger: "change" }
    ],
  },
});
const { queryParams, form, rules } = toRefs(data);

/** 查询员工账套管理列表 */
function getList () {
  loading.value = true;
  listEmpSalary(queryParams.value).then(response => {
    empSalaryList.value = response.rows;
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
/** 查询薪资账套列表 */
function getSalaryList (queryString, cb) {
  let queryParams = { salaryName: queryString }
  listSalary(queryParams).then(response => {
    salaryList.value = response.rows;
    cb(salaryList.value)
  });
}
function handleSelect1 (item) {
  form.value.salaryId = item.salaryId
  form.value.salaryName = item.salaryName
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
    salaryId: null,
    salaryName:"",
    employeeName: "",
  };
  proxy.resetForm("empSalaryRef");
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
  title.value = "添加员工账套管理";
}
/** 修改按钮操作 */
function handleUpdate (row) {
  reset();
  const id = row.id || ids.value
  getEmpSalary(id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改员工账套管理";
  });
}
/** 提交按钮 */
function submitForm () {
  proxy.$refs["empSalaryRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateEmpSalary(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addEmpSalary(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除员工账套管理编号为"' + ids + '"的数据项？').then(function () {
    return delEmpSalary(ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport () {
  proxy.download('hr/empSalary/export', {
    ...queryParams.value
  }, `empSalary_${new Date().getTime()}.xlsx`)
}

getList();
</script>
