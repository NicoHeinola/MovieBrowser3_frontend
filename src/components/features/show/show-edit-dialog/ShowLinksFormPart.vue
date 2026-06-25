<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';
import type { ShowLink } from '@/interfaces/api/models/ShowLink';

import { computed } from 'vue';

import { ShowAutocomplete } from '@/components/features/show/show-autocomplete';
import { ShowLinkTypeSelect } from '@/components/features/show/show-link-type-select';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { ShowLinkType } from '@/enums/show/ShowLinkType';
import { getPrimaryTitle } from '@/utils/show/getPrimaryTitle';
import { getLinksRules } from './showLinksFormRules';

const props = defineProps<{
  /** Used for excluding the current show from the list of available shows. */
  showId?: number;
}>();

const outgoingLinks = defineModel<ShowLink[]>('outgoingLinks', { default: [] });

const rules = computed(() => getLinksRules());

const { confirm } = useConfirmDialog();

const unsavedLinkRenderKey = Symbol('unsavedLinkRenderKey');

const getLinkRenderKey = (link: ShowLink): string | symbol => {
  if (link.id !== 0) {
    return `link-${link.id}`;
  }

  const localLink = link as ShowLink & { [unsavedLinkRenderKey]?: symbol };

  localLink[unsavedLinkRenderKey] ??= Symbol('link');

  return localLink[unsavedLinkRenderKey];
};

const updateLinkedShow = (link: ShowLink, selectedShow: Show | null): void => {
  link.target_show = selectedShow ?? undefined;
  link.target_show_id = selectedShow?.id ?? 0;
};

const addLink = (): void => {
  const links = (outgoingLinks.value ??= []);

  links.push({
    id: 0,
    source_show_id: props.showId ?? 0,
    target_show_id: 0,
    type: ShowLinkType.Sequel,
  });
};

const removeLink = async (index: number): Promise<void> => {
  const linkedShowName = getPrimaryTitle(outgoingLinks.value[index]?.target_show);

  const isConfirmed = await confirm({
    message: linkedShowName
      ? `Are you sure you want to remove the link to "${linkedShowName}"?`
      : 'Are you sure you want to remove this link?',
    confirmColor: 'error',
    confirmText: 'Remove',
  });

  if (!isConfirmed) {
    return;
  }

  outgoingLinks.value.splice(index, 1);
};
</script>

<template>
  <v-row v-for="(link, index) in outgoingLinks" align="start" :key="getLinkRenderKey(link)">
    <v-col cols="6">
      <show-link-type-select v-model="link.type" :rules="rules.linkType" />
    </v-col>
    <v-col class="d-flex align-center ga-5" cols="6">
      <show-autocomplete
        :exclude-ids="props.showId ? [props.showId] : []"
        :model-value="link.target_show ?? null"
        :rules="rules.linkedShow"
        class="required"
        label="Linked show"
        @update:model-value="updateLinkedShow(link, $event)"
      />
      <v-btn color="error" icon="mdi-trash-can" size="x-small" @click="removeLink(index)" />
    </v-col>
  </v-row>

  <v-row class="mt-0">
    <v-col cols="12">
      <v-btn size="small" variant="text" @click="addLink"> Add another link </v-btn>
    </v-col>
  </v-row>
</template>
