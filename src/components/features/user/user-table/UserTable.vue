<script setup lang="ts">
import type { User } from '@/interfaces/api/models/User';
import type { DataTableHeader } from 'vuetify';

import { useAuthStore } from '@/stores/auth/useAuthStore';

const props = defineProps<{
  /** One page of users, already searched, filtered and sorted on the backend. */
  users: User[];
  /** Shows a placeholder instead of the table, for the first load. */
  isPending: boolean;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  /** A user row's edit button was clicked. */
  edit: [user: User];
}>();

const authStore = useAuthStore();

/** Sorting goes through the page's sort menu, so the columns are not sortable. */
const headers: Array<DataTableHeader> = [
  { title: 'Username', key: 'username', sortable: false },
  { title: 'Admin', key: 'is_admin', align: 'center', sortable: false, width: 120 },
  { title: '', key: 'actions', align: 'end', sortable: false, width: 72 },
];
</script>

<template>
  <v-skeleton-loader type="table-tbody" v-if="props.isPending" />
  <v-data-table
    :headers="headers"
    :items="props.users"
    :items-per-page="-1"
    :loading="props.isLoading"
    hide-default-footer
    hover
    v-else
  >
    <template #item.username="{ item }">
      <div class="d-flex ga-2 align-center">
        {{ item.username }}
        <v-chip color="link" size="small" v-if="item.id === authStore.user?.id">You</v-chip>
      </div>
    </template>

    <template #item.is_admin="{ item }">
      <v-icon :color="item.is_admin ? 'primary' : 'medium-emphasis'">
        {{ item.is_admin ? 'mdi-shield-crown' : 'mdi-account' }}
      </v-icon>
    </template>

    <template #item.actions="{ item }">
      <v-btn
        icon="mdi-pencil-outline"
        size="small"
        variant="text"
        @click="emit('edit', item)"
        v-tooltip:bottom="'Edit user'"
      />
    </template>

    <template #no-data>
      <slot name="no-data" />
    </template>
  </v-data-table>
</template>
