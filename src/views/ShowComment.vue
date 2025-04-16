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
    <nut-empty v-if="!isLoading && isNoComment"
        image="empty"
        description="无评论信息">
    </nut-empty>
    <!-- 评论列表区域 -->
    <div class="main-body" ref="commentsContainer">
        <!-- 使用递归组件或嵌套循环 -->
        <!-- 方案 1: 嵌套循环 (对于 1-2 层嵌套更简单) -->
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <a-comment align="right"
                :author="comment.owner.name"
                :avatar="imageBaseUrl + comment.owner.avatar"
                :datetime="formatDateTime(comment.create_time)">
                <template #actions>
                    <!-- 回复按钮 -->
                    <span class="action" @click="startReply(comment)">
                        <IconMessage /> 回复
                    </span>
                    <!-- 引用按钮 (现有) -->
                    <span class="action" @click="setReplyHint(comment)">
                        <IconQuote /> 引用
                    </span>
                    <!-- 删除按钮 (现有) -->
                    <span class="action" v-if="comment.owner_id == uuid" @click="commitDeleteComment(comment)">
                        <IconDelete /> 删除
                    </span>
                    <!-- 新增：展开/收起回复按钮 (仅当有回复时显示) -->
                    <span class="action" v-if="comment.replies && comment.replies.length > 0" @click="toggleReplies(comment.id)">
                        <template v-if="isRepliesExpanded(comment.id)">
                            <IconUp /> 收起回复 ({{ comment.replies.length }})
                        </template>
                        <template v-else>
                            <IconDown /> 展开回复 ({{ comment.replies.length }})
                        </template>
                    </span>
                </template>
                <template #content>
                    <!-- 如果存在则显示图片 -->
                    <a-image v-if="comment.image_url"
                        :src="imageBaseUrl + comment.image_url"
                        width="150px"
                        style="margin-bottom: 8px; border-radius: 4px;"
                        preview />
                    <!-- 显示引用提示 -->
                    <div v-if="comment.hint" class="comment-hint">
                        {{ comment.hint }}
                    </div>
                    <!-- 显示内容 -->
                    <div>{{ comment.content }}</div>
                </template>
            </a-comment>

            <!-- 嵌套的回复 - 添加 v-if 控制显示 -->
            <div v-if="comment.replies && comment.replies.length > 0 && isRepliesExpanded(comment.id)" class="replies-container">
                <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                     <a-comment align="right"
                        :author="reply.owner.name"
                        :avatar="imageBaseUrl + reply.owner.avatar"
                        :datetime="formatDateTime(reply.create_time)">
                        <template #actions>
                            <!-- 嵌套回复的回复按钮 -->
                            <span class="action" @click="startReply(reply)">
                                <IconMessage /> 回复
                            </span>
                            <span class="action" @click="setReplyHint(reply)">
                                <IconQuote /> 引用
                            </span>
                            <span class="action" v-if="reply.owner_id == uuid" @click="commitDeleteComment(reply)">
                                <IconDelete /> 删除
                            </span>
                        </template>
                        <template #content>
                             <!-- 显示回复的图片 -->
                            <a-image v-if="reply.image_url"
                                :src="imageBaseUrl + reply.image_url"
                                width="120px"
                                style="margin-bottom: 6px; border-radius: 4px;"
                                preview />
                            <!-- 显示父评论信息 -->
                            <div class="reply-to" v-if="reply.parent_id === comment.id">
                                回复 @{{ comment.owner.name }}:
                            </div>
                            <!-- 显示引用提示 -->
                            <div v-if="reply.hint" class="comment-hint">
                                {{ reply.hint }}
                            </div>
                            <div>{{ reply.content }}</div>
                        </template>
                    </a-comment>
                </div>
            </div>
        </div>
        <!-- 占位符保持不变 -->
        <div class="comment-placeholder"></div>
    </div>
    <!-- 固定在底部的评论输入框 -->
    <div class="comment-box">
        <a-comment align="right" v-if="isLogin" :avatar="userAvatar" style="width: 100%;">
            <template #actions>
                <!-- 刷新按钮保持不变 -->
                <a-button type="primary" :key="0" v-if="!useCounter.commentCounterEnabled" :loading="isLoading" @click="refreshFun">刷新</a-button>
                <!-- 发送按钮保持不变 -->
                <a-button key="1" type="primary" @click="addReply" :loading="isSendingComment">发送</a-button>
            </template>
            <template #content>
                <!-- 正在回复指示器 -->
                <div v-if="replyingToCommentId" class="replying-indicator">
                    正在回复 @{{ getCommentAuthor(replyingToCommentId) }}
                    <a-button size="mini" type="text" @click="cancelReply">取消回复</a-button>
                </div>
                <!-- 引用提示保持不变 -->
                <div v-if="commentData.hint" style="color:grey;">
                    <a-input v-model="commentData.hint" readonly>
                        <template #append>
                            <span @click="()=>commentData.hint = ''">取消引用</span>
                        </template>
                    </a-input>
                </div>
                <!-- 主要内容输入框 -->
                <a-textarea placeholder="添加评论..." v-model="commentData.content" :rows="2" allow-clear />

                <!-- 图片上传区域 -->
                <div class="comment-image-upload">
                     <!-- 隐藏的文件输入元素 -->
                     <input type="file" @change="handleFileChange" accept="image/*" ref="fileInputRef" style="display: none;" />
                     <!-- 触发文件选择的按钮 -->
                     <a-button size="small" @click="triggerFileInput">
                         <template #icon><IconImage /></template>
                         {{ selectedImageFile ? '更换图片' : '添加图片' }}
                     </a-button>
                     <!-- 图片预览 -->
                     <div v-if="imagePreviewUrl" class="image-preview">
                         <img :src="imagePreviewUrl" alt="预览" />
                         <a-button size="mini" status="danger" @click="removeImage">移除</a-button>
                     </div>
                </div>
            </template>
        </a-comment>
        <!-- 登录提示保持不变 -->
        <nut-cell v-else title="未登录，不能评论" is-link @click="gotoLogin(1)"></nut-cell>
    </div>
