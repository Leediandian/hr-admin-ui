<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm"  :inline="true" v-show="showSearch" >
      <el-form-item label="员工编号" prop="employeeId">
        <el-input v-model="queryParams.employeeId" placeholder="请输入员工编号" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="请假的天数" prop="days">
        <el-input v-model="queryParams.days" placeholder="请输入请假的天数" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="请假类型id" prop="typeNum">
        <el-input v-model="queryParams.typeNum" placeholder="请输入请假类型id" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="请假的开始日期" prop="startDate">
        <el-date-picker clearable v-model="queryParams.startDate" type="date" value-format="yyyy-MM-dd"
          placeholder="请选择请假的开始日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="状态/逻辑删除" prop="isDeleted">
        <el-input v-model="queryParams.isDeleted" placeholder="请输入状态/逻辑删除" clearable
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['hr:leave:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['hr:leave:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['hr:leave:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['hr:leave:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="leaveList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="请假编号" align="center" prop="leaveId" />
      <el-table-column label="员工编号" align="center" prop="employeeId" />
      <el-table-column label="请假的天数" align="center" prop="days" />
      <el-table-column label="请假类型id" align="center" prop="typeNum" />
      <el-table-column label="请假的开始日期" align="center" prop="startDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="0未审核，1审核通过，2驳回，3撤销" align="center" prop="status" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="状态/逻辑删除" align="center" prop="isDeleted" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['hr:leave:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['hr:leave:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改请假审批管理对话框 -->
     <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules">
        <el-form-item label="员工编号" prop="employeeId">
          <el-input v-model="form.employeeId" placeholder="请输入员工编号" />
        </el-form-item>
        <el-form-item label="请假的天数" prop="days">
          <el-input v-model="form.days" placeholder="请输入请假的天数" />
        </el-form-item>
        <el-form-item label="请假类型id" prop="typeNum">
          <el-input v-model="form.typeNum" placeholder="请输入请假类型id" />
        </el-form-item>
        <el-form-item label="请假的开始日期" prop="startDate">
          <el-date-picker clearable v-model="form.startDate" type="date" value-format="yyyy-MM-dd"
            placeholder="请选择请假的开始日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
        </el-form-item>
        <el-form-item label="状态/逻辑删除" prop="isDeleted">
          <el-input v-model="form.isDeleted" placeholder="请输入状态/逻辑删除" />
        </el-form-item>
        <el-divider content-position="center">员工档案管理信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddHrEmployee">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteHrEmployee">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="hrEmployeeList" :row-class-name="rowHrEmployeeIndex"
          @selection-change="handleHrEmployeeSelectionChange" ref="hrEmployee">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50" />
          <el-table-column label="员工姓名" prop="name" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.name" placeholder="请输入员工姓名" />
            </template>
          </el-table-column>
          <el-table-column label="性别" prop="gender" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.gender" placeholder="请输入性别" />
            </template>
          </el-table-column>
          <el-table-column label="出生日期" prop="birthday" width="240">
            <template #default="scope">
              <el-date-picker clearable v-model="scope.row.birthday" type="date" value-format="yyyy-MM-dd"
                placeholder="请选择出生日期" />
            </template>
          </el-table-column>
          <el-table-column label="身份证号" prop="idCard" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.idCard" placeholder="请输入身份证号" />
            </template>
          </el-table-column>
          <el-table-column label="民族" prop="nation" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.nation" placeholder="请输入民族" />
            </template>
          </el-table-column>
          <el-table-column label="籍贯" prop="nativePlace" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.nativePlace" placeholder="请输入籍贯" />
            </template>
          </el-table-column>
          <el-table-column label="政治面貌" prop="politic" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.politic" placeholder="请输入政治面貌" />
            </template>
          </el-table-column>
          <el-table-column label="邮箱" prop="email" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.email" placeholder="请输入邮箱" />
            </template>
          </el-table-column>
          <el-table-column label="电话号码" prop="phone" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.phone" placeholder="请输入电话号码" />
            </template>
          </el-table-column>
          <el-table-column label="联系地址" prop="address" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.address" placeholder="请输入联系地址" />
            </template>
          </el-table-column>
          <el-table-column label="所属部门" prop="deptId" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.deptId" placeholder="请输入所属部门" />
            </template>
          </el-table-column>
          <el-table-column label="职称ID" prop="jobLevelId" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.jobLevelId" placeholder="请输入职称ID" />
            </template>
          </el-table-column>
          <el-table-column label="职位ID" prop="postId" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.postId" placeholder="请输入职位ID" />
            </template>
          </el-table-column>
          <el-table-column label="聘用形式" prop="engageForm" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.engageForm" placeholder="请输入聘用形式" />
            </template>
          </el-table-column>
          <el-table-column label="最高学历" prop="tiptopDegree" width="150">
            <template #default="scope">
              <el-select v-model="scope.row.tiptopDegree" placeholder="请选择最高学历">
                <el-option label="请选择字典生成" value="" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="所属专业" prop="specialty" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.specialty" placeholder="请输入所属专业" />
            </template>
          </el-table-column>
          <el-table-column label="毕业院校" prop="school" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.school" placeholder="请输入毕业院校" />
            </template>
          </el-table-column>
          <el-table-column label="入职日期" prop="beginDate" width="240">
            <template #default="scope">
              <el-date-picker clearable v-model="scope.row.beginDate" type="date" value-format="yyyy-MM-dd"
                placeholder="请选择入职日期" />
            </template>
          </el-table-column>
          <el-table-column label="在职状态" prop="workState" width="150">
            <template #default="scope">
              <el-select v-model="scope.row.workState" placeholder="请选择在职状态">
                <el-option label="请选择字典生成" value="" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="工号" prop="workId" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.workId" placeholder="请输入工号" />
            </template>
          </el-table-column>
          <el-table-column label="合同期限" prop="contractTerm" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.contractTerm" placeholder="请输入合同期限" />
            </template>
          </el-table-column>
          <el-table-column label="转正日期" prop="conversionTime" width="240">
            <template #default="scope">
              <el-date-picker clearable v-model="scope.row.conversionTime" type="date" value-format="yyyy-MM-dd"
                placeholder="请选择转正日期" />
            </template>
          </el-table-column>
          <el-table-column label="离职日期" prop="notWorkDate" width="240">
            <template #default="scope">
              <el-date-picker clearable v-model="scope.row.notWorkDate" type="date" value-format="yyyy-MM-dd"
                placeholder="请选择离职日期" />
            </template>
          </el-table-column>
          <el-table-column label="合同起始日期" prop="beginContract" width="240">
            <template #default="scope">
              <el-date-picker clearable v-model="scope.row.beginContract" type="date" value-format="yyyy-MM-dd"
                placeholder="请选择合同起始日期" />
            </template>
          </el-table-column>
          <el-table-column label="合同终止日期" prop="endContract" width="240">
            <template #default="scope">
              <el-date-picker clearable v-model="scope.row.endContract" type="date" value-format="yyyy-MM-dd"
                placeholder="请选择合同终止日期" />
            </template>
          </el-table-column>
          <el-table-column label="工龄" prop="workAge" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.workAge" placeholder="请输入工龄" />
            </template>
          </el-table-column>
        </el-table>
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

<script>
import { listLeave, getLeave, delLeave, addLeave, updateLeave } from "@/api/hr/leave";

export default {
  name: "Leave",
  data () {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 子表选中数据
      checkedHrEmployee: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 请假审批管理表格数据
      leaveList: [],
      // 员工档案管理表格数据
      hrEmployeeList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        employeeId: null,
        days: null,
        typeNum: null,
        startDate: null,
        status: null,
        isDeleted: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        createTime: [
          { required: true, message: "创建时间不能为空", trigger: "blur" }
        ],
        isDeleted: [
          { required: true, message: "状态/逻辑删除不能为空", trigger: "blur" }
        ]
      }
    };
  },
  created () {
    this.getList();
  },
  methods: {
    /** 查询请假审批管理列表 */
    getList () {
      this.loading = true;
      listLeave(this.queryParams).then(response => {
        this.leaveList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel () {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset () {
      this.form = {
        leaveId: null,
        employeeId: null,
        days: null,
        typeNum: null,
        startDate: null,
        status: null,
        remark: null,
        createTime: null,
        updateTime: null,
        isDeleted: null
      };
      this.hrEmployeeList = [];
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery () {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery () {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange (selection) {
      this.ids = selection.map(item => item.leaveId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd () {
      this.reset();
      this.open = true;
      this.title = "添加请假审批管理";
    },
    /** 修改按钮操作 */
    handleUpdate (row) {
      this.reset();
      const leaveId = row.leaveId || this.ids
      getLeave(leaveId).then(response => {
        this.form = response.data;
        this.hrEmployeeList = response.data.hrEmployeeList;
        this.open = true;
        this.title = "修改请假审批管理";
      });
    },
    /** 提交按钮 */
    submitForm () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          this.form.hrEmployeeList = this.hrEmployeeList;
          if (this.form.leaveId != null) {
            updateLeave(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addLeave(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete (row) {
      const leaveIds = row.leaveId || this.ids;
      this.$modal.confirm('是否确认删除请假审批管理编号为"' + leaveIds + '"的数据项？').then(function () {
        return delLeave(leaveIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => { });
    },
    /** 员工档案管理序号 */
    rowHrEmployeeIndex ({ row, rowIndex }) {
      row.index = rowIndex + 1;
    },
    /** 员工档案管理添加按钮操作 */
    handleAddHrEmployee () {
      let obj = {};
      obj.name = "";
      obj.gender = "";
      obj.birthday = "";
      obj.idCard = "";
      obj.wedlock = "";
      obj.nation = "";
      obj.nativePlace = "";
      obj.politic = "";
      obj.email = "";
      obj.phone = "";
      obj.address = "";
      obj.deptId = "";
      obj.jobLevelId = "";
      obj.postId = "";
      obj.engageForm = "";
      obj.tiptopDegree = "";
      obj.specialty = "";
      obj.school = "";
      obj.beginDate = "";
      obj.workState = "";
      obj.workId = "";
      obj.contractTerm = "";
      obj.conversionTime = "";
      obj.notWorkDate = "";
      obj.beginContract = "";
      obj.endContract = "";
      obj.workAge = "";
      this.hrEmployeeList.push(obj);
    },
    /** 员工档案管理删除按钮操作 */
    handleDeleteHrEmployee () {
      if (this.checkedHrEmployee.length == 0) {
        this.$modal.msgError("请先选择要删除的员工档案管理数据");
      } else {
        const hrEmployeeList = this.hrEmployeeList;
        const checkedHrEmployee = this.checkedHrEmployee;
        this.hrEmployeeList = hrEmployeeList.filter(function (item) {
          return checkedHrEmployee.indexOf(item.index) == -1
        });
      }
    },
    /** 复选框选中数据 */
    handleHrEmployeeSelectionChange (selection) {
      this.checkedHrEmployee = selection.map(item => item.index)
    },
    /** 导出按钮操作 */
    handleExport () {
      this.download('hr/leave/export', {
        ...this.queryParams
      }, `leave_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
