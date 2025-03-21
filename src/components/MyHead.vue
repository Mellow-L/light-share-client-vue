<template>
    <nut-navbar :title="props.title" left-show @click-back="gotoBack">
        <template #right>
            <slot name="right"></slot>
        </template>
        <template #title-icon>
            <slot name="title-icon"></slot>
        </template>
        <template #content>
            <slot name="content"></slot>
        </template>
    </nut-navbar>
</template>
<script setup lang="js">
import {gotoBack} from '@/router/my-router'
const props = defineProps({
    title: String,
})
</script>