<template>
    <nut-searchbar v-model="searchVal" @clear="clearFun"
        placeholder="搜索评论内容或文章标题">
        <template #rightin>
            <Search2 @click="executeManualSearch"></Search2>
        </template>
    </nut-searchbar>
    <ErrorState :error="error"
        :isLoading="isLoading"
        @refreshFun="refreshFun">
    </ErrorState>
    <a-list>
        <a-list-item v-for="(c) in filteredComments" :key="c.id">
            <a-list-item-meta
                :title="c.item?.title"
                @click="gotoShowComment(c.item_id)">
                <template #description>
                    <div>
                        <span>{{ c.content }}</span>
                    </div>
                    <div style="font-size: xx-small">
                        <span>{{ formatDateTime(c.create_time) }}</span>
                    </div>
                </template>  
                <template #avatar>
                    <a-avatar shape="square">
                        <img
                            alt="avatar"
                            :src="imageBaseUrl+(c.owner?.avatar || '')"
                        />
                    </a-avatar>
                </template>
            </a-list-item-meta>
            <template #actions>
                <IconDelete @click="deleteComment(c)"/>
                <IconBook @click="gotoShowArticle(c.item_id)"/>
            </template>
        </a-list-item>
        <template #empty>
       <a-empty></a-empty>
        </template>
    </a-list>
    <div v-if="!isLogin" class="center">
        <nut-button type="info" @click="gotoLogin(1)">去登录页面</nut-button>
    </div>
</template>
<script setup lang="js">
import { 
    gotoLogin,
    gotoShowComment,
    gotoShowArticle
} from '@/router/my-router';
import { imageBaseUrl } from '@/stores/basic-data';
import { useUserStore } from '@/stores/user';
import { apiDeleteCommentById, apiGetMyComments } from '@/utils/apiUtils';
import { formatDateTime } from '@/utils/formatUtils';
import { showDialog } from '@nutui/nutui';
import {
    IconDelete,
    IconBook
} from "@arco-design/web-vue/es/icon";
import { storeToRefs } from 'pinia';
import { onActivated, ref ,computed, watch } from 'vue';
import { Search2 } from '@nutui/icons-vue';

// 防抖函数
function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const counter = ref(1)
const {comments,error,isLoading} = apiGetMyComments(counter)
const userState = useUserStore()
const userRef = storeToRefs(userState)
const isLogin = ref(userRef.isLogin)

const searchVal = ref('') // 搜索框的实时输入值
const searchValCommit = ref('') // 用于前端过滤的实际关键词

// 防抖处理的函数：延迟更新实际用于过滤的搜索词
const debouncedUpdateSearchCommit = debounce((value) => {
  searchValCommit.value = value;
  console.log('MyComments - 防抖搜索触发:', value);
}, 300); // 评论是前端过滤，延迟可以短一些，例如300ms

// 监听搜索框输入变化
watch(searchVal, (newValue) => {
  debouncedUpdateSearchCommit(newValue);
});

// 手动点击搜索按钮触发
function executeManualSearch() {
  searchValCommit.value = searchVal.value;
  console.log('MyComments - 手动搜索触发:', searchVal.value);
}

const filteredComments = computed(() => {
    if (!comments.value) return []; // 如果评论数据还未加载，返回空数组
    if (!searchValCommit.value.trim()) {
        return comments.value; // 无搜索词时返回全部评论
    }
    
    const searchTerm = searchValCommit.value.toLowerCase().trim();
    
    return comments.value.filter(c => {
        const contentMatch = c.content && 
            c.content.toLowerCase().includes(searchTerm);
        const titleMatch = c.item && c.item.title && 
            c.item.title.toLowerCase().includes(searchTerm);
        return contentMatch || titleMatch;
    });
});

async function deleteComment(c){
    const onOk = async()=>{
        await apiDeleteCommentById(c.id)
        refreshFun()
    }
    showDialog({
        title:'确定需要删除该项内容吗?',
        content:c.content,
        onCancel:()=>{},
        onOk
    })
}
function refreshFun(){
    counter.value ++
}
function clearFun(){
    searchVal.value = '';
    searchValCommit.value = ''; // 立即清空提交的搜索词以更新列表
    console.log('MyComments - 搜索框已清除');
}

onActivated(()=>{
    refreshFun()
})

</script>
<style scoped>
.center{
    display: flex;
    justify-content: center;
    margin-top: 10px;
}
</style>