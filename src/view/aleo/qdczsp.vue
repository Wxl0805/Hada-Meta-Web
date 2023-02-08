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
        <el-form-item label="渠道">
          <el-select v-model="searchInfo.status" clearable placeholder="请选择">
            <el-option v-for="item in channelOptions" :key="item.value" :label="`${item.label}`" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核时间">
          <el-date-picker v-model="searchInfo.approvalTime" type="datetimerange" range-separator="To"
            start-placeholder="开始时间" end-placeholder="结束时间" :disabled-date="disabledDate" :shortcuts="shortcuts"
            format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>
        <el-form-item label="提交时间">
          <el-date-picker v-model="searchInfo.commitTime" type="datetimerange" range-separator="To"
            start-placeholder="开始时间" end-placeholder="结束时间" :disabled-date="disabledDate" :shortcuts="shortcuts"
            format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss" />
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
        <el-table-column align="left" label="充值流水号" min-width="200" prop="orderNumber">
          <template #default="scope">
            <a style="color: blue; cursor: pointer;" @click="checkIncomeStatementDetail(scope.row)">{{
            scope.row.orderNumber }}</a>
          </template>
        </el-table-column>
        <el-table-column align="left" label="渠道" min-width="100" prop="nickName" />
        <el-table-column align="left" label="充值额" min-width="250" prop="email" />
        <el-table-column align="left" label="凭证" min-width="200">
          <template #default="scope">
            <div style="display: flex; align-items: center;">
              <!-- <a style="color: blue; cursor: pointer;" v-on:click="showVouchers(scope.row)">查看凭证</a> -->
              <el-image style="width: 50px; height: 50px; margin-right: 5px;" v-if="scope.row.vouchersPic1 !== ''"
                :src="scope.row.vouchersPic1" :preview-src-list="scope.row.imgList" :initial-index="0"
                :preview-teleported="true" fit="cover">
                <template #error>
                  <div style="
                      width: 100%;
                      height: 100%;
                      background-color: #f5f7fa;
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                      align-items: center;
                      color: #a8abb2;
                    ">
                    <p style="font-size: 10px; margin-block-start: 0px; margin-block-end: -14px;">加载</p>
                    <p style="font-size: 10px; margin-block-start: -10px; margin-block-end: 0px;">失败</p>
                  </div>
                </template>
              </el-image>
              <el-image style="width: 50px; height: 50px; margin-right: 5px;" v-if="scope.row.vouchersPic2 !== ''"
                :src="scope.row.vouchersPic2" :preview-src-list="scope.row.imgList" :initial-index="1"
                :preview-teleported="true" fit="cover">
                <template #error>
                  <div style="
                      width: 100%;
                      height: 100%;
                      background-color: #f5f7fa;
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                      align-items: center;
                      color: #a8abb2;
                    ">
                    <p style="font-size: 10px; margin-block-start: 0px; margin-block-end: -14px;">加载</p>
                    <p style="font-size: 10px; margin-block-start: -10px; margin-block-end: 0px;">失败</p>
                  </div>
                </template>
              </el-image>
              <el-image style="width: 50px; height: 50px;" v-if="scope.row.vouchersPic3 !== ''"
                :src="scope.row.vouchersPic3" :preview-src-list="scope.row.imgList" :initial-index="2"
                :preview-teleported="true" fit="cover">
                <template #error>
                  <div style="
                      width: 100%;
                      height: 100%;
                      background-color: #f5f7fa;
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                      align-items: center;
                      color: #a8abb2;
                    ">
                    <p style="font-size: 10px; margin-block-start: 0px; margin-block-end: -14px;">加载</p>
                    <p style="font-size: 10px; margin-block-start: -10px; margin-block-end: 0px;">失败</p>
                  </div>
                </template>
              </el-image>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left" label="状态" min-width="100" prop="status">
          <template #default="scope">
            {{ renderStatus(scope.row.status) }}
          </template>
        </el-table-column>
        <el-table-column align="left" label="提交时间" min-width="200" prop="tradeTime" />
        <el-table-column align="left" label="审核时间" min-width="200" prop="approvalTime" />
        <el-table-column align="left" fixed="right" label="操作" width="200">
          <template #default="scope">
            <el-button v-if="scope.row.status == 0" icon="edit" size="small" type="primary" link
              @click="approval(scope.row)">审核同意</el-button>
            <!-- <el-button v-if="scope.row.status == 0" icon="delete" size="small" type="primary" link @click="reject(scope.row)">审核拒绝</el-button> -->
            <el-button v-if="scope.row.status == 0" icon="delete" size="small" type="primary" link
              @click="openDialog(scope.row)">审核拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="gva-pagination">
        <el-pagination :current-page="page" :page-size="pageSize" :page-sizes="[10, 30, 50, 100]" :total="total"
          layout="total, sizes, prev, pager, next, jumper" @current-change="handleCurrentChange"
          @size-change="handleSizeChange" />
      </div>
    </div>

    <el-dialog v-model="dialogFormVisible" :before-close="closeDialog" title="审核拒绝" draggable>
      <el-input v-model="textarea" :autosize="{ minRows: 3, maxRows: 4 }" type="textarea" placeholder="请输入拒绝原因" />
      <template #footer>
        <div class="dialog-footer">
          <el-button size="small" @click="closeDialog">我再想想</el-button>
          <el-button size="small" type="primary" @click="enterDialog">确认拒绝</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  components: { image },
  name: "Api",
};
</script>

