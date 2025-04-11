<template>
    <nut-searchbar v-model="searchVal" @clear="clearFun"
        @search="searchFun" placeholder="搜索">
        <template #rightin>
            <Search2 @click="searchFun"></Search2>
        </template>
    </nut-searchbar>
    <nut-empty v-if="error" image="error" description="Error">
        <nut-cell>
            <nut-ellipsis :content="error"
                direction="end"
                expand-text="展开"
                rows="3"
                class="my-ellipsis"
                collapse-text="收起">
            </nut-ellipsis>
        </nut-cell>
        <nut-button type="primary" style="margin-top: 5px;"
            :loading="isLoading"
            @click="refreshFun">Refresh</nut-button>
    </nut-empty>
    <div v-if="list && list.length > 0" class="center">
        <nut-infinite-loading v-model="isLoading"
                :has-more="hasMore"
                @scroll-change="scrollChange"
                @load-more="loadMore">
            <nut-space v-if="!counterEnableRef"
                direction="vertical"
                align="center" fill>
                <nut-pull-refresh v-if="!counterEnableRef"
                    v-model="isLoading" @refresh="refreshFun">
                    <MyCard v-for="item in list" :key="item.id" v-bind="item"
                        @onClickStar="(id)=>clickStar(id)"
                        @onClickComment="gotoShowComment(item.id)"
                        @onClickUser="(name)=>onClickUser(name)"></MyCard>
                </nut-pull-refresh>
            </nut-space>
            <nut-space v-else
                direction="vertical" align="center" fill>
                <MyCard v-for="item in list" :key="item.id" v-bind="item"
                    @onClickStar="(id)=>clickStar(id)"
                    @onClickComment="gotoShowComment(item.id)"
                    @onClickUser="(name,src)=>onClickUser(name,src)"></MyCard>
            </nut-space>
        </nut-infinite-loading>   
    </div>
</template>
<script setup lang="js">
import { ref,watch,computed,onActivated, onMounted, nextTick } from 'vue';
import MyCard from "@/components/MyCard"
import { useCounterStore } from '@/stores/counter-store';
import { storeToRefs } from 'pinia';
import { useScrollPos } from '@/utils/scrollUtils';
import {apiAddItemStar, apiFetchLikeStatus, apiGetAllItemsRefresh, apiGetUuidByName} from '@/utils/apiUtils'
import{gotoShowComment, gotoUserArticle} from '@/router/my-router'
import { useStarStore } from '@/stores/star-store';
import { Search2 } from '@nutui/icons-vue';

const counterStore = useCounterStore()
const counterRefObj = storeToRefs(counterStore)
const counterRef = ref(counterRefObj.articleCounter.value)
const counterEnableRef = ref(counterRefObj.articleCounterEnabled)
const hasMore = ref(true)
const currentPage = ref(0)
const PAGE_SIZE = 5

// 二者分离避免频繁触发请求
const searchVal = ref('') // 实时输入值
const searchValCommit = ref('') // 提交的搜索值 注意声明在api函数使用前

const q = computed(()=>{
    let offset = 0
    return `skip=${offset}&limit=${PAGE_SIZE*(currentPage.value+1)}`
})
//const allList = ref(new Map())
const{list, error, isLoading} = apiGetAllItemsRefresh(counterRef,q,searchValCommit)


function searchFun(){
    searchValCommit.value = searchVal.value // 提交值为输入值
    console.log('search',searchValCommit.value);
}
function refreshFun() {
    counterRef.value++;
    nextTick(() => {
        fetchLikeStatus();
    });
}

function clearFun(){
    console.log('clearFun');
    searchValCommit.value = searchVal.value
}
function scrollChange(v){
    console.log(`v=${v},currentPage=${currentPage.value}`)
}
function loadMore(){
    currentPage.value++
}
watch(list,()=>{
    if(list.value?.length && 
    list.value.length < PAGE_SIZE*(currentPage.value+1)){
        hasMore.value = false
    }else{
        hasMore.value = true
    }
})
watch(list, async () => {
    if (list.value?.length) {
        await fetchLikeStatus();  // 重新获取点赞状态
    }
});

const fetchLikeStatus = async () => {
    if (!list.value || list.value.length === 0) return;
    const itemIds = list.value.map(item => item.id);
    const likeMap = await apiFetchLikeStatus(itemIds);
    if (!likeMap) return;

    // 避免替换整个 list，改为就地更新 liked 字段
    list.value.forEach(item => {
        item.liked = likeMap[item.id] || false;
    });
};
async function clickStar(id){
    // const starStore = useStarStore()
    // if(!starStore.canStar(id)){
    //     alert("每天只能点赞一次")
    //     return
    // }
    let data = await apiAddItemStar(id)
    if (data) {
        refreshFun(); // 会调用 fetchLikeStatus()
    }
}

async function onClickUser(name,src){
    console.log("头像被点击");
    try {
        const uuid = await apiGetUuidByName(name)
        console.log("后端返回的uuid：",uuid);
        
        gotoUserArticle(uuid)
    } catch (error) {
        console.log("用户id获取失败",error);
    }
}
onActivated(()=>{
    refreshFun()
})
onMounted(()=>{
    fetchLikeStatus()
})

useScrollPos()
</script>

<style scoped>
.center{
    display: block;
    justify-content: center;
}
.my-ellipsis{
    overflow-wrap:break-word;
    word-wrap: break-word;
    white-space:pre-wrap;
}
</style>