<template>
  <div>
    <el-row>
      <el-col :span="24">
        <div class="head">
          <div class="title">
            <p>实时数据</p>
            <p>更新时间：</p>
            <p>{{ updateTime }}</p>
          </div>
          <div class="content">
            <div class="box1">
              <p>差值收益( Aleo )</p>
              <p class="num">{{ dataMessage.differenceValue }}</p>
              <div>
                <p>总收益 {{ dataMessage.totalIncomes }}</p>
                <p>总分配 {{ dataMessage.totalAllot }}</p>
              </div>
            </div>
            <div class="box2">
              <p>总分配( Aleo )</p>
              <p class="num">{{ dataMessage.totalAllot }}</p>
              <div>
                <p>用户 {{ dataMessage.customerIntegral }}</p>
                <p>leader {{ dataMessage.leaderIntegral }}</p>
              </div>
            </div>
            <div class="box3">
              <p>leader</p>
              <p class="num">{{ dataMessage.leaderIntegral }}</p>
              <div>
                <p>已分配 {{ dataMessage.leaderIntegralCustomer }}</p>
                <p>未分配 {{ dataMessage.leaderIntegralToChannel }}</p>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <div class="expandingCustomerTitle">
          <p>日结算收益</p>
          <div><el-button type="primary" style="margin-right: 20px;" @click="onDateSelect">选择结算日期</el-button></div>
        </div>
        <div class="gva-table-box">
          <el-table :data="tableData">
            <el-table-column align="center" label="序号" width="100" type="index" fixed="left" />
            <el-table-column align="left" label="积分收益单" min-width="200" prop="orderNumber">
              <template #default="scope">
                <a style="color: blue; cursor: pointer;" @click="checkIncomeStatementDetail(scope.row)">{{ scope.row.orderNumber }}</a>
              </template>
            </el-table-column>
            <el-table-column align="left" label="结算日期" min-width="100" prop="settlementDate" />
            <el-table-column align="left" label="累计收益" min-width="100" prop="totalIncome" />
            <el-table-column align="left" label="当日收益" min-width="100" prop="dailyIncome" />
            <el-table-column align="left" label="当日结算积分" min-width="120" prop="dailySettlementIntegral" />
            <el-table-column align="left" label="结算股份" min-width="120" prop="dailySettlementShares" />
            <el-table-column align="left" label="用户每股积分" min-width="120" prop="perCustomerIntegral" />
            <el-table-column align="left" label="结算用户积分" min-width="120" prop="customerIntegral" />
            <el-table-column align="left" label="结算leader积分" min-width="120" prop="leaderIntegral" />
            <el-table-column align="left" label="创建时间" min-width="220" prop="created_at" />
            <el-table-column align="left" label="生效时间" min-width="220" prop="update_at">
              <template #default="scope">
                <div v-if="(scope.row.status === 0)" />
                <div v-else>{{ scope.row.update_at }}</div>
              </template>
            </el-table-column>
            <el-table-column align="left" fixed="right" label="操作" width="220">
              <template #default="scope">
                <el-button v-if="scope.row.status == 0" icon="edit" size="small" type="primary" link @click="editDoc(scope.row)">编辑</el-button>
                <el-button v-if="scope.row.status == 0" icon="check" size="small" type="primary" link @click="openDialog(scope.row, '生效')">确认生效</el-button>
                <el-button v-if="scope.row.status == 0" icon="delete" size="small" type="primary" link @click="openDialog(scope.row, '删除')">删除</el-button>
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
      </el-col>
    </el-row>

    <el-dialog v-model="dialogFormVisible" :before-close="closeDialog" :title="dialogText" draggable>
      <div>
        <span><strong style="color: red;">此操作不可逆</strong>，{{ dialogText }}后此单据将无法再修改或撤回，您确认{{ dialogText }}此单据吗？</span>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button size="small" @click="closeDialog">我再想想</el-button>
          <el-button size="small" type="primary" @click="enterDialog">确认{{ dialogText }}</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogDateVisible" :before-close="closeDateDialog" title="选择结算日期" draggable>
      <div>
        <span style="margin-left: 20px; display: block; padding: 12px 0px;">请选择...</span>
        <el-date-picker
          style="margin-left: 20px;"
          v-model="chosenDate"
          type="date"
          placeholder="请选择结算日期"
          :disabled-date="disabledDate"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button size="small" @click="closeDateDialog">取消</el-button>
          <el-button size="small" type="primary" @click="enterDateDialog">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { getIncomeOverview, createIncomeStatementData, deleteIncomeStatementData, getIncomeStatementData, confirmIncomeStatementData, getTodayPointsData } from "@/api/aleo";
  import { ref, onBeforeMount, onMounted } from "vue";
  import { ElMessage } from "element-plus";
  import { useRouter, useRoute } from "vue-router";
  const route = useRoute(); // 路由参数
  const router = useRouter(); // 跳转路由

  const updateTime = ref("");
  // updateTime = updateTime.toLocaleDateString() + "\t" + updateTime.toLocaleTimeString();

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

  const page = ref(1);
  const total = ref(0);
  const pageSize = ref(10);
  const tableData = ref([]);
  // 分页
  const handleSizeChange = (val) => {
    pageSize.value = val;
    getTableData();
  };
  const handleCurrentChange = (val) => {
    page.value = val;
    getTableData();
  };

  // 查询日结算收益table信息
  const getTableData = async () => {
    const table = await getIncomeStatementData({
      page: page.value,
      pageSize: pageSize.value,
    });
    if (table.code === 0) {
      tableData.value = table.data.list;
      console.log(tableData.value);
      tableData.value.forEach((data) => {
        data.created_at = dateChangeFormat("YYYY-mm-dd HH:MM:SS", data.createdAt);
        data.update_at = dateChangeFormat("YYYY-mm-dd HH:MM:SS", data.updatedAt);
      });
      total.value = table.data.total;
      page.value = table.data.page;
      pageSize.value = table.data.pageSize;
    }
  };
  getTableData();

  // 顶部4个div信息
  const dataMessage = ref({
    TotalIncome: "",
    NetIncome: "",
    AwardIncome: "",
    ExcitationIncome: "",
  });

  // 查询实时数据
  const getTopDailyData = async () => {
    const table = await getIncomeOverview();
    if (table.code === 0) {
      console.log(table);
      dataMessage.value = table.data;
      updateTime.value = dateChangeFormat("YYYY-mm-dd HH:MM:SS", table.data.createdAt);
    }
  };
  getTopDailyData();

  // 查询当日积分明细table(用于校验是否允许编辑和查看)
  const getTodayTableData = async (_row) => {
    const table = await getTodayPointsData({
      orderNumber: _row.orderNumber,
      settlementDate: _row.settlementDate,
      status: _row.status,
      page: 1,
      pageSize: 1,
    });
    console.log(table, "table");
    if (table.code === 0) {
      if (table.msg === "ok") {
        // 说明可以查看,继续跳转
        return true;
      } else {
        // 不能查看,返回提示信息
        return table.msg;
      }
    }
  };

  // 点击"编辑"按钮函数
  const editDoc = async (_row) => {
    const temp = await getTodayTableData(_row);
    if (temp === true) {
      // 跳到 编辑收益结算单页面
      router.push({
        path: "/layout/aleo/aleo-syjsd-edit",
        query: {
          incomeStatement: _row.orderNumber,
          status: _row.status,
          // ---表头信息
          // 日期
          settlementDate: _row.settlementDate,
          // 结算股份
          settlement_amount: _row.dailySettlementShares,

          // 用户占比
          customerRate: _row.customerRate,
          // leader占比
          leaderRate: _row.leaderRate,

          // 累计收益
          totalIncome: _row.totalIncome,
          // 昨日累计收益
          yesterdayTotalIncome: _row.preTotalIncome,
          // 当日收益
          dailyIncome: _row.dailyIncome,
          // 当前余额
          currentBalance: _row.currentBalance,
          // 昨日余额
          yesterdayCurrentBalance: _row.preCurrentBalance,

          // 保存后用户每股积分
          user_per_points: _row.perCustomerIntegral,
          // 保存后leader每股积分
          leader_per_points: _row.perLeaderIntegral,
        },
      });
    } else {
      // 不能查看,弹提示信息
      ElMessage({
        type: "error",
        message: temp,
      });
    }
  };

  // 点击表格的收益结算单号
  const checkIncomeStatementDetail = async (_row, b) => {
    const temp = await getTodayTableData(_row);
    if (temp === true) {
      // 跳到 收益结算单详情页面
      router.push({
        path: "/layout/aleo/aleo-syjsd-detail",
        query: {
          incomeStatement: _row.orderNumber,
          status: _row.status,
          // ---表头信息
          // 日期
          settlementDate: _row.settlementDate,
          // 结算股份
          settlement_amount: _row.dailySettlementShares,

          // 用户占比
          customerRate: _row.customerRate,
          // leader占比
          leaderRate: _row.leaderRate,

          // 累计收益
          totalIncome: _row.totalIncome,
          // 昨日累计收益
          yesterdayTotalIncome: _row.preTotalIncome,
          // 当日收益
          dailyIncome: _row.dailyIncome,
          // 当前余额
          currentBalance: _row.currentBalance,
          // 昨日余额
          yesterdayCurrentBalance: _row.preCurrentBalance,

          // 用户每股积分
          user_per_points: _row.perCustomerIntegral,
          // 保存后leader每股积分
          leader_per_points: _row.perLeaderIntegral,
        },
      });
    } else {
      // 不能查看,弹提示信息
      ElMessage({
        type: "error",
        message: temp,
      });
    }
  };

  // 弹窗相关
  const dialogFormVisible = ref(false);
  const investmentInfo = ref(null);
  const dialogText = ref("");

  // 打开弹窗
  const openDialog = (_row, text) => {
    investmentInfo.value = _row;
    dialogText.value = text;
    dialogFormVisible.value = true;
  };

  // 点击弹窗里的取消
  const closeDialog = () => {
    dialogFormVisible.value = false;
  };

  // 确认生效收益结算单
  const confirmTableData = async (_row) => {
    const confirmInfo = await confirmIncomeStatementData({
      orderNumber: _row.orderNumber,
      settlementDate: _row.settlementDate,
      perCustomerIntegral: _row.perCustomerIntegral,
    });
    if (confirmInfo.code === 0) {
      if (confirmInfo.msg == "确认生效，OK") {
        console.log("成功生效");
        ElMessage({
          type: "success",
          message: confirmInfo.msg,
        });
        // 重新读取
        getTableData();
      } else {
        ElMessage({
          type: "error",
          message: confirmInfo.msg,
        });
      }
    }
  };

  // 删除收益结算单
  const removeTableData = async (_row) => {
    const deleteInfo = await deleteIncomeStatementData({
      orderNumber: _row.orderNumber,
      settlementDate: _row.settlementDate,
    });
    console.log(deleteInfo);
    if (deleteInfo.code === 0) {
      console.log(deleteInfo);

      if (deleteInfo.msg == "删除成功") {
        console.log("删除成功");
        ElMessage({
          type: "success",
          message: deleteInfo.msg,
        });
        // 重新读取
        getTableData();
      } else {
        ElMessage({
          type: "error",
          message: deleteInfo.msg,
        });
      }
    }
  };

  // 点击弹窗里的确认
  const enterDialog = () => {
    if (dialogText.value === "生效") {
      confirmTableData(investmentInfo.value);
      dialogFormVisible.value = false;
    }
    if (dialogText.value === "删除") {
      removeTableData(investmentInfo.value);
      dialogFormVisible.value = false;
    }
  };

  // 选择结算日期弹窗
  const disabledDate = (time) => {
    const now = new Date();
    return time.getTime() > now.getTime() - 3600 * 1000 * 24;
  };

  // 弹窗相关
  const dialogDateVisible = ref(false);
  const chosenDate = ref(null);
  // 打开弹窗
  const onDateSelect = (_row) => {
    console.log("选择结算日期");
    dialogDateVisible.value = true;
  };

  // 点击弹窗里的取消
  const closeDateDialog = () => {
    chosenDate.value = null;
    dialogDateVisible.value = false;
  };

  // 确认生成收益结算单
  const generateTableData = async (date) => {
    const table = await createIncomeStatementData({
      settlementDate: date,
    });
    if (table.code === 0) {
      if (table.msg == "ok") {
        console.log("成功生成");
        ElMessage({
          type: "success",
          message: table.msg,
        });
        // 重新读取
        getTableData();
      } else {
        ElMessage({
          type: "error",
          message: table.msg,
        });
      }
    }
  };

  // 点击弹窗里的确认
  const enterDateDialog = () => {
    console.log(chosenDate.value);
    generateTableData(chosenDate.value);
    chosenDate.value = null;
    dialogDateVisible.value = false;
  };
