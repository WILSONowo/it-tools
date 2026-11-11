import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createHead } from '@vueuse/head';
import { plausible } from './plugins/plausible.plugin';

import 'virtual:uno.css';

// 注销所有 Service Worker:避免 PWA 缓存导致看不到最新版本
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    if (registrations.length > 0) {
      registrations.forEach((reg) => reg.unregister());
      if (!sessionStorage.getItem('sw-cleared')) {
        sessionStorage.setItem('sw-cleared', '1');
        window.location.reload();
      }
    }
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
