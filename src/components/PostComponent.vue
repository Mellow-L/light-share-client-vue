<template>
   <nut-form>
        <nut-form-item label="文章标题">
            <nut-textarea v-model="formData.title"
                :rows="1" autosize
                :max-length="40">
            </nut-textarea>
        </nut-form-item>
        <nut-form-item label="简介">
            <nut-textarea v-model="formData.content"
                :rows="3" autosize
                :max-length="2000" limit-show>
            </nut-textarea>
        </nut-form-item>
        <nut-form-item label="封面图片">
            <image-uploader v-model:img-src="formData.src"/>
        </nut-form-item>
   </nut-form>

    <div v-for="(item) in sortedImgContents"
        :key="item.clientId || item.id" 
        class="image-content-item">
        
        <nut-textarea v-model="item.img_content" :rows="3" autosize
            :max-length="2000" limit-show/>
        <image-uploader v-model:img-src="item.url"
            @onSuccess="res=>onImgContentSuccess(item,res)">
        </image-uploader>
        
        <nut-space style="margin-top: 5px; margin-bottom: 15px;">
            <nut-button shape="square"
                size="small"
                type="info"
                @click="moveItem(item,'up')"
                :disabled="isFirstItem(item)">上移
            </nut-button>
            <nut-button shape="square"
                size="small"
                type="info"
                @click="moveItem(item,'down')"
                :disabled="isLastItem(item)">下移
            </nut-button>
            <nut-button shape="square"
                size="small"
                type="danger"
                @click="deleteImageByItemId(item)">删除
            </nut-button>
        </nut-space>
        <nut-divider v-if="!isLastItem(item)" style="margin-bottom: 10px;" />
    </div>

   <nut-space :gutter="20" style="margin-top: 10px;">
        <nut-button size="small" type="info"
            @click="addImageContent">添加内容</nut-button>
        <nut-button size="small" type="primary"
            @click="submitContent">提交</nut-button>
   </nut-space>
</template>

<script setup lang="js">
import { apiDeleteImageById, apiDeleteImageByPath, apiPostItemDetail } from '@/utils/apiUtils'
import { computed, reactive, ref } from 'vue'

const itemId = defineModel('itemId')
const formData = defineModel('formData')
const imgContents = defineModel('imgContents')

let nextClientId = -1; // Counter for new item client IDs

const sortedImgContents = computed(() => {
  return [...imgContents.value].sort((a, b) => a.order - b.order);
});
const emits = defineEmits(['onSubmit'])

function addImageContent(){
    let orderValue = 0
    if(imgContents.value.length > 0){
        orderValue = Math.max(...imgContents.value.map(item => item.order ?? -1))+1
    }
    let imgItem = reactive({
        name:"",
        url:"",
        img_content:"",
        order:orderValue,
        id:0, 
        clientId: nextClientId-- 
    })
    imgContents.value.push(imgItem)
}

function moveItem(item, direction) {
  const currentOrder = item.order;
  const targetOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;
  const targetItem = imgContents.value.find(i => i.order === targetOrder);
  
  if (targetItem) {
    item.order = targetOrder;
    targetItem.order = currentOrder;
    // Force reactivity for the array if direct order mutation isn't enough for v-for re-render
    // imgContents.value = [...imgContents.value]; 
  }
}

function isFirstItem(item) {
  if (imgContents.value.length <= 1) return true;
  const orders = imgContents.value.map(i => i.order);
  const minOrder = Math.min(...orders);
  return item.order === minOrder;
}

function isLastItem(item) {
  if (imgContents.value.length <= 1) return true;
  const orders = imgContents.value.map(i => i.order);
  const maxOrder = Math.max(...orders);
  return item.order === maxOrder;
}
async function deleteImageByItemId(item){
    const itemToDelete = imgContents.value.find(contentItem => (contentItem.clientId || contentItem.id) === (item.clientId || item.id));
    if (!itemToDelete) return;

    const index = imgContents.value.indexOf(itemToDelete);

    if(itemToDelete.id > 0){ // Existing item from backend
        await apiDeleteImageById(itemToDelete.id)
    } else { // New item not yet saved to backend
        if(itemToDelete.url){ // If it has an uploaded image, delete it from server
            await apiDeleteImageByPath(itemToDelete.url)
        }
    }
    if (index > -1) {
        imgContents.value.splice(index,1)
    }
}
async function onImgContentSuccess(item, resUrl) { // Changed resObj to resUrl for clarity
    // Assuming resUrl is the direct URL string of the uploaded image
    // The image-uploader component should emit the final URL/path
    // item.name might not be relevant here if resUrl is just a path/URL
    // If the server response for image upload contains a 'name', adjust accordingly.
    console.log("Image content success, URL:", resUrl, "for item:", item);
}
async function submitContent() {
    // Ensure order is up-to-date before submitting, though sortedImgContents should reflect it
    // imgContents.value = sortedImgContents.value; 
    // The above line might not be necessary if mutations to order directly trigger re-sort in computed prop
    console.log("Submitting imgContents:", imgContents.value); 
    let id = await apiPostItemDetail(itemId,formData.value,imgContents.value)
    console.log(submitContent.name,'id',id);
    emits('onSubmit',id)
}
</script>

<style scoped>
.image-content-item {
  border: 1px solid #eee;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}
</style>