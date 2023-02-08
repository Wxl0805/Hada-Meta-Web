<template>
  <div>
    <el-container>
      <el-aside width="26.5rem">
        <div class="gva-search-box">
          <el-input v-model="query" placeholder="请输入用户名搜索" @input="onQueryChanged" :prefix-icon="Search" />
          <el-tree-v2
            ref="treeRef"
            :data="treeData"
            :props="props"
            :filter-method="filterMethod"
            :height="600"
            @node-click="onTreeClick"
            :highlight-current="true"
            :default-expanded-keys="['136']"
          >
            <template #default="{ node }">
              <span>{{ node.label }}</span>
              <span class="prefix" v-if="node.data.IsLeader == 1"
                ><el-icon><Star /></el-icon
              ></span>
            </template>
          </el-tree-v2>
        </div>
      </el-aside>
      <el-main style="padding-top: 0px;">
        <div class="breadTitle">
          <el-breadcrumb separator="\">
            <el-breadcrumb-item v-for="(info, index) in breadInfo" :key="index" @click="onBreadClick(info, index)">{{ info.name }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="userInfoTitle">
          <p>用户信息</p>
          <el-select v-model="selectValue" class="m-2" placeholder="请选择排序方式" @change="getTreeAndTableInfo">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </div>
        <div class="gva-info-box">
          <div class="box1">
            <p>UID：{{ uid }}</p>
            <p>邮箱：{{ email }}</p>
            <p>手机号：{{ phoneNumber }}</p>
          </div>
          <div class="box2">
            <p>
              是否leader：<span style="display: inline-block;" v-if="isLeader == 1">是</span><span style="display: inline-block;" v-if="isLeader == 0">否</span>
            </p>
            <p>总拓展用户：{{ totalExpand }}</p>
            <p>直属拓展用户：{{ directlyExpend }}</p>
          </div>
          <div class="box3">
            <p>投资股份：{{ investmentShare }}({{ UinvestmentShare }}U)</p>
            <p>拓展股份：{{ inviteShare }}({{ UinviteShare }}U)</p>
          </div>
        </div>
        <div class="expandingCustomerTitle">
          <p>直属拓展客户</p>
        </div>
        <div class="gva-table-box">
          <el-table :data="tableData">
            <el-table-column align="center" width="100" label="UID" fixed="left" prop="Uid" />
            <el-table-column align="left" label="用户名" min-width="120" prop="NickName" />
            <el-table-column align="left" label="是否leader" min-width="100" prop="IsLeader" :formatter="formatter" />
            <el-table-column align="left" label="拓展用户数" min-width="120" prop="TotalExpanded" />
            <el-table-column align="left" label="直属拓展用户数" min-width="150" prop="DirectExpansion" />
            <el-table-column align="left" label="投资股份" min-width="200" prop="ChangeAmount">
              <template #default="scope">
                <div>{{ scope.row.ChangeAmount }}({{ scope.row.UAmount }}U)</div>
              </template>
            </el-table-column>
            <el-table-column align="left" label="拓展股份" min-width="200" prop="InvitationChangeAmount">
              <template #default="scope">
                <div>{{ scope.row.InvitationChangeAmount }}({{ scope.row.InvitationChangeUAmount }}U)</div>
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
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { Search } from "@element-plus/icons-vue";
import { getCustomerTree, getCustomerInfo } from "@/api/aleo";
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
const route = useRoute(); //路由参数
const router = useRouter(); //跳转路由

// 用户信息右边排序下拉选择
const selectValue = ref("0");
const options = [
  {
    value: "0",
    label: "按拓展用户数排序",
  },
  {
    value: "1",
    label: "按拓展股份排序",
  },
];

// 虚拟树结构相关信息
const query = ref("");
const treeRef = ref();
const treeData = ref([]);
const props = {
  value: "Id",
  label: "NickName",
  children: "Children",
  leader: "IsLeader",
};
const breadInfo = ref([]);

// 查询树信息
const getTreeInfo = async () => {
  const tree = await getCustomerTree(selectValue.value);
  if (tree.code === 0) {
    treeData.value = tree.data;
    let temp = tree.data[0].NickName.split("(");
    let nodeId = tree.data[0].Id;
    breadInfo.value = [{ name: temp[0], id: nodeId }];
  }
};
getTreeInfo();

let num = 1;
// 默认当前节点id是hada的id(136)
const nowTreeNodeId = ref(136);
// 点击树节点
const onTreeClick = (data, node) => {
  // 获取当前树节点里的Id
  nowTreeNodeId.value = data.Id;
  // 获取对应节点的信息
  getTableData();
  // 初始化
  breadInfo.value = [];
  num = 1;
  // 开始递归
  getCurrentNode(node);
};
// 递归
const getCurrentNode = (node) => {
  let nodes = node;
  // 只有第一次点击的时候存被点击节点的NickName到数组里
  if (num == 1) {
    let temp = nodes.data.NickName.split("(");
    let nodeId = nodes.data.Id;
    breadInfo.value.unshift({ name: temp[0], id: nodeId });
  }
  // 递归找parent是否存在
  if (nodes.parent !== undefined) {
    num = num + 1;
    let temp = nodes.parent.data.NickName.split("(");
    let nodeId = nodes.parent.data.Id;
    breadInfo.value.unshift({ name: temp[0], id: nodeId });
    getCurrentNode(nodes.parent);
  }
};

// onBreadClick
// 获取到当前被点击的面包屑内容(name和id)和该面包屑在数组的下标
const onBreadClick = (name, index) => {
  // 获取到当前树节点的父节点key
  let nowTreeParentKey = treeRef.value.getCurrentNode().Pid;
  // 如果当前被点击面包屑的id==父节点key,
  if (name.id == nowTreeParentKey) {
    // 通过父节点key设置当前树节点为父节点
    treeRef.value.setCurrentKey(nowTreeParentKey);
    // 删除面包屑数组尾部节点
    breadInfo.value.pop();
    // 获取到当前树节点的key
    let nowTreeKey = treeRef.value.getCurrentKey();
    // 获取当前树节点里的Id
    nowTreeNodeId.value = nowTreeKey;
    // 获取对应节点的信息
    getTableData();
  }
};

// 树filter
const onQueryChanged = (query) => {
  // TODO: fix typing when refactor tree-v2
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  treeRef.value.filter(query);
};
const filterMethod = (query, node) => {
  // 这里需要注意"node.属性名"的属性名要根据需要修改
  return node.NickName.includes(query);
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

const uid = ref(null);
const email = ref(null);
const phoneNumber = ref(null);
const isLeader = ref(null);
const totalExpand = ref(null);
const directlyExpend = ref(null);
const investmentShare = ref(null);
const inviteShare = ref(null);
const UinvestmentShare = ref(null);
const UinviteShare = ref(null);

// 查询table信息
const getTableData = async () => {
  const table = await getCustomerInfo({ Id: nowTreeNodeId.value, page: page.value, pageSize: pageSize.value, orderkey: selectValue.value });
  if (table.code === 0) {
    // 拓展客户table信息
    tableData.value = table.data.list.Children;
    // 用户信息
    uid.value = table.data.list.Uid;
    email.value = table.data.list.Email;
    phoneNumber.value = table.data.list.Telephone;
    isLeader.value = table.data.list.IsLeader;
    console.log(isLeader.value);
    totalExpand.value = table.data.list.TotalExpanded;
    directlyExpend.value = table.data.list.DirectExpansion;
    investmentShare.value = table.data.list.ChangeAmount;
    inviteShare.value = table.data.list.InvitationChangeAmount;
    UinvestmentShare.value = table.data.list.UAmount;
    UinviteShare.value = table.data.list.InvitationChangeUAmount;

    total.value = table.data.total;
    page.value = table.data.page;
    pageSize.value = table.data.pageSize;
  }
};
getTableData();

// 修改表格里"是否leader"字段的展示效果
const formatter = (row, column) => {
  if (row.IsLeader == 1) {
    return "是";
  } else {
    return "否";
  }
};

// 查询树结构接口和table接口
const getTreeAndTableInfo = async () => {
  getTreeInfo();
  getTableData();
};
</script>

<style>
/* 面包屑颜色*/
.breadTitle .el-breadcrumb__item:last-child .el-breadcrumb__inner {
  color: #4d70ff !important;
}
</style>

<style scoped lang="scss">
// 面包屑title
.breadTitle {
  background-color: #fff;
  padding: 20px 40px;
  margin-bottom: 10px;
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
  flex-direction: column;
  p {
    display: inline-block;
    width: 300px;
  }
  .box1,
  .box2,
  .box3 {
    padding: 20px;
  }
  .box3 {
    padding-bottom: 40px;
  }
}
.gva-info-box {
  .el-collapse {
    border: none;
    .el-collapse-item__header,
    .el-collapse-item__wrap {
      border-bottom: none;
    }
  }
  padding: 24px;
  padding-bottom: 2px;
  background-color: #fff;
  border-radius: 2px;
  margin-bottom: 12px;
}
</style>
