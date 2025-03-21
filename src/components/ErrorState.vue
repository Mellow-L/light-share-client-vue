<template>
    <nut-empty v-if="$props.error" image="error" description="Error">
        <nut-cell>
            <nut-ellipsis :content="props.error"
                direction="end"
                expand-text="展开"
                rows="3"
                class="my-ellipsis"
                collapse-text="收起">
            </nut-ellipsis>
        </nut-cell>
        <nut-button type="primary" style="margin-top: 5px;"
            :loading="props.isLoading"
            @click="refreshFun">Refresh</nut-button>
    </nut-empty>
</template>
<script setup lang="js">
const props = defineProps({
    error:String,
    isLoading:Boolean,
})
const emits = defineEmits(["refreshFun"]);
function refreshFun(){
    emits("refreshFun");
}
</script>
<style scoped>
.my-ellipsis{
    overflow-wrap:break-word;
    word-wrap: break-word;
    white-space: pre-wrap;
}
</style>