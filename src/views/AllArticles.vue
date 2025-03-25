<template>
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
    <div v-if="allList" class="center">
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
                        @onClickComment="gotoShowComment(item.id)"></MyCard>
                </nut-pull-refresh>
            </nut-space>
            <nut-space v-else
                direction="vertical" align="center" fill>
                <MyCard v-for="item in list" :key="item.id" v-bind="item"
                    @onClickStar="(id)=>clickStar(id)"
                    @onClickComment="gotoShowComment(item.id)"></MyCard>
            </nut-space>
        </nut-infinite-loading>   
    </div>
</template>
<script setup lang="js">
import { ref,watch,computed,onActivated } from 'vue';
import MyCard from "@/components/MyCard"
import { useCounterStore } from '@/stores/counter-store';
import { storeToRefs } from 'pinia';
import { useScrollPos } from '@/utils/scrollUtils';
import {apiAddItemStar, apiGetAllItemsRefresh} from '@/utils/apiUtils'
import{gotoShowComment} from '@/router/my-router'
import { useStarStore } from '@/stores/star-store';

const counterStore = useCounterStore()
const counterRefObj = storeToRefs(counterStore)

// 1. 双重包装的问题，创建了与原始store状态脱节的副本
// 2. ".value"的探讨

const counterRef = ref(counterRefObj.articleCounter.value)
//const counterRef = counterRefObj.articleCounterEnabled
const counterEnableRef = ref(counterRefObj.articleCounterEnabled)
//const counterEnableRef = counterRefObj.articleCounterEnabled

const hasMore = ref(true)
const currentPage = ref(0)
const PAGE_SIZE = 5
const q = computed(()=>{
    let offset = 0
    return `skip=${offset}&limit=${PAGE_SIZE*(currentPage.value+1)}`
})
const allList = ref(new Map())

const{list, error, isLoading} = apiGetAllItemsRefresh(counterRef,q)

function refreshFun(){
    counterRef.value++
    // counterStore.incrementArticleCounter()
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

async function clickStar(id){
    const starStore = useStarStore()
    if(!starStore.canStar(id)){
        alert("每天只能点赞一次")
        return
    }
    let data = await apiAddItemStar(id)
    if(data){
        refreshFun()
    }
}
onActivated(()=>{
    refreshFun()
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