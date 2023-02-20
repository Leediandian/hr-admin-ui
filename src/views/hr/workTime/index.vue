<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">

      <el-form-item label="归属部门" prop="deptId">
        <el-tree-select v-model="queryParams.deptId" :data="deptOptions"
          :props="{ value: 'id', label: 'label', children: 'children' }" value-key="id" placeholder="请选择归属部门"
          check-strictly clearable />
      </el-form-item>

      <el-form-item label="员工总工作时长" prop="totalWorkTime">
        <el-input v-model="queryParams.totalWorkTime" placeholder="请输入员工总工作时长" clearable
          @keyup.enter.native="handleQuery" />
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
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['hr:workTime:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['hr:workTime:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['hr:workTime:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['hr:workTime:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="workTimeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <!-- <el-table-column label="工作时间编号" align="center" prop="id" /> -->
      <el-table-column label="所属部门" align="center" prop="dept">
        <template #default="scope">
          <span>{{ scope.row.dept.deptName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上午上班时间" align="center" prop="morStartTime" width="140">
        <template #default="scope">
          <span>{{ scope.row.morStartTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="上午下班时间" align="center" prop="morEndTime" width="140">
        <template #default="scope">
          <span>{{ scope.row.morEndTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下午上班时间" align="center" prop="aftStartTime" width="140">
        <template #default="scope">
          <span>{{ scope.row.aftStartTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下午下班时间" align="center" prop="aftEndTime" width="140">
        <template #default="scope">
          <span>{{ scope.row.aftEndTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="员工总工作时长" align="center" prop="totalWorkTime">
        <template #default="scope">
          <div v-text="`${scope.row.totalWorkTime}小时`"></div>
        </template>
      </el-table-column>
      <!-- <el-table-column label="备注" align="center" prop="remark" /> -->
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['hr:workTime:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['hr:workTime:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改工作时间管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="workTimeRef" :model="form" :rules="rules">

        <el-form-item label="归属部门" prop="deptId">
          <el-tree-select v-model="form.deptId" :data="deptOptions"
            :props="{ value: 'id', label: 'label', children: 'children' }" value-key="id" placeholder="请选择归属部门"
            check-strictly clearable />
        </el-form-item>

        <el-form-item label="上午上班时间" prop="morStartTime">
          <el-time-select v-model="form.morStartTime" start="05:00" step="00:05" end="23:55" format="HH:mm" editable
            placeholder="请选择上午上班时间" />
        </el-form-item>
        <el-form-item label="上午下班时间" prop="morEndTime">
          <el-time-select v-model="form.morEndTime" start="05:00" step="00:05" end="23:55" format="HH:mm" editable
            placeholder="请选择上午下班时间" />
        </el-form-item>
        <el-form-item label="下午上班时间" prop="aftStartTime">
          <el-time-select v-model="form.aftStartTime" start="05:00" step="00:05" end="23:55" format="HH:mm" editable
            placeholder="请选择下午上班时间" />
        </el-form-item>
        <el-form-item label="下午下班时间" prop="aftEndTime">
          <el-time-select v-model="form.aftEndTime" start="05:00" step="00:05" end="23:55" format="HH:mm" editable
            placeholder="请选择下午下班时间" />
        </el-form-item>
        <el-form-item label="员工总工作时长" prop="totalWorkTime">
          <el-input v-model="form.totalWorkTime" placeholder="请输入员工总工作时长" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
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

<script setup name="WorkTime">
import { listWorkTime, getWorkTime, delWorkTime, addWorkTime, updateWorkTime } from "@/api/hr/workTime";
import { deptTreeSelect } from "@/api/system/user";

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
// 工作时间管理表格数据
const workTimeList = ref([]);
const deptOptions = ref(undefined);
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
    deptId: null,
    morStartTime: null,
    morEndTime: null,
    aftStartTime: null,
    aftEndTime: null,
    totalWorkTime: null,
    status: null
  },
  rules: {
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ],
    deptId: [
      { required: true, message: "部门不能为空", trigger: "change" }
    ],
    morStartTime: [
      { required: true, message: "上午上班不能为空", trigger: "change" }
    ],
    morEndTime: [
      { required: true, message: "上午下班不能为空", trigger: "change" }
    ],
    aftStartTime: [
      { required: true, message: "下午上班不能为空", trigger: "change" }
    ],
    aftEndTime: [
      { required: true, message: "下午下班不能为空", trigger: "change" }
    ],
    totalWorkTime: [
      { required: true, message: "员工总工资时长不能为空", trigger: "blur" }
    ],
  },
});
const { queryParams, form, rules } = toRefs(data);

/** 查询工作时间管理列表 */
function getList () {
  loading.value = true;
  listWorkTime(queryParams.value).then(response => {
    workTimeList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 查询部门下拉树结构 */
function getDeptTree () {
  deptTreeSelect().then(response => {
    deptOptions.value = response.data;
  });
};
// 取消按钮
function cancel () {
  open.value = false;
  reset();
}
// 表单重置
function reset () {
  form.value = {
    id: undefined,
    deptId: undefined,
    morStartTime: undefined,
    morEndTime: undefined,
    aftStartTime: undefined,
    aftEndTime: undefined,
    totalWorkTime: undefined,
    remark: undefined,
    createTime: undefined,
    updateTime: undefined,
    status: "0"
  };
  proxy.resetForm("workTimeRef");
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
  title.value = "添加工作时间管理";
}
/** 修改按钮操作 */
function handleUpdate (row) {
  reset();
  const id = row.id || ids.value
  getWorkTime(id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改工作时间管理";
  });
}
/** 提交按钮 */
function submitForm () {
  proxy.$refs["workTimeRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateWorkTime(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addWorkTime(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除工作时间管理编号为"' + ids + '"的数据项？').then(function () {
    return delWorkTime(ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}
/** 导出按钮操作 */
function handleExport () {
  proxy.download('hr/workTime/export', {
    ...queryParams.value
  }, `workTime_${new Date().getTime()}.xlsx`)
}

getDeptTree();
getList();
</script>
