<script setup lang="ts">
import { useTracker } from '@/modules/tracker/tracker.services';
import { useHead } from '@vueuse/head';

useHead({ title: '关于 - IT-Tools' });
const { tracker } = useTracker();
</script>

<template>
  <div class="about-page">
    <n-h1>关于</n-h1>
    <n-p>
      这个网站由
      <n-button text tag="a" href="https://github.com/CorentinTh" target="_blank" rel="noopener" type="primary">
        Corentin Thomasset
      </n-button>
      用爱开发,汇集了对开发者与 IT
      从业者有用的工具。如果它对你有帮助,欢迎分享给可能需要的人,别忘了把它固定到浏览器快捷栏!
    </n-p>
    <n-p>
      IT-Tools 是开源(GNU GPLv3
      协议)且免费的,并且将永远如此;但托管与域名续费需要费用。如果你想支持我的工作、鼓励我添加更多工具,请考虑通过
      <n-button
        type="primary"
        tag="a"
        text
        href="https://www.buymeacoffee.com/cthmsst"
        rel="noopener"
        target="_blank"
        @click="() => tracker.trackEvent({ eventName: 'Support button clicked' })"
      >
        赞助我 </n-button
      >。
    </n-p>

    <n-h2>技术栈</n-h2>
    <n-p>
      IT-Tools 使用 Vue 3 与 naive-ui 组件库构建。部分工具使用了第三方开源库,完整列表见仓库中的
      <n-button
        type="primary"
        tag="a"
        text
        href="https://github.com/CorentinTh/it-tools/blob/main/package.json"
        rel="noopener"
        target="_blank"
      >
        package.json
      </n-button>
      文件。
    </n-p>

    <n-h2>发现 Bug?缺少工具?</n-h2>
    <n-p>
      如果你需要一个当前没有、且你认为有意义的工具,欢迎在 GitHub 仓库的
      <n-button
        type="primary"
        tag="a"
        text
        href="https://github.com/CorentinTh/it-tools/issues/new?assignees=CorentinTh&labels=enhancement&template=feature_request.md&title=%5BFEAT%5D%20My%20feature"
        rel="noopener"
        target="_blank"
      >
        issues 板块
      </n-button>
      提交功能请求。
    </n-p>
    <n-p>
      如果你发现了 Bug 或有不符合预期的地方,请在 GitHub 仓库的
      <n-button
        type="primary"
        tag="a"
        text
        href="https://github.com/CorentinTh/it-tools/issues/new?assignees=CorentinTh&labels=bug&template=bug_report.md&title=%5BBUG%5D%20My%20bug"
        rel="noopener"
        target="_blank"
      >
        issues 板块
      </n-button>
      提交错误报告。
    </n-p>
  </div>
</template>

<style scoped lang="less">
.about-page {
  max-width: 600px;
  margin: 50px auto;
  box-sizing: border-box;

  .n-h2 {
    margin-bottom: 0px;
  }

  .n-p {
    text-align: justify;
  }
}
</style>
