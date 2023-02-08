<template>
  <div>
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item>
          <el-input
            v-model="searchInfo.userName"
            :onkeyup="(searchInfo.userName = searchInfo.userName.replace(/\s+/g, ''))"
            :placeholder="searchInfo.selection"
            @keyup.enter="onSubmit"
          >
            <template #append>
              <el-select v-model="searchInfo.selection" style="width: 100px;">
                <el-option v-for="item in options" :key="item.id" :label="item.value" :value="item.value" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="是否leader">
          <el-select v-model="searchInfo.leader" placeholder="请选择">
            <el-option label="是" value="1" />
            <el-option label="否" value="0" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button size="small" type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button size="small" icon="refresh" @click="onReset">重置</el-button>
          <el-button
            type="primary"
            :icon="CirclePlus"
            color="orange"
            style="color: #ffffff;"
            :disabled="!multipleSelection.length"
            @click="batchSetLeader"
          >设置leader</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="gva-table-box">
      <el-table :data="tableData" @sort-change="sortChange" @selection-change="handleSelect">
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" fixed="left" width="60" label="序号" />
        <el-table-column align="left" label="UID" min-width="100" prop="uid" />
        <el-table-column align="left" label="用户名" min-width="100" prop="nickname" />
        <el-table-column align="left" label="手机号" min-width="150" prop="telephone">
          <template #default="scope">
            <div>{{ switchtel(scope.row.telephone) }}</div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="邮箱" min-width="200" prop="email" />
        <el-table-column align="left" label="邀请码" min-width="100" prop="invitationCode" />
        <el-table-column align="left" label="投资股份" min-width="100" prop="changeAmount" />
        <el-table-column align="left" label="拓展股份" min-width="100" prop="expandAmount" />
        <el-table-column align="left" label="账户余额" min-width="100" prop="balance" />
        <el-table-column align="left" label="总积分" min-width="100" prop="credits">
          <template #default="scope">
            <el-button style="color: blue;" link @click="chakan(scope.row.customerId)">{{ scope.row.credits }}</el-button>
          </template>
          <!-- <template #default="scope">
            <el-button style="color:blue;" link>{{ scope.row.totalPoints }}</el-button>
          </template> -->
        </el-table-column>
        <el-table-column align="left" label="奖励积分" min-width="100" prop="rewardIntegral" />
        <el-table-column align="left" label="激励激分" min-width="120" prop="inspiritIntegral" />
        <el-table-column align="left" label="是否leader" min-width="150" prop="isLeader">
          <template #default="scope">
            <div v-if="scope.row.isLeader == 0">否</div>
            <div v-if="scope.row.isLeader == 1">是</div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="认证人" min-width="120" prop="authenticator" />
        <el-table-column align="left" label="认证人-UID" min-width="120" prop="authenticatorUid" />
        <el-table-column align="left" label="认证时间" min-width="170" prop="authenticatorTime" />
        <el-table-column align="left" fixed="right" label="操作" width="150">
          <template #default="scope">
            <el-button
              v-if="scope.row.isLeader == 0"
              icon="edit"
              size="small"
              type="primary"
              link
              @click="setleaders(scope.row.customerId)"
            >设置leader</el-button>
            <el-button
              v-if="scope.row.isLeader == 1"
              style="color: red;"
              icon="delete"
              size="small"
              type="primary"
              link
              @click="quxiaoleader(scope.row.customerId)"
            >取消leader</el-button>
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

    <el-dialog v-model="chakanpop" title="收益明细">
      <div class="gva-search-box">
        <el-form ref="searchForm" :inline="true" :model="searchInfoIncome">
          <el-form-item label="结算日期">
            <el-date-picker
              v-model="searchInfoIncome.date"
              type="datetimerange"
              range-separator="To"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              :disabled-date="disabledDate"
              :shortcuts="shortcuts"
              value-format="YYYY-MM-DD HH:mm:ss Z"
              format="YYYY-MM-DD HH:mm:ss"
              @change="selectDate"
            />
          </el-form-item>

          <el-form-item>
            <el-input
              v-model="searchInfoIncome.odd"
              style="width: 300px;"
              placeholder="收益结算单号"
              :onkeyup="(searchInfoIncome.odd = searchInfoIncome.odd.replace(/\s+/g, ''))"
              @keyup.enter="onSubmitIncome"
            />
          </el-form-item>

          <el-form-item>
            <el-button size="small" type="primary" icon="search" @click="onSubmitIncome">查询</el-button>
            <el-button size="small" icon="refresh" @click="onResetIncome">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="gva-table-box">
        <el-table :data="tableDataIncome" @sort-change="sortChangeIncome">
          <el-table-column type="index" fixed="left" width="60" label="序号" />
          <el-table-column align="left" label="收益结算单号" min-width="200" prop="orderNumber" />
          <el-table-column align="left" label="结算日期" min-width="100" prop="settlementDate" />
          <el-table-column align="left" label="结算总积分" min-width="100" prop="totalIntegral" />
          <el-table-column align="left" label="奖励积分" min-width="100" prop="rewardIntegral" />
          <el-table-column align="left" label="激励积分" min-width="100" prop="inspireIntegral" />
        </el-table>
        <div class="gva-pagination">
          <el-pagination
            :current-page="pageIncome"
            :page-size="pageSizeIncome"
            :page-sizes="[10, 30, 50, 100]"
            :total="totalIncome"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handleCurrentChangeIncome"
            @size-change="handleSizeChangeIncome"
          />
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="quxiaoleaderlog" title="取消leader" width="30%">
      <span>此操作不可逆，您确认删除该leader吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="quxiaoleaderlog = false">我再想想</el-button>
          <el-button type="primary" @click="confirmdelete(deleteCustomerId)">确认取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Khgl',
}
</script>
<script setup>
import { getTableList, setLeader, deleteLeader, getCustomerProfit } from '@/api/khgl'
import { toSQLLine } from '@/utils/stringFun'
// eslint-disable-next-line no-unused-vars
import WarningBar from '@/components/warningBar/warningBar.vue'
import { onBeforeMount, ref, watch } from 'vue'
// eslint-disable-next-line no-unused-vars
import { ElMessage, ElMessageBox } from 'element-plus'
import { CirclePlus, Search } from '@element-plus/icons-vue'

