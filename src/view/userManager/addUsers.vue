<template>
  <div class="content">
    <div class="header">
      <el-button :icon="CaretBottom" style="color:#000000;font-size: 20px;margin-left: 25px;" link>基本信息</el-button>
    </div>
    <div class="footer">
      <el-form ref="formref" :model="form" inline="true" :rules="rules">
        <div style="display:flex;align-items:center;justify-content:flex-start">
          <el-form-item label="用户名:" prop="userName">
            <el-input
              v-model="form.userName"
              placeholder="用户名"
            />
          </el-form-item>

          <el-form-item label="手机号:" prop="telephone">
            <el-input
              v-model="form.telephone"
              placeholder="手机号"
            />
          </el-form-item>

          <el-form-item label="是否启用:" prop="switch">
            <el-switch
              v-model="form.switch"
              inline-prompt
              active-text="是"
              inactive-text="否"
            />
          </el-form-item>
        </div>
        <div>
          <el-form-item label="性别:" prop="sex">
            <el-radio-group v-model="form.sex">
              <el-radio label="男" />
              <el-radio label="女" />
            </el-radio-group>
          </el-form-item>
        </div>
        <div class="area">
          <el-form-item label="备注:" prop="desc">
            <el-input v-model="form.desc" :rows="10" style="width:600px;" type="textarea" placeholder="请输入" />
          </el-form-item>
        </div>
      </el-form>
    </div>
    <div class="submit">
      <el-button type="primary">提交</el-button>
      <el-button type="primary">提交并新增</el-button>
      <el-button @click="back">返回</el-button>
    </div>
  </div>

</template>

<script>
export default {

}
</script>

<script setup>
import { CaretBottom } from '@element-plus/icons-vue'
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const route = useRoute() // 路由参数
const router = useRouter() // 跳转路由

const form = ref({
  userName: '',
  telephone: '',
  switch: '',
  sex: '男',
  desc: ''
})

const formref = ref()
const rules = ref({
  userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  telephone: [
    { required: true, message: '请输入手机号', trigger: 'blur' }
  ]
})

const back = () => {
  router.push({ path: '/layout/userManager/UserManager' })
}
</script>

<style lang="scss" scoped>
    .content{
        box-sizing: border-box;
        padding: 40px;
        .header{
            width: 100%;
            left: 10%;
            height: 50px;
            background: #eeeef0;
            display: flex;
            align-items: center;
            border: 1px solid #c2c2ca;
        }
        .footer{
            width: 100%;
            height: 500px;
            border: 1px solid #c2c2ca;
            border-top-width: 0;
            background: #ffffff;
            padding: 30px;
            box-sizing: border-box;
        }
        .submit{
            margin-top: 20px;
        }
    }
</style>
