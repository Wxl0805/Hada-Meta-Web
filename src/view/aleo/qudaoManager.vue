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

        <!-- <el-form-item label="状态">
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
        </el-form-item> -->

        <el-form-item>
          <el-button size="small" type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button size="small" icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :icon="CirclePlus"
            color="orange"
            style="color: #ffffff;"
            @click="addAccountpop = true"
          >新增账号</el-button>
        </el-form-item>

      </el-form>
    </div>

    <div class="gva-table-box">

      <el-table :data="tableData" @sort-change="sortChange">
        <el-table-column type="index" fixed="left" width="60" label="序号" />
        <el-table-column align="left" label="渠道编号" min-width="100" prop="Uid">
          <template #default="scope">
            <el-button style="color: blue;" link @click="toDetail(scope.row.Uid)">{{ scope.row.Uid }}</el-button>
          </template>
        </el-table-column>
        <el-table-column align="left" label="渠道名称" min-width="100" prop="NickName" />
        <el-table-column align="left" label="邮箱" min-width="100" prop="Email" />
        <el-table-column align="left" label="手机号" min-width="100" prop="Telephone">
          <template #default="scope">
            <div>{{ switchtel(scope.row.Telephone) }}</div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="账户余额(U)" min-width="100" prop="" />
        <el-table-column align="left" label="总股份" min-width="100" prop="" />
        <el-table-column align="left" label="渠道售价" min-width="100" prop="">
          <template #default="scope">
            <div>1000U/股</div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="已分配积分" min-width="100" prop="">
          <template #default="scope">
            <div>1000Aleo</div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="服务费" min-width="100" prop="">
          <template #default="scope">
            <div>{{ 0.08 * 100 }}%</div>
          </template>
        </el-table-column>

        <!-- <el-table-column align="left" label="状态" min-width="100" prop="Status">
          <template #default="scope">
            <div v-if="scope.row.Status == 1">正常</div>
            <div v-else style="color:red">注销</div>
          </template>
        </el-table-column> -->
        <!-- <el-table-column align="left" label="注册时间" min-width="100" prop="CreatedAt"> -->
        <!-- <template #default="scope">
              <div>{{ scope.row.CreatedAt }}</div>
            </template> -->
        <!-- </el-table-column> -->
        <el-table-column align="center" fixed="right" label="操作" width="150">
          <template #default="scope">
            <el-button
              icon="edit"
              size="small"
              type="primary"
              link
            >编辑</el-button>
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

    <!-- 新增账号弹窗 -->
    <el-dialog
      v-model="addAccountpop"
      title="新增账号"
      width="400px"
      @close="clearAccountData"
    >
      <el-form
        ref="modifyAccountForm"
        :model="AccountModify"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="渠道名称" prop="qudaoName">
          <el-input v-model="AccountModify.qudaoName" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="AccountModify.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="AccountModify.phone" />
        </el-form-item>
        <el-form-item label="渠道售价" prop="qudaoSell">
          <el-input v-model="AccountModify.qudaoSell" type="number" />
        </el-form-item>
        <el-form-item label="服务费" prop="Fee">
          <el-input v-model="AccountModify.Fee" type="number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            size="small"
            @click="clearAccountData"
          >取 消</el-button>
          <el-button
            size="small"
            type="primary"
            @click="addAccount"
          >确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="editAccountpop"
      title="编辑账号"
      width="400px"
      @close="clearAccountData"
    >
      <el-form
        ref="editmodifyAccountForm"
        :model="editAccountModify"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="渠道名称" prop="qudaoName">
          <el-input v-model="editAccountModify.qudaoName" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editAccountModify.email" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editAccountModify.phone" />
        </el-form-item>
        <el-form-item label="渠道售价" prop="qudaoSell">
          <el-input v-model="editAccountModify.qudaoSell" type="number" />
        </el-form-item>
        <el-form-item label="服务费" prop="Fee">
          <el-input v-model="editAccountModify.Fee" type="number" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            size="small"
            @click="clearAccountData"
          >取 消</el-button>
          <el-button
            size="small"
            type="primary"
            @click="addAccount"
          >确 定</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: 'CustomerManager',
}
</script>
<script setup>
import { getTableList } from '@/api/qudaoManager'
import { toSQLLine } from '@/utils/stringFun'
// eslint-disable-next-line no-unused-vars
import WarningBar from '@/components/warningBar/warningBar.vue'
import { onBeforeMount, ref, reactive } from 'vue'
// eslint-disable-next-line no-unused-vars
import { ElMessage, ElMessageBox } from 'element-plus'
// eslint-disable-next-line no-unused-vars
import { CirclePlus, Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
const router = useRouter() // 跳转路由

// eslint-disable-next-line no-unused-vars
const methodFilter = (value) => {
  const target = methodOptions.value.filter(item => item.value === value)[0]
  return target && `${target.label}`
}

// 结算日期所需内容---------
// const shortcuts = [
//   {
//     text: '今天',
//     value: new Date(),
//   },
//   {
//     text: '昨天',
//     value: () => {
//       const end = new Date()
//       const start = new Date()
//       start.setTime(start.getTime() - 3600 * 1000 * 24)
//       return [start, end]
//     },
//   },
//   {
//     text: '7天前',
//     value: () => {
//       const end = new Date()
//       const start = new Date()
//       start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
//       return [start, end]
//     },
//   },
// ]
// const disabledDate = (time) => {
//   return time.getTime() > Date.now()
// }

// // 转换日期格式
// const dateChangeFormat = (format, date) => {
//   date = new Date(date)
//   const dataItem = {
//     'Y+': date.getFullYear().toString(),
//     'm+': (date.getMonth() + 1).toString(),
//     'd+': date.getDate().toString(),
//     'H+': date.getHours().toString(),
//     'M+': date.getMinutes().toString(),
//     'S+': date.getSeconds().toString(),
//   }
//   Object.keys(dataItem).forEach((item) => {
//     const ret = new RegExp(`(${item})`).exec(format)
//     if (ret) {
//       format = format.replace(ret[1], ret[1].length === 1 ? dataItem[item] : dataItem[item].padStart(ret[1].length, '0'))
//     }
//   })
//   return format
// }

// eslint-disable-next-line no-unused-vars
const options = ref([
  { id: '0', value: '渠道编号' },
  { id: '1', value: '渠道名称' },
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
})

onBeforeMount(() => {
  // 默认选中渠道编号
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
  if (searchInfo.value.selection === '渠道编号') {
    selecttype = 'uid'
  } else if (searchInfo.value.selection === '渠道名称') {
    selecttype = 'name'
  } else if (searchInfo.value.selection === '手机号') {
    selecttype = 'telephone'
  } else if (searchInfo.value.selection === '邮箱') {
    selecttype = 'email'
  }
  // 如果date为空
  //   if (searchInfo.value.date === '' || searchInfo.value.date === null) {
  //     const table = await getTableList({ page: page.value, pageSize: pageSize.value, type: selecttype, value: searchInfo.value.userName, status: searchInfo.value.status, date1: '', date2: '' })
  //     if (table.code === 0) {
  //       if (table.data.total === 0) {
  //         tableData.value = []
  //         total.value = 0
  //         page.value = 1
  //         pageSize.value = 10
  //         return
  //       }
  //       console.log(table)
  //       tableData.value = table.data.list
  //       tableData.value.forEach((data) => {
  //         data.CreatedAt = dateChangeFormat('YYYY-mm-dd HH:MM:SS', data.CreatedAt)
  //         // data.created_at = data.UserName + " / " + data.created_at;
  //         // data.UserName = data.created_at;
  //       })
  //       total.value = table.data.total
  //       page.value = table.data.page
  //       pageSize.value = table.data.pageSize
  //     }
  //     return
  //   }
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
    // tableData.value.forEach((data) => {
    //   data.CreatedAt = dateChangeFormat('YYYY-mm-dd HH:MM:SS', data.CreatedAt)
    //   // data.created_at = data.UserName + " / " + data.created_at;
    //   // data.UserName = data.created_at;
    // })
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
// const setzhuxiao = async(id) => {
//   const quxiao = await exitStatus(id)
//   if (quxiao.code === 0) {
//     ElMessage({
//       type: 'success',
//       message: '取消注销成功',
//     })
//   }
//   getTableData()
// }

// 校验新增账号
const rules = reactive({
  qudaoName: [
    { required: true, message: '请输入渠道名称', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const emailreg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
        if (!emailreg.test(AccountModify.value.email)) {
          callback(new Error('邮箱格式错误'))
        }
      },
      trigger: 'blur',
    },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const telreg = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/
        if (!telreg.test(AccountModify.value.phone)) {
          callback(new Error('手机号格式错误'))
        }
      },
      trigger: 'blur',
    },
  ],
  qudaoSell: [
    { required: true, message: '请输入渠道售价', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (AccountModify.value.qudaoSell <= 0) {
          callback(new Error('渠道售价必须大于0'))
        }
      },
      trigger: 'blur',
    },
  ],
  Fee: [
    { required: true, message: '请输入服务费', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (AccountModify.value.Fee <= 0 || AccountModify.value.Fee >= 1) {
          callback(new Error('服务费区间为0~1'))
        }
      },
      trigger: 'blur',
    },
  ],
})

