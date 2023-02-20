<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" >
      <el-form-item label="职称名称" prop="jobLevelName">
        <el-input v-model="queryParams.jobLevelName" placeholder="请输入职称名称" clearable style="width: 200px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>

      <el-form-item label="职称等级" prop="titleLevel">
        <el-select v-model="queryParams.titleLevel" placeholder="请选择职称等级" clearable style="width: 200px">
          <el-option v-for="item in titleLevelList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 200px">
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
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['hr:jobLevel:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['hr:jobLevel:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['hr:jobLevel:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['hr:jobLevel:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="jobLevelList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="职称编号" align="center" prop="jobLevelId" />
      <el-table-column label="职称名称" align="center" prop="jobLevelName" />
      <el-table-column label="职称等级" align="center" prop="titleLevel" />
      <el-table-column label="创建时间" align="center" prop="createDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createDate, '{y}-{m}-{d}') }}</span>
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
            v-hasPermi="['hr:jobLevel:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['hr:jobLevel:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改职称管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="jobLevelRef" :model="form" :rules="rules">
        <el-form-item label="职称名称" prop="jobLevelName">
          <el-input v-model="form.jobLevelName" placeholder="请输入职称名称" />
        </el-form-item>
        <el-form-item label="职称等级" prop="titleLevel">
          <el-select v-model="form.titleLevel" placeholder="请选择职称等级" clearable style="width: 200px">
            <el-option v-for="itme in titleLevelList" :key="itme.value" :label="itme.label" :value="itme.value" />
          </el-select>
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

<script setup name="JobLevel">
import { listJobLevel, getJobLevel, delJobLevel, addJobLevel, updateJobLevel } from "@/api/hr/jobLevel";
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
// 职称管理表格数据
const jobLevelList = ref([]);
// 弹出层标题
const title = ref("");
// 是否显示弹出层
const open = ref(false);
const loading = ref(true);
//职称等级列表
const titleLevelList = [{ label: "员级", value: "员级" }, { label: "副高级", value: "副高级" }, { label: "正高级", value: "正高级" },
{ label: "初级", value: "初级" }, { label: "中级", value: "中级" }, { label: "助理级", value: "助理级" }, { label: "高级", value: "高级" }]
// 查询参数/表单参数/表单校验
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    jobLevelName: undefined,
    titleLevel: undefined,
    createDate: undefined,
    status: undefined
  },
  rules: {
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ],
    jobLevelName: [
      { required: true, message: "职称名称不能为空", trigger: "blur" }
    ],
    titleLevel: [
      { required: true, message: "职称等级不能为空", trigger: "change" }
    ],
  },
});
const { queryParams, form, rules } = toRefs(data);

/** 查询职称管理列表 */
function getList () {
  loading.value = true;
  listJobLevel(queryParams.value).then(response => {
    jobLevelList.value = response.rows;
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
    jobLevelId: undefined,
    jobLevelName: undefined,
    titleLevel: undefined,
    createDate: undefined,
    status: "0"
  };
  proxy.resetForm("jobLevelRef");
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
  ids.value = selection.map(item => item.jobLevelId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 新增按钮操作 */
function handleAdd () {
  reset();
  open.value = true;
  title.value = "添加职称管理";
}
/** 修改按钮操作 */
function handleUpdate (row) {
  reset();
  const jobLevelId = row.jobLevelId || ids.value
  getJobLevel(jobLevelId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改职称管理";
  });
}
/** 提交按钮 */
function submitForm () {
  proxy.$refs["jobLevelRef"].validate(valid => {
    if (valid) {
      if (form.value.jobLevelId != null) {
        updateJobLevel(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addJobLevel(form.value).then(response => {
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
  const jobLevelIds = row.jobLevelId || ids.value;
  proxy.$modal.confirm('是否确认删除职称管理编号为"' + jobLevelIds + '"的数据项？').then(function () {
    return delJobLevel(jobLevelIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}
/** 导出按钮操作 */
function handleExport () {
  proxy.download('hr/jobLevel/export', {
    ...queryParams.value
  }, `jobLevel_${new Date().getTime()}.xlsx`)
}

getList();
</script>
