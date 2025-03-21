<template>
    <MyHead title="发布文章"></MyHead>
    <nut-cell title="请先登录" desc="未登录不能发布文章"
        v-if="!isLogin"
        @click="gotoLogin(1)">
    </nut-cell>
    <div v-else>
        <post-component v-model:item-id="itemId"
            v-model:form-data="formData"
            v-model:img-contents="imgContents"
            @onSubmit="(id)=>replaceView(id)">
        </post-component>
    </div>
</template>

<script setup lang="js">
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { reactive ,ref} from 'vue';
import MyHead from '@/components/MyHead.vue';
import { replaceToShowArticle, gotoLogin } from "@/router/my-router" 
const userStore = useUserStore()
const userRef = storeToRefs(userStore)
const isLogin = ref(userRef.isLogin)
const itemId = ref(0)
const formData = ref({
    title:"",
    description:"",
    price:0,
    vipPrice:0,
    content:"",
    src:"",
    id:0,
})
const imgContents = ref([reactive({
    name:"",
    url:"",
    img_content:"",
    order:0,
    id:0,
})])
function replaceView(id){
    console.log(replaceView.name,'id',id);
    replaceToShowArticle(id)
}
</script>

<style>

</style>