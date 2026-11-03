<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { TitledSection } from '@/components/common/titled-section';
import { ChangelogTimeline } from '@/components/features/changelog/changelog-timeline';
import { changelogEntries } from '@/data/changelog/changelogEntries';
import { getReleasedChangelogEntries } from '@/utils/changelog/getReleasedChangelogEntries';

/** Released updates only: the next version's lines stay hidden until it ships. */
const releasedEntries = getReleasedChangelogEntries(changelogEntries);

const { t } = useI18n();
</script>

<template>
  <page-background />

  <page-container>
    <v-row>
      <v-col cols="12" lg="8" xl="6">
        <titled-section :title="t('changelog.title')" icon="mdi-update" icon-color="primary">
          <changelog-timeline :entries="releasedEntries" />
        </titled-section>
      </v-col>
    </v-row>
  </page-container>
</template>
