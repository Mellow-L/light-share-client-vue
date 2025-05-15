<template>
   <a-list class="list-demo-action-layout"
    :bordered="false"
    :data="props.items">
        <template #item="{ item }">
            <a-list-item class="list-demo-item"
                action-layout="vertical">
                <template #actions>
                    <div class="list-actions">
                        <nut-row type="flex" justify="space-between">
                            <nut-col :span="8">
                                <span ><IconThumbUp></IconThumbUp>{{ item.star }}</span>
                            </nut-col>
                            <nut-col :span="8">
                                <span @click="gotoShowComment(item.id)">
                                    <icon-message></icon-message>{{ item.comment_count }}
                                </span>
                            </nut-col>
                            <nut-col :span="8">
                                <span @click="confirmDelete(item)">
                                    <icon-delete></icon-delete>
                                </span>
                            </nut-col>
                        </nut-row>
                    </div>
                </template>
                <template #extra>
                    <div class="image-area">
                        <img alt="arco-design" :src="imageBaseUrl+item.src"
                            @click="gotoShowArticle(item.id)">
                    </div>
                </template>
                <a-list-item-meta :title="getTitleMeta(item)"
                    :description="item.title"
                    @click="gotoShowArticle(item.id)">
                </a-list-item-meta>
            </a-list-item>
        </template>
        <template #empty>
            <a-empty></a-empty>
        </template>
   </a-list> 
</template>
<script setup lang="js">
import { gotoShowArticle, gotoShowComment } from '@/router/my-router';
import { imageBaseUrl } from '@/stores/basic-data';
import { apiDeleteItemById } from '@/utils/apiUtils';
import { formatDateTime } from '@/utils/formatUtils';
import { showDialog } from '@nutui/nutui';
import { reactive } from 'vue';
import {
    IconThumbUp,
    IconDelete,
    IconMessage
}from '@arco-design/web-vue/es/icon'
const props = defineProps({
    items:{
        type:Array,
        default:()=>[
            reactive({
                title:"",
                descriptions:"",
                src:"",
                price:0,
                vipPrice:0,
                content:"",
                id:0,
                modify_time:"",
                star:0,
                owner:{
                    name:"",
                    avatar:""
                },
                comment_count:0,
            }),
        ]
    }
})

const emits = defineEmits(['onRefresh'])
async function dealDelete(itemId) {
    console.log('dealDelete in ArticleList, itemId:',itemId);
    try {
        await apiDeleteItemById(itemId)
        emits('onRefresh', itemId)
    } catch (error) {
        console.error("Error deleting item in ArticleList:", error);
    }
}
function confirmDelete(item) {
    showDialog({
        title:item.title,
        content:"确定需要删除该项内容吗",
        onCancel,
        onOk:()=>{dealDelete(item.id)}
    })
}
const onCancel=()=>{
    console.log('onCancel');
}
function getTitleMeta(item){
    return item.owner.name + ' ' + formatDateTime(item.modify_time,true)
}
</script>
<style scoped>
.list-demo-action-layout .image-area{
    display: block;
    width: 45vw;
    align-content: center;
    justify-content: center;
    height: 119px;
    border-radius: 2px;
    overflow:hidden;
    margin:0 0 0 10px;
}
.list-demo-action-layout .image-area img{
    width: 100%;
}
.list-demo-action-layout .list-demo-item{
    padding: 20px 0;
    justify-content: center;
    justify-items: center;
    align-content: center;
    align-items:center;
    border-bottom: 1px solid var(--color-fill-3);
}
.list-demo-action-layout .arco-list-item-action .arco-icon{
    margin:0 4px;
}
.list-actions{
    width: 40vw;
}
</style>