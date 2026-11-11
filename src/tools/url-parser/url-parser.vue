<template>
  <n-card>
    <n-form-item label="待解析的 URL：" :feedback="validation.message" :validation-status="validation.status">
      <n-input v-model:value="urlToParse" placeholder="待解析的 URL..." />
    </n-form-item>

    <n-divider style="margin-top: 0" />

    <n-form>
      <n-input-group v-for="{ title, key } in properties" :key="key">
        <n-input-group-label style="flex: 0 0 120px"> {{ title }}: </n-input-group-label>
        <input-copyable :value="(urlParsed?.[key] as string) ?? ''" readonly placeholder=" " />
      </n-input-group>

      <n-input-group v-for="([k, v], index) in queryEntries" :key="index">
        <n-input-group-label style="flex: 0 0 120px">
          <n-icon :component="SubdirectoryArrowRightRound" />
        </n-input-group-label>
        <input-copyable :value="k" readonly />
        <input-copyable :value="v" readonly />
      </n-input-group>

      <n-input-group>
        <n-input-group-label style="flex: 0 0 120px"> 锚点 (hash): </n-input-group-label>
        <input-copyable :value="urlParsed?.hash ?? ''" readonly placeholder=" " />
      </n-input-group>
    </n-form>
  </n-card>
</template>

<script setup lang="ts">
import { useValidation } from '@/composable/validation';
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';
import { SubdirectoryArrowRightRound } from '@vicons/material';
import { computed, ref } from 'vue';
import InputCopyable from '../../components/InputCopyable.vue';

const urlToParse = ref('https://me:pwd@it-tools.tech:3000/url-parser?key1=value&key2=value2#the-hash');

const urlParsed = computed(() => withDefaultOnError(() => new URL(urlToParse.value), undefined));
// Use the entries (not an object) so repeated keys such as ?a=1&a=2 are all shown
const queryEntries = computed(() => (urlParsed.value ? [...urlParsed.value.searchParams.entries()] : []));

const validation = useValidation({
  source: urlToParse,
  rules: [
    {
      validator: (value) => isNotThrowing(() => new URL(value)),
      message: '无效的 URL',
    },
  ],
});

const properties: { title: string; key: keyof URL }[] = [
  { title: '协议', key: 'protocol' },
  { title: '用户名', key: 'username' },
  { title: '密码', key: 'password' },
  { title: '主机名', key: 'hostname' },
  { title: '端口', key: 'port' },
  { title: '路径', key: 'pathname' },
  { title: '参数', key: 'search' },
];
</script>

<style lang="less" scoped>
.n-input-group-label {
  text-align: right;
}
.n-input-group {
  margin: 2px 0;
}
</style>
