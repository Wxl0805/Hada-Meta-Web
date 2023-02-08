<template>
  <div class="page flex-col">
    <div class="header">
      <div class="box_1 flex-row" />
      <div class="xiazai" @click="download"><div class="xiazai_icon" /><text class="xiazai_cont">下载APP</text></div>
    </div>
    <div class="box_2 flex-col">
      <div class="group_2 flex-col">
        <div class="tabs_3 flex-col">
          <div class="text-wrapper_8 flex-row justify-between">
            <text class="selectcommon" :class="{select:selecttel,unselect:!selecttel}" style="margin-right:10px" @click="selecttel = true">手機號</text>
            <text class="selectcommon" :class="{select:!selecttel,unselect:selecttel}" @click="selecttel = false">郵箱</text>
          </div>
          <div class="box_6">
            <div v-if="selecttel" class="block_1" />
            <div v-else class="block_1_1" />
          </div>
        </div>

        <div v-if="selecttel" class="input_1" style="padding:0 11.5px 0 22.5px">
          <div style="flex:1;display: flex;align-items: center;" @click="selectcountry = true"><div style="width:20px;margin-left: auto;font-size: 14px;">+{{ countrycode }}</div><div class="icon_1" /></div>
          <div style="flex:5;"><el-input v-model="tel" placeholder="請輸入手機號" /></div>
        </div>
        <div v-else class="input_1" style="padding:0 11.5px 0 22.5px">
          <div style="flex:1;font-size: 14px;"><span>Email</span></div>
          <div class="shuxian" />
          <div style="flex:5;"><el-input v-model="email" placeholder="請輸入郵箱" /></div>
        </div>

        <text class="text_10">輸入驗證碼</text>
        <div v-if="selecttel" class="input_2 flex-row" style="padding:0 22.5px 0 11.5px">
          <div style="flex:2"><el-input v-model="telcode" placeholder="請輸入驗證碼" /></div>
          <div style="flex:1.3;display:flex;align-items: center;">
            <div style="flex:1"><div class="shuxian" /></div>
            <button style="font-size:14px;flex: 10;color: #000000;" :disabled="forbiddentel" @click="sendtelcode">{{ telcodevalue }}</button>
          </div>
        </div>
        <div v-else class="input_2 flex-row" style="padding:0 22.5px 0 11.5px">
          <div style="flex:2"><el-input v-model="emailcode" placeholder="請輸入驗證碼" /></div>
          <div style="flex:1.3;display:flex;align-items: center;">
            <div style="flex:1"><div class="shuxian" /></div>
            <button style="font-size:14px;flex: 10;color: #000000;" :disabled="forbiddenemail" @click="sendemailcode">{{ emailcodevalue }}</button>
          </div>
        </div>

        <text class="text_12">設置用戶名</text>
        <div class="input_3 flex-col" style="padding:0 11.5px 0 11.5px">
          <el-input v-model="username" placeholder="請輸入用戶名" />
        </div>
        <text class="text_13">設置密碼</text>
        <div class="box_4 flex-col" style="padding:0 11.5px">
          <el-input v-model="password" type="password" placeholder="請輸入密碼" show-password />
        </div>
        <text class="text_14">重複輸入密碼</text>
        <div class="input_4 flex-col" style="padding:0 11.5px">
          <el-input v-model="confirmpassword" type="password" placeholder="確認密碼" show-password />
        </div>
        <text class="text_15">邀請碼</text>
        <div class="input_5 flex-col">
          <text class="text_16">{{ invitecode }}</text>
        </div>
        <div class="text-wrapper_4">
          <div v-if="agree" class="quxiao flex-col" @click="agree = false" />
          <div v-else class="queding flex-col" @click="agree = true" />
          <text class="text_17">我已閱讀並同意
            <span style="color:#009BF9 " @click="inProtocal">《Hada&nbsp;Meta服務協議》</span>以及
            <span style="color:#009BF9 " @click="inPolicy">《Hada&nbsp;Meta隱私政策》</span>和
            <span style="color:#009BF9 " @click="inStatement">《Hada&nbsp;Meta免責聲明》</span></text>
        </div>

        <button class="button_1 flex-col" @click="signout">
          <text class="text_22">立即註冊</text>
        </button>

      </div>
    </div>

    <div v-if="selectcountry" class="group_10 flex-col">
      <div class="group_11 flex-col">
        <button class="text-wrapper_5 flex-row justify-between" :class="{selectbg:countrycode == 86}" @click="countrycode = 86;selectcountry = false">
          <span class="text_22_1">China中国</span>
          <span class="text_23">+86</span>
        </button>
        <button class="text-wrapper_6 flex-row justify-between" :class="{selectbg:countrycode == 65}" @click="countrycode = 65;selectcountry = false">
          <span class="text_24">Singapore新加坡</span>
          <span class="text_25">+65</span>
        </button>
        <button class="text-wrapper_7 flex-row justify-between" :class="{selectbg:countrycode == 1}" @click="countrycode = 1;selectcountry = false">
          <span class="text_26">The&nbsp;United&nbsp;States美国</span>
          <span class="text_27">+1</span>
        </button>
      </div>
    </div>

    <div v-if="selectcountry" class="mask" @click="selectcountry = false" />

  </div>
