<template>
  <div>
    <div class="gva-search-box">
      <el-form ref="searchForm" :inline="true" :model="searchInfo">
        <el-form-item>
          <el-input v-model.trim="searchInfo.orderNumber" placeholder="请输入..." @change="onSearchInputChange">
            <template #append>
              <el-select v-model="searchInfo.types" style="width: 100px;" @change="onSearchInputChange">
                <el-option v-for="item in options" :key="item.id" :label="item.label" :value="item.value" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="结算日期">
          <el-date-picker
            v-model="searchInfo.settlementDate"
            type="daterange"
            range-separator="To"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            :disabled-date="disabledDate"
            :shortcuts="shortcuts"
            format="YYYY-MM-DD"
          />
          <!-- value-format="YYYY-MM-DD HH:mm:ss Z" -->
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" icon="search" @click="onSubmit">查询</el-button>
          <el-button size="small" icon="refresh" @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="gva-table-box">
      <!-- <el-table :data="tableData" @row-click="checkIncomeStatementDetail"> -->
      <el-table :data="tableData">
        <el-table-column align="center" type="index" width="60" label="序号" fixed="left" />
        <el-table-column align="left" label="收益结算单" min-width="200" prop="orderNumber">
          <template #default="scope">
            <a style="color: blue; cursor: pointer;" @click="checkIncomeStatementDetail(scope.row)">{{ scope.row.orderNumber }}</a>
          </template>
        </el-table-column>
        <el-table-column align="left" label="结算日期" min-width="150" prop="settlementDate" />
        <el-table-column align="center" label="当日结算积分(Aleo)" min-width="150" prop="dailySettlementIntegral" />
        <el-table-column align="center" label="往期结算积分(Aleo)" min-width="150" prop="preSettlementIntegral" />
        <el-table-column align="left" label="状态" min-width="100" prop="status">
          <template #default="scope">
            {{ renderStatus(scope.row.status) }}
          </template>
        </el-table-column>
        <el-table-column align="left" label="创建人/创建时间" min-width="220" prop="created_at" />
        <el-table-column align="left" label="更新人/更新时间" min-width="220" prop="update_at" />
        <el-table-column align="left" fixed="right" label="操作" width="160">
          <template #default="scope">
            <el-button v-if="scope.row.status == 0" icon="edit" size="small" type="primary" link @click="editDoc(scope.row)">编辑</el-button>
            <el-button v-if="scope.row.status == 0" icon="check" size="small" type="primary" link @click="openDialog(scope.row)">确认生效</el-button>
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

    <el-dialog v-model="dialogFormVisible" :before-close="closeDialog" title="确认生效" draggable>
      <div>
        <span><strong style="color: red;">此操作不可逆</strong>，生效后此单据将无法再修改或撤回，您确认生效次单据吗？</span>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button size="small" @click="closeDialog">我再想想</el-button>
          <el-button size="small" type="primary" @click="enterDialog">确认生效</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
  import { getIncomeStatementData, confirmIncomeStatementData, getTodayPointsData } from "@/api/aleo";
  import { ref } from "vue";
  import { ElMessage } from "element-plus";
  import { useRouter, useRoute } from "vue-router";
  const route = useRoute(); //路由参数
  const router = useRouter(); //跳转路由

  const page = ref(1);
  const total = ref(0);
  const pageSize = ref(10);
  const tableData = ref([]);
  // 顶部查询条件相关model
  const searchInfo = ref({});
  const options = [
    { id: "0", value: "orderNumber", label: "结算单号" },
    // { id: "1", value: "nickName", label: "用户名" },
  ];
  // 默认选中UID
  searchInfo.value.types = "orderNumber";

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
  // 结算日期所需内容---------

  // 点击"重置"按钮函数
  const onReset = () => {
    searchInfo.value = {
      types: "orderNumber",
    };
  };
  // 点击"查询"按钮函数
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

  // 查询
  const getTableData = async () => {
    const table = await getIncomeStatementData({
      page: page.value,
      pageSize: pageSize.value,
      orderNumber: searchInfo.value.orderNumber,
      settlementDate: searchInfo.value.settlementDate,
    });
    if (table.code === 0) {
      tableData.value = table.data.list;
      console.log(tableData.value);
      tableData.value.forEach((data) => {
        data.created_at = dateChangeFormat("YYYY-mm-dd HH:MM:SS", data.createdAt);
        data.update_at = dateChangeFormat("YYYY-mm-dd HH:MM:SS", data.updatedAt);
        if (data.createdBy === "") {
          data.createdBy = " - ";
        }
        if (data.updatedBy === "") {
          data.updatedBy = " - ";
        }
        data.created_at = data.createdBy + " / " + data.created_at;
        data.update_at = data.updatedBy + " / " + data.update_at;
      });
      total.value = table.data.total;
      page.value = table.data.page;
      pageSize.value = table.data.pageSize;
    }
  };
  getTableData();

  const renderStatus = (status) => {
    if (status == 0) {
      return "未生效";
    } else {
      return "已生效";
    }
  };

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
    let temp = await getTodayTableData(_row);
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
          // 用户占比
          customerRate: _row.customerRate,
          // leader占比
          leaderRate: _row.leaderRate,
          // 每股积分
          per_points: _row.initInfos.initPerIntegral,
          // 用户每股积分
          user_per_points: _row.initInfos.initPerCustomerIntegral,
          // 每股分佣
          per_points_fee: _row.initInfos.initPerLeaderIntegral,
          // 结算股份
          settlement_amount: _row.dailySettlementShares,
          // 保存后用户每股积分
          save_user_per_points: _row.perCustomerIntegral,
          // 保存后每股分佣
          save_per_points_fee: _row.perLeaderIntegral,
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
    let temp = await getTodayTableData(_row);
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
          // 用户占比
          customerRate: _row.customerRate,
          // leader占比
          leaderRate: _row.leaderRate,
          // 每股积分
          per_points: _row.initInfos.initPerIntegral,
          // 用户每股积分
          user_per_points: _row.initInfos.initPerCustomerIntegral,
          // 每股分佣
          per_points_fee: _row.initInfos.initPerLeaderIntegral,
          // 结算股份
          settlement_amount: _row.dailySettlementShares,
          // 保存后用户每股积分
          save_user_per_points: _row.perCustomerIntegral,
          // 保存后每股分佣
          save_per_points_fee: _row.perLeaderIntegral,
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
  // 打开弹窗
  const openDialog = (_row) => {
    investmentInfo.value = _row;
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

  // 点击弹窗里的确认
  const enterDialog = () => {
    console.log(investmentInfo.value);
    confirmTableData(investmentInfo.value);
    dialogFormVisible.value = false;
  };
</script>

<style scoped lang="scss"></style>
