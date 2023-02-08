<template>
  <div>
    <!-- <div class="gva-search-box" style="position: relative;">
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
        <el-form-item label="状态">
          <el-select v-model="searchInfo.status" clearable placeholder="请选择">
            <el-option v-for="item in statusOptions" :key="item.value" :label="`${item.label}`" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核时间">
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
        </el-form-item>
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
      </el-form>
    </div> -->

    <div class="gva-search-box" style="padding-bottom: 24px;">
      <el-button type="primary" icon="CirclePlus" color="orange" style="color: #ffffff;" @click="addUsers">新增文章</el-button>
    </div>

    <div class="gva-table-box">
      <el-table :data="tableData">
        <el-table-column type="index" width="60" label="序号" align="center" />
        <el-table-column align="left" label="文章标题" min-width="220" prop="title">
          <template #default="scope">
            <a style="color: blue; cursor: pointer;" @click="checkIncomeStatementDetail(scope.row)">{{ scope.row.title }}</a>
          </template>
        </el-table-column>
        <el-table-column align="left" label="作者" min-width="120" prop="author" />
        <el-table-column align="left" label="修改人" min-width="100" prop="updateBy" />
        <!-- <el-table-column align="left" label="文章摘要" min-width="100" prop="author" /> -->
        <el-table-column align="left" label="封面图片" min-width="100">
          <template #default="scope">
            <div style="display: flex; align-items: center;">
              <el-image
                style="width: 50px; height: 50px; margin-right: 5px;"
                :src="scope.row.imgUrl"
                :preview-src-list="[scope.row.imgUrl]"
                :initial-index="0"
                :preview-teleported="true"
                fit="cover"
              >
                <template #error>
                  <div
                    style="
                      width: 100%;
                      height: 100%;
                      background-color: #f5f7fa;
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                      align-items: center;
                      color: #a8abb2;
                    "
                  >
                    <p style="font-size: 10px; margin-block-start: 0px; margin-block-end: -14px;">加载</p>
                    <p style="font-size: 10px; margin-block-start: -10px; margin-block-end: 0px;">失败</p>
                  </div>
                </template>
              </el-image>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" min-width="100" prop="activeFlag">
          <template #default="scope">
            {{ renderStatus(scope.row.activeFlag) }}
          </template>
        </el-table-column>
        <el-table-column align="center" label="文章语言" min-width="100" prop="language">
          <template #default="scope">
            {{ renderLanguage(scope.row.language) }}
          </template>
        </el-table-column>
        <el-table-column align="left" label="发布时间" min-width="200" prop="CreatedAt" />
        <el-table-column align="left" label="更改时间" min-width="200" prop="UpdatedAt" />
        <el-table-column align="left" fixed="right" label="操作" width="160">
          <template #default="scope">
            <el-button v-if="scope.row.activeFlag == 1" icon="edit" size="small" type="primary" link @click="approval(scope.row)">编辑</el-button>
            <el-button v-if="scope.row.activeFlag == 1" icon="delete" size="small" type="primary" link @click="openDialog(scope.row)">删除</el-button>
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

    <el-dialog v-model="dialogFormVisible" :before-close="closeDialog" title="删除文章" draggable>
      <div><span>是否确认删除文章?此操作不可更改!</span></div>
      <template #footer>
        <div class="dialog-footer">
          <el-button size="small" @click="closeDialog">我再想想</el-button>
          <el-button size="small" type="primary" @click="enterDialog">确认删除</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { getDocList, deleteDoc } from "@/api/aleo";
import { ref } from "vue";
import { ElMessage } from "element-plus";
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

// const options1 = [
//   { id: "0", value: "nickName", label: "用户名" },
//   { id: "1", value: "orderNumber", label: "投资流水号" },
//   { id: "2", value: "email", label: "邮箱" },
//   { id: "3", value: "telephone", label: "手机号" },
//   { id: "4", value: "approvalName", label: "审核人" },
// ];
// // 默认选中用户名
// searchInfo.value.types = "nickName";

