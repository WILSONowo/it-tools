<template>
  <div>
    <n-space class="labels" item-style="flex: 1 1 0" w-full align="center">
      <div style="text-align: left">上一个</div>
      <div style="text-align: center">当前 OTP</div>
      <div style="text-align: right">下一个</div>
    </n-space>
    <n-input-group>
      <n-tooltip trigger="hover" placement="bottom">
        <template #trigger>
          <n-button data-test-id="previous-otp" secondary @click.prevent="copyPrevious(tokens.previous)">{{
            tokens.previous
          }}</n-button>
        </template>
        <div>{{ feedback(previousStatus, '复制上一个 OTP') }}</div>
      </n-tooltip>
      <n-tooltip trigger="hover" placement="bottom">
        <template #trigger>
          <n-button
            tertiary
            type="primary"
            data-test-id="current-otp"
            class="current-otp"
            @click.prevent="copyCurrent(tokens.current)"
          >
            {{ tokens.current }}
          </n-button>
        </template>
        <div>{{ feedback(currentStatus, '复制当前 OTP') }}</div>
      </n-tooltip>
      <n-tooltip trigger="hover" placement="bottom">
        <template #trigger>
          <n-button secondary data-test-id="next-otp" @click.prevent="copyNext(tokens.next)">{{
            tokens.next
          }}</n-button>
        </template>
        <div>{{ feedback(nextStatus, '复制下一个 OTP') }}</div>
      </n-tooltip>
    </n-input-group>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { useCopyFeedback } from '@/composable/copy';

const { copy: copyPrevious, status: previousStatus } = useCopyFeedback();
const { copy: copyCurrent, status: currentStatus } = useCopyFeedback();
const { copy: copyNext, status: nextStatus } = useCopyFeedback();
const feedback = (status: string, idleText: string) =>
  status === 'copied' ? '已复制!' : status === 'failed' ? '复制失败,请手动复制' : idleText;

const props = defineProps<{ tokens: { previous: string; current: string; next: string } }>();
const { tokens } = toRefs(props);
</script>

<style scoped lang="less">
.current-otp {
  font-size: 22px;
  flex: 1 0 35% !important;
}

.n-button {
  height: 45px;
}

.labels {
  div {
    text-align: center;
    padding: 0 2px 6px 2px;
    line-height: 1.25;
  }
}

.n-input-group > * {
  flex: 1 0 0;
}
</style>
