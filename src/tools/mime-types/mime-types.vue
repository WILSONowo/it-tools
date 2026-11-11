<template>
  <n-card>
    <n-h2 style="margin-bottom: 0">Mime 类型 → 文件扩展名</n-h2>
    <div style="opacity: 0.8">查看哪些文件扩展名与 mime 类型关联</div>
    <n-form label-placement="top">
      <n-form-item label="Mime 类型" style="margin: 12px 0 0">
        <n-select
          v-model:value="selectedMimeType"
          filterable
          :options="mimeToExtensionsOptions"
          size="large"
          placeholder="在此选择 mime 类型...(例如:application/pdf)"
        />
      </n-form-item>
    </n-form>

    <div v-if="extensionsFound.length > 0" class="result-row">
      <span class="result-text"
        >mime 类型为 <n-tag round :bordered="false">{{ selectedMimeType }}</n-tag> 的文件的扩展名:</span
      >
      <div class="result-tags">
        <n-tag
          v-for="extension of extensionsFound"
          :key="extension"
          round
          :bordered="false"
          type="primary"
          style="margin-right: 10px"
        >
          .{{ extension }}
        </n-tag>
      </div>
    </div>
  </n-card>

  <n-card>
    <n-h2 style="margin-bottom: 0">文件扩展名 → Mime 类型</n-h2>
    <div style="opacity: 0.8">查看哪些 mime 类型与文件扩展名关联</div>
    <n-form label-placement="top">
      <n-form-item label="文件扩展名" style="margin: 12px 0 0">
        <n-select
          v-model:value="selectedExtension"
          filterable
          :options="extensionToMimeTypeOptions"
          size="large"
          placeholder="在此选择文件扩展名...(例如:application/pdf)"
        />
      </n-form-item>
    </n-form>

    <div v-if="selectedExtension" class="result-row">
      <span class="result-text"
        >与扩展名 <n-tag round :bordered="false">{{ selectedExtension }}</n-tag> 关联的 mime 类型:</span
      >
      <div class="result-tags">
        <n-tag round :bordered="false" type="primary" style="margin-right: 10px">
          {{ mimeTypeFound }}
        </n-tag>
      </div>
    </div>
  </n-card>

  <n-card>
    <n-table :bordered="false">
      <thead>
        <tr>
          <th>Mime 类型</th>
          <th>扩展名</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="{ mimeType, extensions } of mimeInfos" :key="mimeType">
          <td style="width: 25%">{{ mimeType }}</td>
          <td>
            <n-tag v-for="extension of extensions" :key="extension" round :bordered="false" style="margin-right: 10px">
              .{{ extension }}
            </n-tag>
          </td>
        </tr>
      </tbody>
    </n-table>
  </n-card>
</template>

<script setup lang="ts">
import { types as extensionToMimeType, extensions as mimeTypeToExtension } from 'mime-types';
import { computed, ref } from 'vue';

const mimeInfos = Object.entries(mimeTypeToExtension).map(([mimeType, extensions]) => ({ mimeType, extensions }));

const mimeToExtensionsOptions = Object.keys(mimeTypeToExtension).map((label) => ({ label, value: label }));
const selectedMimeType = ref(undefined);

const extensionsFound = computed(() => (selectedMimeType.value ? mimeTypeToExtension[selectedMimeType.value] : []));

const extensionToMimeTypeOptions = Object.keys(extensionToMimeType).map((label) => {
  const extension = `.${label}`;

  return { label: extension, value: label };
});
const selectedExtension = ref(undefined);

const mimeTypeFound = computed(() => (selectedExtension.value ? extensionToMimeType[selectedExtension.value] : []));
</script>

<style lang="less" scoped>
.result-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 14px;

  .result-text {
    line-height: 24px;
    flex: 0 0 auto;
  }

  .result-tags {
    flex: 1 1 auto;
    display: flex;
    flex-wrap: wrap;
    row-gap: 6px;
  }
}
</style>
