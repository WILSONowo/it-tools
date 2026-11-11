<template>
  <n-card title="chmod 权限计算">
    <n-text depth="2" style="display: block; margin-bottom: 8px">权限位</n-text>
    <n-table :bordered="false" :bottom-bordered="false" single-column class="permission-table">
      <thead>
        <tr>
          <th class="text-center" scope="col"></th>
          <th class="text-center" scope="col">所有者 (u)</th>
          <th class="text-center" scope="col">用户组 (g)</th>
          <th class="text-center" scope="col">其他人 (o)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="{ scope, title } of scopes" :key="scope">
          <td class="line-header">{{ title }}</td>
          <td v-for="group of groups" :key="group" class="text-center">
            <!-- <n-switch v-model:value="permissions[group][scope]" /> -->
            <n-checkbox v-model:checked="permissions[group][scope]" size="large" />
          </td>
        </tr>
      </tbody>
    </n-table>

    <n-text depth="2" style="display: block; margin-bottom: 8px">八进制结果</n-text>
    <div class="octal-result">
      {{ octal }}
    </div>
    <input-copyable :value="`chmod ${octal} path`" readonly />
  </n-card>
</template>

<script setup lang="ts">
import { useThemeVars } from 'naive-ui';
import { computed, ref } from 'vue';
import { computeChmodOctalRepresentation } from './chmod-calculator.service';
import InputCopyable from '../../components/InputCopyable.vue';

import type { Group, Scope } from './chmod-calculator.types';

const themeVars = useThemeVars();

const scopes: { scope: Scope; title: string }[] = [
  { scope: 'read', title: '读 (4)' },
  { scope: 'write', title: '写 (2)' },
  { scope: 'execute', title: '执行 (1)' },
];
const groups: Group[] = ['owner', 'group', 'public'];

const permissions = ref({
  owner: { read: false, write: false, execute: false },
  group: { read: false, write: false, execute: false },
  public: { read: false, write: false, execute: false },
});

const octal = computed(() => computeChmodOctalRepresentation({ permissions: permissions.value }));
</script>

<style lang="less" scoped>
.octal-result {
  text-align: center;
  font-size: 50px;
  font-family: monospace;
  color: v-bind('themeVars.primaryColor');
  margin: 20px 0;
}
.permission-table {
  td,
  th {
    padding: 15px;

    @media screen and (max-width: 600px) {
      padding: 5px;
    }
  }
}
.line-header {
  font-weight: bold;
  text-align: right;
  max-width: 80px;
}
.text-center {
  text-align: center;
}
</style>
