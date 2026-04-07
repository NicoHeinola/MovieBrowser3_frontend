import type { Component } from 'vue';

export interface ActiveDialog {
  id: number;
  component: Component;
  modelValue: boolean;
  props: Record<string, unknown>;
  closeDelay: number;
  isClosing: boolean;
  resolve: (value: unknown | undefined) => void;
}
