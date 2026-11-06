<script setup lang="ts">
import type { ChangelogEntry } from '@/interfaces/changelog/ChangelogEntry';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDisplay } from 'vuetify';

import { HeadingText } from '@/components/common/heading-text';
import { ReadMoreContainer } from '@/components/common/read-more-container';
import { ChangelogChangeList } from '@/components/features/changelog/changelog-change-list';
import { formatChangelogDate } from '@/utils/changelog/formatChangelogDate';
import { getReleasedChangelogEntries } from '@/utils/changelog/getReleasedChangelogEntries';

const props = defineProps<{
  /** Every update to list, newest first. The first may be the next, unreleased version. */
  entries: ChangelogEntry[];
}>();

const { smAndUp } = useDisplay();
const { t } = useI18n();

/** The newest released version, which is not the top entry while an upcoming version is listed. */
const latestVersion = computed<string | undefined>(() => getReleasedChangelogEntries(props.entries)[0]?.version);

/**
 * Picks the timeline dot color of an update.
 * @param entry - The update.
 * @returns A theme color name.
 */
const getDotColor = (entry: ChangelogEntry): string => {
  if (entry.date === null) {
    return 'secondary';
  }

  return entry.version === latestVersion.value ? 'primary' : 'changelog-dot';
};

/**
 * Builds the text shown in an update's date slot.
 * @param entry - The update.
 * @returns The formatted release date, or a note that it is not released yet.
 */
const getDateText = (entry: ChangelogEntry): string =>
  entry.date === null ? t('changelog.notReleased') : formatChangelogDate(entry.date);
</script>

<template>
  <!-- Comfortable density sizes the date column to its content, so the line hugs the dates. -->
  <v-timeline :hide-opposite="!smAndUp" align="start" density="comfortable" side="end" truncate-line="both">
    <v-timeline-item
      v-for="entry in props.entries"
      :dot-color="getDotColor(entry)"
      size="x-small"
      fill-dot
      :key="entry.version"
    >
      <template #opposite>
        <span class="text-body-medium text-medium-emphasis text-no-wrap">{{ getDateText(entry) }}</span>
      </template>

      <div class="d-flex flex-column ga-4 pb-6">
        <!--
          The heading's line box is taller than the dot, so it moves up to center on the dot and the date.
          On phones the date column is hidden, so the date moves under the version.
        -->
        <heading-text
          :level="2"
          :subtitle="smAndUp ? undefined : getDateText(entry)"
          :title="t('changelog.version', { version: entry.version })"
          class="mt-n2"
        >
          <template #append>
            <v-chip color="secondary" size="x-small" label v-if="entry.date === null">
              {{ t('changelog.upcoming') }}
            </v-chip>
            <v-chip color="primary" size="x-small" label v-else-if="entry.version === latestVersion">
              {{ t('changelog.latest') }}
            </v-chip>
          </template>
        </heading-text>
        <v-card border="sm" rounded="xl">
          <v-card-text class="pa-5">
            <read-more-container :default-expanded="entry.version === latestVersion">
              <changelog-change-list :changes="entry.changes" />
            </read-more-container>
          </v-card-text>
        </v-card>
      </div>
    </v-timeline-item>
  </v-timeline>
</template>
