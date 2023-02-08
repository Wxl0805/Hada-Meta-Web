<template>
  <div>
    <el-row>
      <el-col :span="24">
        <div class="gva-search-box" style="position: relative;">
          <el-form ref="searchForm" :model="searchInfo" :rules="rules">
            <el-form-item label="标题" prop="title">
              <el-input v-model="searchInfo.title" placeholder="请输入文章标题" @change="onTitleInputChange"> </el-input>
            </el-form-item>
            <el-form-item label="作者" prop="author">
              <el-input v-model="searchInfo.author" placeholder="请输入文章作者" @change="onAuthorInputChange"> </el-input>
            </el-form-item>
            <el-form-item label="文章语言" prop="language">
              <el-select v-model="searchInfo.language" clearable placeholder="请选择文章的语言类型">
                <el-option v-for="item in statusOptions" :key="item.id" :label="`${item.label}`" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="选择封面图" prop="fileList">
              <el-upload
                ref="uploadRef"
                v-model:file-list="searchInfo.fileList"
                action="#"
                :http-request="testUpload"
                :headers="uploadHeaders"
                name="img"
                list-type="picture-card"
                :auto-upload="false"
                :limit="1"
                accept=".jpg,.png,.jpeg"
                :on-success="handleImgSuccess"
                :on-error="handleImgError"
                :on-change="handleImgChange"
                :before-upload="handlePic"
                :on-preview="handlePictureCardPreview"
                :on-remove="handleImgRemove"
                :class="{ disUploadBtn: noneBtnImg }"
              >
                <template #tip>
                  <div class="el-upload__tip">
                    jpg/jpeg/png files with a size less than 2MB
                  </div>
                </template>
                <el-icon><Plus /></el-icon>
              </el-upload>

              <el-dialog v-model="dialogVisible">
                <img w-full :src="dialogImageUrl" alt="Preview Image" />
              </el-dialog>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit(searchForm)">提交</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
    </el-row>
    <el-row justify="space-around">
      <el-col :span="18">
        <div class="head">
          <div style="border: 1px solid #ccc;">
            <Toolbar style="border-bottom: 1px solid #ccc;" :editor="editorRef" :defaultConfig="toolbarConfig" />
            <Editor style="height: 700px; overflow-y: hidden;" v-model="valueHtml" :defaultConfig="editorConfig" @onCreated="handleCreated" />
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="docPreview">
          <view v-html="valueHtml" style="margin-top: 20px;" class="docPreviewHtml"></view>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="24">
        <div class="head">
          <textarea v-model="valueHtml" readonly style="width: 100%; height: 300px;"></textarea>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
  import "@wangeditor/editor/dist/css/style.css"; // 引入 css
  import { Editor, Toolbar } from "@wangeditor/editor-for-vue";

  import { onBeforeUnmount, ref, reactive, shallowRef } from "vue";

  import { useUserStore } from "@/pinia/modules/user";
  import { storeToRefs } from "pinia";

  import { useRouter, useRoute } from "vue-router";

  import { addDoc } from "@/api/aleo";
  import { ElMessage } from "element-plus";

  const user = useUserStore();
  const route = useRoute(); //路由参数
  const router = useRouter(); //跳转路由

  // 表单验证规则
  const rules = reactive({
    title: [
      {
        required: true,
        message: "请输入文章标题",
        trigger: "change",
      },
    ],
    author: [
      {
        required: true,
        message: "请输入文章作者",
        trigger: "change",
      },
    ],
    language: [
      {
        required: true,
        message: "请选择文章语言类型",
        trigger: "change",
      },
    ],
    fileList: [
      {
        type: "array",
        required: true,
        message: "请选择封面图片",
        trigger: "change",
      },
    ],
  });

  // formRef
  const searchForm = ref();

  // editor编辑器实例，必须用 shallowRef
  const editorRef = shallowRef();
  // editor内容 HTML
  const valueHtml = ref("");
  // editor组件相关
  const toolbarConfig = {};
  toolbarConfig.excludeKeys = [
    // "group-more-style", // 排除菜单组，写菜单组 key 的值即可
    "todo",
    "blockquote",
    "|",
    "fullScreen",
    "codeBlock",
    "insertTable",
    // "uploadImage",
    "uploadVideo",
  ];
  const editorConfig = { placeholder: "请输入内容...", MENU_CONF: {} };
  // editor工具栏菜单-字号
  editorConfig.MENU_CONF["fontSize"] = {
    fontSizeList: ["12px", "14px", "16px", "22px", "28px", "36px", "42px"],
  };
  // editor工具栏菜单-文字颜色
  editorConfig.MENU_CONF["color"] = {
    colors: ["#2E334E", "#9EA3BB"],
  };
  // editor工具栏菜单-字体
  editorConfig.MENU_CONF["fontFamily"] = {
    fontFamilyList: [
      "黑体",
      "楷体",
      { name: "仿宋", value: "仿宋" },
      { name: "苹方-简", value: "PingFang SC" },
      { name: "苹方-简 中黑体", value: "PingFangSC-Medium" },
      "Arial",
      "Tahoma",
      "Verdana",
    ],
  };
  // editor工具栏菜单-图片上传
  editorConfig.MENU_CONF["uploadImage"] = {
    // 小于该值就插入 base64 格式（而不上传），默认为 0
    base64LimitSize: 5 * 1024 * 1024 * 1024, // 5Gb
  };

  // editor组件销毁时，也及时销毁编辑器
  onBeforeUnmount(() => {
    const editor = editorRef.value;
    if (editor == null) return;
    editor.destroy();
  });
  const handleCreated = (editor) => {
    editorRef.value = editor; // 记录 editor 实例，重要！
  };

  const searchInfo = ref({
    fileList: [],
  });
  const statusOptions = ref([
    {
      value: "zh-Hans",
      label: "简体",
    },
    {
      value: "zh-Hant",
      label: "繁体",
    },
  ]);

  // 封面图片上传相关
  const uploadRef = ref();

  // 从pinia获取token
  const { token } = storeToRefs(user);

  const uploadHeaders = ref({ "x-token": token.value, "Content-Type": "multipart/form-data" });
  // const uploadHeaders = ref({ "x-token": token.value });

  const dialogImageUrl = ref("");
  // const fileList = ref([]);

  const dialogVisible = ref(false);
  // const disabled = ref(false);

  // 是否显示上传按钮
  const noneBtnImg = ref(false);

  // 删除图片
  const handleImgRemove = (file, fileList) => {
    // console.log("Remove", file);
    // uploadRef.value.handleRemove(file);
    if (fileList == undefined) {
      noneBtnImg.value = false;
    } else {
      // 文件数量大于等于1就显示上传按钮
      noneBtnImg.value = fileList.length >= 1;
    }
  };

  // 预览图片
  const handlePictureCardPreview = (file) => {
    dialogImageUrl.value = file.url;
    dialogVisible.value = true;
  };

  let isImgChange = ref(false);

  const handleImgChange = (file, fileList) => {
    console.log("onChange");
    // 标记封面图片修改
    isImgChange.value = true;
    if (fileList == undefined) {
      noneBtnImg.value = false;
    } else {
      // 文件数量大于等于1就显示上传按钮
      noneBtnImg.value = fileList.length >= 1;
    }
  };

  // 图片上传前检查图片格式和图片大小
  const handlePic = (rawFile) => {
    console.log(rawFile);
    const isJPG = rawFile.type === "image/jpeg";
    const isJPG2 = rawFile.type === "image/jpg";
    const isPNG = rawFile.type === "image/png";

    const isLt2M = rawFile.size / 1024 / 1024 < 2;

    if (!isJPG && !isJPG2 && !isPNG) {
      ElMessage({
        message: "请上传格式为 .png, .jpg, .jpeg 的图片！",
        type: "error",
      });
    }
    if (!isLt2M) {
      ElMessage({
        message: "上传图片大小不能超过 2MB!",
        type: "error",
      });
    }
    return (isJPG || isJPG2 || isPNG) && isLt2M;
  };

  // 上传图片
  const testUpload = (options) => {
    const fileObj = options.file;
    const form = new FormData();
    form.append("img", fileObj);
    form.append("title", searchInfo.value.title);
    form.append("content", valueHtml.value);
    form.append("author", searchInfo.value.author);
    form.append("language", searchInfo.value.language);

    // console.log("options", options);
    addDoc(form)
      .then((res, resp) => {
        console.log("res", res);
        console.log("resp", resp);
        if (res.code == 0) {
          ElMessage({
            message: res.msg,
            type: "success",
          });
          options.onSuccess();
          setTimeout(() => {
            router.back(1);
          }, 1000);
        } else {
          options.onError(res.msg);
        }
      })
      .finally((res, resp) => {
        console.log("res", res);
        console.log("resp", resp);
      });
  };

  // 上传图片成功
  const handleImgSuccess = (res, file, fileList) => {
    console.log("Success", res, file, fileList);
  };
  // 上传图片失败
  const handleImgError = (error, file, fileList) => {
    console.log("Error", error, file);
  };

  // 顶部输入信息相关
  const onTitleInputChange = () => {};
  const onAuthorInputChange = () => {};

  // 提交图片
  const onSubmit = (formEl) => {
    console.log("提交文章");
    if (!formEl) return;
    formEl.validate((valid) => {
      if (valid) {
        console.log("submit!");
        uploadRef.value.submit();
      } else {
        console.log("error submit!");
        ElMessage({
          message: "提交失败!",
          type: "error",
        });
        return false;
      }
    });
  };