// eslint-disable-next-line no-unused-vars
const options = ref([
  { id: '0', value: 'UID' },
  { id: '1', value: '用户名' },
  { id: '2', value: '手机号' },
  { id: '3', value: '邮箱' },
  { id: '4', value: '认证人' },
  { id: '5', value: '认证人-UID' },
])

// 转换日期格式
const dateChangeFormat = (format, date) => {
  date = new Date(date)
  const dataItem = {
    'Y+': date.getFullYear().toString(),
    'm+': (date.getMonth() + 1).toString(),
    'd+': date.getDate().toString(),
    'H+': date.getHours().toString(),
    'M+': date.getMinutes().toString(),
    'S+': date.getSeconds().toString(),
  }
  Object.keys(dataItem).forEach((item) => {
    const ret = new RegExp(`(${item})`).exec(format)
    if (ret) {
      format = format.replace(ret[1], ret[1].length === 1 ? dataItem[item] : dataItem[item].padStart(ret[1].length, '0'))
    }
  })
  return format
}

// 结算日期所需内容---------
const shortcuts = [
  {
    text: '今天',
    value: new Date(),
  },
  {
    text: '昨天',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24)
      return [start, end]
    },
  },
  {
    text: '7天前',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    },
  },
]
const disabledDate = (time) => {
  return time.getTime() > Date.now()
}

const date1 = ref('')
const date2 = ref('')
const selectDate = (e) => {
  date1.value = e[0]
  date2.value = e[1]
}

