<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="加班类型编码" prop="code">
        <el-input v-model="queryParams.code" style="width: 200px" placeholder="请输入加班类型编码" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="加班类型名称" prop="name">
        <el-input v-model="queryParams.name" style="width: 200px" placeholder="请输入加班类型名称" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="工资倍数下限" prop="lowerLimit">
        <el-input v-model="queryParams.lowerLimit" style="width: 200px" placeholder="请输入工资倍数下限" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="加班类型状态" clearable style="width: 200px">
          <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
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
          v-hasPermi="['hr:overtimeType:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['hr:overtimeType:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['hr:overtimeType:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['hr:overtimeType:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="overtimeTypeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="加班类型编号" align="center" prop="overtimeTypeId" />
      <el-table-column label="加班类型编码" align="center" prop="code" />
      <el-table-column label="加班类型名称" align="center" prop="name" />
      <el-table-column label="工资倍数下限" align="center" prop="lowerLimit" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['hr:overtimeType:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['hr:overtimeType:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改加班类型对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="overtimeTypeRef" :model="form" :rules="rules">
        <el-form-item label="加班类型编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入加班类型编码" />
        </el-form-item>
        <el-form-item label="加班类型名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入加班类型名称" />
        </el-form-item>
        <el-form-item label="工资倍数下限" prop="lowerLimit">
          <el-input v-model="form.lowerLimit" placeholder="请输入工资倍数下限" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{
              dict.label
            }}</el-radio>
          </el-radio-group>
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

<script setup name="OvertimeType">
import { listOvertimeType, getOvertimeType, delOvertimeType, addOvertimeType, updateOvertimeType } from "@/api/hr/overtimeType";
const { proxy } = getCurrentInstance();
const { sys_normal_disable } = proxy.useDict("sys_normal_disable");

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
    code: undefined,
    name: undefined,
    status: undefined,
    lowerLimit: undefined,
  },
  rules: {
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ],
    name: [
      { required: true, message: "加班类型名称不能为空", trigger: "blur" }
    ],
    code: [
      { required: true, message: "加班类型编码不能为空", trigger: "blur" }
    ],
    lowerLimit: [
      { required: true, message: "工资倍数下限不能为空", trigger: "blur" }
    ]
  },
});

const { queryParams, form, rules } = toRefs(data);


/** 查询加班类型列表 */
function getList () {
  loading.value = true;
  listOvertimeType(queryParams.value).then(response => {
    overtimeTypeList.value = response.rows;
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
    overtimeTypeId: undefined,
    code: undefined,
    name: undefined,
    status: "0",
    createTime: undefined,
    updateTime: undefined,
    lowerLimit: undefined,
  };
  proxy.resetForm("overtimeTypeRef");
}
/** 搜索按钮操作 */
function handleQuery () {
  queryParams.value.pageNum = 1;
  getList();
}
/** 重置按钮操作 */
function resetQuery () {
  proxy.resetForm("queryRef");
  handleQuery();
}
// 多选框选中数据
function handleSelectionChange (selection) {
  ids.value = selection.map(item => item.overtimeTypeId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 新增按钮操作 */
function handleAdd () {
  reset();
  open.value = true;
  title.value = "添加加班类型";
}
/** 修改按钮操作 */
function handleUpdate (row) {
  reset();
  const overtimeTypeId = row.overtimeTypeId || ids.value
  getOvertimeType(overtimeTypeId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改加班类型";
  });
}
/** 提交按钮 */
function submitForm () {
  proxy.$refs["overtimeTypeRef"].validate(valid => {
    if (valid) {
      if (form.value.overtimeTypeId != null) {
        updateOvertimeType(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addOvertimeType(form.value).then(response => {
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
  const overtimeTypeIds = row.overtimeTypeId || ids.value;
  proxy.$modal.confirm('是否确认删除加班类型编号为"' + overtimeTypeIds + '"的数据项？').then(function () {
    return delOvertimeType(overtimeTypeIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}
/** 导出按钮操作 */
function handleExport () {
  proxy.download('hr/overtimeType/export', {
    ...queryParams.value
  }, `overtimeType_${new Date().getTime()}.xlsx`)
}

getList();
</script>
