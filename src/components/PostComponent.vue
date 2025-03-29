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
   <nut-swipe-group>
        <nut-swipe v-for="(item) in sortedImgContents"
            :key="item.order"
            :name="item.order">
                <nut-textarea v-model="item.img_content" :rows="3" autosize
                    :max-length="2000" limit-show/>
                <image-uploader v-model:img-src="item.url"
                    @onSuccess="res=>onImgContentSuccess(item,res)">
                </image-uploader>
                <template #right>
                    <nut-button shape="square"
                        style="height: 100%"
                        type="info"
                        @click="moveItem(item,'up')"
                        :disabled="isFirstItem(item)">上移
                    </nut-button>
                    <nut-button shape="square"
                        style="height: 100%"
                        type="info"
                        @click="moveItem(item,'down')"
                        :disabled="isLastItem(item)">下移
                    </nut-button>
                    <nut-button shape="square"
                        style="height: 100%"
                        type="danger"
                        @click="deleteImageByItemId(item)">删除
                    </nut-button>
                </template>
        </nut-swipe>
   </nut-swipe-group>
   <nut-space :gutter="20" style="margin-top: 10px;">
        <nut-button size="small" type="info"
            @click="addImageContent">添加内容</nut-button>
        <nut-button size="small" type="primary"
            @click="submitContent">提交</nut-button>
   </nut-space>
</template>

<script setup lang="js">
import { apiDeleteImageById, apiDeleteImageByPath, apiPostItemDetail } from '@/utils/apiUtils'
import { computed, reactive } from 'vue'

const itemId = defineModel('itemId')
const formData = defineModel('formData')
const imgContents = defineModel('imgContents')

const sortedImgContents = computed(() => {
  return [...imgContents.value].sort((a, b) => a.order - b.order);
});
const emits = defineEmits(['onSubmit'])

function addImageContent(){
    // 取最后一个元素
    let orderValue = 0// 默认为0
    if(imgContents.value.length > 0){
        // 存在图文项，多项则找到最大order值+1
        // 若仅一项则从-1+1=0开始
        orderValue = Math.max(...imgContents.value.map(item => item.order ?? -1))+1
    }
    // NOTE: js中0被认为是false，用？判断时导致新增选段order为0.更正.
    let imgItem = reactive({
        name:"",
        url:"",
        img_content:"",
        order:orderValue,
        id:0
    })
    imgContents.value.push(imgItem)    
    console.log(addImageContent.name,'sortedImgContents',sortedImgContents.value);
}

function moveItem(item, direction) {
  console.log("移动操作触发");
  const currentOrder = item.order;
  const targetOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;

  const targetItem = imgContents.value.find(i => i.order === targetOrder);
  
  if (targetItem) {
    item.order = targetOrder;
    targetItem.order = currentOrder;
    imgContents.value = [...imgContents.value];
  }
}

function isFirstItem(item) {
  const orders = imgContents.value.map(i => i.order);
  const minOrder = Math.min(...orders);
  return item.order === minOrder;
}

function isLastItem(item) {
  const orders = imgContents.value.map(i => i.order);
  const maxOrder = Math.max(...orders);
  return item.order === maxOrder;
}
async function deleteImageByItemId(item){
    let index = imgContents.value.indexOf(item)
    if(item.id > 0){
        await apiDeleteImageById(item.id)
    }else{
        if(item?.url){
            await apiDeleteImageByPath(item.url)
        }
    }
    imgContents.value.splice(index,1)
}
async function onImgContentSuccess(item, resObj) {
    item.name = resObj.name
}
async function submitContent() {
    imgContents.value = sortedImgContents.value
    console.log(imgContents.value); 
    let id = await apiPostItemDetail(itemId,formData.value,imgContents.value)
    console.log(submitContent.name,'id',id);
    emits('onSubmit',id)
}
</script>

<style scoped>

</style>