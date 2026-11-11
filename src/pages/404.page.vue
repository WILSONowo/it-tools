<script setup lang="ts">
import { Coffee } from '@vicons/tabler';
import { useHead } from '@vueuse/head';

useHead({ title: '页面不存在 - 在线工具箱' });
</script>

<template>
  <div mt-20 flex flex-col items-center>
    <n-icon :component="Coffee" size="100" depth="3" />

    <n-h1 m-0 mt-3>404 页面未找到</n-h1>
    <n-text mt-4 block depth="3">抱歉,这个页面似乎不存在</n-text>
    <n-text mb-8 block depth="3">可能是缓存问题,试试强制刷新?</n-text>

    <router-link to="/" #="{ navigate, href }" custom>
      <n-button tag="a" :href="href" secondary @click="navigate"> 返回首页 </n-button>
    </router-link>
  </div>
</template>
