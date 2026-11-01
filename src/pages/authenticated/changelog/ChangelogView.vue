<script setup lang="ts">
import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { TitledSection } from '@/components/common/titled-section';
import { ChangelogTimeline } from '@/components/features/changelog/changelog-timeline';
import { changelogEntries } from '@/data/changelog/changelogEntries';
</script>

<template>
  <page-background />

  <page-container>
    <v-row>
      <v-col cols="12" lg="8" xl="6">
        <titled-section icon="mdi-update" icon-color="primary" title="Changelog">
          <changelog-timeline :entries="changelogEntries" />
        </titled-section>
      </v-col>
    </v-row>
  </page-container>
</template>
