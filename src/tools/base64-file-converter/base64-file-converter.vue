<template>
  <n-grid y-gap="16" cols="1 800:2" x-gap="16" responsive="screen" style="align-items: start">
    <n-gi>
      <n-card title="Base64 转文件">
        <n-form label-placement="top">
          <n-form-item :feedback="base64InputValidation.message" :validation-status="base64InputValidation.status">
            <n-input
              v-model:value="base64Input"
              type="textarea"
              placeholder="在此粘贴文件的 Base64 字符串..."
              :autosize="{ minRows: 10 }"
              spellcheck="false"
              style="font-family: monospace; font-size: 13px"
            />
          </n-form-item>
        </n-form>
        <n-space justify="center" style="margin-top: 20px">
          <n-button
            type="primary"
            :disabled="base64Input === '' || !base64InputValidation.isValid"
            @click="downloadFile()"
          >
            下载文件
          </n-button>
        </n-space>
      </n-card>
    </n-gi>
    <n-gi>
      <n-card title="文件转 Base64">
        <n-form label-placement="top">
          <n-form-item label="选择文件">
            <n-upload
              v-model:file-list="fileList"
              :show-file-list="true"
              :on-before-upload="onUpload"
              list-type="image"
              style="width: 100%"
            >
              <n-upload-dragger>
                <div mb-2>
                  <n-icon size="35" :depth="3" :component="Upload" />
                </div>
                <n-text style="font-size: 14px"> 点击或将文件拖拽到此处上传 </n-text>
              </n-upload-dragger>
            </n-upload>
          </n-form-item>
          <n-form-item label="文件的 Base64" label-placement="top">
            <n-input
              :value="fileBase64"
              type="textarea"
              readonly
              placeholder="文件的 Base64 将显示在这里"
              :autosize="{ minRows: 5 }"
              spellcheck="false"
              style="font-family: monospace; font-size: 13px"
            />
          </n-form-item>
        </n-form>
        <n-space justify="center" style="margin-top: 16px">
          <n-button secondary @click="copyFileBase64()">复制</n-button>
        </n-space>
      </n-card>
    </n-gi>
  </n-grid>
</template>

<script setup lang="ts">
import { useCopy } from '@/composable/copy';
import { useDownloadFileFromBase64 } from '@/composable/downloadBase64';
import { useValidation } from '@/composable/validation';
import { isValidBase64 } from '@/utils/base64';
import { Upload } from '@vicons/tabler';
import { useBase64 } from '@vueuse/core';
import type { UploadFileInfo } from 'naive-ui';
import { ref, type Ref } from 'vue';

const base64Input = ref('');
const { download } = useDownloadFileFromBase64({ source: base64Input });
const base64InputValidation = useValidation({
  source: base64Input,
  rules: [
    {
      message: '无效的 Base64 字符串',
      validator: (value) => isValidBase64(value.trim()),
    },
  ],
});

function downloadFile() {
  if (!base64InputValidation.isValid) return;

  try {
    download();
  } catch (_) {
    //
  }
}

const fileList = ref();
const fileInput = ref() as Ref<File>;
const { base64: fileBase64 } = useBase64(fileInput);
const { copy: copyFileBase64 } = useCopy({ source: fileBase64, text: 'Base64 字符串已复制到剪贴板' });

async function onUpload({ file: { file } }: { file: UploadFileInfo }) {
  if (file) {
    fileList.value = [];
    fileInput.value = file;
  }
}
</script>