<script setup>
import { getAleoInvestmentList, modifyStatus } from "@/api/aleo";
import { ref } from "vue";
import { ElMessage } from "element-plus";
import image from "../../components/upload/image.vue";
import { useRouter, useRoute } from "vue-router";
const route = useRoute(); //路由参数
const router = useRouter(); //跳转路由

// 渠道选项
const channelOptions = ref([
  {
    value: "0",
    label: "元聚",
  },
  {
    value: "1",
    label: "云聚未来",
  },
  // {
  //   value: "2",
  //   label: "审核拒绝",
  // },
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
  { id: "1", value: "orderNumber", label: "充值流水号" },
  { id: "2", value: "email", label: "邮箱" },
  { id: "3", value: "telephone", label: "手机号" },
  { id: "4", value: "approvalName", label: "审核人" },
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
      const date = new Date();
      date.setTime(date.getTime() - 3600 * 1000 * 24);
      return date;
    },
  },
  {
    text: "7天前",
    value: () => {
      const date = new Date();
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
      return date;
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

// 查询列表信息
const getTableData = async () => {
  const table = await getAleoInvestmentList({ page: page.value, pageSize: pageSize.value, ...searchInfo.value });
  if (table.code === 0) {
    tableData.value = table.data.list;
    if (tableData.value !== null) {
      console.log(table.data.list);
      tableData.value.forEach((data) => {
        // 只有一个图
        if (data.vouchersPic2 == "") {
          data.imgList = [data.vouchersPic1];
        } else if (data.vouchersPic3 == "") {
          // 有两个图
          data.imgList = [data.vouchersPic1, data.vouchersPic2];
        } else {
          // 有三个图
          data.imgList = [data.vouchersPic1, data.vouchersPic2, data.vouchersPic3];
        }
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
  // console.log("行被点击", _row, b);
  // // 如果点击的不是操作那一列或不是查看凭证那一列
  // if (
  //   b.label == "序号" ||
  //   b.label == "投资流水号" ||
  //   b.label == "昵称" ||
  //   b.label == "邮箱" ||
  //   b.label == "手机号" ||
  //   b.label == "投资股份" ||
  //   b.label == "投资额" ||
  //   b.label == "leader-uid" ||
  //   b.label == "leader-用户名" ||
  //   b.label == "状态" ||
  //   b.label == "审核人" ||
  //   b.label == "审核时间" ||
  //   b.label == "提交时间"
  // ) {
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

const renderStatus = (status) => {
  if (status == 0) {
    return "处理中";
  } else if (status == 1) {
    return "审核通过";
  } else {
    return "审核拒绝";
  }
};
// 审核通过
const approval = async (_row) => {
  const res = await modifyStatus({ orderNumber: _row.orderNumber, status: 1 });
  if (res.code === 0) {
    ElMessage({
      type: "success",
      message: res.msg,
    });
    getTableData();
  }
};
// 审核拒绝
const reject = async (_row, reason) => {
  const res = await modifyStatus({ orderNumber: _row.orderNumber, status: 2, failReason: reason });
  if (res.code === 0) {
    ElMessage({
      type: "success",
      message: res.msg,
    });
    getTableData();
  }
};

// 弹窗相关
const type = ref("");
const textarea = ref(null);
const initTextarea = () => {
  textarea.value = "";
};

const dialogFormVisible = ref(false);
const investmentInfo = ref(null);
// 打开弹窗
const openDialog = (_row) => {
  type.value = "edit";
  investmentInfo.value = _row;
  dialogFormVisible.value = true;
};
// 点击弹窗里的取消
const closeDialog = () => {
  initTextarea();
  dialogFormVisible.value = false;
};
// 点击弹窗里的确认
const enterDialog = () => {
  reject(investmentInfo.value, textarea.value);
  initTextarea();
  dialogFormVisible.value = false;
};
</script>

<style scoped lang="scss">

</style>