</script>

<style scoped lang="scss">
  .docPreview {
    position: relative;
    background-color: #ffffff;
    padding: 20px 40px 0px;
    width: inherit;
    height: 722px;
    margin-left: 20px;

    overflow: auto;
  }
</style>

<style lang="scss">
  /* 上传按钮隐藏 */
  .disUploadBtn .el-upload--picture-card {
    display: none;
  }
  // 预览图片弹窗css
  .el-dialog .el-dialog__body {
    display: flex;
    justify-content: center;
    padding-bottom: 40px;
  }
  .el-dialog .el-dialog__header {
    border: 0px;
  }

  // 恢复预览部分的ul,ol展示效果
  .docPreviewHtml {
    ol {
      list-style-type: decimal;
      padding-inline-start: 40px;
      li {
        list-style-type: decimal;
      }
    }
    ul {
      list-style-type: disc;
      padding-inline-start: 40px;
      li {
        list-style-type: disc;
      }
    }
  }
  // 恢复editor部分的ul,ol展示效果
  .w-e-scroll {
    ol {
      list-style-type: decimal;
      padding-inline-start: 40px;
      li {
        list-style-type: decimal;
      }
    }
    ul {
      list-style-type: disc;
      padding-inline-start: 40px;
      li {
        list-style-type: disc;
      }
    }
  }
</style>
