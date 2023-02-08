<template>
  <div>
    <el-collapse v-model="activeNames">
      <el-collapse-item title="当日积分概览" name="1">
        <template #title>
          <span class="header-text">当日积分概览</span>
        </template>
        <div class="gva-search-box">
          <el-form :inline="true" :model="todayPoint">
            <el-form-item label="结算日期:">
              <el-input v-model="todayPoint.settlementDate" :disabled="true" />
            </el-form-item>
            <el-form-item label="每股积分:">
              <el-input v-model.number="todayPoint.perPoint" :disabled="true" /><span class="aleo">Aleo</span>
            </el-form-item>
            <el-form-item :label="'每股积分(扣除费率'+todayPoint.rate+'%):'">
              <el-input v-model.number="todayPoint.perPointExtra" :disabled="true" /><span class="aleo">Aleo</span>
            </el-form-item>
            <el-form-item label="结算股份:">
              <el-input v-model="todayPoint.settlementShares" :disabled="true" />
            </el-form-item>
            <el-form-item label="结算积分:">
              <el-input v-model.number="todayPoint.settlementPoint" :disabled="true" /><span class="aleo">Aleo</span>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-item>
      <el-collapse-item title="往期积分概览" name="2">
        <template #title>
          <span class="header-text">往期积分概览</span>
        </template>
        <div class="gva-search-box">
          <el-form :inline="true" :model="pastPoint">
            <el-form-item label="往期结算积分" prop="settlement_points">
              <el-input v-model.number="pastPoint.settlement_points" :disabled="true" /><span class="aleo">Aleo</span>
            </el-form-item>
            <el-form-item label="往期结算股份" prop="settlement_amount">
              <el-input v-model="pastPoint.settlement_amount" :disabled="true" />
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-item>
      <el-collapse-item title="往期积分明细" name="3">
        <template #title>
          <span class="header-text">往期积分明细</span>
        </template>
        <div class="gva-table-box">
          <el-table :data="tableData">
            <el-table-column align="left" label="日期" prop="settlementDate" width="200" fixed="left" />
            <el-table-column align="left" label="结算股份" min-width="100" prop="settlementShares" />
            <el-table-column align="left" :label="'每股积分(扣除费率'+todayPoint.rate+'%):'" min-width="100" prop="perChannelIntegral" />
            <el-table-column align="left" label="结算积分小计(Aleo)" min-width="100" prop="channelIntegral" />
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
      </el-collapse-item>
    </el-collapse>

  </div>
</template>

<script setup>
import { getPointsOverviewPastDetail } from '@/api/aleo'
import { ref, onBeforeMount, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
const route = useRoute() // 路由参数
const router = useRouter() // 跳转路由

// 折叠面板相关信息
const activeNames = ref(['1', '2', '3'])

const orderNumber = ref('')

// 当日积分概览
const todayPoint = ref({
  settlementDate: '',
  perPoint: '',
  perPointExtra: '',
  settlementShares: '',
  settlementPoint: '',
  rate: '',
})

// 往期积分概览
const pastPoint = ref({
  settlement_points: '',
  settlement_amount: '',
})

// 往期积分明细
const page = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableData = ref([])

const handleCurrentChange = (val) => {
  page.value = val
  getTableData()
}
const handleSizeChange = (val) => {
  pageSize.value = val
  getTableData()
}

// 往期积分明细获取数据
const getTableData = async() => {
  const table = await getPointsOverviewPastDetail({ page: page.value, pageSize: pageSize.value, orderNumber: orderNumber.value })
  if (table.code === 0) {
    if (!table.data.list) {
      tableData.value = []
      total.value = 0
      page.value = 1
      pageSize.value = 10
      return
    }
    tableData.value = table.data.list
    tableData.value.forEach((data) => {
      data.settlementDate = dateChangeFormat('YYYY.mm.dd', data.settlementDate)
    })
    total.value = table.data.total
    page.value = table.data.page
    pageSize.value = table.data.pageSize
  }
}

// 用于最初点进去看详情的时候读取路由里的信息
onBeforeMount(() => {
  orderNumber.value = route.query.orderNumber
  // 当日积分概览
  todayPoint.value.settlementDate = dateChangeFormat('YYYY-mm-dd', route.query.settlementDate)
  todayPoint.value.perPoint = route.query.perPoint
  todayPoint.value.perPointExtra = route.query.perPointExtra
  todayPoint.value.settlementShares = route.query.settlementShares
  todayPoint.value.settlementPoint = route.query.settlementPoint
  todayPoint.value.rate = route.query.rate

  // 往期积分概览
  pastPoint.value.settlement_points = route.query.settlement_points
  pastPoint.value.settlement_amount = route.query.settlement_amount

  // 往期积分明细
  getTableData()
})

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

</script>

<style scoped lang="scss">
  // 折叠面板标题
  .header-text {
    padding: 0px 20px;
    font-size: 16px;
    font-weight: 600;
  }

  .el-collapse-item {
    position: relative;
  }

  // 奖励table上方search部分
  .search-box-bonus {
    position: absolute;
    top: -8px;
    left: 140px;

    .bonus-form {
      //width: 600px;
      height: 80px;

      //display: flex;
      //align-items: center;
      .el-form-item {
        margin-bottom: 0px;
      }

      .box4 {
        //margin-left: 800px;
        p {
          display: inline-block;
        }
      }
    }
  }

  // 激励table上方search部分
  .search-box-inspired {
    position: absolute;
    top: -8px;
    left: 140px;

    .inspired-form {
      //width: 600px;
      height: 80px;

      //display: flex;
      //align-items: center;
      .el-form-item {
        margin-bottom: 0px;
      }

      .box4 {
        //margin-left: 800px;
        p {
          display: inline-block;
        }
      }
    }
  }

  // 去除input会换行的问题
  :deep(.el-form-item__content) {
    flex-wrap: nowrap;
    // Aleo
    .aleo {
      margin-left: 6px;
    }
  }
</style>
