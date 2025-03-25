<template>
    <nut-searchbar v-model="searchVal" @clear="clearFun"
        @search="searchFun" placeholder="搜索">
        <template #rightin>
            <Search2 @click="searchFun"></Search2>
        </template>
        <template #rightout>
            <nut-tag type="danger" @click="addArticle">发布文章</nut-tag>
        </template>
    </nut-searchbar>
    <ErrorState v-if="error" :error="error"
        :isLoading="isLoading"
        @refreshFun="refresh">
    </ErrorState>
    <ArticleList :items="list"
        onRefresh="refresh">
    </ArticleList>
    <div v-if="!isLogin" class="center">
        <nut-button type="info" @click="gotoLogin">去登录页面</nut-button>
    </div>
</template>
<script setup lang="js">
import ArticleList from '@/components/ArticleList.vue';
import { gotoLogin, gotoPostArticle } from '@/router/my-router';
import { useUserStore } from '@/stores/user';
import { apiGetAllItemsByUserId } from '@/utils/apiUtils';
import { useScrollPos } from '@/utils/scrollUtils';
import { Search2 } from '@nutui/icons-vue';
import { storeToRefs } from 'pinia';

import { onActivated, ref } from 'vue';
const searchVal = ref('')
const searchValCommit = ref('')
const counter = ref(0)
const useUser = useUserStore()
const userRef = storeToRefs(useUser)
const isLogin = ref(userRef.isLogin)
const uuid = ref(userRef.uuid)
const {list,error,isLoading}  = apiGetAllItemsByUserId(counter,uuid,searchValCommit)
useScrollPos()
function refresh(){
    counter.value ++
}
function clearFun(){
    console.log('clearFun');
    searchValCommit.value = searchVal.value
}
function searchFun(){
    searchValCommit.value = searchVal.value
    console.log('search',searchValCommit.value);
}
function addArticle(){
    console.log('add article');
    gotoPostArticle()
}
onActivated(()=>{
    refresh()
})
</script>
<style scoped>
.center{
    display: flex;
    justify-content: center;
    margin-top: 10px;
}
</style>