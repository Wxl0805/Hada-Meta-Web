<template>
  <div>
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item>
          <el-input
            v-model="searchInfo.userName"
            :placeholder="searchInfo.selection"
          >
            <template #append>
              <el-select v-model="searchInfo.selection" style="width:100px">
                <el-option v-for="item in options" :key="item.id" :label="item.value" :value="item.value" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="启用/禁用">
          <el-select v-model="searchInfo.switch" placeholder="请选择">
            <el-option label="启用" value="on" />
            <el-option label="禁用" value="off" />
          </el-select>
        </el-form-item>

        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchInfo.date1"
            type="date"
            placeholder="请选择"
            :editable="false"
            :size="size"
          />
        </el-form-item>

        <el-form-item label="更新时间">
          <el-date-picker
            v-model="searchInfo.date2"
            type="date"
            placeholder="请选择"
            :editable="false"
            :size="size"
          />
        </el-form-item>

        <el-form-item>
          <el-button size="small" type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button size="small" icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>

      </el-form>

      <div style="display:block">
        <el-button type="primary" :icon="Top" color="green" style="color:#FFFFFF" :disabled="!multipleSelection.length " @click="batchSetLeader">批量启用</el-button>
        <el-button type="primary" :icon="Bottom" color="red" style="color:#FFFFFF" :disabled="!multipleSelection.length " @click="batchSetLeader">批量禁用</el-button>
        <el-button type="primary" :icon="CirclePlus" color="orange" style="color:#FFFFFF" @click="addUsers">新建用户</el-button>
      </div>
    </div>

    <div class="gva-table-box">

      <el-table :data="tableData" @sort-change="sortChange" @selection-change="handleSelect">
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column type="index" fixed="left" width="60" label="序号" />
        <el-table-column align="left" label="用户名" min-width="100" prop="nickname">
          <template #default="scope">
            <el-button style="color:blue;" link @click="showUserdetail(scope.row)">{{ scope.row.nickname }}</el-button>
          </template>
        </el-table-column>
        <el-table-column align="left" label="手机号" min-width="150" prop="telephone" />
        <el-table-column align="left" label="备注" min-width="150" prop="email" />
        <el-table-column align="left" label="性别" min-width="100" prop="isLeader">
          <template #default="scope">
            <el-button v-if="scope.row.isLeader == 1" style="color:blue;" link>男</el-button>
            <el-button v-if="scope.row.isLeader == 0" style="color:red;" link>女</el-button>
          </template>
        </el-table-column>
        <el-table-column align="left" label="启用/禁用" min-width="100" prop="isLeader">
          <template #default="scope">
            <el-button v-if="scope.row.isLeader == 1" :icon="SuccessFilled" style="color:green;" link>启用</el-button>
            <el-button v-if="scope.row.isLeader == 0" :icon="CircleCloseFilled" style="color:red;" link>禁用</el-button>
          </template>
        </el-table-column>
        <el-table-column align="left" label="创建人/创建时间" min-width="100" prop="rewardPoints" />
        <el-table-column align="left" label="更新人/更新时间" min-width="120" prop="inspiritPoints" />
        <el-table-column align="center" fixed="right" label="操作" width="100">
          <template #default="scope">
            <div style="display:flex;justify-content:space-around;align-items: center;margin: auto;">
              <el-button style="color:green;" link @click="editUsers(scope.row)">编辑</el-button>
              <el-button v-if="scope.row.isLeader == 0" style="color:blue;" link @click="setleaders(scope.row.customerId)">启用</el-button>
              <el-button v-if="scope.row.isLeader == 1" style="color:red;" link @click="quxiaoleader(scope.row.customerId)">禁用</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="gva-pagination">
        <el-pagination
          :current-page="page"
          :page-size="pageSize"
          :page-sizes="[10, 30, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>

    </div>

    <el-dialog
      v-model="quxiaoleaderlog"
      title="禁用用户"
      width="30%"
    >
      <span>
        此操作不可逆，禁用后用户将无法正常登录，您确认禁用所选用户吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="quxiaoleaderlog = false">我再想想</el-button>
          <el-button
            type="primary"
            @click="confirmdelete(deleteCustomerId)"
          >确认禁用</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: 'UserManager',
}
</script>
<script setup>
import { getTableList, setLeader, deleteLeader } from '@/api/khgl'
import { toSQLLine } from '@/utils/stringFun'
// eslint-disable-next-line no-unused-vars
import WarningBar from '@/components/warningBar/warningBar.vue'
import { onBeforeMount, ref } from 'vue'
// eslint-disable-next-line no-unused-vars
import { ElMessage, ElMessageBox } from 'element-plus'
import { CirclePlus, Search, Top, Bottom, SuccessFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
const route = useRoute() // 路由参数
const router = useRouter() // 跳转路由

// eslint-disable-next-line no-unused-vars
const options = ref([
  { id: '0', value: '用户名' },
  { id: '1', value: '手机号' },
])

// 弹窗
const deleteCustomerId = ref('')
const quxiaoleaderlog = ref(false)
const quxiaoleader = (value) => {
  quxiaoleaderlog.value = true
  deleteCustomerId.value = value
}
const confirmdelete = async(value) => {
  const str = String(value)
  const info = await deleteLeader(str)
  console.log(info)
  console.log(str)
  // eslint-disable-next-line eqeqeq
  if (info.code != 0) {
    getTableData()
    quxiaoleaderlog.value = false
    deleteCustomerId.value = ''
  } else {
    ElMessage({
      type: 'success',
      message: '禁用成功',
    })
    getTableData()
    quxiaoleaderlog.value = false
    deleteCustomerId.value = ''
  }
}

const multipleSelection = ref([])
// var isLeaders = []
var zancundatas = []
// 批量操作
const handleSelect = (val) => {
  console.log(val)
  multipleSelection.value = val
  console.log(multipleSelection.value)
}

const batchSetLeader = async() => {
  // 数据转移
  multipleSelection.value.forEach((data) => {
    zancundatas.push(data.customerId)
    // isLeaders.push(data.isLeader)
  })
  console.log('暂存数据', zancundatas)
  // console.log('是否包含leader', isLeaders)
  const batchinfo = await setLeader({ customerIds: zancundatas })
  console.log(batchinfo)
  if (batchinfo.code === 0) {
    ElMessage({
      type: 'success',
      message: '设置成功',
    })
  }
  // isLeaders = []
  zancundatas = []
  getTableData()
}

// 单个设置leader
const setleaders = async(value) => {
  const logs = await setLeader({ customerIds: [value] })
  ElMessage({
    type: 'success',
    message: '设置成功',
  })
  getTableData()
}

// 客户概览数据
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])
const searchInfo = ref({
  userName: '',
  selection: ''
})

