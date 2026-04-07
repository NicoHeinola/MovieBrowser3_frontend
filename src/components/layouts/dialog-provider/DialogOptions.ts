import type { Component } from 'vue';

export interface DialogOptions<Props extends Record<string, unknown> = Record<string, never>> {
  component: Component;
  closeDelay?: number;
  props?: Props;
}
