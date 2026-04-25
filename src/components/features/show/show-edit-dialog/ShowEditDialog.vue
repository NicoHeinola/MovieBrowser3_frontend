<script setup lang="ts">
import type { DialogComponentProps } from '@/components/layouts/dialog-provider';
import type { Show } from '@/interfaces/api/models/Show';
import { ref } from 'vue';
import { BaseDialog } from '@/components/common/base-dialog';

const props = defineProps<
  DialogComponentProps & {
    show: Show | null;
  }
>();

const modelValue = defineModel<boolean>({ required: true });
const selectedTab = ref<string[]>(['general']);
</script>

<template>
  <base-dialog v-model="modelValue" :max-width="860">
    <template #title>
      {{ show ? 'Edit Show' : 'Create Show' }}
    </template>

    <template #default>
      <div class="d-flex ga-5">
        <v-list v-model:selected="selectedTab" color="secondary" width="100px" mandatory>
          <v-list-item title="General" value="general" />
          <v-list-item title="Entries" value="entries" />
          <v-list-item title="Links" value="links" />
        </v-list>
        <v-divider vertical />
        <v-tabs-window :model-value="selectedTab[0]" class="flex-1-1">
          <v-tabs-window-item value="general">
            <v-sheet class="pa-5" color="purple">One</v-sheet>
          </v-tabs-window-item>
          <v-tabs-window-item value="entries">
            <v-sheet class="pa-5" color="orange">Two</v-sheet>
          </v-tabs-window-item>
          <v-tabs-window-item value="links">
            <v-sheet class="pa-5" color="brown">Three</v-sheet>
          </v-tabs-window-item>
        </v-tabs-window>
      </div>
    </template>

    <template #actions>
      <v-spacer />
      <v-btn variant="text" @click="props.close()"> Cancel </v-btn>
      <v-btn color="primary" variant="flat" @click="props.close()"> Save </v-btn>
    </template>
  </base-dialog>
</template>
