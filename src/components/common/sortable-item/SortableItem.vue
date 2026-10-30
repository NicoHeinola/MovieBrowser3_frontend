<script setup lang="ts">
import type {
  IBaseOptions,
  IDragActivationOptions,
  IDragEvent,
  IDraggableEvents,
  IModifierOptions,
  IPlacementMargins,
  TDraggablePayload,
} from '@vue-dnd-kit/core';
import type { Component, Ref } from 'vue';

import { makeDraggable } from '@vue-dnd-kit/core';
import { useTemplateRef } from 'vue';

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

const emit = defineEmits<{
  /** The drag ended with the payload list in a new order. Fires wherever the item is dropped. */
  sorted: [];
}>();

const el = useTemplateRef<HTMLElement>('el');

/** Order of the payload list when this item started dragging, restored if the drag is cancelled. */
let itemsBeforeDrag: unknown[] = [];

/**
 * Live-sort: move the dragged item into the hovered item's slot once the cursor passes that item's
 * vertical midpoint. The midpoint check stops the two items from swapping back and forth.
 *
 * @param e Drag event fired while this item is being dragged.
 * @returns Nothing.
 */
const moveToHoveredItem = (e: IDragEvent): void => {
  const draggedItem = e.draggedItems[0];
  const [hoveredElement, placement] = [...e.provider.hovered.draggable][0] ?? [];
  if (e.draggedItems.length !== 1 || draggedItem === undefined || hoveredElement === undefined) {
    return;
  }

  const [hoveredIndex, items] = e.provider.entities.draggableMap.get(hoveredElement)?.payload?.() ?? [];
  if (hoveredIndex === undefined || items !== draggedItem.items || hoveredIndex === draggedItem.index) {
    return;
  }

  const isPastMidpoint = hoveredIndex > draggedItem.index ? placement?.bottom : placement?.top;
  if (!isPastMidpoint) {
    return;
  }

  items.splice(hoveredIndex, 0, ...items.splice(draggedItem.index, 1));
};

const { isDragging } = makeDraggable(
  el,
  {
    ...props.dragOptions,
    events: {
      ...props.dragOptions?.events,
      onSelfDragStart(e) {
        itemsBeforeDrag = [...(props.dragPayload?.()[1] ?? [])];
        props.dragOptions?.events?.onSelfDragStart?.(e);
      },
      onSelfDragEnd(e) {
        const items = props.dragPayload?.()[1] ?? [];
        if (items.some((item, index) => item !== itemsBeforeDrag[index])) {
          emit('sorted');
        }

        props.dragOptions?.events?.onSelfDragEnd?.(e);
      },
      onSelfDragCancel(e) {
        props.dragPayload?.()[1].splice(0, Infinity, ...itemsBeforeDrag);
        props.dragOptions?.events?.onSelfDragCancel?.(e);
      },
      onSelfDragMove(e) {
        moveToHoveredItem(e);
        props.dragOptions?.events?.onSelfDragMove?.(e);
      },
    },
  },
  props.dragPayload === undefined ? undefined : () => props.dragPayload!(),
);
</script>

<template>
  <div :style="{ opacity: isDragging ? 0 : 1 }" tabindex="-1" @keydown.stop @keyup.stop ref="el">
    <slot />
  </div>
</template>
