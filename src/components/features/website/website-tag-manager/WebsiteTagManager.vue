<script setup lang="ts">
import { useQueryClient } from '@tanstack/vue-query';
import { ref } from 'vue';
import { FloatingActionButton } from '@/components/common/floating-action-button';
import { SearchToolbar } from '@/components/common/search-toolbar';
import { useDialog } from '@/components/layouts/dialog-provider';
import { WebsiteTagQueryKey } from '@/enums/query/websiteTagQueryKey';
import { WebsiteTagCreateDialog } from '../website-tag-create-dialog';
import { WebsiteTagTable } from '../website-tag-table';

const emit = defineEmits<{
  /** The websites count of a tag was clicked, to list the websites using it. */
  'click:websites': [tagId: number];
}>();

const search = ref<string>('');

const dialog = useDialog();
const queryClient = useQueryClient();

const openCreateTagDialog = async (): Promise<void> => {
  const refresh = await dialog.showDialog({
    component: WebsiteTagCreateDialog,
    props: {},
  });

  if (refresh) {
    await Promise.all(
      Object.values(WebsiteTagQueryKey).map((queryKey) => queryClient.invalidateQueries({ queryKey: [queryKey] })),
    );
  }
};
</script>

<template>
  <search-toolbar v-model:search="search" placeholder="Search tags..." />

  <v-row justify="center">
    <v-col cols="12" lg="8" md="10" xl="6">
      <website-tag-table :search="search" @click:websites="emit('click:websites', $event)" />
    </v-col>
  </v-row>

  <floating-action-button class="z-100" icon="mdi-plus" @click="openCreateTagDialog" />
</template>