const modifyAccountForm = ref(null)
const addAccountpop = ref(false)
const AccountModify = ref({})
const addAccount = async() => {
  modifyAccountForm.value.validate((valid) => {
    if (valid) {
      changePassword({
        password: AccountModify.value.password,
        newPassword: AccountModify.value.newPassword,
      }).then((res) => {
        if (res.code === 0) {
          ElMessage.success('新增账号成功！')
        }
        addAccountpop.value = false
      })
    } else {
      return false
    }
  })
}
const clearAccountData = () => {
  addAccountpop.value = false
  AccountModify.value = {
    qudaoName: '',
    email: '',
    phone: '',
    qudaoSell: '',
    Fee: ''
  }
  modifyAccountForm.value.clearValidate()
}

// 校验编辑账号
const editrules = reactive({
  qudaoName: [
    { required: true, message: '请输入渠道名称', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const emailreg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
        if (!emailreg.test(editAccountModify.value.email)) {
          callback(new Error('邮箱格式错误'))
        }
      },
      trigger: 'blur',
    },
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const telreg = /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/
        if (!telreg.test(editAccountModify.value.phone)) {
          callback(new Error('手机号格式错误'))
        }
      },
      trigger: 'blur',
    },
  ],
  qudaoSell: [
    { required: true, message: '请输入渠道售价', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (editAccountModify.value.qudaoSell <= 0) {
          callback(new Error('渠道售价必须大于0'))
        }
      },
      trigger: 'blur',
    },
  ],
  Fee: [
    { required: true, message: '请输入服务费', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (editAccountModify.value.Fee <= 0 || editAccountModify.value.Fee >= 1) {
          callback(new Error('服务费区间为0~1'))
        }
      },
      trigger: 'blur',
    },
  ],
})

const editmodifyAccountForm = ref(null)
const editAccountpop = ref(false)
const editAccountModify = ref({})
const editAccount = async() => {
  editmodifyAccountForm.value.validate((valid) => {
    if (valid) {
      changePassword({
        password: editAccountModify.value.password,
        newPassword: editAccountModify.value.newPassword,
      }).then((res) => {
        if (res.code === 0) {
          ElMessage.success('编辑账号成功！')
        }
        editAccountpop.value = false
      })
    } else {
      return false
    }
  })
}
const cleareditAccountData = () => {
  editAccountpop.value = false
  editAccountModify.value = {
    qudaoName: '',
    email: '',
    phone: '',
    qudaoSell: '',
    Fee: ''
  }
  editmodifyAccountForm.value.clearValidate()
}

// 编辑账号点击
const Edit = (cid) => {
  editAccountpop.value = true
}

// 跳转到渠道详情
const toDetail = (id) => {
  router.push({ path: '/layout/aleo-project/qudaoDetail', query: { id: id }})
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

