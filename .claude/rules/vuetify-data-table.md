---
paths:
  - 'src/components/**/*Table.vue'
---

# Vuetify Data Table Rules

- Use a table when the user scans many rows of mostly structured text and row actions are secondary. A card list that grows too long becomes a thin `*Table.vue` wrapper around `v-data-table`, not table setup inside a page.
- A `*Table.vue` wrapper renders only the table (plus its `v-skeleton-loader` placeholder). Search fields, toolbars and the `v-row`/`v-col` layout belong to the page.
- Tables display; they never fetch. A paginated list's search term, filters, sort, page, page size and query live in its `use<Domain>Search` (built on `usePaginatedSearch`), which the parent calls and hands to the table as rows plus `v-model:sort`. Paging is the parent's `floating-pagination`, like every search page, so the table hides its footer. Single actions on a row (rename, delete) stay in the table.
- Use `v-data-table-server` whenever the backend sorts or pages the rows, whichever component runs the query: a plain `v-data-table` sorts and pages its items again in the browser.
- A server-sorted table binds `v-model:sort-by` through `useDataTableSort(sort, { columnKey: 'backendField' })`, so the rest of the code keeps one backend sort string such as `-size`.
- Type headers with `DataTableHeader`, and map store or API arrays into row objects with a `computed(...)` before passing them in.
- Use `item.*` slots for richer cells (thumbnails, previews, icons, action buttons), and always fill the `no-data` slot.
- When a table mixes previews with long URLs or other long text, lock the inner table to a fixed layout in scoped styles.

```vue
<script setup lang="ts">
import type { DataTableHeader } from 'vuetify';

import { computed, ref } from 'vue';

const urls = ref<string[]>([]);

const headers: Array<DataTableHeader> = [
  { title: 'Preview', key: 'preview', width: 116, sortable: false },
  { title: 'URL', key: 'url' },
  { title: 'Actions', key: 'actions', align: 'end', sortable: false, width: 72 },
];

const items = computed<Array<{ url: string }>>(() => {
  return urls.value.map((url: string) => ({ url }));
});
</script>

<template>
  <v-data-table :headers="headers" :items="items" class="media-table">
    <template #item.preview="{ item }">
      <v-img :src="item.url" height="80" cover />
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
