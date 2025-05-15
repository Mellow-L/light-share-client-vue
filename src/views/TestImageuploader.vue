<template>
  <div style="margin-bottom: 10px">
    <nut-button @click="gotoLogin">登录</nut-button>
  </div>
  <div>
    <nut-image :src="absoluteSrc" width="100" height="100"  ></nut-image>
    <a :href="absoluteSrc">跳转</a>
  </div>
  <div>
    <span>压缩图片</span>
    <nut-switch v-model="isCompression" active-color="skyblue"
                active-text="是" inactive-text="否">
    </nut-switch>
  </div>
  <div style="margin-bottom: 10px">
    <ImageUploader :need-compression="isCompression"
                   :max-width-or-height="1024"
                   v-model:img-src="src">
    </ImageUploader>
  </div>
</template>

<script setup lang="js">
import {imageBaseUrl} from "@/stores/basic-data";
import {computed, ref} from "vue";
import {gotoLogin} from "@/router/my-router";
import ImageUploader from "@/components/ImageUploader.vue";

const isCompression = ref(false)
//const src= ref("")
const src= ref()
const absoluteSrc = computed(()=>imageBaseUrl + src.value)
</script>

<style scoped>

</style>