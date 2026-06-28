<script setup lang="ts">
import type { ShowLinkType } from '@/enums/show/ShowLinkType';
import { computed, useAttrs } from 'vue';
import { useI18n } from 'vue-i18n';

import { ShowLinkType as ShowLinkTypeEnum } from '@/enums/show/ShowLinkType';
import { getShowLinkTypeIcon } from '@/utils/show/getShowLinkTypeIcon';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<{
    label?: string;
  }>(),
  {
    label: 'Link type',
  },
);

const selectedType = defineModel<ShowLinkType>({
  required: true,
});

const attrs = useAttrs();
const { t } = useI18n();

const linkTypeItems = computed<Array<{ icon: string; label: string; value: ShowLinkType }>>(() => {
  return Object.values(ShowLinkTypeEnum).map((linkType) => ({
    icon: getShowLinkTypeIcon(linkType),
    label: t(`showLink.type.${linkType}`),
    value: linkType,
  }));
});
</script>

<template>
  <v-select
    v-model="selectedType"
    :items="linkTypeItems"
    :label="props.label"
    item-title="label"
    item-value="value"
    v-bind="attrs"
  >
    <template #item="{ item, props: itemProps }">
      <v-list-item v-bind="itemProps" :prepend-icon="item.icon" :title="item.label" />
    </template>

    <template #selection="{ item }">
      <div class="d-flex ga-2 align-center">
        <v-icon :icon="item.icon" size="small" />
        <span>{{ item.label }}</span>
      </div>
    </template>
  </v-select>
</template>
