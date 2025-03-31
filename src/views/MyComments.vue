<template>
    <nut-searchbar v-model="searchVal" @clear="clearFun"
        @search="searchFun" placeholder="搜索">
        <template #rightin>
            <Search2 @click="searchComments"></Search2>
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
import { onActivated, ref ,computed} from 'vue';
import { Search2 } from '@nutui/icons-vue';

const counter = ref(1)
const {comments,error,isLoading} = apiGetMyComments(counter)
const userState = useUserStore()
const userRef = storeToRefs(userState)
const isLogin = ref(userRef.isLogin)

// 二者分离避免频繁触发请求
const searchVal = ref('') // 实时输入值
const searchValCommit = ref('') // 提交的搜索值 

const filteredComments = computed(() => {
    if (!comments.value || !searchValCommit.value.trim()) {
        return comments.value; // 无搜索词时返回全部评论
    }
    
    const searchTerm = searchValCommit.value.toLowerCase().trim();
    
    return comments.value.filter(c => {
        // 匹配评论内容
        const contentMatch = c.content && 
            c.content.toLowerCase().includes(searchTerm);
        
        // 匹配文章标题
        const titleMatch = c.item && c.item.title && 
            c.item.title.toLowerCase().includes(searchTerm);
        
        // 任一匹配即可
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
    console.log('clearFun');
    searchVal.value = ''; // 清空输入框
    searchValCommit.value = searchVal.value // 提交值为输入值
}
function searchComments(){
    searchValCommit.value = searchVal.value // 提交值为输入值
    console.log('search',searchValCommit.value);
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