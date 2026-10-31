import type { EffectScope } from 'vue';
import { flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp, effectScope } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';

import { useRouteLoading } from '../useRouteLoading';

const scopes: EffectScope[] = [];

/**
 * Runs the route loading tracker on a memory router opened at `/search`.
 * @returns The navigation flag, the router, and a gate that holds `/slow` navigations until released.
 */
const setupRouteLoading = async () => {
  let release = (): void => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });

  const component = { template: '<div />' };
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/search', component },
      { path: '/slow', component, beforeEnter: () => gate },
    ],
  });
  await router.push('/search');

  const app = createApp({});
  app.use(router);

  const scope = effectScope();
  scopes.push(scope);

  const { isNavigating } = app.runWithContext(() => scope.run(() => useRouteLoading()))!;

  return { isNavigating, router, release };
};

describe('useRouteLoading', () => {
  afterEach(() => {
    for (const scope of scopes.splice(0)) {
      scope.stop();
    }
  });

  it('is navigating until a navigation to another page finishes', async () => {
    const { isNavigating, router, release } = await setupRouteLoading();

    const navigation = router.push('/slow');
    await flushPromises();
    expect(isNavigating.value).toBe(true);

    release();
    await navigation;
    expect(isNavigating.value).toBe(false);
  });

  it('ignores a navigation that only changes the query', async () => {
    const { isNavigating, router } = await setupRouteLoading();
    const states: boolean[] = [];
    router.beforeResolve(() => {
      states.push(isNavigating.value);
    });

    await router.replace('/search?q=car');

    expect(states).toEqual([false]);
    expect(router.currentRoute.value.fullPath).toBe('/search?q=car');
  });
});
