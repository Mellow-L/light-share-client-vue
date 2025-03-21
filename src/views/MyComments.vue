<template>
    <ErrorState :error="error"
        :isLoading="isLoading"
        @refreshFun="refreshFun">
    </ErrorState>
    <a-list>
        <a-list-item v-for="(c) in comments" :key="c.id">
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
import { onActivated, ref } from 'vue';

const counter = ref(1)
const {comments,error,isLoading} = apiGetMyComments(counter)
const userState = useUserStore()
const userRef = storeToRefs(userState)
const isLogin = ref(userRef.isLogin)
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