</script>

<style scoped lang="scss">
  // 实时数据
  .head {
    margin-bottom: 10px;
    .title {
      padding: 10px 20px;
      p {
        display: inline-block;
      }
      p:first-of-type {
        font-size: 18px;
        font-weight: 600;
        margin-right: 20px;
      }
    }
    .content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .box1,
      .box2,
      .box3,
      .box4 {
        border-radius: 12px;
        background-color: #fff;
        width: 300px;
        padding: 20px 30px;
        margin: 10px;
        .num {
          font-weight: 700;
          font-size: 24px;
          padding: 10px;
          padding-left: 0px;
        }
        div {
          margin-top: 20px;
          display: flex;
          justify-content: space-between;
          p {
            display: inline-block;
          }
        }
      }
    }
  }
  // 用户信息,拓展客户信息title
  .userInfoTitle,
  .expandingCustomerTitle {
    background-color: #fafafa;
    display: flex;
    align-items: center;
    justify-content: space-between;
    p {
      padding: 20px 40px;
      display: inline-block;
      font-size: 20px;
    }
    .m-2 {
      margin-right: 40px;
    }
  }
  // 用户信息内容
  .gva-info-box {
    display: flex;
    flex-direction: row;
    padding: 0px 24px;
    //padding-bottom: 2px;
    background-color: #fff;
    border-radius: 2px;
    p {
      display: inline-block;
      width: 300px;
    }
    // 装着echarts
    .content {
      display: flex;
      flex-direction: column;
      margin-left: 20px;
      justify-content: space-around;
      .box2,
      .box3 {
        display: flex;
        justify-content: center;
        align-items: center;
        .dot {
          margin-right: 8px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
      }
    }
  }
</style>
