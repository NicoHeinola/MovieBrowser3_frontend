import type { Component } from 'vue';
import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';

/** What a caller can add when it opens a show in the drawer. */
export interface ShowDrawerOptions {
  /** Shown next to the drawer's close button until it closes, such as "pick another". It wires up its own actions. */
  action?: Component;
}

/**
 * The app's one show drawer: any page or component opens a show in it, and `App.vue` mounts it.
 */
export const useShowDrawerStore = defineStore('showDrawer', () => {
  /**
   * The show in the drawer. Setting it switches the open drawer to another show and keeps its action. It outlives
   * closing, so the content stays up while the drawer slides out.
   */
  const showId = ref<number | null>(null);
  const isShown = ref<boolean>(false);
  /** The open show's extra action. Shallow, because a component must not become reactive. */
  const action = shallowRef<Component | null>(null);

  /**
   * Opens a show in the drawer, replacing the show and action of an already open one.
   * @param id - The id of the show to open.
   * @param options - What to add to the drawer for this show.
   */
  const open = (id: number, options: ShowDrawerOptions = {}): void => {
    showId.value = id;
    action.value = options.action ?? null;
    isShown.value = true;
  };

  /**
   * Closes the drawer and drops its action.
   */
  const close = (): void => {
    isShown.value = false;
    action.value = null;
  };

  return {
    showId,
    isShown,
    action,
    open,
    close,
  };
});
