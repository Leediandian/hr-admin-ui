<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label="员工名称" prop="employeeName">
        <el-input v-model="queryParams.employeeName" placeholder="请输入员工名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="加班类型" prop="overtimeTypeId">
        <el-select v-model="queryParams.overtimeTypeId" placeholder="请选择加班类型" clearable>
          <el-option v-for="item in overtimeTypeList" :key="item.overtimeTypeId" :label="item.name"
            :value="item.overtimeTypeId" />
        </el-select>
      </el-form-item>
      <el-form-item label="员工是否补休" prop="isTimeOff">
        <el-select v-model="queryParams.isTimeOff" placeholder="请选择员工是否补休" clearable>
          <el-option v-for="dict in employe_overtime_is_time_off" :key="dict.value" :label="dict.label"
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
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['hr:overtime:add']">新增员工加班记录</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['hr:overtime:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['hr:overtime:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['hr:overtime:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="overtimeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="加班编号" align="center" prop="id" />
      <el-table-column label="员工名称" align="center" prop="employeeName" />
      <el-table-column label="加班类型名称" align="center" prop="overtimeTypeName" />
      <el-table-column label="工资倍数" align="center" prop="salaryMultiple" />
      <el-table-column label="加班奖金" align="center" prop="bonus" />
      <el-table-column label="加班时长" align="center" prop="timeNum" />
      <el-table-column label="员工加班计数类型" align="center" prop="countType">
        <template #default="scope">
          <dict-tag :options="employe_overtime_count_type" :value="scope.row.countType" />
        </template>
      </el-table-column>
      <el-table-column label="员工是否补休" align="center" prop="isTimeOff">
        <template #default="scope">
          <dict-tag :options="employe_overtime_is_time_off" :value="scope.row.isTimeOff" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['hr:overtime:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['hr:overtime:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改员工加班管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="overtimeRef" :model="form" :rules="rules">
        <el-form-item label="员工" prop="employeeId">
          <el-autocomplete v-model="form.employeeName" :fetch-suggestions="getEmployeeList" placeholder="请输入员工名称"
            @select="handleSelect" clearable :disabled="title == '修改员工加班管理'">
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
        <el-form-item label="加班类型" prop="overtimeTypeId">
          <el-select v-model="form.overtimeTypeId" placeholder="请选择加班类型" clearable>
            <el-option v-for="item in overtimeTypeList" :key="item.overtimeTypeId" :label="item.name"
              :value="item.overtimeTypeId" />
          </el-select>
        </el-form-item>
        <el-form-item label="员工加班计数类型" prop="countType">
          <el-select v-model="form.countType" placeholder="请选择员工加班计数类型" clearable>
            <el-option v-for="dict in employe_overtime_count_type" :key="dict.value" :label="dict.label"
              :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="加班时长" prop="timeNum">
          <el-input v-model.trim="form.timeNum" placeholder="请输入加班时长" @input="limitInput($event, 'timeNum')" />
        </el-form-item>
        <el-form-item label="员工是否补休" prop="isTimeOff">
          <el-select v-model="form.isTimeOff" placeholder="请选择员工是否补休" clearable>
            <el-option v-for="dict in employe_overtime_is_time_off" :key="dict.value" :label="dict.label"
              :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="工资倍数" prop="salaryMultiple">
          <el-input v-model="form.salaryMultiple" placeholder="请输入工资倍数" />
        </el-form-item>
        <el-form-item label="加班奖金" prop="bonus">
          <el-input v-model="form.bonus" placeholder="请输入加班奖金" />
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

<script setup name="Overtime">
import { listOvertime, getOvertime, delOvertime, addOvertime, updateOvertime } from "@/api/hr/overtime";
import { listEmployee } from "@/api/hr/employee";
import { allListOvertimeType } from "@/api/hr/overtimeType";

const { proxy } = getCurrentInstance();
//员工加班计数类型列表
const { employe_overtime_count_type } = proxy.useDict("employe_overtime_count_type");
//员工是否补休列表
const { employe_overtime_is_time_off } = proxy.useDict("employe_overtime_is_time_off");

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
// 员工加班管理表格数据
const overtimeList = ref([]);
const employeeList = ref([]);
// 加班类型表格数据
const overtimeTypeList = ref([]);

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
    salaryMultiple: null,
    bonus: null,
    overtimeTypeId: null,
    employeeId: null,
    countType: null,
    isTimeOff: null,
    isDeleted: null
  },
  rules: {
    employeeId: [
      { required: true, message: "员工不能为空", trigger: "change" }
    ],
    bonus: [
      { required: true, message: "加班奖金不能为空", trigger: "blur" }
    ],
    overtimeTypeId: [
      { required: true, message: "加班类型不能为空", trigger: "change" }
    ],
    countType: [
      { required: true, message: "加班计数类型不能为空", trigger: "change" }
    ],
    timeNum: [
      { required: true, message: "加班时长不能为空", trigger: "change" }
    ],
    isTimeOff: [
      { required: true, message: "是否补休不能为空", trigger: "change" }
    ],
  },
});
const { queryParams, form, rules } = toRefs(data);


/** 查询员工加班管理列表 */
function getList () {
  loading.value = true;
  listOvertime(queryParams.value).then(response => {
    overtimeList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
function getallListOvertimeType () {
  allListOvertimeType({}).then(response => {
    overtimeTypeList.value = response.data;
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
    id: null,
    salaryMultiple: null,
    bonus: null,
    overtimeTypeId: null,
    employeeId: null,
    employeeName: "",
    countType: '0',
    remark: null,
    timeNum: null,
    isTimeOff: '0',
    createTime: null,
    updateTime: null,
    isDeleted: null
  };
  proxy.resetForm("overtimeRef");
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
  title.value = "添加员工加班管理";
}
/** 修改按钮操作 */
function handleUpdate (row) {
  reset();
  const id = row.id || ids.value
  getOvertime(id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改员工加班管理";
  });
}
/** 提交按钮 */
function submitForm () {
  proxy.$refs["overtimeRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateOvertime(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addOvertime(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除员工加班管理编号为"' + ids + '"的数据项？').then(function () {
    return delOvertime(ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}
/** 导出按钮操作 */
function handleExport () {
  proxy.download('hr/overtime/export', {
    ...queryParams.value
  }, `overtime_${new Date().getTime()}.xlsx`)
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
getallListOvertimeType();
</script>
