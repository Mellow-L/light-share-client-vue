<template>
  <nut-navbar title="林怡然 22211860212" left-show @click-back="gotoBack"></nut-navbar>
  <div v-if="userStoreRef.isLogin.value">
    <nut-cell title="头像" is-link @click="changeUploaderView">
      <template #desc>
        <img :src="userDetail.avatar">
      </template>
    </nut-cell>
    <ImageUploader v-if="uploaderView"
      v-model:img-src="renameData.avatar"
      need-compression
      @onDelete="modifyProfile"
      @onSuccess="modifyProfile">
    </ImageUploader>

    <nut-cell :title="'UUID '+ userDetail.uuid">
    </nut-cell>

    <nut-cell title="姓名" is-link @click="changeNameView">
      <template #desc>
        <span>{{userDetail.name}}</span>
      </template>
    </nut-cell>
    <nut-input v-model="renameData.name" placeholder="请输入姓名" clearable
               v-if="nameView">
      <template #right>
        <nut-button type="info" size="small"
                    @click="modifyProfile">确定</nut-button>
      </template>
    </nut-input>

    <nut-cell title="Email">
      <template #desc>
        <span>{{userDetail.email}}</span>
      </template>
    </nut-cell>

    <nut-cell title="修改密码" is-link @click="changePwdView"></nut-cell>
    <nut-input v-model="newPwd" placeholder="请输入新密码"
                v-if="pwdView" :type="pwdStyle">
      <template #left>
        <Eye @click="changePwdStyle"></Eye>
      </template>
      <template #right>
        <nut-button type="info" size="small"
          @click="changePassword">确定</nut-button>
      </template>
    </nut-input>

    <nut-cell title="发表文章数" is-link @click="gotoMyArticles">
      <template #desc>
        <span>{{userDetail.items.length}}</span>
      </template>
    </nut-cell>
    <nut-cell title="发表评论数" is-link @click="gotoMyComments">
      <template #desc>
        <span>{{userDetail.comments.length}}</span>
      </template>
    </nut-cell>
<!--      <div>-->
<!--        <p>-->
<!--          {{userStoreRef.user}}-->
<!--        </p>-->
<!--      </div>-->
    <nut-cell title="参数设置" is-link @click="gotoSettings"></nut-cell>
    <div class="center">
      <nut-button type="primary" @click = "logout">登出</nut-button>
    </div>
  </div>
  <div v-else class="center">
    <nut-button type="info" @click="gotoLogin">返回登录页面</nut-button>
  </div>
</template>

<script setup>
import {gotoBack, gotoSettings, gotoLogin as login} from "@/router/my-router";
import {useUserStore} from "@/stores/user";
import {storeToRefs} from "pinia";
import {apiGetDetailProfile, apiLogout, apiModifyPassword, apiRenameMe} from "@/utils/apiUtils";
import {onMounted, reactive, ref} from "vue";
import ImageUploader from "@/components/ImageUploader.vue";
import {imageBaseUrl} from "@/stores/basic-data";
import {Eye} from "@nutui/icons-vue"

const userStore = useUserStore()
const userStoreRef = storeToRefs(userStore)

const userDetail = reactive({
  name:"",
  avatar:"",
  id:0,
  uuid:"",
  items:[],
  comments:[],
  email:""
})
const renameData = reactive({
  name:"",
  avatar:""
})
const uploaderView = ref(false)
const nameView = ref(false)
const pwdView = ref(false)
const newPwd = ref(userStore.getDecodedPwd)
const inputTypes = ['password','text']
const pwdStyle = ref(inputTypes[0])
async function logout(){
  await apiLogout()
}
function gotoLogin(){
  login()
}

function changeUploaderView(){
  uploaderView.value = !uploaderView.value
}
function changeNameView(){
  nameView.value = !nameView.value
}
function changePwdView(){
  pwdView.value = !pwdView.value
}
async function modifyProfile(){
  //console.log("调用 modifyProfile，数据：", renameData)
  try {
    await apiRenameMe(renameData);
    await getProfileDetail();
  } catch (error) {
    console.error("修改个人信息失败", error);
  }finally {
    nameView.value=false
    uploaderView.value=false
    pwdView.value=false
  }
}
async function getProfileDetail(){
  let data = await apiGetDetailProfile()
  if(data){
    Object.assign(userDetail, data)
    userDetail.avatar = imageBaseUrl + data.avatar//理解：相对变绝对
    renameData.name = userDetail.name
    renameData.avatar = data.avatar
  }
}
function changePwdStyle(){
  if(pwdStyle.value === inputTypes[0]){
    pwdStyle.value = inputTypes[1]
  }else{
    pwdStyle.value = inputTypes[0]
  }
}
async function changePassword(){
  let data = await apiModifyPassword(newPwd.value)
  if(data){
    userStore.setPassword(newPwd.value)
    pwdView.value=false
  }
}

function gotoMyArticles(){
  console.log("被点击");
  
  userStore.setTabValue(1)
}
function gotoMyComments(){
  console.log("被点击");
  userStore.setTabValue(2)
}

// onMounted(async ()=>{
//   await apiGetProfile()
// })
onMounted(()=>{
  if(userStore.isLogin){
    getProfileDetail();
  }
})
</script>

<style scoped>
.center{
  display: flex;
  justify-content: center;
  margin-top:10px;
}
img{
  height: 60px;
}
span{
  color: black;
  margin-right: 15px;
}
</style>