import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createHead } from '@vueuse/head';
import { plausible } from './plugins/plausible.plugin';

import 'virtual:uno.css';

// 注销所有 Service Worker:避免旧版 PWA 缓存导致看不到最新版本。
// 等待注销与缓存清理完成后再刷新,否则刷新请求可能仍由旧 Service Worker 返回。
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then(async (registrations) => {
      if (registrations.length === 0) return;
      await Promise.all(registrations.map((registration) => registration.unregister()));
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      if (!sessionStorage.getItem('sw-cleared')) {
        sessionStorage.setItem('sw-cleared', '1');
        window.location.reload();
      }
    })
    .catch(() => {
      // ignore: nothing to clean up
    });
}

import { naive } from './plugins/naive.plugin';

import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(createHead());
app.use(router);
app.use(naive);
app.use(plausible);

app.mount('#app');
