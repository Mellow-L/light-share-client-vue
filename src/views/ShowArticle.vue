<template>
  <MyHead :title="formData.title">
    <template #right>
        <div v-if="isAuthor">
            <Edit v-if="!showEditContent" @click="setToEdit"
                color="black"></Edit>
            <Eye type="primary" v-else @click="setToPreview"
                color="black"></Eye>
        </div>
    </template>
  </MyHead>
  <ErrorState v-if="error" :error="error"
    :is-loading="isLoading"
    @refreshFun="refreshItem">
    </ErrorState>
    <div class="main-body">
        <div class="layout-demo" v-if="!showEditContent">
            <a-typography>
                <a-typography-title :heading="3">
                    {{ formData.title }}
                </a-typography-title>
                <a-typography-title :heading="5">
                    By {{ owner.name }}
                </a-typography-title>
                <a-typography-title :heading="6">
                  更新时间  {{ modify_time}}
                </a-typography-title>
                <a-typography-paragraph>
                    <pre class="text-style">{{ formData.content }}</pre>
                </a-typography-paragraph>
                <a-image :src="getAbsoluteImageSrc(formData.src)"
                    width="100%" :title="formData.title"
                    :description="'@' + owner.name"
                    v-if="formData.src"></a-image>
            </a-typography>
            <div v-for="(item) in sortedImgContents" :key="item.order">
                <pre class="text-style">{{ item.img_content }}</pre>
                <a-image :src="getAbsoluteImageSrc(item.url)"
                    width="100%" v-if="item.url"></a-image>
            </div>
            <nut-cell title="去评论"
                @click="gotoShowComment(routeId)">
                <template #desc>
                    <span style="color:black;">
                        <IconMessage></IconMessage>{{ commentCount }}
                    </span>
                </template>
            </nut-cell>
        </div>
    </div>
    <div class="layout-edit" v-if="showEditContent">
        <post-component v-model:form-data="formData"
            v-model:item-id="itemId"
            v-model:img-contents="imgContents"
            @onSubmit="onSubmitArticle">
        </post-component>
    </div>
</template>

<script setup lang="js">
import MyHead from '@/components/MyHead.vue';
import { gotoShowComment } from '@/router/my-router';
import { imageBaseUrl } from '@/stores/basic-data';
import { useUserStore } from '@/stores/user';
import { apiGetItemById, apiPostItemDetail } from '@/utils/apiUtils';
import { formatDateTime } from '@/utils/formatUtils';
import { computed, onActivated, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import {Edit,Eye} from '@nutui/icons-vue'
const route = useRoute()
const routeId = Number(route.params.id)
const itemId = ref(routeId)
const refreshCount = ref(1)
const userStore = useUserStore()
const formData = ref({
    title:"",
    description:"",
    price:0,
    vipPrice:0,
    content:"",
    src:"",
    id:routeId,
})
const modify_time = ref("")
const commentCount = ref(0)
const owner = reactive({
    owner_id:"",
    name:"",
    avatar:""
})
const imgContents = ref([reactive({
    name:"",
    url:"",
    img_content:"",
    order:0,
    id: routeId
})])
const sortedImgContents = computed(() => {
  return [...imgContents.value].sort((a, b) => a.order - b.order);
});
const isAuthor = ref(false)
const {itemData,error,isLoading} = apiGetItemById(routeId,refreshCount)

function updateItemData(){
    if(itemData.value){
        formData.value.title = itemData.value.title
        formData.value.description = itemData.value.description
        formData.value.price = itemData.value.price
        formData.value.src = itemData.value.src
        formData.value.id = itemData.value.id
        formData.value.vipPrice = itemData.value.vipPrice
        formData.value.content = itemData.value.content
        commentCount.value = itemData.value.comment_count
        modify_time.value = formatDateTime(itemData.value.modify_time)
        owner.owner_id = itemData.value.owner_id
        owner.name = itemData.value.owner.name
        owner.avatar = imageBaseUrl + itemData.value.owner.avatar
        isAuthor.value = (itemData.value.owner_id == userStore.uuid)
        imgContents.value = itemData.value.images.map(img => reactive(img))
    }
}

updateItemData()
watch(itemData,()=>{
    console.log('watch itemData',itemData);
    updateItemData()
})
const showEditContent = ref(false)
function getAbsoluteImageSrc(src){
    return imageBaseUrl + src
}
function refreshItem(){
    refreshCount.value ++
}
function setToEdit(){
    showEditContent.value = true
}
async function setToPreview(){
    if(showEditContent.value){
        await apiPostItemDetail(itemId,formData.value,imgContents.value)
        refreshItem()
    }
    showEditContent.value = false
}
function onSubmitArticle(){
    refreshItem()
    setToPreview()
}
onActivated(()=>{
    refreshItem()
})
</script>

<style>
.main-body{
    display: flex;
    flex-direction:column;
    justify-content:center;
    justify-items:center;
    width: 90%;
    margin: auto;
}
.layout-demo{
    display: flex;
    flex-direction:column;
    justify-content:center;
    font-size:16px;
    font-stretch:condensed;
    text-align:left;
    width: 100%;
}
.layout-edit{
    display: flex;
    flex-direction:column;
    justify-content:center;
    font-size:16px;
    font-stretch:condensed;
    text-align:left;
}
.text-style{
    white-space: pre-wrap;
    overflow-wrap: break-word;
    text-indent:0em;
    line-height: 1.5;
}
</style>