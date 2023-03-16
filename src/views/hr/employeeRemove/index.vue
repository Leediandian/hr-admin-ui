<!--
 * @Author: diandian
 * @Date: 2023-02-13 09:49:16
 * @LastEditors: diandain 498728659@qq.com
 * @LastEditTime: 2023-03-15 11:03:24
 * @FilePath: \hr-admin-ui\src\views\hr\employeeRemove\index.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by ${git_name_email}, All Rights Reserved. 
-->
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" label-width="90px" :inline="true" v-show="showSearch">
      <el-form-item label="员工名称" prop="employeeName">
        <el-input v-model="queryParams.employeeName" placeholder="请输入员工名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="调动前部门" prop="beforeDeptId">
        <el-tree-select v-model="queryParams.beforeDeptId" :data="deptOptions"
          :props="{ value: 'id', label: 'label', children: 'children' }" value-key="id" placeholder="请选择调动前部门"
          check-strictly clearable />
      </el-form-item>
      <el-form-item label="调动前职位" prop="beforePostId">
        <el-select v-model="queryParams.beforePostId" placeholder="请选择调动前职位" clearable>
          <el-option v-for="item in postList" :key="item.postId" :label="item.postName" :value="item.postId" />
        </el-select>
      </el-form-item>
      <el-form-item label="调动后部门" prop="afterDepId">
        <el-tree-select v-model="queryParams.afterDepId" :data="deptOptions"
          :props="{ value: 'id', label: 'label', children: 'children' }" value-key="id" placeholder="请选择调动后部门"
          check-strictly clearable />
      </el-form-item>
      <el-form-item label="调动后职位" prop="afterPostId">
        <el-select v-model="queryParams.afterPostId" placeholder="请选择调动后职位" clearable>
          <el-option v-for="item in postList" :key="item.postId" :label="item.postName" :value="item.postId" />
        </el-select>
      </el-form-item>
      <el-form-item label="调动日期" prop="removeDate">
        <el-date-picker clearable v-model="queryParams.removeDate" type="date" value-format="YYYY-MM-DD"
          format="YYYY-MM-DD" placeholder="请选择调动日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['hr:employeeRemove:add']">新增员工调动</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['hr:employeeRemove:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['hr:employeeRemove:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['hr:employeeRemove:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="employeeRemoveList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="员工调动编号" align="center" prop="id" />
      <el-table-column label="员工编号" align="center" prop="employeeId" />
      <el-table-column label="员工名称" align="center" prop="employeeName" />
      <el-table-column label="调动前部门" align="center" prop="beforeDeptId">
        <template #default="scope">
          <span>{{ scope.row.beforeDept.deptName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调动前职位" align="center" prop="beforePostId">
        <template #default="scope">
          <span>{{ scope.row.beforePost.postName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调动后部门" align="center" prop="afterDeptId">
        <template #default="scope">
          <span>{{ scope.row.afterDept.deptName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调动后职位" align="center" prop="afterPostId">
        <template #default="scope">
          <span>{{ scope.row.afterPost.postName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调动日期" align="center" prop="removeDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.removeDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="调动原因" align="center" prop="reason" :show-overflow-tooltip="true" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['hr:employeeRemove:edit']">查看</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['hr:employeeRemove:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改员工调动对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="emRemoveRef" :model="form" :rules="rules" :disabled="title=='查看员工调动记录'">
        <el-divider content-position="center">员工信息</el-divider>
        <el-form-item label="员工名称" prop="employeeId">
          <el-autocomplete v-model="form.employeeName" :fetch-suggestions="getEmployeeList" placeholder="请输入员工名称"
            @select="handleSelect" clearable >
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

        <el-form-item label="调动前部门" prop="beforeDeptId">
          <el-input v-model="form.beforeDeptName" placeholder="请输入调动前部门" disabled />
        </el-form-item>
        <el-form-item label="调动前职位" prop="beforePostId">
          <el-input v-model="form.beforePostName" placeholder="请输入调动前职位" disabled />
        </el-form-item>
        <el-form-item label="调动后部门" prop="afterDeptId">
          <el-tree-select v-model="form.afterDeptId" :data="deptOptions"
            :props="{ value: 'id', label: 'label', children: 'children' }" value-key="id" placeholder="请选择调动后部门"
            check-strictly clearable />
        </el-form-item>
        <el-form-item label="调动后职位" prop="afterPostId">
          <el-select v-model="form.afterPostId" placeholder="请选择调动后职位" clearable>
            <el-option v-for="item in postList" :key="item.postId" :label="item.postName" :value="item.postId" />
          </el-select>
        </el-form-item>
        <el-form-item label="调动日期" prop="removeDate">
          <el-date-picker clearable v-model="form.removeDate" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD"
            placeholder="请选择调动日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="调动原因" prop="reason">
          <el-input v-model="form.reason" placeholder="请输入调动原因" />
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

<script setup name="EmployeeRemove">
import { listEmployeeRemove, getEmployeeRemove, delEmployeeRemove, addEmployeeRemove, updateEmployeeRemove } from "@/api/hr/employeeRemove";
import { allListPost } from "@/api/system/post";
import { deptTreeSelect } from "@/api/system/user";
import { listEmployee } from "@/api/hr/employee";
const { proxy } = getCurrentInstance();


// 显示搜索条件
const showSearch = ref(true);
// 总条数
const total = ref(0);
// 员工调动表格数据
const employeeRemoveList = ref([]);
// 员工岗位列表
const postList = ref([]);
const deptOptions = ref(undefined);
const employeeList = ref([]);

// 弹出层标题
const title = ref("");
// 是否显示弹出层
const open = ref(false);
const loading = ref(true);
// 选中数组
const ids = ref([]);
// 非单个禁用
const single = ref(true);
// 非多个禁用
const multiple = ref(true);
// 查询参数/表单参数/表单校验
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    employeeId: null,
    employeeName: null,
    beforeDeptId: null,
    beforePostId: null,
    afterDeptId: null,
    afterPostId: null,
    removeDate: null,
    reason: null,
  },
  rules: {
    employeeId: [
      { required: true, message: "员工不能为空", trigger: "change" }
    ],

    afterDeptId: [
      { required: true, message: "调动部门不能为空", trigger: "change" }
    ],
    afterPostId: [
      { required: true, message: "调动职位不能为空", trigger: "change" }
    ],
    removeDate: [
      { required: true, message: "调动日期不能为空", trigger: "change" }
    ],
    reason: [
      { required: true, message: "调动原因不能为空", trigger: "blur" }
    ],
  },
});
const { queryParams, form, rules } = toRefs(data);

/** 查询员工调动列表 */
function getList () {
  loading.value = true;
  listEmployeeRemove(queryParams.value).then(response => {
    employeeRemoveList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 查询部门下拉树结构 */
function getDeptTree () {
  deptTreeSelect().then(response => {
    deptOptions.value = response.data;
  });
}
/** 查询全部岗位列表 */
function getAllListPost () {
  allListPost(queryParams.value).then(response => {
    postList.value = response.data;
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
  form.value.beforeDeptId = item.dept.deptId
  form.value.beforePostId = item.post.postId
  form.value.beforeDeptName = item.dept.deptName
  form.value.beforePostName = item.post.postName
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
    employeeName: "",
    employeeId: null,
    afterDepId: null,
    afterPostId: null,
    removeDate: null,
    reason: null,
    remark: null,
    beforeDeptName: null,
    beforePostName: null,
  }
  proxy.resetForm("emRemoveRef");
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
  title.value = "员工调动";
}
/** 修改按钮操作 */
function handleUpdate (row) {
  reset();
  const id = row.id || ids.value
  getEmployeeRemove(id).then(response => {
    form.value = response.data;
    form.value.beforeDeptName = response.data.beforeDept.deptName
    form.value.beforePostName = response.data.beforePost.postName
    open.value = true;
    title.value = "查看员工调动记录";
  });
}
/** 提交按钮 */
function submitForm () {
  proxy.$refs["emRemoveRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateEmployeeRemove(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addEmployeeRemove(form.value).then(response => {
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
  const removeids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除员工调动编号为"' + removeids + '"的数据项？').then(function () {
    return delEmployeeRemove(removeids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}


/** 导出按钮操作 */
function handleExport () {
  proxy.download('hr/employeeRemove/export', {
    ...queryParams.value
  }, `employeeRemove_${new Date().getTime()}.xlsx`)
}


getList()
getDeptTree();
getAllListPost();
</script>
