<template>
  <nut-navbar title="登录" left-show @click-back="gotoBack"></nut-navbar>
  <nut-row type="flex" justify="center">
    <nut-col :span="18" fill>
      <nut-image :src="logoSrc" width="100%" height="50vh" fit="cover" radius="10px"></nut-image>
    </nut-col>
  </nut-row>
  <nut-row type="flex" justify="center">
    <nut-col :span="18">
      <nut-form>
        <nut-form-item label="用户名">
          <nut-input v-model="formData.username" type="text"></nut-input>
        </nut-form-item>
        <nut-form-item label="密码">
          <nut-input v-model="formData.password" type="password"></nut-input>
        </nut-form-item>
      </nut-form>
    </nut-col>
  </nut-row>
  <div class="center">
    <nut-button type="info" @click="login">登录</nut-button>
  </div>

  <nut-row type="flex" justify="center">
        <nut-col :span="18" fill>
            <nut-cell title="没有账号，前往注册" is-link @click="gotoRegister"></nut-cell>
        </nut-col>
    </nut-row>
</template>

<script setup lang="js">
import {reactive} from "vue";
import {apiLogin} from "@/utils/apiUtils";
//import {alertSuccess} from "@/utils/showMessage";
import {gotoBack, gotoHome, gotoRegister} from "@/router/my-router";
import {useUserStore} from "@/stores/user";
import {storeToRefs} from "pinia";
import {useRoute} from "vue-router"; 
import {apiGetDetailProfile} from "@/utils/apiUtils";
const logoSrc = require("@/assets/login_logo.jpg")
const userStore = useUserStore()
const userStoreRef = storeToRefs(userStore)
const route = useRoute()
const back = route.params?.back??0
const formData = reactive({
  username:userStoreRef.userName,
  password:userStore.getDecodedPwd
})
// const formData = reactive({
//       grant_type: 'password', // 固定值
//       username:'aa@wzu.edu.cn',
//       password:'123456',
//       scope: '', // 可选，可以为空
//       client_id: 'string', // 从配置中获取
//       client_secret: 'string', // 从配置中获取
// })

async function login(){
  let data  = await apiLogin(formData)
  if(data){
    await apiGetDetailProfile()
    console.log('back',back)
    if(back == 1){
      gotoBack()
    }else{
      gotoHome()
    } 
  }
}

</script>

<style scoped>
.center{
  display: flex;
  justify-content: center;
}
</style>