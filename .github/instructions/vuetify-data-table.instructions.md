---
description: Vuetify data table structure rules for table components. Use when creating or editing Vue table components that end with Table, v-data-table UIs, or thin table wrapper components.
applyTo: 'src/components/**/*Table.vue'
---

# Vuetify Data Table Rules

## When To Prefer A Table

- Prefer a table when the user needs to scan many rows quickly, the content is mostly structured text, and row actions are secondary to comparison.
- When a card list becomes too long for efficient scanning, prefer a thin feature wrapper around `v-data-table` instead of rebuilding table setup inline in a page.

## Table Setup

- Type headers explicitly with `DataTableHeader`.
- Map store or API arrays into row objects with a `computed(...)` value before passing them to the table.
- Use the table's built-in `loading` prop for in-place loading states, or `v-skeleton-loader` for initial placeholder rendering around the table region.
- Do not add any other loading treatment for table data, including custom row shimmers, standalone spinners, or bespoke loading overlays.
- Use `item.*` slots for richer cells such as thumbnails, preview media, icons, and action buttons.
- Always provide a `no-data` slot instead of leaving the empty state implicit.
- When a table mixes previews with long URLs or other long text, lock the inner table to a fixed layout in scoped styles.

## Example

```vue
<script setup lang="ts">
import type { DataTableHeader } from 'vuetify';

import { computed, ref } from 'vue';

const urls = ref<string[]>([]);

const headers: Array<DataTableHeader> = [
  {
    title: 'Preview',
    key: 'preview',
    width: 116,
    sortable: false,
  },
  {
    title: 'URL',
    key: 'url',
  },
  {
    title: 'Actions',
    key: 'actions',
    align: 'end',
    sortable: false,
    width: 72,
  },
];

const items = computed<Array<{ url: string }>>(() => {
  return urls.value.map((url: string) => ({ url }));
});
</script>

<template>
  <v-data-table :headers="headers" :items="items" class="media-table">
    <template #item.preview="{ item }">
      <v-img :src="item.url" cover height="80" />
    </template>

    <template #item.url="{ value }">
      <p class="text-truncate">{{ value }}</p>
    </template>

    <template #item.actions="{ item }">
      <slot :url="item.url" name="actions" />
    </template>

    <template #no-data> No items available. </template>
  </v-data-table>
</template>

<style scoped lang="scss">
.media-table {
  :deep(table) {
    table-layout: fixed;
    width: 100%;
  }
}
</style>
```
