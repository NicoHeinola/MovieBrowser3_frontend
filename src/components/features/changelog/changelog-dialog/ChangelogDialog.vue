<script setup lang="ts">
import type { ChangelogDialogProps } from './changelogDialogProps';
import type { ChangelogEntry } from '@/interfaces/changelog/ChangelogEntry';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { BaseDialog } from '@/components/common/base-dialog';
import { HeadingText } from '@/components/common/heading-text';
import { ChangelogChangeList } from '@/components/features/changelog/changelog-change-list';
import { formatChangelogDate } from '@/utils/changelog/formatChangelogDate';

const props = defineProps<ChangelogDialogProps>();

const router = useRouter();
const { t } = useI18n();

/** The newest update, shown as the dialog's headline. */
const latestEntry = computed<ChangelogEntry | undefined>(() => props.entries[0]);

/** Older unseen updates, listed below the newest one. */
const olderEntries = computed<ChangelogEntry[]>(() => props.entries.slice(1));

/**
 * Closes the dialog and opens the full changelog.
 * @returns Nothing.
 */
const openChangelog = async (): Promise<void> => {
  props.close();
  await router.push({ name: 'authenticated-changelog' });
};
</script>

<template>
  <base-dialog :model-value="props.modelValue" max-width="520">
    <div class="d-flex flex-column ga-6" v-if="latestEntry">
      <div class="d-flex align-center ga-4">
        <v-avatar color="primary" rounded="lg" size="x-large" variant="tonal">
          <v-icon>mdi-creation</v-icon>
        </v-avatar>
        <heading-text
          :subtitle="
            t('changelog.versionReleased', {
              version: latestEntry.version,
              date: formatChangelogDate(latestEntry.date),
            })
          "
          :title="t('changelog.whatsNew')"
        />
      </div>

      <changelog-change-list :changes="latestEntry.changes" />

      <template v-for="entry in olderEntries" :key="entry.version">
        <v-divider />
        <div class="d-flex flex-column ga-4">
          <heading-text
            :level="2"
            :subtitle="formatChangelogDate(entry.date)"
            :title="t('changelog.version', { version: entry.version })"
          />
          <changelog-change-list :changes="entry.changes" />
        </div>
      </template>
    </div>

    <template #actions>
      <v-btn append-icon="mdi-arrow-right" variant="text" @click="void openChangelog()">{{
        t('changelog.allUpdates')
      }}</v-btn>
      <v-spacer />
      <v-btn color="primary" variant="flat" @click="props.close()">{{ t('changelog.gotIt') }}</v-btn>
    </template>
  </base-dialog>
</template>
