<template>
    <nut-navbar title="参数设置" left-show @click-back="gotoBack"></nut-navbar>
    
    <nut-cell title="开启评论自动刷新">
        <template #desc>
            <nut-switch v-model="commentCounterStatus"
                active-color="deepskyblue"
                @change="statusChange"/>
        </template>
    </nut-cell>

    <nut-cell :title="counterRef.commentCounter" desc="当前评论计数器值"></nut-cell>
    
    <nut-cell title="开启文章自动刷新">
        <template #desc>
            <nut-switch v-model="articleCounterStatus"
                active-color="deepskyblue"
                @change="statusChange"/>
        </template>
    </nut-cell>

    <nut-cell :title="counterRef.articleCounter" desc="当前文章计数器值"></nut-cell>

    <nut-cell title="设置刷新间隔(ms)">
        <template #desc>
            <nut-input-number v-model="rangeVal" :max="20000" :min="100"
            :step="100" @change="intervalChange"/>
        </template>
    </nut-cell>
</template>

<script setup lang="js">
import { gotoBack } from '@/router/my-router';
import { useCounterStore } from '@/stores/counter-store';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

const counterStore = useCounterStore()
const counterRef = storeToRefs(counterStore)

// 1. 这里存在双重包装的问题，创建了与原始store状态脱节的副本
// 2. ".value"的探讨
const rangeVal = ref(counterStore.interval)
//const rangeVal = counterStore.interval
const articleCounterStatus = ref(counterStore.articleCounterEnabled)
const commentCounterStatus = ref(counterStore.commentCounterEnabled)
// const articleCounterStatus = counterRef.articleCounterEnabled
// const commentCounterStatus = counterRef.commentCounterEnabled

function statusChange(){
    counterStore.setCommentCounterEnabled(commentCounterStatus.value)
    counterStore.setArticleCounterEnabled(articleCounterStatus.value)
}
function intervalChange(){
    counterStore.setInterval(rangeVal.value)
}
</script>

