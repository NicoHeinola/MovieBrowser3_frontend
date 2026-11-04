<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { TitledSection } from '@/components/common/titled-section';
import { ChangelogTimeline } from '@/components/features/changelog/changelog-timeline';
import { changelogEntries } from '@/data/changelog/changelogEntries';
import { getVisibleChangelogEntries } from '@/utils/changelog/getVisibleChangelogEntries';

/** Released updates, plus the next version once it has lines. */
const visibleEntries = getVisibleChangelogEntries(changelogEntries);

const { t } = useI18n();
</script>

<template>
  <page-background />

  <page-container>
    <v-row>
      <v-col cols="12" lg="8" xl="6">
        <titled-section :title="t('changelog.title')" icon="mdi-update" icon-color="primary">
          <changelog-timeline :entries="visibleEntries" />
        </titled-section>
      </v-col>
    </v-row>
  </page-container>
</template>
