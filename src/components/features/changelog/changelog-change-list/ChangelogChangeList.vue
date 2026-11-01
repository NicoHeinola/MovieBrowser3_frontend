<script setup lang="ts">
import type { ChangelogChange } from '@/interfaces/changelog/ChangelogChange';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { ChangelogChangeType } from '@/enums/changelog/ChangelogChangeType';
import { getChangelogChangeTypeColor } from '@/utils/changelog/getChangelogChangeTypeColor';
import { getChangelogChangeTypeIcon } from '@/utils/changelog/getChangelogChangeTypeIcon';

const props = defineProps<{
  /** The changes of one update. */
  changes: ChangelogChange[];
}>();

const { t } = useI18n();

/** The changes grouped by type, in enum order, leaving out types with no changes. */
const groups = computed<{ type: ChangelogChangeType; texts: string[] }[]>(() =>
  Object.values(ChangelogChangeType)
    .map((type) => ({
      type,
      texts: props.changes.filter((change) => change.type === type).map((change) => change.text),
    }))
    .filter((group) => group.texts.length > 0),
);
</script>

<template>
  <div class="d-flex flex-column ga-5">
    <div v-for="group in groups" class="d-flex flex-column ga-2" :key="group.type">
      <!-- Icon sizes scale with the font size, so the icons sit outside the text classes to stay the same size. -->
      <div :class="`text-${getChangelogChangeTypeColor(group.type)}`" class="d-flex align-center ga-2">
        <v-icon :icon="getChangelogChangeTypeIcon(group.type)" size="small" />
        <span class="text-label-medium text-uppercase font-weight-bold">
          {{ t(`changelog.changeType.${group.type}`) }}
        </span>
      </div>
      <div class="d-flex flex-column ga-2">
        <!-- Bullets match the group icon's size, so they sit under it and the text lines up with the label. -->
        <div v-for="text in group.texts" class="d-flex align-start ga-2" :key="text">
          <v-icon :color="getChangelogChangeTypeColor(group.type)" icon="mdi-circle-small" size="small" />
          <span class="text-body-medium">{{ text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
