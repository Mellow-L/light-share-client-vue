<template>
    <nut-searchbar v-model="searchVal" @clear="clearFun"
        placeholder="搜索">
        <template #rightin>
            <Search2 @click="executeManualSearch"></Search2>
        </template>
    </nut-searchbar>

    <!-- 通用错误提示：网络错误等 -->
    <nut-empty v-if="error && !isLoading" image="error" :description="error">
        <nut-button type="primary" style="margin-top: 5px;" @click="refreshFun">重试</nut-button>
    </nut-empty>

    <!-- 加载完成，无错误，但列表为空（或null），且用户已输入搜索词 -->
    <nut-empty v-if="!error && !isLoading && (!list || list.length === 0) && searchValCommit">
        <template #image>
            <Search2 color="#999" width="50px" height="50px" />
        </template>
        <template #description>
            <span>没有找到与 "{{ searchValCommit }}" 相关的内容</span>
        </template>
         <nut-button type="primary" plain style="margin-top: 5px;" @click="clearSearchAndRefresh">清空并刷新</nut-button>
    </nut-empty>

    <!-- 加载完成，无错误，列表为空，且用户未输入搜索词 (初始状态或清空搜索后) -->
     <nut-empty v-if="!error && !isLoading && (!list || list.length === 0) && !searchValCommit" description="暂无文章">
         <nut-button type="primary" style="margin-top: 5px;" @click="refreshFun">刷新列表</nut-button>
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
                        @onClickItem="(id)=>gotoShowArticle(id)"
                        @onClickComment="gotoShowComment(item.id)"
                        @onClickUser="(name)=>onClickUser(name)"></MyCard>
                </nut-pull-refresh>
            </nut-space>
            <nut-space v-else
                direction="vertical" align="center" fill>
                <MyCard v-for="item in list" :key="item.id" v-bind="item"
                    @onClickStar="(id)=>clickStar(id)"
                    @onClickItem="(id)=>gotoShowArticle(id)"
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
import{gotoShowArticle, gotoShowComment, gotoUserArticle, gotoLogin} from '@/router/my-router'
import { Search2 } from '@nutui/icons-vue';
import { useUserStore } from '@/stores/user';
import { showToast } from '@nutui/nutui';

function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const counterStore = useCounterStore()
const counterRefObj = storeToRefs(counterStore)
const counterRef = ref(counterRefObj.articleCounter.value)
const counterEnableRef = ref(counterRefObj.articleCounterEnabled)
const hasMore = ref(true)
const currentPage = ref(0)
const PAGE_SIZE = 5

const searchVal = ref('')
const searchValCommit = ref('')

const debouncedProcessSearchInput = debounce((currentInputValue) => {
  searchValCommit.value = currentInputValue;
  console.log('防抖搜索触发，关键词:', currentInputValue);
}, 500);

watch(searchVal, (newVal) => {
  debouncedProcessSearchInput(newVal);
});

function executeManualSearch() {
  searchValCommit.value = searchVal.value;
  console.log('手动搜索触发，关键词:', searchVal.value);
}

const q = computed(()=>{
    let offset = 0
    return `skip=${offset}&limit=${PAGE_SIZE*(currentPage.value+1)}`
})
const{list, error, isLoading} = apiGetAllItemsRefresh(counterRef,q,searchValCommit)

function refreshFun() {
    counterRef.value++;
    nextTick(() => {
        fetchLikeStatus();
    });
}

function clearFun(){
    searchVal.value = '';
    searchValCommit.value = '';
    console.log('搜索框已清除');
}

function clearSearchAndRefresh() {
    searchVal.value = '';
    searchValCommit.value = '';
    refreshFun();
}

function scrollChange(v){
    console.log(`滚动位置变化: ${v}, 当前页: ${currentPage.value}`)
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
        await fetchLikeStatus();
    }
});

const fetchLikeStatus = async () => {
    if (!list.value || list.value.length === 0) return;
    const itemIds = list.value.map(item => item.id);
    const likeMap = await apiFetchLikeStatus(itemIds);
    if (!likeMap) return;

    list.value.forEach(item => {
        item.liked = likeMap[item.id] || false;
    });
};
async function clickStar(id){
    const userStoreInstance = useUserStore()
    if (!userStoreInstance.isLogin) {
        showToast.warn("请先登录后再点赞！")
        gotoLogin(1)
        return
    }
    let data = await apiAddItemStar(id)
    if (data) {
        refreshFun();
    }
}

async function onClickUser(name,src){
    console.log("用户头像被点击");
    try {
        const uuid = await apiGetUuidByName(name)
        console.log("通过用户名获取到的uuid：",uuid);
        
        gotoUserArticle(uuid)
    } catch (error) {
        console.log("获取用户uuid失败",error);
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