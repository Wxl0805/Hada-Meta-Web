<template>
  <div>
    <div class="gva-search-box" style="position: relative;">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item>
          <el-input v-model.trim="searchInfo.values" placeholder="请输入..." @change="onSearchInputChange">
            <template #append>
              <el-select v-model="searchInfo.types" style="width: 120px;" @change="onSearchInputChange">
                <el-option v-for="item in options1" :key="item.id" :label="item.label" :value="item.value" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <!-- <el-form-item label="状态">
          <el-select v-model="searchInfo.status" clearable placeholder="请选择">
            <el-option v-for="item in statusOptions" :key="item.value" :label="`${item.label}`" :value="item.value" />
          </el-select>
        </el-form-item> -->
        <!-- <el-form-item label="审核时间">
          <el-date-picker
            v-model="searchInfo.approvalTime"
            type="datetimerange"
            range-separator="To"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            :disabled-date="disabledDate"
            :shortcuts="shortcuts"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item> -->
        <el-form-item label="提交时间">
          <el-date-picker
            v-model="searchInfo.commitTime"
            type="datetimerange"
            range-separator="To"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            :disabled-date="disabledDate"
            :shortcuts="shortcuts"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button size="small" icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
        <!-- 废弃<el-form-item style="position: absolute; right: 20px;">
          <el-select v-model="searchInfo.orderkey" class="m-2" placeholder="请选择排序方式" @change="getTableData">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item> -->
      </el-form>
    </div>
    <div class="gva-table-box">
      <el-table :data="tableData">
        <el-table-column type="index" width="60" label="序号" />
        <el-table-column align="left" label="投资流水号" min-width="200" prop="orderNumber">
          <template #default="scope">
            <a style="color: blue; cursor: pointer;" @click="checkIncomeStatementDetail(scope.row)">{{ scope.row.orderNumber }}</a>
          </template>
        </el-table-column>
        <el-table-column align="left" label="用户名" min-width="100" prop="nickName" />
        <el-table-column align="left" label="邮箱" min-width="200" prop="email" />
        <el-table-column align="left" label="手机号" min-width="150" prop="phone" />
        <el-table-column align="left" label="投资股份" min-width="120" prop="investmentCount" />
        <el-table-column align="left" label="投资额" min-width="120" prop="investmentAmount" />
        <el-table-column align="left" label="Inviter-uid" min-width="100" prop="inviterId" />
        <el-table-column align="left" label="Inviter-用户名" min-width="120" prop="inviterName" />
        <el-table-column align="left" label="leader-uid" min-width="100" prop="LeaderUid" />
        <el-table-column align="left" label="leader-用户名" min-width="120" prop="LeaderName" />
        <el-table-column align="left" label="提交人" min-width="120" prop="exchanger" />
        <el-table-column align="left" label="提交时间" min-width="200" prop="tradeTime" />
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
  components: { image },
  name: "Api",
};
</script>

<script setup>
import { getAleoInvestmentList } from "@/api/aleo";
import { ref } from "vue";
import { ElMessage } from "element-plus";
import image from "../../components/upload/image.vue";
import { useRouter, useRoute } from "vue-router";
const route = useRoute(); //路由参数
const router = useRouter(); //跳转路由

const statusOptions = ref([
  {
    value: "0",
    label: "处理中",
  },
  {
    value: "1",
    label: "审核同意",
  },
  {
    value: "2",
    label: "审核拒绝",
  },
]);

const page = ref(1);
const total = ref(0);
const pageSize = ref(10);
const tableData = ref([]);
// 用户信息右边排序下拉选择(废弃)
const searchInfo = ref({
  // orderkey: "status",
});

// const options = [
//   {
//     value: "status",
//     label: "按审核状态排序",
//   },
//   {
//     value: "time",
//     label: "按提交时间倒序排",
//   },
// ];

const options1 = [
  { id: "0", value: "nickName", label: "用户名" },
  { id: "1", value: "orderNumber", label: "投资流水号" },
  { id: "2", value: "email", label: "邮箱" },
  { id: "3", value: "telephone", label: "手机号" },
  { id: "4", value: "exchanger", label: "提交人" },
];
// 默认选中用户名
searchInfo.value.types = "nickName";

// 结算日期所需内容---------
const shortcuts = [
  {
    text: "今天",
    value: new Date(),
  },
  {
    text: "昨天",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24);
      return [start, end];
    },
  },
  {
    text: "7天前",
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
];
const disabledDate = (time) => {
  return time.getTime() > Date.now();
};

// 重置
const onReset = () => {
  searchInfo.value = {
    types: "nickName",
  };
};
// 搜索
const onSubmit = () => {
  page.value = 1;
  pageSize.value = 10;
  getTableData();
};
// 输入框input和下拉框select
const onSearchInputChange = () => {
  page.value = 1;
  pageSize.value = 10;
  getTableData();
};

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val;
  getTableData();
};

const handleCurrentChange = (val) => {
  page.value = val;
  getTableData();
};

// 转换日期格式
const dateChangeFormat = (format, date) => {
  date = new Date(date);
  const dataItem = {
    "Y+": date.getFullYear().toString(),
    "m+": (date.getMonth() + 1).toString(),
    "d+": date.getDate().toString(),
    "H+": date.getHours().toString(),
    "M+": date.getMinutes().toString(),
    "S+": date.getSeconds().toString(),
  };
  Object.keys(dataItem).forEach((item) => {
    const ret = new RegExp(`(${item})`).exec(format);
    if (ret) {
      format = format.replace(ret[1], ret[1].length === 1 ? dataItem[item] : dataItem[item].padStart(ret[1].length, "0"));
    }
  });
  return format;
};

// 查询列表信息
const getTableData = async () => {
  const table = await getAleoInvestmentList({ page: page.value, pageSize: pageSize.value, ...searchInfo.value });
  if (table.code === 0) {
    tableData.value = table.data.list;
    if (tableData.value !== null) {
      // console.log(table.data.list);
      tableData.value.forEach((data) => {
        data.tradeTime = dateChangeFormat("YYYY-mm-dd HH:MM:SS", data.tradeTime);
      });
    }
    console.log(table.data.list);

    total.value = table.data.total;
    page.value = table.data.page;
    pageSize.value = table.data.pageSize;
  }
};
getTableData();

// 点击表格的某一行
const checkIncomeStatementDetail = (_row, b) => {
  // 跳到 收益结算单详情页面
  router.push({
    path: "/layout/aleo/aleo-tzsh-detail",
    query: {
      ID: _row.ID,
      approvalName: _row.approvalName,
      approvalTime: _row.approvalTime,
      email: _row.email,
      failReason: _row.failReason,
      investmentAmount: _row.investmentAmount,
      investmentCount: _row.investmentCount,
      leaderId: _row.leaderId,
      leaderName: _row.leaderName,
      nickName: _row.nickName,
      orderNumber: _row.orderNumber,
      phone: _row.phone,
      status: _row.status,
      tradeTime: _row.tradeTime,
      vouchersPic1: _row.vouchersPic1,
      vouchersPic2: _row.vouchersPic2,
      vouchersPic3: _row.vouchersPic3,
    },
  });
  // }
};

// const renderStatus = (status) => {
//   if (status == 0) {
//     return "处理中";
//   } else if (status == 1) {
//     return "审核通过";
//   } else {
//     return "审核拒绝";
//   }
// };
</script>

<style scoped lang="scss"></style>