// // 结算日期所需内容---------
// const shortcuts = [
//   {
//     text: "今天",
//     value: new Date(),
//   },
//   {
//     text: "昨天",
//     value: () => {
//       const date = new Date();
//       date.setTime(date.getTime() - 3600 * 1000 * 24);
//       return date;
//     },
//   },
//   {
//     text: "7天前",
//     value: () => {
//       const date = new Date();
//       date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
//       return date;
//     },
//   },
// ];
// const disabledDate = (time) => {
//   return time.getTime() > Date.now();
// };

// // 重置
// const onReset = () => {
//   searchInfo.value = {
//     types: "nickName",
//   };
// };
// // 搜索
// const onSubmit = () => {
//   page.value = 1;
//   pageSize.value = 10;
//   getTableData();
// };
// // 输入框input和下拉框select
// const onSearchInputChange = () => {
//   page.value = 1;
//   pageSize.value = 10;
//   getTableData();
// };

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val;
  getTableData();
};

const handleCurrentChange = (val) => {
  page.value = val;
  getTableData();
};

// 文章语言:zh-Hans简体 zh-Hant繁体
// const language = ref("zh-Hans");
// const language = ref("");

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
  const table = await getDocList({ page: page.value, pageSize: pageSize.value, type: "doc", ...searchInfo.value });
  if (table.code === 0) {
    tableData.value = table.data.list;
    if (tableData.value !== null) {
      // console.log(table.data.list);
      tableData.value.forEach((data) => {
        data.CreatedAt = dateChangeFormat("YYYY-mm-dd HH:MM:SS", data.CreatedAt);
        data.UpdatedAt = dateChangeFormat("YYYY-mm-dd HH:MM:SS", data.UpdatedAt);
      });
    }
    // console.log(table.data.list);

    total.value = table.data.total;
    page.value = table.data.page;
    pageSize.value = table.data.pageSize;
  }
};
getTableData();

// 点击表格的某一行
const checkIncomeStatementDetail = (_row, b) => {
  // console.log("行被点击", _row, b);
  // 跳到 收益结算单详情页面
  router.push({
    path: "/layout/hada-article-management/hada-checkDoc",
    query: {
      docId: _row.ID,
      content: _row.content,
      title: _row.title,
      author: _row.author,
      imgUrl: _row.imgUrl,
      language: _row.language,
    },
  });
  // }
};

// 修改状态栏展示效果
const renderStatus = (status) => {
  if (status == 1) {
    return "启用";
  } else {
    return "禁用";
  }
};

// 修改语言栏展示效果
const renderLanguage = (language) => {
  if (language == "zh-Hans") {
    return "简体";
  } else {
    return "繁体";
  }
};

// 新增文章
const addUsers = (_row) => {
  // 跳到 新增文章页面
  router.push({
    path: "/layout/hada-article-management/hada-addDoc",
  });
};

// 编辑
const approval = (_row) => {
  // 跳到 文章编辑页面
  router.push({
    path: "/layout/hada-article-management/hada-editDoc",
    query: {
      docId: _row.ID,
      content: _row.content,
      title: _row.title,
      author: _row.author,
      imgUrl: _row.imgUrl,
      language: _row.language,
      // CreatedAt: _row.CreatedAt,
    },
  });
};

// 删除
const reject = async (docId) => {
  const res = await deleteDoc(docId);
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

const dialogFormVisible = ref(false);
const docId = ref(null);
// 打开弹窗
const openDialog = (_row) => {
  type.value = "edit";
  docId.value = _row.ID;
  dialogFormVisible.value = true;
};
// 点击弹窗里的取消
const closeDialog = () => {
  dialogFormVisible.value = false;
};
// 点击弹窗里的确认
const enterDialog = () => {
  reject(docId.value);
  dialogFormVisible.value = false;
};
</script>

<style scoped lang="scss"></style>