</template>
<script>
import { ElInput, ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { axios } from 'axios'
import api from './api/api'
import { Loading } from 'element-plus/es/components/loading/src/service'
import router from '../../router'
export default {
  components: {
    ElInput,
    ElMessage,
    ElMessageBox,
    ElLoading,
  },
  data() {
    return {
      tel: '',
      email: '',
      telcode: '',
      emailcode: '',
      username: '',
      password: '',
      confirmpassword: '',
      invitecode: '',
      selecttel: true,
      selectemail: false,
      telcodevalue: '發送驗證碼',
      emailcodevalue: '發送驗證碼',
      forbiddentel: false,
      forbiddenemail: false,
      agree: true,
      selectcountry: false,
      countrycode: 86,
      url: '',
      downloadUrl: '',
      // 判断是否ios
      ios: false,
    }
  },
  created() {
    this.appSource()
    this.url = window.location.href
    if (this.ios) {
      api.getUrl(1).then((res) => {
        console.log(res)
        this.downloadUrl = res.data.Url
      }).catch(() => {

      })
    } else {
      api.getUrl(0).then((res) => {
        console.log(res)
        this.downloadUrl = res.data.Url
      }).catch(() => {

      })
    }

    console.log(this.url)
    console.log(this.url.indexOf('inviteCode'))
    if (this.url.indexOf('inviteCode') != -1) {
      this.invitecode = this.url.substr(-8)
    } else {
      this.invitecode = ''
    }
  },
  methods: {
    appSource() {
      const u = navigator.userAgent
      const isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) // ios终端
      if (isiOS) {
        console.log('ios')
        this.ios = true
      } else {
        console.log('andriod')
        this.ios = false
      }
    },

    sendtelcode() {
      // 判断是否错误
      // 中国大陆手机正则
      const telreg = /^1(3\d|4[5-9]|5[0-35-9]|6[2567]|7[0-8]|8\d|9[0-35-9])\d{8}$/
      // 新加坡手机正则
      const telregSG = /^[89]\d{7}$/
      // 美国手机正则
      const telregUS = /^(\(\d{3}\)[ .-]?|\d{3}[ .-]?)?\d{3}[ .-]?\d{4}$/
      if (!this.tel) {
        ElMessage({
          message: '手機號為空',
          type: 'error',
        })
        return
      }
      // 验证中国手机号是否正确
      if (!telreg.test(this.tel)) {
        ElMessage({
          message: '手機號格式錯誤',
          type: 'error',
        })
        return
      }
      // 注册发送手机验证码
      const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
      })
      api.sendCodetel({
        'phone': this.tel
      }).then((res) => {
        console.log(res)
        if (res.code == 0) {
          this.forbiddentel = true
          let num = 60
          const runtel = setInterval(() => {
            this.telcodevalue = num + 's後重發'
            num--
            if (num == -1) {
              clearInterval(runtel)
              this.telcodevalue = '發送驗證碼'
              this.forbiddentel = false
            }
          }, 1000)
          if (res.msg == '操作成功') {
            ElMessage({
              message: '驗證碼已發送',
              type: 'success',
            })
            return
          }
        } else {
          if (res.msg == '手机号已被注册') {
            ElMessage({
              message: '手機號已被註冊',
              type: 'error',
            })
            return
          }
          if (res.msg == '验证码还在有效期内，请勿重复发送') {
            ElMessage({
              message: '驗證碼還在有效期內，請勿重複發送',
              type: 'success',
            })
            return
          }
        }
      }).catch((err) => {
        console.log(err)
      }).finally(() => {
        loading.close()
      })
    },
    sendemailcode() {
      // 判断是否错误
      const emailreg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
      if (!this.email) {
        ElMessage({
          message: '郵箱為空',
          type: 'error',
        })
        return
      }
      if (!emailreg.test(this.email)) {
        ElMessage({
          message: '郵箱格式錯誤',
          type: 'error',
        })
        return
      }
      // 注册发送邮箱验证码
      const loading = ElLoading.service({
        lock: true,
        text: 'Loading',
        background: 'rgba(0, 0, 0, 0.7)',
      })
      api.sendCodeemail({
        'email': this.email
      }).then((res) => {
        console.log(res)
        if (res.code == 0) {
          this.forbiddenemail = true
          let num = 60
          const runemail = setInterval(() => {
            this.emailcodevalue = num + 's後重發'
            num--
            if (num == -1) {
              clearInterval(runemail)
              this.emailcodevalue = '發送驗證碼'
              this.forbiddenemail = false
            }
          }, 1000)
          if (res.msg == '操作成功') {
            ElMessage({
              message: '驗證碼已發送',
              type: 'success',
            })
            return
          }
        } else {
          if (res.msg == '邮箱已被注册') {
            ElMessage({
              message: '郵箱已被註冊',
              type: 'error',
            })
            return
          }
          if (res.msg == '验证码还在有效期内，请勿重复发送') {
            ElMessage({
              message: '驗證碼還在有效期內，請勿重複發送',
              type: 'success',
            })
            return
          }
        }
      }).catch((err) => {
        console.log(err)
      }).finally(() => {
        loading.close()
      })
    },
    // 判断输入框内容是否有误
    veriinput() {
      if (!this.username) {
        ElMessage({
          message: '用戶名為空',
          type: 'error',
        })
        return
      }
      if (!this.password) {
        ElMessage({
          message: '密碼為空',
          type: 'error',
        })
        return
      }
      if (this.password !== this.confirmpassword) {
        ElMessage({
          message: '密碼不一致',
          type: 'error',
        })
        return
      }
      if (this.password.length < 8 || this.password.length > 16) {
        ElMessage({
          message: '請輸入8-16位密碼',
          type: 'error',
        })
        return
      }
      if (this.invitecode == '') {
        ElMessage({
          message: '邀請碼為空',
          type: 'error',
        })
        return
      }
      if (this.selecttel) {
        const loading = ElLoading.service({
          lock: true,
          text: 'Loading',
          background: 'rgba(0, 0, 0, 0.7)',
        })
        api.signTel({
          'nickName': this.username,
          'password': this.password,
          'phoneCode': this.telcode,
          'phone': this.tel,
          'invitationCode': this.invitecode
        }).then((res) => {
          console.log(res)
          if (res.code == 0) {
            ElMessage({
              message: '註冊成功',
              type: 'success',
            })
            window.open(this.downloadUrl, '_self')
            return
          }
          if (res.code == 7) {
            if (res.msg.indexOf('Key') != -1 || res.msg.indexOf('验证码获取失败') != -1) {
              ElMessage({
                message: '驗證碼錯誤',
                type: 'error',
              })
              return
            }
            if (res.msg.indexOf('注册失败') != -1) {
              ElMessage({
                message: '該賬號已被註冊',
                type: 'error',
              })
              return
            }
            ElMessage({
              message: res.msg,
              type: 'error',
            })
            return
          }
        }).catch((err) => {
          console.log(err)
          ElMessage({
            message: '註冊失敗',
            type: 'error',
          })
        }).finally(() => {
          loading.close()
        })
      } else {
        const loading = ElLoading.service({
          lock: true,
          text: 'Loading',
          background: 'rgba(0, 0, 0, 0.7)',
        })
        api.signEmail({
          'nickName': this.username,
          'password': this.password,
          'emailCode': this.emailcode,
          'email': this.email,
          'invitationCode': this.invitecode
        }).then((res) => {
          console.log(res)
          if (res.code == 0) {
            ElMessage({
              message: '註冊成功',
              type: 'success',
            })
            window.open(this.downloadUrl, '_self')
            return
          }
          if (res.code == 7) {
            if (res.msg.indexOf('Key') != -1 || res.msg.indexOf('验证码获取失败') != -1) {
              ElMessage({
                message: '驗證碼錯誤',
                type: 'error',
              })
              return
            }
            if (res.msg.indexOf('注册失败') != -1) {
              ElMessage({
                message: '該賬號已被註冊',
                type: 'error',
              })
              return
            }
            ElMessage({
              message: res.msg,
              type: 'error',
            })
            return
          }
        }).catch((err) => {
          console.log(err)
          ElMessage({
            message: '註冊失敗',
            type: 'error',
          })
        }).finally(() => {
          loading.close()
        })
      }
    },
    // 注册
    signout() {
      if (this.agree) {
        ElMessageBox.confirm(
          '請閱讀並同意《Hada Meta服務協議》以及《Hada Meta隱私政策》和《Hada Meta免責聲明》',
          '提示',
          {
            confirmButtonText: '確認',
            cancelButtonText: '關閉',
            center: true,
            showClose: false,
            closeOnClickModal: false,
          }
        )
          .then(() => {
            this.agree = false
          })
          .catch(() => { })
        // return;
      } else {
        if (this.selecttel) {
          this.signTel()
        } else {
          this.signEmail()
        }
      }
    },

    // 手机注册
    signTel() {
      if (!this.tel) {
        ElMessage({
          message: '手機號為空',
          type: 'error',
        })
        return
      }
      if (!this.telcode) {
        ElMessage({
          message: '驗證碼為空',
          type: 'error',
        })
        return
      }
      this.veriinput()
    },

    // 邮箱注册
    signEmail() {
      if (!this.email) {
        ElMessage({
          message: '郵箱為空',
          type: 'error',
        })
        return
      }
      if (!this.emailcode) {
        ElMessage({
          message: '驗證碼為空',
          type: 'error',
        })
        return
      }
      this.veriinput()
    },

    // 服务协议
    inProtocal() {
      router.push('/HadaMetaProtocal')
    },
    // 隐私政策
    inPolicy() {
      router.push('/HadaMetaPolicy')
    },
    // 免责声明
    inStatement() {
      router.push('/HadaMetaStatement')
    },
    // 下载
    download() {
      window.open(this.downloadUrl, '_self')
    },

  },
}
</script>
<style>
@import './common.css';
@import './style.css';
</style>

<style lang="scss">

.el-message-box{
  width: auto;
}
  .shuxian{
    width: 0.5px;
    height: 10.95px;
    background: #9ea3bb;
  }
  .mask{
    width: 100vw;
    height: 100vh;
    background: transparent;
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    z-index: 999;
  }
  .selectbg{
    background-color: rgba(245, 249, 250, 1);
  }
</style>
