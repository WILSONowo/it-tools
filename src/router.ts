import { createRouter, createWebHistory } from 'vue-router';
import HomePage from './pages/Home.page.vue';
import NotFound from './pages/404.page.vue';
import { tools } from './tools';
import { config } from './config';

const toolsRoutes = tools.map(({ path, name, component, ...config }) => ({
  path,
  name,
  component,
  meta: { isTool: true, name, ...config },
}));
const toolsRedirectRoutes = tools
  .filter(({ redirectFrom }) => redirectFrom && redirectFrom.length > 0)
  .flatMap(
    ({ path, redirectFrom }) => redirectFrom?.map((redirectSource) => ({ path: redirectSource, redirect: path })) ?? [],
  );

const router = createRouter({
  history: createWebHistory(config.app.baseUrl),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('./pages/About.vue'),
    },
    ...toolsRoutes,
    ...toolsRedirectRoutes,
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  ],
});

// After a redeploy, an open tab still references the old hashed chunks, which no longer exist.
// Lazy tool pages then fail to load and the navigation silently does nothing: do a full page
// load of the target instead (at most once per target, to avoid a reload loop).
const CHUNK_ERROR =
  /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Loading chunk \S+ failed/i;

router.onError((error, to) => {
  if (!CHUNK_ERROR.test(String(error?.message ?? error))) return;
  const key = `chunk-reload:${to.fullPath}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch {
    // sessionStorage unavailable: still try one reload
  }
  window.location.assign(to.fullPath);
});

export default router;
