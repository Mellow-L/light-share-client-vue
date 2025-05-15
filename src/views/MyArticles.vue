<template>
    <nut-searchbar v-model="searchVal" @clear="clearFun"
        placeholder="搜索">
        <template #rightin>
            <Search2 @click="executeManualSearch"></Search2>
        </template>
        <template #rightout>
            <nut-button type="info" icon="Add" size="small" @click="addArticle">发布</nut-button>
        </template>
    </nut-searchbar>
    <ErrorState v-if="error" :error="error"
        :isLoading="isLoading"
        @refreshFun="refresh">
    </ErrorState>
    <ArticleList :items="list"
        @onRefresh="refresh">
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
import { Search2, Add } from '@nutui/icons-vue';
import { storeToRefs } from 'pinia';
import { onActivated, ref, watch } from 'vue';

function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const searchVal = ref('')
const searchValCommit = ref('')
const counter = ref(0)
const useUser = useUserStore()
const userRef = storeToRefs(useUser)
const isLogin = ref(userRef.isLogin)
const uuid = ref(userRef.uuid)

const debouncedUpdateSearchCommit = debounce((value) => {
  searchValCommit.value = value;
  console.log('MyArticles - 防抖搜索触发:', value);
}, 500);

watch(searchVal, (newValue) => {
  debouncedUpdateSearchCommit(newValue);
});

function executeManualSearch() {
  searchValCommit.value = searchVal.value;
  console.log('MyArticles - 手动搜索触发:', searchVal.value);
}

const {list,error,isLoading}  = apiGetAllItemsByUserId(counter,uuid,searchValCommit)
useScrollPos()

function refresh(deletedItemId){
    console.log('MyArticles refresh triggered. Deleted Item ID:', deletedItemId);
    
    if (deletedItemId && list.value) {
        const index = list.value.findIndex(article => article.id === deletedItemId);
        if (index !== -1) {
            list.value.splice(index, 1);
            console.log('Optimistically removed item with ID:', deletedItemId, 'from local list.');
        }
    }
    
    counter.value ++
}

function clearFun(){
    searchVal.value = '';
    searchValCommit.value = '';
    console.log('MyArticles - 搜索框已清除');
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