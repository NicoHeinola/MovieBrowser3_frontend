<script setup lang="ts">
import type { DialogComponentProps } from '@/components/layouts/dialog-provider';
import type { Show } from '@/interfaces/api/models/Show';
import { ref } from 'vue';
import { BaseDialog } from '@/components/common/base-dialog';
import BaseForm from '@/components/common/base-form/BaseForm.vue';
import ShowEntriesTab from './ShowEntriesTab.vue';
import ShowGeneralTab from './ShowGeneralTab.vue';
import ShowUiTab from './ShowUiTab.vue';

const props = defineProps<DialogComponentProps>();

const show = defineModel<Show>('show', { required: true });
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
        <v-list v-model:selected="selectedTab" class="position-sticky" color="primary" min-width="120px" mandatory>
          <v-list-item title="General" value="general" />
          <v-list-item title="UI" value="ui" />
          <v-list-item title="Entries" value="entries" />
          <v-list-item title="Links" value="links" />
        </v-list>
        <v-divider vertical />
        <base-form v-model="isFormValid" class="w-100 h-100 overflow-scroll" style="max-height: 60vh" id="show-form">
          <v-tabs-window :model-value="selectedTab[0]" class="flex-1-1">
            <v-tabs-window-item class="pa-1" value="general">
              <show-general-tab v-model:show="show" />
            </v-tabs-window-item>
            <v-tabs-window-item class="pa-1" value="ui">
              <show-ui-tab v-model:show="show" />
            </v-tabs-window-item>
            <v-tabs-window-item class="pa-1" value="entries">
              <show-entries-tab v-model:show="show" />
            </v-tabs-window-item>
            <v-tabs-window-item class="pa-1" value="links">
              <v-sheet class="pa-5" color="brown">
                This page should display links related to the show. We have incoming links that this show is part of.
                And outgoing links that this show points to. If you, for example make this show a prequel to another
                show, then that show would be an outgoing link from this show, and this show would be an incoming link
                to the other show. This would also has "magic" logic that adds to the show that this show itself is a
                sequel of the other show, so that you can easily find all shows that are prequels or sequels of a show.
                You can also add custom links that are not part of the "magic" logic, for example if you want to link
                two shows together that are not prequels or sequels of each other, but still have some relation to each
                other. This magic logic works for "suggested_next" and "suggested_previous" links, but not for "related"
                links, as those are just custom links that have no special logic.
              </v-sheet>
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