</template>

<script setup lang="js">
import MyCard from '@/components/MyCard.vue';
import MyHead from '@/components/MyHead.vue';
import ErrorState from '@/components/ErrorState.vue'; // 导入 ErrorState
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { useCounterStore } from '@/stores/counter-store';
import { ref ,computed,reactive, onMounted,watch, nextTick} from 'vue';
import { imageBaseUrl } from '@/stores/basic-data';
import { apiDeleteCommentById, apiGetCommentsByItemId, apiGetItemById, apiPostComment } from '@/utils/apiUtils';
import { gotoLogin } from '@/router/my-router';
import { showDialog } from '@nutui/nutui';
import { formatDateTime } from '@/utils/formatUtils';
// 导入展开/收起图标 和 其他图标
import { IconDelete, IconMessage, IconQuote, IconImage, IconDown, IconUp } from '@arco-design/web-vue/es/icon';

const commentsContainer = ref(null); // 用于滚动的 Ref

// --- 新增用于回复和图片上传的 Refs ---
const replyingToCommentId = ref(null); // 正在回复的评论 ID
const selectedImageFile = ref(null);   // 已选择的图片文件对象
const imagePreviewUrl = ref('');       // 图片预览的 URL
const fileInputRef = ref(null);        // 隐藏文件输入的 Ref
const isSendingComment = ref(false);   // 发送按钮的加载状态

// --- 新增：管理展开状态的 Set ---
const expandedReplies = ref(new Set()); // 存储已展开回复的一级评论 ID

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
    // 修复：检查 comments.value 是否存在
    return !isLoading.value && (!comments.value || comments.value.length === 0);
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
function refreshFun() {
    // 增加计数器以触发 apiGetCommentsByItemId 中的 watch
    commentCount.value++;
    // 如果需要，可以重置回复状态
    // cancelReply();
}

