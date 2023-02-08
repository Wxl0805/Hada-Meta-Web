<template>
  <div>
    <el-collapse v-model="activeNames" @change="handleChange">
      <el-collapse-item title="表单信息" name="1" style="position: relative;">
        <template #title>
          <span class="header-text">表单信息</span>
        </template>
        <div class="statusBox">
          <div v-if="tableData.status == 0" class="box0">
            <span>待审核</span>
          </div>
          <div v-if="tableData.status == 1" class="box1">
            <span>审核同意</span>
          </div>
          <div v-if="tableData.status == 2" class="box2">
            <span>审核拒绝</span>
          </div>
        </div>
        <div class="gva-table-box">
          <el-form ref="tzshForm" :inline="true" :model="tableData">
            <el-form-item label="投资流水号">
              <el-input v-model="tableData.orderNumber" placeholder="投资流水号" :disabled="true" />
            </el-form-item>
            <el-form-item label="创建时间">
              <el-input v-model="tableData.tradeTime" placeholder="创建时间" :disabled="true" />
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="tableData.nickName" placeholder="用户名" :disabled="true" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="tableData.email" placeholder="邮箱" :disabled="true" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="tableData.phone" placeholder="手机号" :disabled="true" />
            </el-form-item>
            <el-form-item label="leader-uid">
              <el-input v-model="tableData.leaderId" placeholder="leader-uid" :disabled="true" />
            </el-form-item>
            <el-form-item label="leader-用户名">
              <el-input v-model="tableData.leaderName" placeholder="leader-用户名" :disabled="true" />
            </el-form-item>
            <el-form-item label="审核人">
              <el-input v-model="tableData.approvalName" placeholder="暂无审核人" :disabled="true" />
            </el-form-item>
            <el-form-item label="审核时间">
              <el-input v-model="tableData.approvalTime" placeholder="暂无审核时间" :disabled="true" />
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-item>
      <el-collapse-item title="投资信息" name="2">
        <template #title>
          <span class="header-text">投资信息</span>
        </template>
        <div class="gva-table-box">
          <el-form ref="tzshForm" :inline="true" :model="tableData">
            <el-form-item label="投资股份">
              <el-input v-model="tableData.investmentCount" placeholder="投资股份" :disabled="true" />
            </el-form-item>
            <el-form-item label="投资额">
              <el-input v-model.number="tableData.investmentAmount" placeholder="投资额" :disabled="true" />
            </el-form-item>
            <el-form-item label="购买凭证">
              <a style="color: blue; cursor: pointer;" v-on:click="showVouchers(tableData)">查看凭证</a>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-item>
      <el-collapse-item title="拒绝原因" name="3" v-if="tableData.status == 2">
        <template #title>
          <span class="header-text">拒绝原因</span>
        </template>
        <div class="gva-table-box">
          <el-form ref="tzshForm" :inline="true" :model="tableData">
            <el-form-item label="拒绝原因">
              <el-input
                v-model="tableData.failReason"
                placeholder="暂无拒绝原因"
                :disabled="true"
                :autosize="{ minRows: 3, maxRows: 4 }"
                type="textarea"
                style="width: 26.25rem;"
              />
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
export default {
  components: { image },
  name: "Api",
};
</script>

<script setup>
import { getVochers } from "@/api/aleo";
import { ref, onBeforeMount, onBeforeUpdate } from "vue";
import image from "../../components/upload/image.vue";
import { useRouter, useRoute } from "vue-router";
const route = useRoute(); //路由参数
const router = useRouter(); //跳转路由

let tableData = ref({});
// 用于最初点进去看详情的时候读取路由里的信息
onBeforeMount(() => {
  console.log("onBeforeMount");
  tableData.value = route.query;
});
// 用于切换标签页后点击不同条目查看详情时读取路由里更新的数据
onBeforeUpdate(() => {
  console.log("onBeforeUpdate");
  tableData.value = route.query;
});
// 折叠面板相关信息
const activeNames = ref(["1", "2", "3"]);
const handleChange = (val) => {
  console.log(val);
};

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

// 查询img
const querySrc = async (orderNumber, index) => {
  var data = await getVochers(orderNumber, index);
  const myBlob = new window.Blob([data.data], { type: "image/jpeg" });
  const qrUrl = window.URL.createObjectURL(myBlob);
  window.open(qrUrl);
};

function showVouchers(_row) {
  if (_row.vouchersPic1.length > 0) {
    querySrc({ orderNumber: _row.orderNumber, index: 1 });
  }
  if (_row.vouchersPic2.length > 0) {
    querySrc({ orderNumber: _row.orderNumber, index: 2 });
  }
  if (_row.vouchersPic3.length > 0) {
    querySrc({ orderNumber: _row.orderNumber, index: 3 });
  }
}
</script>

<style scoped lang="scss">
// 折叠面板标题
.header-text {
  padding: 0px 20px;
  font-size: 16px;
  font-weight: 600;
}
// 状态方框
.statusBox {
  position: absolute;
  top: 10px;
  right: 80px;
  div {
    padding: 4px 14px;
    border-radius: 4px;
  }
  .box0 {
    background-color: #cdd0f4;
    color: #2600ff;
  }
  .box1 {
    background-color: greenyellow;
    color: green;
  }
  .box2 {
    background-color: #fbcccc;
    color: #ff0000;
  }
}
</style>
