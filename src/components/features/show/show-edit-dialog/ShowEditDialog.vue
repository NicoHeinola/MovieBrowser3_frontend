<script setup lang="ts">
import type { DialogComponentProps } from '@/components/layouts/dialog-provider';
import type { Show } from '@/interfaces/api/models/Show';
import { ref } from 'vue';
import { BaseDialog } from '@/components/common/base-dialog';
import BaseForm from '@/components/common/base-form/BaseForm.vue';
import ShowGeneralTab from './ShowGeneralTab.vue';

const props = defineProps<DialogComponentProps>();

const show = defineModel<Show | null>('show', { required: true });
const isFormValid = ref<boolean>(false);

const isDialogVisible = defineModel<boolean>({ required: true });
const selectedTab = ref<string[]>(['general']);
</script>

<template>
  <base-dialog v-model="isDialogVisible" :max-width="1060">
    <template #title>
      {{ show ? 'Edit Show' : 'Create Show' }}
    </template>

    <template #default>
      <div class="d-flex ga-5 h-100">
        <v-list v-model:selected="selectedTab" class="position-sticky" color="primary" min-width="100px" mandatory>
          <v-list-item title="General" value="general" />
          <v-list-item title="Entries" value="entries" />
          <v-list-item title="Links" value="links" />
        </v-list>
        <v-divider vertical />
        <base-form v-model="isFormValid" class="w-100 h-100 overflow-scroll" style="max-height: 60vh" id="show-form">
          <v-tabs-window :model-value="selectedTab[0]" class="flex-1-1">
            <v-tabs-window-item class="pa-1" value="general">
              <show-general-tab v-model:show="show" />
            </v-tabs-window-item>
            <v-tabs-window-item class="pa-1" value="entries">
              <v-sheet class="pa-5" color="orange">Two</v-sheet>
            </v-tabs-window-item>
            <v-tabs-window-item class="pa-1" value="links">
              <v-sheet class="pa-5" color="brown">Three</v-sheet>
            </v-tabs-window-item>
          </v-tabs-window>
        </base-form>
      </div>
    </template>

    <template #actions>
      <v-spacer />
      <v-btn variant="text" @click="props.close()"> Cancel </v-btn>
      <v-btn color="primary" variant="flat" @click="props.close()"> Save </v-btn>
    </template>
  </base-dialog>
</template>
