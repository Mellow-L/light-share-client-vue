<template>
  <div>
    <router-view v-slot="{Component}">
      <keep-alive include="MyHome,ShowArticle">
        <component :is="Component" :key="$route.path"></component>
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup lang="js">
import { onMounted, onUnmounted } from 'vue';
import { useCounterStore } from './stores/counter-store';

const counterStore = useCounterStore()
onMounted(()=>{
  counterStore.startTimer()
})
onUnmounted(()=>{
  counterStore.stopTimer()
})
</script>