onBeforeMount(() => {
  // 默认选中UID
  searchInfo.value.selection = options.value[0].value
})

const onReset = () => {
  searchInfo.value.userName = ''
}

// 客户概览搜索
const onSubmit = () => {
  page.value = 1
  pageSize.value = 10
  getTableData()
}

// 客户概览分页
const handleSizeChange = (val) => {
  pageSize.value = val
  getTableData()
}

const handleCurrentChange = (val) => {
  page.value = val
  getTableData()
}

// 客户概览排序
const sortChange = ({ prop, order }) => {
  if (prop) {
    if (prop === 'ID') {
      prop = 'id'
    }
    searchInfo.value.orderKey = toSQLLine(prop)
    searchInfo.value.desc = order === 'descending'
  }
  getTableData()
}

// 客户概览查询
const getTableData = async() => {
  var selecttype = ''
  if (searchInfo.value.selection === '用户名') {
    selecttype = 'nick_name'
  } else {
    selecttype = 'telephone'
  }
  const table = await getTableList({ page: page.value, pageSize: pageSize.value, types: selecttype, values: searchInfo.value.userName })
  if (table.code === 0) {
    tableData.value = table.data.list
    total.value = table.data.total
    page.value = table.data.page
    pageSize.value = table.data.pageSize
  }
}
getTableData()

// 新建用户
const addUsers = () => {
  router.push({ path: '/layout/userManager/addUsers' })
}

// 用户详情
const showUserdetail = (val) => {
  console.log(val)
  router.push({ path: '/layout/userManager/UsersDetails', query: { UsersInfo: JSON.stringify(val) }})
}

// 编辑用户
const editUsers = (val) => {
  router.push({ path: '/layout/userManager/editUsers', query: { UsersInfo: JSON.stringify(val) }})
}

</script>

  <style scoped lang="scss">
  .button-box {
    padding: 10px 20px;
    .el-button {
      float: right;
    }
  }
  .warning {
    color: #dc143c;
  }

  </style>
