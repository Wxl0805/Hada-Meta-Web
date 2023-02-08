<template>
  <div>
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item>
          <el-input
            v-model="searchInfo.userName"
            :placeholder="searchInfo.selection"
            :onkeyup="searchInfo.userName = searchInfo.userName.replace(/\s+/g,'')"
            @keyup.enter="onSubmit"
          >
            <template #append>
              <el-select v-model="searchInfo.selection" style="width:100px">
                <el-option v-for="item in options" :key="item.id" :label="item.value" :value="item.value" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" placeholder="请选择">
            <el-option label="正常" value="1" />
            <el-option label="注销" value="0" />
          </el-select>
        </el-form-item>

        <el-form-item label="注册时间">
          <el-date-picker
            v-model="searchInfo.date"
            type="datetimerange"
            range-separator="To"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            :disabled-date="disabledDate"
            :shortcuts="shortcuts"
            value-format="YYYY-MM-DD HH:mm:ss Z"
            format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item>
          <el-button size="small" type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button size="small" icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>

      </el-form>
    </div>

    <div class="gva-table-box">

      <el-table :data="tableData" @sort-change="sortChange">
        <el-table-column type="index" fixed="left" width="60" label="序号" />
        <el-table-column align="left" label="UID" min-width="100" prop="Uid" />
        <el-table-column align="left" label="用户名" min-width="100" prop="NickName" />
        <el-table-column align="left" label="手机号" min-width="100" prop="Telephone">
          <template #default="scope">
            <div>{{ switchtel(scope.row.Telephone) }}</div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="邮箱" min-width="100" prop="Email" />
        <el-table-column align="left" label="状态" min-width="100" prop="Status">
          <template #default="scope">
            <div v-if="scope.row.Status == 1">正常</div>
            <div v-else style="color:red">注销</div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="注册时间" min-width="100" prop="CreatedAt">
          <!-- <template #default="scope">
            <div>{{ scope.row.CreatedAt }}</div>
          </template> -->
        </el-table-column>
        <el-table-column align="left" fixed="right" label="操作" width="150">
          <template #default="scope">
            <el-button
              v-if="scope.row.Status == 0"
              icon="edit"
              size="small"
              type="primary"
              link
              @click="setzhuxiao(scope.row.Id)"
            >撤销注销</el-button>
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

  </div>
</template>

<script>
export default {
  name: 'CustomerManager',
}
</script>
<script setup>
import { getTableList, exitStatus } from '@/api/customerManager'
import { toSQLLine } from '@/utils/stringFun'
// eslint-disable-next-line no-unused-vars
import WarningBar from '@/components/warningBar/warningBar.vue'
import { onBeforeMount, ref } from 'vue'
// eslint-disable-next-line no-unused-vars
import { ElMessage, ElMessageBox } from 'element-plus'
// eslint-disable-next-line no-unused-vars
import { CirclePlus, Search } from '@element-plus/icons-vue'

// eslint-disable-next-line no-unused-vars
const methodFilter = (value) => {
  const target = methodOptions.value.filter(item => item.value === value)[0]
  return target && `${target.label}`
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

// eslint-disable-next-line no-unused-vars
const options = ref([
  { id: '0', value: 'UID' },
  { id: '1', value: '用户名' },
  { id: '2', value: '手机号' },
  { id: '3', value: '邮箱' }
])

// 数据
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])
const searchInfo = ref({
  userName: '',
  selection: '',
  status: '',
  date: ''
})

onBeforeMount(() => {
  // 默认选中UID
  searchInfo.value.selection = options.value[0].value
})

const onReset = () => {
  searchInfo.value.userName = ''
  searchInfo.value.date = ''
  searchInfo.value.status = ''
}

// 搜索
const onSubmit = () => {
  page.value = 1
  pageSize.value = 10
  getTableData()
}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
  getTableData()
}

const handleCurrentChange = (val) => {
  page.value = val
  getTableData()
}

// 排序
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

// const date1 = ref('')
// const date2 = ref('')
// const selectDate = (e) => {
//   console.log(e)
//   date1.value = e[0]
//   date2.value = e[1]
//   console.log(date1.value)
//   console.log(date2.value)
// }
// 查询
const getTableData = async() => {
  var selecttype = ''
  if (searchInfo.value.selection === 'UID') {
    selecttype = 'uid'
  } else if (searchInfo.value.selection === '用户名') {
    selecttype = 'name'
  } else if (searchInfo.value.selection === '手机号') {
    selecttype = 'telephone'
  } else if (searchInfo.value.selection === '邮箱') {
    selecttype = 'email'
  }
  // 如果date为空
  if (searchInfo.value.date === '' || searchInfo.value.date === null) {
    const table = await getTableList({ page: page.value, pageSize: pageSize.value, type: selecttype, value: searchInfo.value.userName, status: searchInfo.value.status, date1: '', date2: '' })
    if (table.code === 0) {
      if (table.data.total === 0) {
        tableData.value = []
        total.value = 0
        page.value = 1
        pageSize.value = 10
        return
      }
      console.log(table)
      tableData.value = table.data.list
      tableData.value.forEach((data) => {
        data.CreatedAt = dateChangeFormat('YYYY-mm-dd HH:MM:SS', data.CreatedAt)
      // data.created_at = data.UserName + " / " + data.created_at;
      // data.UserName = data.created_at;
      })
      total.value = table.data.total
      page.value = table.data.page
      pageSize.value = table.data.pageSize
    }
    return
  }
  // date不为空
  const table = await getTableList({ page: page.value, pageSize: pageSize.value, type: selecttype, value: searchInfo.value.userName, status: searchInfo.value.status, date1: searchInfo.value.date[0], date2: searchInfo.value.date[1] })
  if (table.code === 0) {
    if (table.data.total === 0) {
      tableData.value = []
      total.value = 0
      page.value = 1
      pageSize.value = 10
      return
    }
    tableData.value = table.data.list
    tableData.value.forEach((data) => {
      data.CreatedAt = dateChangeFormat('YYYY-mm-dd HH:MM:SS', data.CreatedAt)
      // data.created_at = data.UserName + " / " + data.created_at;
      // data.UserName = data.created_at;
    })
    total.value = table.data.total
    page.value = table.data.page
    pageSize.value = table.data.pageSize
  }
}

// 转换手机号
const switchtel = (val) => {
  if (val && val.includes('#')) {
    return val.replace('#', '')
  }
  return val
}

getTableData()

// 撤销注销
const setzhuxiao = async(id) => {
  const quxiao = await exitStatus(id)
  if (quxiao.code === 0) {
    ElMessage({
      type: 'success',
      message: '取消注销成功',
    })
  }
  getTableData()
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