// --- 新增：切换回复展开/收起状态的函数 ---
function toggleReplies(commentId) {
    if (expandedReplies.value.has(commentId)) {
        expandedReplies.value.delete(commentId); // 如果已展开，则收起
    } else {
        expandedReplies.value.add(commentId);    // 如果已收起，则展开
    }
}

// --- 新增：检查评论是否展开的辅助函数 ---
function isRepliesExpanded(commentId) {
    return expandedReplies.value.has(commentId);
}

function startReply(comment) {
    replyingToCommentId.value = comment.id;
    commentData.hint = ''; // 回复时清除引用提示
    // 可选：聚焦输入框: document.querySelector('.comment-box textarea')?.focus();
}
function cancelReply() {
    replyingToCommentId.value = null;
}

function getCommentAuthor(commentId) {
    // 辅助函数，用于 "回复 @" 显示作者名
    const findComment = (list) => {
        if (!list) return null;
        for (const c of list) {
            if (c.id === commentId) return c.owner.name;
            // 递归查找子评论
            const foundInReply = findComment(c.replies);
            if (foundInReply) return foundInReply;
        }
        return null;
    };
    return findComment(comments.value) || '用户'; // 默认显示 '用户'
}

function triggerFileInput() {
    fileInputRef.value?.click(); // 触发隐藏的文件输入点击事件
}

function handleFileChange(event) {
    const file = event.target.files?.[0]; // 获取选中的文件
    if (file) {
        selectedImageFile.value = file;
        // 创建预览 URL
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreviewUrl.value = e.target.result; // 设置预览 URL
        };
        reader.readAsDataURL(file); // 读取文件内容
    } else {
        removeImage(); // 如果没有选择文件则清除
    }
    // 重置文件输入的值，允许再次选择相同的文件
    if (event.target) event.target.value = null;
}

function removeImage() {
    selectedImageFile.value = null;
    imagePreviewUrl.value = '';
    if (fileInputRef.value) fileInputRef.value.value = null; // 清除文件输入的值
}

