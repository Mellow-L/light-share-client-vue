<template>
    <a-card :style="{width:'96vw'}">
        <template #actions v-if="props.showMessage">
            <span class="icon-hover" @click="onClickStar">
              <IconThumbUp/>{{props.star}}
            </span>
          <span class="icon-hover" @click="onClickComment">
              <IconMessage/>{{props.comment_count}}
            </span>
          <span class="icon-hover" @click="onClickMore">
              <IconMore/>
            </span>
        </template>
        <template #cover>
          <div class="cover">
            <img class="cover-img"
                 alt="cover"
                 @click="onClickItem"
                 :src="imageSrc"
            />
          </div>
        </template>
        <a-card-meta :title="props.title" :description="props.owner.name">
          <template #avatar>
            <div class="avatar" @click="onClickUser">
              <a-avatar :size="24" :style="{marginRight:'8px'}" >
                <img :alt="avatarAlter" :src="avatarSrc"/>
              </a-avatar>
              <a-typography-text>{{ modify_time }}</a-typography-text>
            </div>
          </template>
        </a-card-meta>
    </a-card>
</template>

<script setup lang="js">
import { imageBaseUrl } from "@/stores/basic-data";
import { formatDateTime } from "@/utils/formatUtils";
import {
    IconThumbUp,
    IconMessage,
    IconMore,
} from "@arco-design/web-vue/es/icon";
import { computed, onMounted } from "vue";

const props = defineProps({
  src:String,
  title:String,
  description:String,
  star:Number,
  id:Number,
  modify_time:String,
  comment_count:Number,
  showMessage:{
    type:Boolean,
    default(){
      return true
    }
  },
  owner:{
    type:Object,
    default(){
      return{
        name:"",
        avatar:"",
      }
    }
  }
})
console.log("子组件收到的props",props);

const modify_time = computed(()=>{
  return formatDateTime(props.modify_time, true)
})

const emit = defineEmits(['onClickStar','onClickMoreActions','onClickItem','onClickComment','onClickUser'])

const onClickStar = () => {
  emit('onClickStar',props.id)
}
const onClickMore = () => {
  emit('onClickStar',props.id)
}
const onClickItem= () => {
  emit('onClickItem',props.id)
}
// const onClickMessage = () => {
//   emit('onClickMessage',props.id)
// }
const onClickComment = () => {
  emit('onClickComment',props.id)
}
const onClickUser = () =>{
  emit('onClickUser',props.owner.name)
}
const avatarAlter = computed(()=>{
  return props.owner?.name ? props.owner.name:''
})
const avatarSrc = computed(()=>{
  return imageBaseUrl + props.owner.avatar
})
const imageSrc = computed(()=>{
  return imageBaseUrl + props.src
})

onMounted(()=>{
  console.log("Mycard",props)
})
</script>

<style scoped>
.icon-hover{
  display: flex;
  align-items: center;
  justify-content:center;
  width: 48px;
  height: 24px;
  border-radius: 50%;
  transition: all 0.1s;
}
.icon-hover:hover{
  background-color: rgb(var(--gray-2));
}
.cover{
  height: 204px;
  overflow:hidden;
  justify-content: center;
  display: flex;
}
.cover-img{
  width: 92%;
  transform: translateY(10px);
  margin: auto;
}
.avatar{
  display: flex;
  align-self:center;
}
</style>