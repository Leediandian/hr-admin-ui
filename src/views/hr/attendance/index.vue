<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch">
      <el-form-item label="员工名称" prop="employeeName">
        <el-input v-model="queryParams.employeeName" placeholder="请输入员工名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>

      <el-form-item label="考勤日期" prop="attendanceDate">
        <el-date-picker clearable v-model="queryParams.attendanceDate" type="date" value-format="YYYY-MM-DD"
          format="YYYY-MM-DD" placeholder="请选择考勤日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="考勤状态" prop="attendanceStatus">
        <el-select v-model="queryParams.attendanceStatus" placeholder="请选择考勤状态" clearable>
          <el-option v-for="dict in employee_attendance_status" :key="dict.value" :label="dict.label"
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
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['hr:attendance:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['hr:attendance:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['hr:attendance:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['hr:attendance:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Upload" @click="handleImport"
          v-hasPermi="['hr:attendance:import']">导入考勤数据</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="attendanceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="员工考勤编号" align="center" prop="id" />
      <el-table-column label="员工名称" align="center" prop="employeeName" />
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
      <el-table-column label="考勤日期" align="center" prop="attendanceDate" width="140">
        <template #default="scope">
          <span>{{ parseTime(scope.row.attendanceDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="考勤状态" align="center" prop="attendanceStatus">
        <template #default="scope">
          <dict-tag :options="employee_attendance_status" :value="scope.row.attendanceStatus" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['hr:attendance:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['hr:attendance:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改员工考勤管理对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="attendanceRef" :model="form" :rules="rules">
        <el-form-item label="员工名称" prop="employeeId">
          <el-autocomplete v-model="form.employeeName" :fetch-suggestions="getEmployeeList" placeholder="请输入员工名称"
            @select="handleSelect" clearable :disabled="title == '修改员工考勤管理'">
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
        <el-form-item label="考勤日期" prop="attendanceDate">
          <el-date-picker clearable v-model="form.attendanceDate" type="date" value-format="YYYY-MM-DD"
            format="YYYY-MM-DD" placeholder="请选择考勤日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="考勤状态" prop="attendanceStatus">
          <el-select v-model="form.attendanceStatus" placeholder="请选择考勤状态" clearable>
            <el-option v-for="dict in employee_attendance_status" :key="dict.value" :label="dict.label"
              :value="dict.value" />
          </el-select>
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

    <el-dialog :title="title1" v-model="open1" width="400px" append-to-body>
      <el-upload ref="upload" :limit="1" accept=".xlsx, .xls" name="importFile" :headers="headers" :action="url"
        :disabled="isUploading" :on-progress="handleFileUploadProgress" :on-success="handleFileSuccess"
        :auto-upload="false" drag>
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip text-center" slot="tip">
          <!-- <div class="el-upload__tip" slot="tip">
            <el-checkbox v-model="upload.updateSupport" /> 是否更新已经存在的用户数据
          </div> -->
          <span>仅允许导入xls、xlsx格式文件。</span>
          <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;"
            @click="importTemplate">下载模板</el-link>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="open1 = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="Attendance">
import { listAttendance, getAttendance, delAttendance, addAttendance, updateAttendance } from "@/api/hr/attendance";
import { listEmployee } from "@/api/hr/employee";
import { getToken } from "@/utils/auth";
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
const attendanceList = ref([]);
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
    morStartTime: null,
    morEndTime: null,
    aftStartTime: null,
    aftEndTime: null,
    attendanceDate: null,
    attendanceStatus: null,
    isDeleted: null
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
// 用户导入参数
const upload = reactive({
  // 是否显示弹出层（用户导入）
  open1: false,
  // 弹出层标题（用户导入）
  title1: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/hr/attendance/import"
})
const { open1, title1, isUploading, updateSupport, headers, url } = toRefs(upload);
/** 查询员工考勤管理列表 */
function getList () {
  loading.value = true;
  listAttendance(queryParams.value).then(response => {
    attendanceList.value = response.rows;
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
  const attenids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除员工考勤管理编号为"' + attenids + '"的数据项？').then(function () {
    return delAttendance(attenids);
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
/** 下载模板操作 */
function importTemplate () {
  proxy.download('hr/attendance/importAttendanceTemplate', {
  }, `anttendance_template_${new Date().getTime()}.xlsx`)
}
// 文件上传中处理
function handleFileUploadProgress (event, file, fileList) {
  isUploading.value = true;
}
// 文件上传成功处理
function handleFileSuccess(response, file, fileList) {
  open1.value = false;
  isUploading.value = false;
  proxy.$refs.upload.clearFiles();
  proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
  getList();
}
// 提交上传文件
function submitFileForm() {
  proxy.$refs.upload.submit();
}
function handleImport () {
  title1.value = "批量导入员工考勤数据";
  open1.value = true;
}

getList();
</script>
