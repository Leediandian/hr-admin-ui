<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="员工姓名" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入员工姓名" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="性别" prop="gender" v-show="showSearch">
        <el-select v-model="queryParams.gender" placeholder="请选择性别" clearable>
          <el-option v-for="dict in sys_user_sex" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="出生日期" prop="birthday" v-show="showSearch">
        <el-date-picker clearable v-model="queryParams.birthday" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD"
          placeholder="请选择出生日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="民族" prop="nation" v-show="showSearch">
        <el-input v-model="queryParams.nation" placeholder="请输入民族" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="籍贯" prop="nativePlace" v-show="showSearch">
        <el-input v-model="queryParams.nativePlace" placeholder="请输入籍贯" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="政治面貌" prop="politic" v-show="showSearch">
        <el-input v-model="queryParams.politic" placeholder="请输入政治面貌" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="所属部门" prop="deptId">
        <el-tree-select v-model="queryParams.deptId" :data="deptOptions"
          :props="{ value: 'id', label: 'label', children: 'children' }" value-key="id" placeholder="请选择归属部门"
          check-strictly clearable />
      </el-form-item>
      <el-form-item label="职称" prop="jobLevelId" v-show="showSearch">
        <el-select v-model="queryParams.jobLevelId" placeholder="请选择职称" clearable>
          <el-option v-for="item in jobLevelList" :key="item.jobLevelId" :label="item.jobLevelName"
            :value="item.jobLevelId" />
        </el-select>
      </el-form-item>
      <el-form-item label="职位" prop="postId" v-show="showSearch">
        <el-select v-model="queryParams.postId" placeholder="请选择职位" clearable>
          <el-option v-for="item in postList" :key="item.postId" :label="item.postName" :value="item.postId" />
        </el-select>
      </el-form-item>
      <el-form-item label="聘用形式" prop="engageForm" v-show="showSearch">
        <el-select v-model="queryParams.engageForm" placeholder="请选择聘用形式" clearable>
          <el-option v-for="dict in employee_engage_form" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="毕业院校" prop="school" v-show="showSearch">
        <el-input v-model="queryParams.school" placeholder="请输入毕业院校" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="入职日期" prop="beginDate" v-show="showSearch">
        <el-date-picker clearable v-model="queryParams.beginDate" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD"
          placeholder="请选择入职日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="工号" prop="workId" v-show="showSearch">
        <el-input v-model="queryParams.workId" placeholder="请输入工号" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="合同期限" prop="contractTerm" v-show="showSearch">
        <el-input v-model="queryParams.contractTerm" placeholder="请输入合同期限" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="转正日期" prop="conversionTime" v-show="showSearch">
        <el-date-picker clearable v-model="queryParams.conversionTime" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD"
          placeholder="请选择转正日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="离职日期" prop="notWorkDate" v-show="showSearch">
        <el-date-picker clearable v-model="queryParams.notWorkDate" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD"
          placeholder="请选择离职日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="合同起始日期" prop="beginContract" v-show="showSearch">
        <el-date-picker clearable v-model="queryParams.beginContract" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD"
          placeholder="请选择合同起始日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="合同终止日期" prop="endContract" v-show="showSearch">
        <el-date-picker clearable v-model="queryParams.endContract" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD"
          placeholder="请选择合同终止日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="工龄" prop="workAge" v-show="showSearch">
        <el-input v-model="queryParams.workAge" placeholder="请输入工龄" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="员工在职状态" prop="workState">
        <el-select v-model="queryParams.workState" placeholder="请选择员工在职状态" clearable>
          <el-option v-for="dict in employee_work_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="婚姻状况" prop="nation" v-show="showSearch">
        <el-select v-model="queryParams.wedlock" placeholder="请选择婚姻状况" clearable>
          <el-option v-for="dict in employee_wedlock_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="最高学历" prop="tiptopDegree" v-show="showSearch">
        <el-select v-model="queryParams.tiptopDegree" placeholder="请选择最高学历" clearable>
          <el-option v-for="dict in employee_tiptop_degree" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['hr:employee:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['hr:employee:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['hr:employee:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['hr:employee:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="employeeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="员工编号" prop="employeeId" key="employeeId" v-if="columns[0].visible" />
      <el-table-column label="员工姓名" align="center" key="name" prop="name" v-if="columns[1].visible" />
      <el-table-column label="工号" align="center" key="workId" prop="workId" v-if="columns[2].visible" />
      <el-table-column label="所属部门" align="center" key="deptId" prop="deptId" v-if="columns[3].visible">
        <template #default="scope">
          <span>{{ scope.row.dept.deptName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="职位" align="center" key="postId" prop="postId" v-if="columns[4].visible">
        <template #default="scope">
          <span>{{ scope.row.post.postName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="聘用形式" align="center" key="engageForm" prop="engageForm" v-if="columns[5].visible">
        <template #default="scope">
          <dict-tag :options="employee_engage_form" :value="scope.row.engageForm" />
        </template>
      </el-table-column>
      <el-table-column label="入职日期" align="center" key="beginDate" prop="beginDate" width="180" v-if="columns[6].visible">
        <template #default="scope">
          <span>{{ parseTime(scope.row.beginDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="在职状态" align="center" key="workState" prop="workState" v-if="columns[7].visible">
        <template #default="scope">
          <dict-tag :options="employee_work_status" :value="scope.row.workState" />
        </template>
      </el-table-column>
      <el-table-column label="合同期限" align="center" key="contractTerm" prop="contractTerm" v-if="columns[8].visible" />
      <el-table-column label="离职日期" align="center" key="notWorkDate" prop="notWorkDate" width="180"
        v-if="columns[9].visible">
        <template #default="scope">
          <span>{{ parseTime(scope.row.notWorkDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="合同起始日期" align="center" key="beginContract" prop="beginContract" width="180"
        v-if="columns[10].visible">
        <template #default="scope">
          <span>{{ parseTime(scope.row.beginContract, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="合同终止日期" align="center" key="endContract" prop="endContract" width="180"
        v-if="columns[11].visible">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endContract, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="工龄" align="center" key="workAge" prop="workAge" v-if="columns[12].visible" />
      <el-table-column label="转正日期" align="center" key="conversionTime" prop="conversionTime" width="180"
        v-if="columns[13].visible">
        <template #default="scope">
          <span>{{ parseTime(scope.row.conversionTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="职称" align="center" key="jobLevelId" prop="jobLevelId" v-if="columns[14].visible">
        <template #default="scope">
          <span>{{ scope.row.jobLevel.jobLevelName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="邮箱" align="center" key="email" prop="email" :show-overflow-tooltip="true"
        v-if="columns[15].visible" />
      <el-table-column label="电话号码" align="center" key="phone" prop="phone" v-if="columns[16].visible" />
      <el-table-column label="联系地址" align="center" key="address" prop="address" :show-overflow-tooltip="true"
        v-if="columns[17].visible" />
      <el-table-column label="性别" align="center" prop="gender" key="gender" v-if="columns[18].visible">
        <template #default="scope">
          <dict-tag :options="sys_user_sex" :value="scope.row.gender" />
        </template>
      </el-table-column>
      <el-table-column label="出生日期" align="center" prop="birthday" key="birthday" width="180" v-if="columns[19].visible">
        <template #default="scope">
          <span>{{ parseTime(scope.row.birthday, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleShowDetail(scope.row)"
            v-hasPermi="['hr:employee:edit']">查看明细</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['hr:employee:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['hr:employee:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改员工档案管理对话框 -->
    <el-dialog :title="title" v-model="open" append-to-body>
      <el-form ref="employeeRef" :model="form" :rules="rules" label-width="90px" :disabled="title == '查看员工档案明细'">
        <el-row>
          <el-col :span="12">
            <el-form-item label="员工姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入员工姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-select v-model="form.gender" placeholder="请选择性别" clearable>
                <el-option v-for="dict in sys_user_sex" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="出生日期" prop="birthday">
              <el-date-picker clearable v-model="form.birthday" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD" 
                placeholder="请选择出生日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="form.idCard" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="婚姻状况" prop="nation">
              <el-select v-model="form.wedlock" placeholder="请选择婚姻状况" clearable>
                <el-option v-for="dict in employee_wedlock_status" :key="dict.value" :label="dict.label"
                  :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最高学历" prop="tiptopDegree">
              <el-select v-model="form.tiptopDegree" placeholder="请选择最高学历" clearable>
                <el-option v-for="dict in employee_tiptop_degree" :key="dict.value" :label="dict.label"
                  :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="民族" prop="nation">
              <el-input v-model="form.nation" placeholder="请输入民族" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="籍贯" prop="nativePlace">
              <el-input v-model="form.nativePlace" placeholder="请输入籍贯" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="政治面貌" prop="politic">
              <el-input v-model="form.politic" placeholder="请输入政治面貌" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="电话号码" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入电话号码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入联系地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="所属部门" prop="deptId">
              <el-tree-select v-model="form.deptId" :data="deptOptions"
                :props="{ value: 'id', label: 'label', children: 'children' }" value-key="id" placeholder="请选择归属部门"
                check-strictly clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职称" prop="jobLevelId">
              <el-select v-model="form.jobLevelId" placeholder="请选择职称" clearable>
                <el-option v-for="item in jobLevelList" :key="item.jobLevelId" :label="item.jobLevelName"
                  :value="item.jobLevelId" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="职位" prop="postId">
              <el-select v-model="form.postId" placeholder="请选择职位" clearable>
                <el-option v-for="item in postList" :key="item.postId" :label="item.postName" :value="item.postId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="聘用形式" prop="engageForm">
              <el-select v-model="form.engageForm" placeholder="请输入聘用形式" clearable>
                <el-option v-for="dict in employee_engage_form" :key="dict.value" :label="dict.label"
                  :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="所属专业" prop="specialty">
              <el-input v-model="form.specialty" placeholder="请输入所属专业" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="毕业院校" prop="school">
              <el-input v-model="form.school" placeholder="请输入毕业院校" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="入职日期" prop="beginDate">
              <el-date-picker clearable v-model="form.beginDate" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD"
                placeholder="请选择入职日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工号" prop="workId">
              <el-input v-model="form.workId" placeholder="请输入工号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="合同期限" prop="contractTerm">
              <el-input v-model="form.contractTerm" placeholder="请输入合同期限" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="转正日期" prop="conversionTime">
              <el-date-picker clearable v-model="form.conversionTime" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD"
                placeholder="请选择转正日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="离职日期" prop="notWorkDate">
              <el-date-picker clearable v-model="form.notWorkDate" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD"
                placeholder="请选择离职日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="合同起始日期" prop="beginContract">
              <el-date-picker clearable v-model="form.beginContract" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD"
                placeholder="请选择合同起始日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="合同终止日期" prop="endContract">
              <el-date-picker clearable v-model="form.endContract" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD"
                placeholder="请选择合同终止日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="工龄" prop="workAge">
              <el-input v-model="form.workAge" placeholder="请输入工龄" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="员工在职状态" prop="workState">
          <el-select v-model="form.workState" placeholder="请选择员工在职状态" clearable>
            <el-option v-for="dict in employee_work_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
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

<script setup name="Employee">
import { listEmployee, getEmployee, delEmployee, addEmployee, updateEmployee } from "@/api/hr/employee";
import { deptTreeSelect } from "@/api/system/user";
import { allListJobLevel } from "@/api/hr/jobLevel";
import { allListPost } from "@/api/system/post";
const { proxy } = getCurrentInstance();
//用户性别
const { sys_user_sex } = proxy.useDict("sys_user_sex");
//员工在职状态
const { employee_work_status } = proxy.useDict("employee_work_status");
//员工婚姻状态
const { employee_wedlock_status } = proxy.useDict("employee_wedlock_status");
//员工聘用形式
const { employee_engage_form } = proxy.useDict("employee_engage_form");
//员工最高学历
const { employee_tiptop_degree } = proxy.useDict("employee_tiptop_degree");

// 选中数组
const ids = ref([]);
// 非单个禁用
const single = ref(true);
// 非多个禁用
const multiple = ref(true);
// 显示搜索条件
const showSearch = ref(false);
// 总条数
const total = ref(0);
// 员工档案管理表格数据
const employeeList = ref([]);
// 员工职称列表
const jobLevelList = ref([]);
// 员工岗位列表
const postList = ref([]);
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
    pageNum: 1,
    pageSize: 10,
    name: null,
    gender: null,
    birthday: null,
    idCard: null,
    wedlock: null,
    nation: null,
    nativePlace: null,
    politic: null,
    email: null,
    phone: null,
    address: null,
    deptId: null,
    jobLevelId: null,
    postId: null,
    engageForm: null,
    tiptopDegree: null,
    specialty: null,
    school: null,
    beginDate: null,
    workState: null,
    workId: null,
    contractTerm: null,
    conversionTime: null,
    notWorkDate: null,
    beginContract: null,
    endContract: null,
    workAge: null
  },
  rules: {
    name: [
      { required: true, message: "员工姓名不能为空", trigger: "blur" }
    ],
    deptId: [
      { required: true, message: "部门不能为空", trigger: "change" }
    ],
    postId: [
      { required: true, message: "职位不能为空", trigger: "change" }
    ],
    address: [
      { required: true, message: "联系地址不能为空", trigger: "blur" }
    ],
    phone: [
      { required: true, message: "电话号码不能为空", trigger: "blur" }
    ],
    engageForm: [
      { required: true, message: "聘用形式不能为空", trigger: "change" }
    ],
    workState: [
      { required: true, message: "员工在职状态不能为空", trigger: "change" }
    ],
  },
});
const { queryParams, form, rules } = toRefs(data);

// 列显隐信息
const columns = ref([
  { key: 0, label: `员工编号`, visible: true },
  { key: 1, label: `员工姓名`, visible: true },
  { key: 2, label: `工号`, visible: true },
  { key: 3, label: `所属部门`, visible: true },
  { key: 4, label: `职位`, visible: true },
  { key: 5, label: `聘用形式`, visible: true },
  { key: 6, label: `入职日期`, visible: false },
  { key: 7, label: `在职状态`, visible: true },
  { key: 8, label: `合同期限`, visible: false },
  { key: 9, label: `离职日期`, visible: false },
  { key: 10, label: `合同起始日期`, visible: false },
  { key: 11, label: `合同终止日期`, visible: false },
  { key: 12, label: `工龄`, visible: true },
  { key: 13, label: `转正日期`, visible: false },
  { key: 14, label: `职称`, visible: false },
  { key: 15, label: `邮箱`, visible: false },
  { key: 16, label: `电话号码`, visible: false },
  { key: 17, label: `联系地址`, visible: false },
  { key: 18, label: `性别`, visible: false },
  { key: 19, label: `出生日期`, visible: false }
]);

/** 查询员工档案管理列表 */
function getList () {
  loading.value = true;
  listEmployee(queryParams.value).then(response => {
    employeeList.value = response.rows;
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
/** 查询全部职称管理列表 */
function getAllListJobLevel () {
  allListJobLevel(queryParams.value).then(response => {
    jobLevelList.value = response.data;
  });
}
/** 查询全部岗位列表 */
function getAllListPost () {
  allListPost(queryParams.value).then(response => {
    postList.value = response.data;
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
    employeeId: null,
    name: null,
    gender: null,
    birthday: null,
    idCard: null,
    wedlock: null,
    nation: null,
    nativePlace: null,
    politic: null,
    email: null,
    phone: null,
    address: null,
    deptId: null,
    jobLevelId: null,
    postId: null,
    engageForm: null,
    tiptopDegree: null,
    specialty: null,
    school: null,
    beginDate: null,
    workState: null,
    workId: null,
    contractTerm: null,
    conversionTime: null,
    notWorkDate: null,
    beginContract: null,
    endContract: null,
    workAge: null
  };
  proxy.resetForm("employeeRef");
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
  ids.value = selection.map(item => item.employeeId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 新增按钮操作 */
function handleAdd () {
  reset();
  open.value = true;
  title.value = "添加员工档案管理";
}
/** 查看按钮操作 */
function handleShowDetail (row) {
  reset();
  const employeeId = row.employeeId || ids.value
  getEmployee(employeeId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "查看员工档案明细";
  });
}
/** 修改按钮操作 */
function handleUpdate (row) {
  reset();
  const employeeId = row.employeeId || ids.value
  getEmployee(employeeId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改员工档案管理";
  });
}
/** 提交按钮 */
function submitForm () {
  proxy.$refs["employeeRef"].validate(valid => {
    if (valid) {
      if (form.value.employeeId != null) {
        updateEmployee(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addEmployee(form.value).then(response => {
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
  const employeeIds = row.employeeId || ids.value;
  proxy.$modal.confirm('是否确认删除员工档案管理编号为"' + employeeIds + '"的数据项？').then(function () {
    return delEmployee(employeeIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}
/** 导出按钮操作 */
function handleExport () {
  proxy.download('hr/employee/export', {
    ...queryParams.value
  }, `employee_${new Date().getTime()}.xlsx`)
}

getList();
getDeptTree();
getAllListPost();
getAllListJobLevel();
</script>
