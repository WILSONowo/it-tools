<template>
  <div style="width: 100%">
    <n-card>
      <n-form label-placement="left" label-width="110" :show-feedback="false">
        <div v-for="{ name, elements } of sections" :key="name" style="margin-bottom: 24px">
          <n-text strong depth="2" style="display: block; margin-bottom: 10px">{{ name }}</n-text>

          <div v-for="{ key, type, label, placeholder, ...element } of elements" :key="key" class="field-row">
            <n-text class="field-label" style="font-size: 13px">{{ label }}</n-text>
            <div class="field-control">
              <n-input v-if="type === 'input'" v-model:value="metadata[key]" :placeholder="placeholder" />
              <n-dynamic-input
                v-else-if="type === 'input-multiple'"
                v-model:value="metadata[key]"
                :min="1"
                :placeholder="placeholder"
                :default-value="['']"
                :show-sort-button="true"
              />
              <n-select
                v-else-if="type === 'select'"
                v-model:value="metadata[key]"
                :placeholder="placeholder"
                :options="(element as OGSchemaTypeElementSelect).options"
              />
            </div>
          </div>
        </div>
      </n-form>

      <n-form-item label="meta 标签" label-placement="top" style="margin: 16px 0 0">
        <textarea-copyable :value="metaTags" language="html" />
      </n-form-item>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { generateMeta } from '@it-tools/oggen';
import _ from 'lodash';
import { computed, ref, watch } from 'vue';
import { image, ogSchemas, twitter, website } from './og-schemas';
import type { OGSchemaType, OGSchemaTypeElementSelect } from './OGSchemaType.type';

// Since type guards do not work in template
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const metadata = ref<{ type: string; [k: string]: any }>({
  type: 'website',
  'twitter:card': 'summary_large_image',
});

watch(
  () => ref(metadata.value.type),
  (_ignored, prevSection) => {
    const section = ogSchemas[prevSection.value];

    if (!section) return;

    section.elements.forEach(({ key }) => {
      metadata.value[key] = '';
    });
  },
);

const sections = computed(() => {
  const secs: OGSchemaType[] = [website, image, twitter];
  const additionalSchema = ogSchemas[metadata.value.type];

  if (additionalSchema) secs.push(additionalSchema);

  return secs;
});

const metaTags = computed(() => {
  const twitterMeta = _.chain(metadata.value)
    .pickBy((_value, k) => k.startsWith('twitter:'))
    .mapKeys((_value, k) => k.replace(/^twitter:/, ''))
    .value();

  const otherMeta = _.pickBy(metadata.value, (_value, k) => !k.startsWith('twitter:'));

  return generateMeta({ ...otherMeta, twitter: twitterMeta }, { generateTwitterCompatibleMeta: true });
});
</script>

<style lang="less" scoped>
.field-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  .field-label {
    flex: 0 0 110px;
    text-align: right;
  }

  .field-control {
    flex: 1 1 auto;
    min-width: 0;
  }
}

::v-deep(.n-dynamic-input-item) {
  margin-bottom: 5px;
}

.field-row {
  align-items: flex-start;

  .field-label {
    margin-top: 6px;
  }
}
</style>
