<template>
  <n-card>
    <n-form label-placement="top">
      <n-form-item label="待解码的 JWT" :feedback="validation.message" :validation-status="validation.status">
        <n-input
          v-model:value="rawJwt"
          type="textarea"
          :autosize="{ minRows: 4 }"
          placeholder="在此粘贴输入令牌..."
          spellcheck="false"
          style="font-family: monospace"
        />
      </n-form-item>
    </n-form>

    <n-space v-if="validation.isValid" justify="center" style="margin-bottom: 16px">
      <n-button secondary @click="copy">复制解析结果</n-button>
    </n-space>

    <n-table v-if="validation.isValid" :bordered="false">
      <tbody>
        <template v-for="section of sections" :key="section.key">
          <tr>
            <th colspan="2" class="table-header">{{ section.title }}</th>
          </tr>
          <tr v-for="{ claim, claimDescription, friendlyValue, value } in decodedJWT[section.key]" :key="claim + value">
            <td class="claims" style="width: 25%">
              <n-text strong>{{ claim }}</n-text>
              <template v-if="claimDescription">
                <div>
                  <n-text depth="3" style="font-size: 12px">{{ claimDescription }}</n-text>
                </div>
              </template>
            </td>
            <td>
              <span style="font-family: monospace; word-break: break-all; white-space: pre-wrap">{{ value }}</span>
              <template v-if="friendlyValue">
                <div>
                  <n-text depth="3" style="font-size: 12px">{{ friendlyValue }}</n-text>
                </div>
              </template>
            </td>
          </tr>
        </template>
      </tbody>
    </n-table>
  </n-card>
</template>

<script setup lang="ts">
import { useValidation } from '@/composable/validation';
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';
import { computed, ref } from 'vue';
import { useCopy } from '@/composable/copy';
import { decodeJwt } from './jwt-parser.service';

const rawJwt = ref(
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
);

const decodedJWT = computed(() =>
  withDefaultOnError(() => decodeJwt({ jwt: rawJwt.value }), { header: [], payload: [] }),
);

const sections = [
  { key: 'header', title: '头部' },
  { key: 'payload', title: '载荷' },
] as const;

const validation = useValidation({
  source: rawJwt,
  rules: [
    {
      validator: (value) => value.length > 0 && isNotThrowing(() => decodeJwt({ jwt: rawJwt.value })),
      message: '无效的 JWT',
    },
  ],
});

const serialized = computed(() => JSON.stringify(decodedJWT.value, null, 2));

const { copy } = useCopy({ source: serialized, text: '解析结果已复制到剪贴板' });
</script>

<style lang="less" scoped>
.table-header {
  text-align: center;
}
</style>
