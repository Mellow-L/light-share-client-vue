<template>
    <MyHead :title="computedTitle" @click="changePopStatus"></MyHead>
    <nut-space v-if="showPop" direction="vertical" align="center" fill>
        <MyCard v-bind="itemData"></MyCard>
    </nut-space>
    <div v-if="error">
        <ErrorState :error="error"  
            :isLoading="isLoading"
            @refreshFun="refreshFun">
        </ErrorState>
    </div>
    <nut-empty v-if="isNoComment"
        image="empty"
        description="无评论信息">
    </nut-empty>
    <div class="main-body">
        <a-comment align="right" v-for="item in comments"
            :author="item.owner.name"
            :avatar="imageBaseUrl+item.owner.avatar"
            :datetime="formatDateTime(item.create_time)"
            :key="item.id">
            <template #actions>
                <span @click="setReplyHint(item)">
                    <IconMessage></IconMessage>引用
                </span>
                <span v-if="item.owner_id == uuid"
                    @click="commitDeleteComment(item)">
                    <IconDelete></IconDelete>删除
                </span>
            </template>
            <template #content>
                <div v-if="item.hint" style="color:grey;">
                    {{ item.hint }}
                </div>
                <div>
                    {{ item.content }}
                </div>
            </template>
        </a-comment>
    </div> 
    <a-comment class="comment-box" align="right" v-if="isLogin" :avatar="userAvatar">
        <template #actions>
            <a-button type="primary" :key="0"
                v-if="!useCounter.commentCounterEnabled"
                :loading="isLoading"
                @click="refreshFun">刷新</a-button>
            <a-button key="1" type="primary" @click="addReply">发送</a-button>
        </template>
        <template #content>
            <div v-if="commentData.hint" style="color:grey;">
                <a-input v-model="commentData.hint" readonly>
                    <template #append>
                        <span @click="()=>commentData.hint = ''">取消引用</span>
                    </template>
                </a-input>
            </div>
            <a-input placeholder="Here is your reply." v-model="commentData.content"></a-input>
        </template>
    </a-comment>
    <nut-cell v-else title="未登录，不能评论"
        is-link
        @click="gotoLogin(1)"></nut-cell>
</template>
<script setup lang="js">
import MyCard from '@/components/MyCard.vue';
import MyHead from '@/components/MyHead.vue';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { useCounterStore } from '@/stores/counter-store';
import { ref ,computed,reactive, onMounted} from 'vue';
import { imageBaseUrl } from '@/stores/basic-data';
import { apiDeleteCommentById, apiGetCommentsByItemId, apiGetItemById, apiPostComment } from '@/utils/apiUtils';
import { gotoLogin } from '@/router/my-router';
import { showDialog } from '@nutui/nutui';
import { formatDateTime } from '@/utils/formatUtils';
import {IconDelete, IconMessage} from '@arco-design/web-vue/es/icon';
const showPop = ref(false)

const useCounter = useCounterStore()
const counterRef = storeToRefs(useCounter)

const userState = useUserStore()
const uuid = userState.uuid
const userRef = storeToRefs(userState)
const isLogin = ref(userRef.isLogin)
const props = defineProps({
    id:String,
})
const commentData = reactive({
    content:"",
    hint:"",
    order:0,
})
const userAvatar = imageBaseUrl + userState.avatar
const commentCount = ref(counterRef.commentCounter)
const {comments, error, isLoading} = apiGetCommentsByItemId(commentCount, props.id)
const itemRefreshCount = ref(0)
const isNoComment = computed(()=>{
    return comments == null || comments.value == null || comments.value.length == 0
})
const {itemData} = apiGetItemById(props.id,itemRefreshCount)
const computedTitle = computed(()=>{
    return itemData.value?.title??""
})
function changePopStatus(){
    showPop.value = !showPop.value
    if(showPop.value){
        itemRefreshCount.value ++
    }
}
function refreshFun(){
    useCounter.incrementCommentCounter()
}
function setReplyHint(item){
    commentData.hint = '引用:' + item.content + '@' + item.owner.name
}
async function addReply(){
    await apiPostComment(props.id,commentData)
    refreshFun()
    commentData.hint = ''
    commentData.content = ''
}
async function deleteComment(item) {
    await apiDeleteCommentById(item.id)
    refreshFun()
}
async function commitDeleteComment(item){
    let title = '确定删除' +item.owner.name +'的回复？'
    let content = item.content
    let onCancel = () =>{
    }
    let onOk = () =>{
        deleteComment(item)
    }
    showDialog({title,content,onCancel,onOk})
}
onMounted(async()=>{
    refreshFun()
    itemRefreshCount.value ++
})
</script>
<style scoped>
.action{
    display: inline-block;
    padding:0 4px;
    color:var(--color-text-1);
    line-height: 24px;
    background: transparent;
    border-radius: 2px;
    cursor:pointer;
    transition: all 0.1s ease;
    padding-bottom: 80px;
}
.action:hover{
    background-color: var(--color-fill-3);
}
.main-body{
    display: flex;
    flex-direction: column;
    justify-items: center;
    justify-content: center;
    width:90%;
    margin:auto;
    margin-top:5%;
    padding-bottom: 120px;
}
.comment-box {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: white;
    padding: 15px;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    z-index: 100;
    display: flex;
    box-sizing: border-box;
}
</style>