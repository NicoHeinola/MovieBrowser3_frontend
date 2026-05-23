<script setup lang="ts">
import type { ShowEntryFormData } from '../ShowEntriesFormData';
import type { DialogComponentProps } from '@/components/layouts/dialog-provider';
import { computed, ref } from 'vue';
import { BaseDialog } from '@/components/common/base-dialog';
import BaseForm from '@/components/common/base-form/BaseForm.vue';
import { deepClone } from '@/utils/clone/deepClone';
import ShowEntryEpisodesFormPart from './ShowEntryEpisodesFormPart.vue';
import ShowEntryGeneralFormPart from './ShowEntryGeneralFormPart.vue';

const props = defineProps<DialogComponentProps<ShowEntryFormData> & { entry: ShowEntryFormData }>();

const isDialogVisible = defineModel<boolean>({ required: true });
const draftEntry = ref<ShowEntryFormData>(deepClone(props.entry));
const isFormValid = ref<boolean>(false);
const selectedTab = ref<string[]>(['general']);

const dialogTitle = computed<string>(() => draftEntry.value.name.trim() || 'Edit Entry');

const closeDialog = (): void => {
  props.close(deepClone(draftEntry.value));
};
</script>

<template>
  <base-dialog v-model="isDialogVisible" :max-width="1060">
    <template #title>{{ dialogTitle }}</template>

    <template #default>
      <div class="d-flex ga-5 h-100">
        <v-list v-model:selected="selectedTab" class="position-sticky" color="primary" min-width="120px" mandatory>
          <v-list-item title="General" value="general" />
          <v-list-item title="Episodes" value="episodes" />
        </v-list>
        <v-divider vertical />
        <base-form v-model="isFormValid" class="w-100 h-100 overflow-scroll" style="max-height: 60vh" id="entry-form">
          <v-tabs-window :model-value="selectedTab[0]" class="flex-1-1">
            <v-tabs-window-item class="pa-1" value="general">
              <show-entry-general-form-part v-model:entry="draftEntry" />
            </v-tabs-window-item>

            <v-tabs-window-item class="pa-1" value="episodes">
              <show-entry-episodes-form-part v-model:entry="draftEntry" />
            </v-tabs-window-item>
          </v-tabs-window>
        </base-form>
      </div>
    </template>

    <template #actions>
      <v-spacer />
      <v-btn variant="text" @click="props.close()"> Cancel </v-btn>
      <v-btn color="primary" variant="flat" @click="closeDialog"> Apply </v-btn>
    </template>
  </base-dialog>
</template>
