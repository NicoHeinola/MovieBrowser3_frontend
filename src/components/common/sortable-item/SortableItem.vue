<script setup lang="ts">
import {
  type IBaseOptions,
  type IDragActivationOptions,
  type IDraggableEvents,
  type IModifierOptions,
  type IPlacementMargins,
  makeDraggable,
  type TDraggablePayload,
} from '@vue-dnd-kit/core';
import { type Component, type Ref, useTemplateRef } from 'vue';

interface IMakeDraggableOptions extends IBaseOptions {
  /** Stable id for this draggable. Required for correct behavior inside virtual lists
   *  where items unmount and remount as the user scrolls. If omitted, a random id is
   *  generated automatically — sufficient for non-virtual usage. */
  id?: string;
  events?: IDraggableEvents;
  modifier?: IModifierOptions;
  render?: Component;
  dragHandle?: string | Ref<string>;
  activation?: IDragActivationOptions;
  placementMargins?: IPlacementMargins;
  data?: () => unknown;
}

const props = defineProps<{ dragOptions?: IMakeDraggableOptions; dragPayload?: TDraggablePayload }>();

const el = useTemplateRef<HTMLElement>('el');

const { isDragging } = makeDraggable(
  el,
  props.dragOptions ?? {},
  props.dragPayload === undefined ? undefined : () => props.dragPayload!(),
);
</script>

<template>
  <div :style="{ opacity: isDragging ? 0 : 1 }" ref="el">
    <slot />
  </div>
</template>
