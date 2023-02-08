<template>
  <div>
    <el-collapse v-model="activeNames">
      <el-collapse-item title="收益信息" name="0">
        <template #title>
          <span class="header-text">收益信息</span>
        </template>
        <div class="gva-search-box">
          <el-form ref="originInfoForm" :inline="true" :model="originInfo">
            <el-form-item label="结算日期">
              <el-input v-model="originInfo.settlementDate" placeholder="结算日期" :disabled="true" />
            </el-form-item>
            <el-form-item
              prop="totalIncome"
              label="累计收益"
              :rules="[
                { required: true, message: '请输入累计收益' },
                { validator: validateTotalIncome, trigger: 'blur' },
              ]"
            >
              <el-input v-model.trim="originInfo.totalIncome" placeholder="累计收益" @input="countTotalIncome(originInfo.totalIncome)" />
              <span class="aleo">Aleo</span>
            </el-form-item>
            <el-form-item label="当日收益">
              <el-input v-model.number="originInfo.dailyIncome" placeholder="当日收益" :disabled="true" />
              <span class="aleo">Aleo</span>
            </el-form-item>
            <el-form-item label="昨日累计收益">
              <el-input v-model.number="originInfo.currentBalance" placeholder="昨日累计收益" :disabled="true" />
              <span class="aleo">Aleo</span>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-item>
      <el-collapse-item title="当日积分概览" name="1">
        <template #title>
          <span class="header-text">当日积分概览</span>
        </template>
        <div class="gva-search-box">
          <el-form ref="integralInfoForm" :inline="true" :model="integralInfo">
            <el-form-item
              prop="settlement_points"
              label="结算积分"
              :rules="[
                { required: true, message: '请输入结算积分' },
                { validator: validatePass, trigger: 'blur' },
              ]"
            >
              <el-input v-model.trim="integralInfo.settlement_points" placeholder="结算积分" @input="countTotalPoints(integralInfo.settlement_points)" />
              <span class="aleo">Aleo</span>
            </el-form-item>
            <el-form-item
              prop="user_per_points"
              :label="`用户每股积分(${customerRate})`"
              :rules="[
                { required: true, message: '请输入用户每股积分' },
                { validator: validatePass, trigger: 'blur' },
              ]"
            >
              <el-input v-model.trim="integralInfo.user_per_points" placeholder="用户每股积分" @input="countUserTotalPoints(integralInfo.user_per_points)" />
              <span class="aleo">Aleo</span>
            </el-form-item>
            <el-form-item :label="`leader每股积分(${leaderRate})`">
              <el-input v-model="integralInfo.leader_per_points" placeholder="leader每股积分" :disabled="true" />
              <span class="aleo">Aleo</span>
            </el-form-item>
            <el-form-item label="结算股份">
              <el-input v-model="integralInfo.settlement_amount" placeholder="结算股份" :disabled="true" />
            </el-form-item>
            <el-form-item label="结算用户积分">
              <el-input v-model="integralInfo.settlement_user_points" placeholder="结算用户积分" :disabled="true" />
              <span class="aleo">Aleo</span>
            </el-form-item>
            <el-form-item label="结算leader积分">
              <el-input v-model.number="integralInfo.settlement_leader_points" placeholder="结算leader积分" :disabled="true" />
              <span class="aleo">Aleo</span>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-item>
      <el-collapse-item title="当日积分明细" name="2">
        <template #title>
          <span class="header-text">当日积分明细</span>
        </template>
        <div class="search-box-bonus">
          <el-form ref="searchForm" :inline="true" :model="searchBonusInfo" class="bonus-form">
            <el-form-item>
              <el-input v-model.trim="searchBonusInfo.userInput" placeholder="请输入..." @change="onSearchInputChange">
                <template #append>
                  <el-select v-model="searchBonusInfo.types" style="width: 120px;" @change="onSearchInputChange">
                    <el-option v-for="item in options" :key="item.id" :label="item.label" :value="item.value" />
                  </el-select>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button size="small" type="primary" icon="search" @click="onSubmitNow">查询</el-button>
              <el-button size="small" icon="refresh" @click="onResetNow">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="gva-table-box">
          <el-table :data="tableDataNow">
            <el-table-column align="center" label="UID" prop="UID" width="100" fixed="left" />
            <el-table-column align="left" label="用户名" min-width="90" prop="nickName" />
            <el-table-column align="left" label="手机号" min-width="100" prop="telephone" />
            <el-table-column align="left" label="邮箱" min-width="140" prop="email" />
            <el-table-column align="left" label="结算股份" min-width="100" prop="settlementShares" />
            <el-table-column align="left" label="结算用户积分(Aleo)" min-width="120" prop="customerIntegral" :formatter="formatterToday" />
            <el-table-column align="left" label="结算leader积分(Aleo)" min-width="120" prop="leaderIntegral" :formatter="formatterToday" />
            <el-table-column align="left" label="分佣leader" min-width="100" prop="leaderName" />
          </el-table>
          <div class="gva-pagination">
            <el-pagination
              :current-page="pageNow"
              :page-size="pageSizeNow"
              :page-sizes="[10, 30, 50, 100]"
              :total="totalNow"
              layout="total, sizes, prev, pager, next, jumper"
              @current-change="handleCurrentChangeNow"
              @size-change="handleSizeChangeNow"
            />
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>

    <!-- 底部按钮 -->
    <div>
      <el-button type="primary" @click="onSaveBtnClick">保存</el-button>
      <el-button type="primary" @click="onConfirmBtnClick">确认生效</el-button>
      <el-button type="default" @click="onCancelClick">取消</el-button>
    </div>
  </div>
