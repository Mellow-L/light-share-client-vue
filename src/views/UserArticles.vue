<template>
    <nut-navbar title="用户详情" left-show @click-back="gotoBack"></nut-navbar>
    
    <ErrorState v-if="error" :error="error"
        :isLoading="isLoading"
        @refreshFun="refresh">
    </ErrorState>
    <div v-if="userInfo.value">
        <nut-cell title="用户" >
            <template #desc>
                <span>{{userInfo?.value.name}}</span>
            </template>
        </nut-cell>
        <nut-cell :title="'UUID '+ uuid"></nut-cell>
        <nut-cell title="发布文章">
            <template #desc>
                <span>{{list?.length || 0}}</span>
            </template>
        </nut-cell>
    </div>
    <nut-divider> 文章列表 </nut-divider>
    <nut-searchbar v-model="searchVal" @clear="clearFun"
        @search="searchFun" placeholder="搜索">
        <template #rightin>
            <Search2 @click="searchFun"></Search2>
        </template>
    </nut-searchbar>
    <MyCard v-for="item in list" :key="item.id" v-bind="item"
                    @onClickStar="(id)=>clickStar(id)"
                    @onClickComment="gotoShowComment(item.id)"
                    @onClickUser="(name,src)=>onClickUser(name,src)"></MyCard>
    <!-- <ArticleList :items="list"
        onRefresh="refresh">
    </ArticleList> -->
</template>
<script setup lang="js">
import ArticleList from '@/components/ArticleList.vue';
import MyCard from '@/components/MyCard.vue';
import { gotoBack, gotoShowComment } from '@/router/my-router';
import { useStarStore } from '@/stores/star-store';
import { apiAddItemStar, apiGetAllItemsByUserId, apiGetUserInfoByUuid } from '@/utils/apiUtils';
import { useScrollPos } from '@/utils/scrollUtils';
import { Search2 } from '@nutui/icons-vue';

import { onActivated, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute()
const searchVal = ref('')
const searchValCommit = ref('')
const counter = ref(0)
let userInfo = ref({}) 
const uuid = ref(route.params.uuid)

const {list,error,isLoading}  = apiGetAllItemsByUserId(counter,uuid,searchValCommit)
console.log("UserArticle中显示的list",list);
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

async function clickStar(id){
    // const starStore = useStarStore()
    // if(!starStore.canStar(id)){
    //     alert("每天只能点赞一次")
    //     return
    // }
    let data = await apiAddItemStar(id)
    if(data){
        refresh()
    }
}

onActivated(()=>{
    refresh()
})
onMounted(async()=>{
    console.log(uuid.value);
    try {
        userInfo.value = await apiGetUserInfoByUuid(uuid.value)
        console.log("后端返回的userInfo：",userInfo.value);
    } catch (error) {
        console.error('获取用户信息失败',error)
    }
})

</script>
<style scoped>
.center{
    display: flex;
    justify-content: center;
    margin-top: 10px;
}
span{
  color: black;
  margin-right: 15px;
}
</style>