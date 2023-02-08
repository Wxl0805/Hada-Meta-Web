import service from "@/utils/request";

// 投资记录页面列表接口
export const getAleoInvestmentList = (data) => {
  return service({
    url: "/admin/investment/list/page",
    method: "post",
    data,
  });
};

// 充值审批页面列表接口
export const getAleoRechargeList = (data) => {
  return service({
    url: "/admin/recharge/list/page",
    method: "post",
    data,
  });
};

// 充值审批页面状态改变接口
export const modifyStatus = (data) => {
  return service({
    url: "/admin/recharge/status/modify",
    method: "post",
    data,
  });
};

// 收益总览-实时数据
export const getIncomeOverview = () => {
  return service({
    url: "/admin/incomeOverview/realTimeDate",
    method: "get",
  });
};

// 收益总览-日结算收益
export const getIncomeOverviewTable = (page, pageSize) => {
  return service({
    url: "/admin/incomeOverview/dailyIncome?page=" + page + "&pageSize=" + pageSize,
    method: "get",
  });
};

// 客户架构概览-树结构接口
export const getCustomerTree = (data) => {
  return service({
    url: "/admin/getArchitectureInfo?types=" + data,
    method: "get",
  });
};

// 客户架构概览-用户信息和拓展客户接口
export const getCustomerInfo = (data) => {
  return service({
    url: "/admin/ArchitectureInfo/inquireInfo/" + data.Id + "/" + data.page + "/" + data.pageSize + "/" + data.orderkey,
    method: "get",
  });
};

// 收益结算单接口1--获取列表信息
export const getIncomeStatementData = (data) => {
  return service({
    url: "/admin/settlement/income/list",
    method: "post",
    data,
  });
};

// 收益结算单接口2--表单确认生效
export const confirmIncomeStatementData = (data) => {
  return service({
    url: "/admin/settlement/validation",
    method: "post",
    data,
  });
};

// 收益结算单接口3--保存表单
export const saveIncomeStatementData = (data) => {
  return service({
    url: "/admin/incomeStatement/saveIncomeStatement",
    method: "post",
    data,
  });
};

// 收益结算单接口4--删除表单
export const deleteIncomeStatementData = (data) => {
  return service({
    url: "/admin/deleteAllocate",
    method: "delete",
    params: data,
  });
};

// 收益结算单接口5--生成表单
export const createIncomeStatementData = (data) => {
  return service({
    url: "/admin/getAllocate",
    method: "get",
    params: data,
  });
};

// 编辑/详情-收益结算单接口1--获取当日积分table信息
export const getTodayPointsData = (data) => {
  return service({
    url: "/admin/settlement/dailyIntegral/details",
    method: "post",
    data,
  });
};

// 编辑/详情-收益结算单接口2--获取往期积分table+概览信息
export const getPastPointsData = (data) => {
  return service({
    url: "/admin/settlement/preIntegral/list",
    method: "post",
    data,
  });
};

// 编辑/详情-收益结算单接口3--获取往期积分明细弹窗信息
export const getPastPointsDetailData = (data) => {
  console.log(data);
  return service({
    url: "/admin/settlement/preIntegral/flows",
    method: "post",
    data,
  });
};

// 文章列表-展示接口
export const getDocList = (data) => {
  return service({
    url: "/admin/announcements/list?type=" + data.type + "&page=" + data.page + "&pageSize=" + data.pageSize + "&language=" + data.language,
    method: "get",
    // data,
  });
};

// 文章列表-删除接口
export const deleteDoc = (docId) => {
  return service({
    url: "/admin/deleteAnnouncements/" + docId,
    method: "get",
  });
};

// 编辑文章-更新接口
export const updateDoc = (data) => {
  return service({
    url: "/admin/updateAnnouncements",
    method: "post",
    data,
  });
};

// 新增文章-接口
export const addDoc = (data) => {
  return service({
    url: "/admin/addAnnouncements",
    method: "post",
    data,
  });
};

// 积分收益单详情-往期积分明细
export const getPointsOverviewPastDetail = (data) => {
  return service({
    url: "/admin/incomeOverview/preIntegralDetail?page=" + data.page + "&pageSize=" + data.pageSize + "&orderNumber=" + data.orderNumber,
    method: "get",
  });
};
