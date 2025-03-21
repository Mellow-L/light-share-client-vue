<template>
    <nut-uploader :url="props.url" name="file"
      v-if="props.needCompression" :headers="headToken"
      v-model:file-list="defaultFileList"
      @success="onImgSuccess"
      @delete="deleteImageByFileName"

      list-type="list"
      :before-upload="beforeUpload">
      <nut-button type="info" size="small"
      v-if="defaultFileList.length === 0">上传图片</nut-button>
    </nut-uploader>
    <nut-uploader :url="props.url" name="file"
                  v-else :headers="headToken"
                  v-model:file-list="defaultFileList"
                  @success="onImgSuccess"
                  @delete="deleteImageByFileName">
    </nut-uploader>
<!--  </div>-->

</template>

<script setup lang="js">
// import {gotoLogin} from "@/router/my-router";
import {imageBaseUrl, imgUploadUrl} from "@/stores/basic-data";
import {useUserStore} from "@/stores/user";
import {reactive, watchEffect} from "vue";
import {showFail, showSuccess} from "@/utils/showMessage";

import imageCompression from "browser-image-compression";
import {apiDeleteImageByPath} from "@/utils/apiUtils";

const userStore = useUserStore()
const headToken = {authorization: userStore.token}

const props = defineProps({
  needCompression:{
    type:Boolean,
    default:false,
  },
  maxWidthOrHeight:{
    type:Number,
    default:800,
  },
  url:{
    type:String,
    default:imgUploadUrl,
  },
})

const imgSrc = defineModel('imgSrc',{required:true})
const emit = defineEmits(['onSuccess','onDelete'])
// const needCompression = ref(props.needCompression)
// watch(needCompression, (newValue) => {
//   emit('update:needCompression', newValue);
// });
const CompressOptions = {
  maxSizeMB: 1,
  maxWidthOrWeight: props.maxWidthOrHeight,
  useWebWorker:true,
}
//const absoluteSrc = computed(()=>imageBaseUrl+imgSrc.value)
const defaultFileList = reactive([
  {
    url: imageBaseUrl+imgSrc.value,
    status:'success',
    type:'image',
    name:imgSrc.value,
  }
])
watchEffect(()=>{
  if(imgSrc.value){
    if(defaultFileList.length === 0){
      defaultFileList.push({
        url:imageBaseUrl +imgSrc.value,
        status:'success',
        type:'image',
        name:imgSrc.value,
      })
    }else{
      defaultFileList[0] = {
        url:imageBaseUrl + imgSrc.value,
        status:'success',
        type:'image',
        name:imgSrc.value,
      }
    }
  }else{
    defaultFileList.shift()
  }
})
const beforeUpload = async(files)=>{
  let file = files[0]
  let fileName = file.name
  try{
    let blob = await imageCompression(file, CompressOptions)
    let f = new File([blob], fileName)
    return [f]
  }catch (e) {
    showFail('图片压缩失败',e)
    return []
  }
}
async function deleteImageByFileName(){
  let path = imgSrc.value
  let res = await apiDeleteImageByPath(path)
  if(res){
    showSuccess(deleteImageByFileName.name, res)
    imgSrc.value = ''
    emit('onDelete')
  }
}
//这里注意response的类别，检查中查看
const onImgSuccess = ((response)=>{
  //console.log(responseText)
  showSuccess(onImgSuccess.name, response)
  let resObj;
  try {
    resObj = JSON.parse(response.responseText);
    console.log("解析后的resObj.src:", resObj.src);
  } catch (error) {
    showFail("JSON解析失败", error);
    return;
  }
  imgSrc.value = resObj.src;
  emit('onSuccess',resObj.src)
})
</script>

<style scoped>

</style>