function setReplyHint(item){
    commentData.hint = '引用:' + item.content + '@' + item.owner.name
}
async function addReply() {
    // 如果没有内容且没有图片，则不发送
    if (!commentData.content.trim() && !selectedImageFile.value) {
        // 可以显示提示信息: "请输入评论内容或选择图片"
        return;
    }
    isSendingComment.value = true; // 设置加载状态

    // 准备 API 调用参数
    const apiParams = {
        content: commentData.content,
        hint: commentData.hint,
        order: commentData.order,
        parent_id: replyingToCommentId.value // 如果是回复，则添加 parent_id
    };

    // 调用更新后的 API 函数，传入图片文件
    const updatedComments = await apiPostComment(props.id, apiParams, selectedImageFile.value);

    isSendingComment.value = false; // 重置加载状态

    if (updatedComments !== null) { // 检查 API 调用是否成功 (失败时 apiPostComment 返回 null)
        // 重置输入字段
        commentData.content = '';
        commentData.hint = '';
        cancelReply(); // 清除回复状态
        removeImage(); // 清除图片选择

        // 后端现在返回更新后的列表，理论上可以本地更新
        // 但触发刷新更简单可靠
        refreshFun(); // 触发刷新以获取包含新评论的最新列表

        // DOM 更新后滚动到底部
        await nextTick(() => {
            scrollToBottom();
        });
    }
    // 如果 updatedComments 为 null, apiPostComment 内部已经显示了错误消息
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

// --- 现有滚动逻辑 ---
function scrollToBottom() {
    if (commentsContainer.value) {
        // 使用 scrollIntoView 可能更平滑
        const lastComment = commentsContainer.value.lastElementChild;
        if (lastComment && lastComment.scrollIntoView) {
             lastComment.scrollIntoView({ behavior: 'smooth', block: 'end' });
        } else {
            // 回退到 scrollTop
             commentsContainer.value.scrollTop = commentsContainer.value.scrollHeight;
        }
    }
}
watch(() => comments.value, (newComments, oldComments) => {
    // 仅在评论实际增加时滚动
    if (newComments?.length > (oldComments?.length || 0)) {
        nextTick(() => {
            scrollToBottom();
        });
    }
}, { deep: true });

onMounted(async()=>{
    refreshFun()
    itemRefreshCount.value ++
    // 初始加载时延迟滚动到底部，确保评论已加载
    setTimeout(() => {
        if (comments.value && comments.value.length > 0) {
            scrollToBottom();
        }
    }, 500);
})
</script>
<style scoped>
/* --- 现有样式 --- */
.action {
    display: inline-block;
    padding: 0 4px;
    color: var(--color-text-1);
    line-height: 20px; /* 减小行高 */
    font-size: 13px; /* 减小字体大小 */
    background: transparent;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.1s ease;
}
.action:hover{
    background-color: var(--color-fill-3);
}
.main-body{
    display: flex;
    flex-direction: column;
    /* 移除 justify-items 和 justify-content */
    width:90%;
    margin:auto;
    margin-top:5%;
    padding-bottom: 140px; /* 调整以适应固定评论框 */
    overflow-y: auto; /* 允许内容滚动 */
}
.comment-placeholder { /* 底部占位符，确保内容不被固定评论框遮挡 */
    height: 80px; /* 调整为评论框的高度 */
    width: 100%;
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
.comment-item {
    margin-bottom: 16px; /* 顶级评论之间的间距 */
    border-bottom: 1px solid #e8e8e8; /* 分隔线 */
    padding-bottom: 16px;
}
.comment-item:last-child {
    border-bottom: none; /* 最后一个评论无底部分隔线 */
    padding-bottom: 0;
}

.replies-container {
    margin-left: 48px; /* 回复缩进 */
    margin-top: 12px;
    border-left: 2px solid #f0f0f0; /* 缩进线 */
    padding-left: 16px;
}

.reply-item {
     margin-bottom: 12px; /* 回复之间的间距 */
}
.reply-item:last-child {
     margin-bottom: 0;
}

.reply-to { /* "回复 @" 的样式 */
    font-size: 0.85em;
    color: #888;
    margin-bottom: 4px;
}

.comment-hint { /* 引用内容的样式 */
    background-color: #f5f5f5;
    border-left: 3px solid #ccc;
    padding: 6px 10px;
    margin-bottom: 8px;
    font-size: 0.9em;
    color: #555;
    border-radius: 3px;
}

.replying-indicator { /* "正在回复" 指示器样式 */
    font-size: 0.9em;
    color: #555;
    margin-bottom: 8px;
    background-color: #e6f7ff; /* 淡蓝色背景 */
    padding: 4px 8px;
    border-radius: 4px;
    display: flex;
    justify-content: space-between; /* 让 "取消回复" 按钮靠右 */
    align-items: center;
}

.comment-image-upload { /* 图片上传区域样式 */
    margin-top: 10px;
    display: flex;
    align-items: center;
    gap: 10px; /* 按钮和预览之间的间距 */
}

.image-preview img { /* 图片预览样式 */
    max-height: 50px; /* 限制预览图高度 */
    max-width: 100px; /* 限制预览图宽度 */
    border-radius: 4px;
    margin-right: 5px;
    vertical-align: middle; /* 垂直居中对齐 */
}
.image-preview { /* 预览区域容器样式 */
    display: inline-flex; /* 使用 inline-flex 优化对齐 */
    align-items: center;
    gap: 5px; /* 图片和移除按钮间距 */
    border: 1px solid #d9d9d9; /* 添加边框 */
    padding: 4px;
    border-radius: 4px;
}

/* 确保 Arco Design 图标大小合适 */
.arco-icon {
    vertical-align: middle; /* 图标与文字垂直对齐 */
    margin-right: 4px; /* 图标和文字间距 */
    font-size: 1em; /* 确保图标大小与文字一致 */
}
</style>