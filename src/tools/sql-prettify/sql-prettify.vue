<template>
  <div style="flex: 0 0 100%">
    <n-form label-placement="left" label-width="110" :show-feedback="false" style="max-width: 720px; margin: 0 auto">
      <n-space item-style="flex:1 1 0" :vertical="styleStore.isSmallScreen">
        <n-form-item label="方言">
          <n-select
            v-model:value="config.language"
            :options="[
              { label: 'GCP BigQuery', value: 'bigquery' },
              { label: 'IBM DB2', value: 'db2' },
              { label: 'Apache Hive', value: 'hive' },
              { label: 'MariaDB', value: 'mariadb' },
              { label: 'MySQL', value: 'mysql' },
              { label: 'Couchbase N1QL', value: 'n1ql' },
              { label: 'Oracle PL/SQL', value: 'plsql' },
              { label: 'PostgreSQL', value: 'postgresql' },
              { label: 'Amazon Redshift', value: 'redshift' },
              { label: 'Spark', value: 'spark' },
              { label: 'Standard SQL', value: 'sql' },
              { label: 'sqlite', value: 'sqlite' },
              { label: 'SQL Server Transact-SQL', value: 'tsql' },
            ]"
          />
        </n-form-item>
        <n-form-item label="关键字大小写">
          <n-select
            v-model:value="config.keywordCase"
            :options="[
              { label: '大写', value: 'upper' },
              { label: '小写', value: 'lower' },
              { label: '保留原样', value: 'preserve' },
            ]"
          />
        </n-form-item>
        <n-form-item label="缩进样式">
          <n-select
            v-model:value="config.indentStyle"
            :options="[
              { label: '标准', value: 'standard' },
              { label: '左对齐制表', value: 'tabularLeft' },
              { label: '右对齐制表', value: 'tabularRight' },
            ]"
          />
        </n-form-item>
      </n-space>

      <n-form-item label="SQL 查询">
        <n-input
          ref="inputElement"
          v-model:value="rawSQL"
          placeholder="在此输入 SQL 查询..."
          type="textarea"
          rows="14"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          style="font-family: 'Consolas', monospace; font-size: 14px"
        />
      </n-form-item>
      <n-form-item label="格式化结果" :show-feedback="false">
        <textarea-copyable :value="prettySQL" language="sql" :follow-height-of="inputElement" />
      </n-form-item>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { useStyleStore } from '@/stores/style.store';
import { format as formatSQL, type FormatFnOptions } from 'sql-formatter';
import { computed, reactive, ref } from 'vue';

const inputElement = ref<HTMLElement>();
const styleStore = useStyleStore();
const config = reactive<Partial<FormatFnOptions>>({
  keywordCase: 'upper',
  useTabs: false,
  language: 'sql',
  indentStyle: 'standard',
  tabulateAlias: true,
});

const rawSQL = ref('select field1,field2,field3 from my_table where my_condition;');
const prettySQL = computed(() => formatSQL(rawSQL.value, config));
</script>

<style lang="less" scoped></style>
