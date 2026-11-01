<script setup lang="ts">
import type { ChangelogEntry } from '@/interfaces/changelog/ChangelogEntry';

import { useDisplay } from 'vuetify';

import { HeadingText } from '@/components/common/heading-text';
import { ChangelogChangeList } from '@/components/features/changelog/changelog-change-list';
import { formatChangelogDate } from '@/utils/changelog/formatChangelogDate';

const props = defineProps<{
  /** Every update, newest first. */
  entries: ChangelogEntry[];
}>();

const { smAndUp } = useDisplay();
</script>

<template>
  <!-- Comfortable density sizes the date column to its content, so the line hugs the dates. -->
  <v-timeline :hide-opposite="!smAndUp" align="start" density="comfortable" side="end" truncate-line="both">
    <v-timeline-item
      v-for="(entry, index) in props.entries"
      :dot-color="index === 0 ? 'primary' : 'changelog-dot'"
      size="x-small"
      fill-dot
      :key="entry.version"
    >
      <template #opposite>
        <span class="text-body-medium text-medium-emphasis text-no-wrap">{{ formatChangelogDate(entry.date) }}</span>
      </template>

      <div class="d-flex flex-column ga-4 pb-6">
        <!--
          The heading's line box is taller than the dot, so it moves up to center on the dot and the date.
          On phones the date column is hidden, so the date moves under the version.
        -->
        <heading-text
          :level="2"
          :subtitle="smAndUp ? undefined : formatChangelogDate(entry.date)"
          :title="`Version ${entry.version}`"
          class="mt-n2"
        >
          <template #append>
            <v-chip color="primary" size="x-small" label v-if="index === 0">Latest</v-chip>
          </template>
        </heading-text>
        <v-card border="sm" rounded="xl">
          <v-card-text class="pa-5">
            <changelog-change-list :changes="entry.changes" />
          </v-card-text>
        </v-card>
      </div>
    </v-timeline-item>
  </v-timeline>
</template>
