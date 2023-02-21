<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
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
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['hr:salary:add']">新增工资账套</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['hr:salary:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['hr:salary:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['hr:salary:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="salaryList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="薪资编号" align="center" prop="salaryId" />
      <el-table-column label="薪资账套名称" align="center" prop="salaryName" />
      <el-table-column label="基本工资" align="center" prop="basicSalary" />
      <el-table-column label="奖金" align="center" prop="bonus" />
      <el-table-column label="午餐补助" align="center" prop="lunchSalary" />
      <el-table-column label="交通补助" align="center" prop="trafficSalary" />
      <el-table-column label="应发工资" align="center" prop="allSalary" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="280">
        <template #default="scope">
          <el-button link type="primary" icon="Tickets" @click="handleShow(scope.row)"
            v-hasPermi="['hr:salary:edit']">查看明细</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['hr:salary:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['hr:salary:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改薪资账套管理对话框 -->
    <el-dialog :title="title" v-model="open" width="650px" append-to-body>
      <el-form ref="salaryRef" :model="form" :rules="rules" label-width="120px" :disabled="title == '查看工资账套明细'">
        <el-row>
          <el-col :span="12">
            <el-form-item label="薪资账套名称" prop="salaryName">
              <el-input v-model="form.salaryName" placeholder="请输入薪资账套名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="基本工资" prop="basicSalary">
              <el-input v-model="form.basicSalary" placeholder="请输入基本工资" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="奖金" prop="bonus">
              <el-input v-model="form.bonus" placeholder="请输入奖金" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="午餐补助" prop="lunchSalary">
              <el-input v-model="form.lunchSalary" placeholder="请输入午餐补助" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="交通补助" prop="trafficSalary">
              <el-input v-model="form.trafficSalary" placeholder="请输入交通补助" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="应发工资" prop="allSalary">
              <el-input v-model="form.allSalary" placeholder="请输入应发工资" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="养老金基数" prop="pensionBase">
              <el-input v-model="form.pensionBase" placeholder="请输入养老金基数" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="养老金比率" prop="pensionPer">
              <el-input v-model="form.pensionPer" placeholder="请输入养老金比率" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="医疗保险比率" prop="medicalPer">
              <el-input v-model="form.medicalPer" placeholder="请输入医疗保险比率" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="医疗基数" prop="medicalBase">
              <el-input v-model="form.medicalBase" placeholder="请输入医疗基数" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="公积金比率" prop="accumulationFundper">
              <el-input v-model="form.accumulationFundper" placeholder="请输入公积金比率" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公积金基数" prop="accumulationFundbase">
              <el-input v-model="form.accumulationFundbase" placeholder="请输入公积金基数" />
            </el-form-item>
          </el-col>
        </el-row>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm" v-show="title != '查看工资账套明细'">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Salary">
import { listSalary, getSalary, delSalary, addSalary, updateSalary } from "@/api/hr/salary";

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
// 薪资账套管理表格数据
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
    salaryName: null,
    basicSalary: null,
    bonus: null,
    lunchSalary: null,
    trafficSalary: null,
    allSalary: null,
    pensionBase: null,
    pensionPer: null,
    medicalBase: null,
    medicalPer: null,
    accumulationFundbase: null,
    accumulationFundper: null
  },
  rules: {
    salaryName: [
      { required: true, message: "薪资账套名称不能为空", trigger: "blur" }
    ],
    basicSalary: [
      { required: true, message: "基本工资不能为空", trigger: "blur" }
    ],
    pensionBase: [
      { required: true, message: "养老金基数不能为空", trigger: "blur" }
    ],
    pensionPer: [
      { required: true, message: "养老金比率不能为空", trigger: "blur" }
    ],
    medicalBase: [
      { required: true, message: "医疗基数不能为空", trigger: "blur" }
    ],
    medicalPer: [
      { required: true, message: "医疗保险比率不能为空", trigger: "blur" }
    ], 
    accumulationFundbase: [
      { required: true, message: "公积金基数不能为空", trigger: "blur" }
    ],
    accumulationFundper: [
      { required: true, message: "公积金比率不能为空", trigger: "blur" }
    ],
  },
});
const { queryParams, form, rules } = toRefs(data);


/** 查询薪资账套管理列表 */
function getList () {
  loading.value = true;
  listSalary(queryParams.value).then(response => {
    salaryList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
// 取消按钮
function cancel () {
  open.value = false;
  reset();
}
// 表单重置
function reset () {
  form.value = {
    salaryId: null,
    salaryName: null,
    basicSalary: null,
    bonus: 0,
    lunchSalary: 0,
    trafficSalary: 0,
    allSalary: null,
    pensionBase: null,
    pensionPer: null,
    medicalBase: null,
    medicalPer: null,
    accumulationFundbase: null,
    accumulationFundper: null
  };
  proxy.resetForm("salaryRef");
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
  ids.value = selection.map(item => item.salaryId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 新增按钮操作 */
function handleAdd () {
  reset();
  open.value = true;
  title.value = "添加薪资账套管理";
}
/** 查看明细按钮操作 */
function handleShow (row) {
  reset();
  const salaryId = row.salaryId || ids.value
  getSalary(salaryId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "查看工资账套明细";
  });
}
/** 修改按钮操作 */
function handleUpdate (row) {
  reset();
  const salaryId = row.salaryId || ids.value
  getSalary(salaryId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改薪资账套管理";
  });
}
/** 提交按钮 */
function submitForm () {
  proxy.$refs["salaryRef"].validate(valid => {
    if (valid) {
      if (form.value.salaryId != null) {
        updateSalary(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSalary(form.value).then(response => {
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
  const salaryIds = row.salaryId || ids.value;
  proxy.$modal.confirm('是否确认删除薪资账套管理编号为"' + salaryIds + '"的数据项？').then(function () {
    return delSalary(salaryIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}
/** 导出按钮操作 */
function handleExport () {
  proxy.download('hr/salary/export', {
    ...queryParams.value
  }, `salary_${new Date().getTime()}.xlsx`)
}

getList();
</script>
