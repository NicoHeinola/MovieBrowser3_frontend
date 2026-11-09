<script setup lang="ts">
import type { ChangelogChange } from '@/interfaces/changelog/ChangelogChange';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ChangelogChangeType } from '@/enums/changelog/ChangelogChangeType';
import { CHANGELOG_CHANGE_TYPE_STYLES } from '@/utils/changelog/changelogChangeTypeStyles';

const props = defineProps<{
  /** The changes of one update. */
  changes: ChangelogChange[];
}>();

const { t } = useI18n();

/** The changes grouped by type, in enum order, leaving out types with no changes. */
const groups = computed<{ type: ChangelogChangeType; changes: ChangelogChange[] }[]>(() =>
  Object.values(ChangelogChangeType)
    .map((type) => ({
      type,
      changes: props.changes.filter((change) => change.type === type),
    }))
    .filter((group) => group.changes.length > 0),
);
</script>

<template>
  <div class="d-flex flex-column ga-5">
    <div v-for="group in groups" class="d-flex flex-column ga-2" :key="group.type">
      <!-- Icon sizes scale with the font size, so the icons sit outside the text classes to stay the same size. -->
      <div :class="`text-${CHANGELOG_CHANGE_TYPE_STYLES[group.type].color}`" class="d-flex align-center ga-2">
        <v-icon :icon="CHANGELOG_CHANGE_TYPE_STYLES[group.type].icon" size="small" />
        <span class="text-label-medium text-uppercase font-weight-bold">
          {{ t(`changelog.changeType.${group.type}`) }}
        </span>
      </div>
      <div class="d-flex flex-column ga-2">
        <!-- Bullets match the group icon's size, so they sit under it and the text lines up with the label. -->
        <div v-for="change in group.changes" class="d-flex flex-column ga-2" :key="change.text">
          <div class="d-flex align-start ga-2">
            <v-icon :color="CHANGELOG_CHANGE_TYPE_STYLES[group.type].color" icon="mdi-circle-small" size="small" />
            <span class="text-body-medium">{{ change.text }}</span>
          </div>
          <!-- Sub-points sit one bullet width in, under the text of their parent. -->
          <div v-for="detail in change.details" class="d-flex align-start ga-2 ms-6" :key="detail">
            <v-icon :color="CHANGELOG_CHANGE_TYPE_STYLES[group.type].color" icon="mdi-circle-small" size="x-small" />
            <span class="text-body-medium text-medium-emphasis">{{ detail }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