</template>

<script setup>
  import { getPastPointsData, getTodayPointsData, confirmIncomeStatementData, saveIncomeStatementData, getPastPointsDetailData } from "@/api/aleo";
  import { ref, onBeforeMount, watch } from "vue";
  import { ElMessage } from "element-plus";
  import { useRouter, useRoute } from "vue-router";
import BigNumber from "bignumber.js";
  const route = useRoute(); //路由参数
  const router = useRouter(); //跳转路由

  /**
   ** 乘法函数，用来得到精确的乘法结果
   ** 说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。
   ** 调用：accMul(arg1,arg2)
   ** 返回值：arg1乘以 arg2的精确结果
   **/
  const accMul = (arg1, arg2) => {
    let m = 0,
      s1 = arg1.toString(),
      s2 = arg2.toString();
    try {
      m += s1.split(".")[1].length;
    } catch (e) {}
    try {
      m += s2.split(".")[1].length;
    } catch (e) {}
    return (Number(s1.replace(".", "")) * Number(s2.replace(".", ""))) / Math.pow(10, m);
  };

  // 限制input数字
  const limitInput = (value) => {
    value = value
      .toString() // 第一步：转成字符串
      .replace(/[^\d^\.]+/g, ""); // 第二步：把不是数字，不是小数点的过滤掉
    // 处理小数点后以 0 结尾的情况
    if (value.toString().substr(value.toString().length - 1, 1) === "0") {
      return value;
    }
    // 处理以 . 结尾的情况(只能输入一个 . )
    if (value.toString().substr(value.toString().length - 1, 1) === ".") {
      value =
        value
          .toString() // 第一步：转成字符串
          .replace(/[^\d^\.]+/g, "") // 第二步：把不是数字，不是小数点的过滤掉
          .replace(/^\./, "0.") // 第四步：如果输入的第一位为小数点，则替换成 0. 实现自动补全
          .match(/^\d*(\.?\d{0,5})/g)[0] || ""; // 第五步：最终匹配得到结果 以数字开头，只有一个小数点，而且小数点后面只能有0到5位小数
      return value;
    }
    // 处理一般情况
    value =
      value
        .toString() // 第一步：转成字符串
        .replace(/[^\d^\.]+/g, "") // 第二步：把不是数字，不是小数点的过滤掉
        .replace(/^0+(\d)/, "$1") // 第三步：第一位0开头，0后面为数字，则过滤掉，取后面的数字
        .replace(/^\./, "0.") // 第四步：如果输入的第一位为小数点，则替换成 0. 实现自动补全
        .match(/^\d*(\.{0,1}\d{0,5})/g)[0] || ""; // 第五步：最终匹配得到结果 以数字开头，只有一个小数点，而且小数点后面只能有0到5位小数
    value = Number(value);
    return value;
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

  // 折叠面板相关信息
  const activeNames = ref(["0", "1", "2", "3", "4"]);

  // 积分信息相关input
  const validatePass = (rule, value, callback) => {
    if (value == 0) {
      callback(new Error("输入不能为0!"));
    } else {
      callback();
    }
  };

  // 积分初始信息
  const originInfoForm = ref(null);
  const originInfo = ref({
    settlementDate: "",
    totalIncome: 0,
    yesterdayTotalIncome: 0,
    dailyIncome: 0,
    currentBalance: 0,
    yesterdayCurrentBalance: 0,
  });

  // 累计收益相关input
  const validateTotalIncome = (rule, value, callback) => {
    // 验证当前输入的累计收益是否<昨日累计收益
    if (value < originInfo.value.yesterdayTotalIncome) {
      callback(new Error("输入不能小于昨日累计收益!"));
    } else {
      callback();
    }
  };

  // 当日积分概览
  const integralInfoForm = ref(null);
  const integralInfo = ref({
    settlementDate: "",
    settlement_points: 0,
    user_per_points: 0,
    leader_per_points: 0,
    settlement_amount: 0,
    settlement_user_points: 0,
    settlement_leader_points: 0,
  });

  // 结算单号
  const incomeStatement = ref(null);
  // 结算单状态
  const status = ref(null);
  // 用户占比
  const customerRate = ref("85%");
  // leader占比
  const leaderRate = ref("10%");

  // 用于最初点进去看详情的时候读取路由里的信息
  onBeforeMount(() => {
    console.log("onBeforeMount");
    // 查询table信息时需要的单号和状态x2
    incomeStatement.value = route.query.incomeStatement;
    status.value = route.query.status;

    // 积分初始信息相关
    originInfo.value.settlementDate = route.query.settlementDate;
    originInfo.value.totalIncome = Number(route.query.totalIncome);
    originInfo.value.yesterdayTotalIncome = Number(route.query.yesterdayTotalIncome);
    originInfo.value.dailyIncome = Number(route.query.dailyIncome);
    originInfo.value.currentBalance = Number(route.query.currentBalance);
    originInfo.value.yesterdayCurrentBalance = Number(route.query.yesterdayCurrentBalance);

    // 当日积分概览相关-结算日期/结算股份
    integralInfo.value.settlementDate = route.query.settlementDate;
    integralInfo.value.settlement_amount = Number(route.query.settlement_amount);
    integralInfo.value.user_per_points = Number(route.query.user_per_points);
    integralInfo.value.leader_per_points = Number(route.query.leader_per_points);

    // 比例
    customerRate.value = route.query.customerRate;
    leaderRate.value = route.query.leaderRate;

    getTopData();

    // 读取当日积分明细表格数据
    getTodayTableData();
    // 读取往期积分明细表格数据
    // getPastTableData();
  });

  // 查询当日积分概览
  const getTopData = () => {
    // 结算用户积分 = 参数获取的用户每股积分 * 结算股份
    integralInfo.value.settlement_user_points = accMul(integralInfo.value.user_per_points, integralInfo.value.settlement_amount);
    // 结算leader积分 = 参数获取的leader每股积分 * 结算股份
    integralInfo.value.settlement_leader_points = accMul(integralInfo.value.leader_per_points, integralInfo.value.settlement_amount);
    // 结算积分 = 结算用户积分 + 结算leader积分
    integralInfo.value.settlement_points = BigNumber.sum(integralInfo.value.settlement_user_points, integralInfo.value.settlement_leader_points).toNumber();

    // 昨日累计收益 = 昨日累计收益
    originInfo.value.currentBalance = originInfo.value.yesterdayTotalIncome;
    // 当日收益 = 输入的累计收益 - 参数获取的昨日累计收益
    const x3 = new BigNumber(originInfo.value.totalIncome)
    originInfo.value.dailyIncome = x3.minus(originInfo.value.yesterdayTotalIncome).toNumber();
  };

  // 顶部查询条件相关model
  const searchBonusInfo = ref({});
  const searchInspiredInfo = ref({});
  const options = [
    { id: "0", value: "UID", label: "UID" },
    { id: "1", value: "nickName", label: "用户名" },
    { id: "2", value: "telephone", label: "手机号" },
    { id: "3", value: "email", label: "邮箱" },
    { id: "4", value: "leaderName", label: "分佣leader" },
  ];
  // 默认选中UID
  searchBonusInfo.value.types = "UID";
  searchInspiredInfo.value.types = "UID";

  const pageNow = ref(1);
  const totalNow = ref(0);
  const pageSizeNow = ref(10);
  const tableDataNow = ref([]);

  // 点击当日table"重置"按钮函数
  const onResetNow = () => {
    searchBonusInfo.value = {
      types: "UID",
    };
  };
  // 点击当日table"查询"按钮函数
  const onSubmitNow = () => {
    pageNow.value = 1;
    pageSizeNow.value = 10;
    getTodayTableData();
  };

  // 当日table输入框input和下拉框select
  const onSearchInputChange = () => {
    pageNow.value = 1;
    pageSizeNow.value = 10;
    getTodayTableData();
  };

  // 当日table分页
  const handleSizeChangeNow = (val) => {
    pageSizeNow.value = val;
    getTodayTableData();
  };
  const handleCurrentChangeNow = (val) => {
    pageNow.value = val;
    getTodayTableData();
  };

  // 查询当日积分明细table
  const getTodayTableData = async () => {
    const table = await getTodayPointsData({
      orderNumber: incomeStatement.value,
      settlementDate: integralInfo.value.settlementDate,
      status: parseInt(status.value),
      types: searchBonusInfo.value.types,
      values: searchBonusInfo.value.userInput,
      page: pageNow.value,
      pageSize: pageSizeNow.value,
    });
    console.log(table.data, "today");
    if (table.code === 0) {
      tableDataNow.value = table.data.list;

      totalNow.value = table.data.total;
      pageNow.value = table.data.page;
      pageSizeNow.value = table.data.pageSize;
    }
  };

  // 累计收益的input事件
  const countTotalIncome = (value) => {
    originInfo.value.totalIncome = limitInput(value) || 0;
    // if (originInfo.value.totalIncome != 0) {
    // 当日收益 = 输入的累计收益 - 参数获取的昨日累计收益
    const x3 = new BigNumber(originInfo.value.totalIncome)
    originInfo.value.dailyIncome = x3.minus(originInfo.value.yesterdayTotalIncome).toNumber();
    // } else {
    //   originInfo.value.dailyIncome = 0;
    // }
    // 当前余额 = 当日收益 + 参数获取的昨日当前余额 - 结算积分
    // originInfo.value.currentBalance = Number(originInfo.value.dailyIncome) + Number(originInfo.value.yesterdayCurrentBalance) - Number(integralInfo.value.settlement_points);
  };

  // 结算积分的input事件
  const countTotalPoints = (value) => {
    integralInfo.value.settlement_points = limitInput(value) || 0;

    // 用户每股积分 = 结算积分 / 结算股份 * 85 / 95
    integralInfo.value.user_per_points = Math.floor(accMul(accMul(integralInfo.value.settlement_points / integralInfo.value.settlement_amount, 85 / 95), 100000)) / 100000;
    // leader每股积分 = 用户每股积分/85 * 10
    integralInfo.value.leader_per_points = Math.floor(accMul(accMul(integralInfo.value.user_per_points / 85, 10), 100000)) / 100000;

    // 结算用户积分 = 结算股份 * 用户每股积分
    integralInfo.value.settlement_user_points = Math.floor(accMul(accMul(integralInfo.value.settlement_amount, integralInfo.value.user_per_points), 100000)) / 100000;
    // 结算leader积分 = 结算股份 * leader每股积分
    integralInfo.value.settlement_leader_points = Math.floor(accMul(accMul(integralInfo.value.settlement_amount, integralInfo.value.leader_per_points), 100000)) / 100000;

    // 当前余额 = 当日收益 + 参数获取的昨日当前余额 - 结算积分
    // originInfo.value.currentBalance = originInfo.value.dailyIncome + originInfo.value.yesterdayCurrentBalance - integralInfo.value.settlement_points;
  };

  // 用户每股积分的input事件
  const countUserTotalPoints = (value) => {
    integralInfo.value.user_per_points = limitInput(value) || 0;

    // leader每股积分 = 用户每股积分/85 * 10
    integralInfo.value.operate_per_points = Math.floor(accMul(accMul(integralInfo.value.user_per_points / 85, 10), 100000)) / 100000;

    // 结算用户积分 = 结算股份 * 用户每股积分
    integralInfo.value.settlement_user_points = Math.floor(accMul(accMul(integralInfo.value.settlement_amount, integralInfo.value.user_per_points), 100000)) / 100000;
    // 结算leader积分 = 结算股份 * leader每股积分
    integralInfo.value.settlement_leader_points = Math.floor(accMul(accMul(integralInfo.value.settlement_amount, integralInfo.value.leader_per_points), 100000)) / 100000;
     // 结算积分 = 结算用户积分 + 结算leader积分
     integralInfo.value.settlement_points = BigNumber.sum(integralInfo.value.settlement_user_points, integralInfo.value.settlement_leader_points).toNumber();

    // 当前余额 = 当日收益 + 参数获取的昨日当前余额 - 结算积分
    // originInfo.value.currentBalance = originInfo.value.dailyIncome + originInfo.value.yesterdayCurrentBalance - integralInfo.value.settlement_points;
  };

  // 用户每股积分的input事件
  const formatterToday = (row, column) => {
    if (column.label === "结算用户积分(Aleo)") {
      // 用户每股积分 * 结算股份
      return Math.floor(accMul(accMul(row.settlementShares, integralInfo.value.user_per_points), 100000)) / 100000;
    }
    if (column.label === "结算leader积分(Aleo)") {
      // leader每股积分 * 结算股份
      return Math.floor(accMul(accMul(row.settlementShares, integralInfo.value.leader_per_points), 100000)) / 100000;
    }
  };

  // 确认生效收益结算单
  const confirmTableData = async () => {
    const confirmInfo = await confirmIncomeStatementData({
      orderNumber: incomeStatement.value,
      settlementDate: originInfo.value.settlementDate,
      perCustomerIntegral: integralInfo.value.user_per_points,
      totalIncome: originInfo.value.totalIncome,
    });
    console.log(confirmInfo, "confirmInfo");
    if (confirmInfo.code === 0) {
      if (confirmInfo.msg == "确认生效，OK") {
        console.log("成功生效");
        ElMessage({
          type: "success",
          message: "成功生效",
        });
        // 延时1s后返回
        setTimeout(() => {
          router.back(1);
        }, 1000);
      } else {
        ElMessage({
          type: "error",
          message: confirmInfo.msg,
        });
      }
    }
  };

  // 保存收益结算单
  const saveTableData = async () => {
    const confirmInfo = await saveIncomeStatementData({
      orderNumber: incomeStatement.value,
      perCustomerIntegral: integralInfo.value.user_per_points,
      totalIncome: originInfo.value.totalIncome,
    });
    if (confirmInfo.code === 0) {
      if (confirmInfo.data == "ok") {
        console.log("成功生效");
        ElMessage({
          type: "success",
          message: confirmInfo.msg,
        });
        // 延时1s后返回
        setTimeout(() => {
          router.back(1);
        }, 1000);
      } else {
        ElMessage({
          type: "error",
          message: confirmInfo.msg,
        });
      }
    }
  };

  // 点击了保存按钮
  const onSaveBtnClick = async () => {
    let flag1, flag2;
    flag1 = await integralInfoForm.value.validate((valid) => {
      if (valid) {
        console.log("可以保存");
        return true;
      } else {
        return false;
      }
    });

    flag2 = await originInfoForm.value.validate((valid) => {
      if (valid) {
        console.log("可以保存");
        return true;
      } else {
        return false;
      }
    });

    if (flag1 === true && flag2 === true) {
      // 调用接口
      saveTableData();
    } else {
      console.log("用户输入不合法");
    }
  };

  // 点击了确认生效按钮
  const onConfirmBtnClick = async () => {
    let flag1, flag2;
    flag1 = await integralInfoForm.value.validate((valid) => {
      if (valid) {
        console.log("可以生效");
        return true;
      } else {
        return false;
      }
    });

    flag2 = await originInfoForm.value.validate((valid) => {
      if (valid) {
        console.log("可以生效");
        return true;
      } else {
        return false;
      }
    });

    if (flag1 === true && flag2 === true) {
      // 调用接口
      confirmTableData();
    } else {
      console.log("用户输入不合法");
    }
  };

  // 点击了取消按钮
  const onCancelClick = () => {
    router.back(1);
  };
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
    top: 8px;
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
    top: 8px;
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