// 默认选中UID
// searchInfo.selection = options.value[0].value

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
  // eslint-disable-next-line eqeqeq
  if (info.code != 0) {
    getTableData()
    quxiaoleaderlog.value = false
    deleteCustomerId.value = ''
  } else {
    ElMessage({
      type: 'success',
      message: '取消成功',
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
  multipleSelection.value = val
}

const batchSetLeader = async() => {
  // 数据转移
  multipleSelection.value.forEach((data) => {
    zancundatas.push(data.customerId)
    // isLeaders.push(data.isLeader)
  })
  const batchinfo = await setLeader({ customerIds: zancundatas })
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

const chakanpop = ref(false)
const customerIds = ref('')
// 查看积分记录
const chakan = (val) => {
  customerIds.value = val
  getTableDataIncome()
  chakanpop.value = true
}

watch(
  () => chakanpop.value,
  (val) => {
    if (!val) {
      pageIncome.value = 1
      pageSizeIncome.value = 10
      totalIncome.value = 0
      onResetIncome()
    }
  }
)

// 单个设置leader
const setleaders = async(value) => {
  const logs = await setLeader({ customerIds: [value] })
  ElMessage({
    type: 'success',
    message: '设置成功',
  })
  getTableData()
}

// eslint-disable-next-line no-unused-vars
// const methodFilter = (value) => {
//   const target = methodOptions.value.filter(item => item.value === value)[0]
//   return target && `${target.label}`
// }

// 客户概览数据
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])
const searchInfo = ref({
  userName: '',
  selection: '',
  leader: '',
})

onBeforeMount(() => {
  // 默认选中UID
  searchInfo.value.selection = options.value[0].value
})

// 收益明细数据
const pageIncome = ref(1)
const totalIncome = ref(0)
const pageSizeIncome = ref(10)
const tableDataIncome = ref([])
const searchInfoIncome = ref({
  date: '',
  odd: '',
})

const onReset = () => {
  searchInfo.value.userName = ''
  searchInfo.value.leader = ''
}

const onResetIncome = () => {
  searchInfoIncome.value.date = ''
  searchInfoIncome.value.odd = ''
}

// 客户概览搜索
const onSubmit = () => {
  page.value = 1
  pageSize.value = 10
  getTableData()
}

// 收益明细搜索
const onSubmitIncome = () => {
  pageIncome.value = 1
  pageSizeIncome.value = 10
  getTableDataIncome()
}

// 客户概览分页
const handleSizeChange = (val) => {
  pageSize.value = val
  getTableData()
}

// 收益明细分页
const handleSizeChangeIncome = (val) => {
  pageSizeIncome.value = val
  getTableDataIncome()
}

const handleCurrentChange = (val) => {
  page.value = val
  getTableData()
}

const handleCurrentChangeIncome = (val) => {
  pageIncome.value = val
  getTableDataIncome()
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

// 收益明细排序
const sortChangeIncome = ({ prop, order }) => {
  if (prop) {
    if (prop === 'ID') {
      prop = 'id'
    }
    searchInfoIncome.value.orderKey = toSQLLine(prop)
    searchInfoIncome.value.desc = order === 'descending'
  }
  getTableDataIncome()
}

// 客户概览查询
const getTableData = async() => {
  var selecttype = ''
  if (searchInfo.value.selection === 'UID') {
    selecttype = 'uid'
  } else if (searchInfo.value.selection === '用户名') {
    selecttype = 'nickName'
  } else if (searchInfo.value.selection === '手机号') {
    selecttype = 'telephone'
  } else if (searchInfo.value.selection === '邮箱') {
    selecttype = 'email'
  } else if (searchInfo.value.selection === '认证人') {
    selecttype = 'authenticator'
  } else if (searchInfo.value.selection === '认证人-UID') {
    selecttype = 'authenticatorUid'
  }
  const table = await getTableList({ page: page.value, pageSize: pageSize.value, types: selecttype, values: searchInfo.value.userName, keyword: searchInfo.value.leader })
  if (table.code === 0) {
    if (table.msg === '该客户不存在') {
      tableData.value = []
      total.value = 0
      page.value = 1
      pageSize.value = 10
      return
    }
    tableData.value = table.data.list
    tableData.value.forEach((data) => {
      data.authenticatorTime = dateChangeFormat('YYYY-mm-dd HH:MM:SS', data.authenticatorTime)
      // data.created_at = data.UserName + " / " + data.created_at;
      // data.UserName = data.created_at;
    })
    total.value = table.data.total
    page.value = table.data.page
    pageSize.value = table.data.pageSize
  }
}
getTableData()

// 收益明细查询
const getTableDataIncome = () => {
  if (searchInfoIncome.value.date === '') {
    searchtable()
  } else {
    searchtables()
  }
}
// 弹窗显示出来查询
const searchtable = async() => {
  const table = await getCustomerProfit({
    page: pageIncome.value,
    pageSize: pageSizeIncome.value,
    customerId: customerIds.value,
    keyword: searchInfoIncome.value.odd,
  })
  if (table.code === 0) {
    if (table.msg === '暂无此记录') {
      // ElMessage({
      //   type: 'error',
      //   message: '暂无数据',
      // })
      tableDataIncome.value = []
      totalIncome.value = 0
      return
    }
    tableDataIncome.value = table.data.list
    totalIncome.value = table.data.total
    pageIncome.value = table.data.page
    pageSizeIncome.value = table.data.pageSize
  }
}
// 字段查询
const searchtables = async() => {
  const table = await getCustomerProfit({
    page: pageIncome.value,
    pageSize: pageSizeIncome.value,
    customerId: customerIds.value,
    statementDate: searchInfoIncome.value.date,
    keyword: searchInfoIncome.value.odd,
  })
  if (table.code === 0) {
    if (table.msg === '暂无此记录') {
      // ElMessage({
      //   type: 'error',
      //   message: '暂无数据',
      // })
      tableDataIncome.value = []
      totalIncome.value = 0
      return
    }
    tableDataIncome.value = table.data.list
    totalIncome.value = table.data.total
    pageIncome.value = table.data.page
    pageSizeIncome.value = table.data.pageSize
  }
}

// 转换手机号
const switchtel = (val) => {
  if (val && val.includes('#')) {
    return val.replace('#', '')
  }
  return val
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
