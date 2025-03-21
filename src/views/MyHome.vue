<template>
    <keep-alive>
        <component :is="currentComponent"></component>
    </keep-alive>
    <nut-tabbar v-model="activeTab" @tab-switch="tabSwitch"
        unactive-color="#505050"
        bottom safe-area-inset-bottom placeholder>
        <nut-tabbar-item v-for="item in List"
            :key="item.name"
            :tab-title="item.title"
            :icon="item.icon"> 
        </nut-tabbar-item>
    </nut-tabbar>
</template>

<script setup lang="js">
import { Find, Home,Comment, My } from '@nutui/icons-vue'
import {h,onMounted,ref,shallowRef, watchEffect} from 'vue'
import AllArticles from './AllArticles.vue'
import MyArticles from './MyArticles.vue'
import MyComments from './MyComments.vue'
import MyProfile from './MyProfile.vue'
import { loginOnLaunch } from '@/utils/apiUtils'
import { gotoLogin } from '@/router/my-router'

const components = [
    AllArticles,
    MyArticles,
    MyComments,
    MyProfile,
]
const activeTab = ref(1)// 表示激活状态导航项的index
const currentComponent = shallowRef(components[activeTab.value])

const List = [
    {
        title:'所有文章',
        icon: h(Find),
        name:'find',
    },
    {
        title:'我的文章',
        icon: h(Home),
        name:'home',
    },
    {
        title:'我的评论',
        icon: h(Comment),
        name:'comment',
    },
    {
        title:'林怡然',
        icon: h(My),
        name:'my',
    },
]

const tabSwitch = (_, index)=>{
    console.log(index)
    currentComponent.value = components[index]
}

onMounted(()=>{
    tabSwitch(null,activeTab.value)
})
onMounted(()=>{
    loginOnLaunch().catch(e=>{
        console.log('loginOnLaunch',e)
        gotoLogin();
    })
})
watchEffect(()=>{
    currentComponent.value = components[activeTab.value]
})
</script>