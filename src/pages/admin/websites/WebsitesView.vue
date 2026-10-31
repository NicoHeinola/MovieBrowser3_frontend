<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import { PageBackground } from '@/components/common/page-background';
import { PageContainer } from '@/components/common/page-container';
import { WebsiteBrowser } from '@/components/features/website/website-browser';
import { WebsiteTagManager } from '@/components/features/website/website-tag-manager';

const tab = ref<'websites' | 'tags'>('websites');
/** Not named `websiteBrowser`: the template would resolve `<website-browser>` to that binding instead of the component. */
const browser = useTemplateRef<InstanceType<typeof WebsiteBrowser>>('browser');

/**
 * Lists the websites using a tag, from its count in the tags table.
 * @param tagId - The tag id.
 * @returns void
 */
const showWebsitesWithTag = (tagId: number): void => {
  browser.value?.showWebsitesWithTag(tagId);
  tab.value = 'websites';
};
</script>

<template>
  <page-background />

  <page-container class="mb-12">
    <v-row class="mb-4" justify="center">
      <v-col cols="auto">
        <v-tabs v-model="tab">
          <v-tab prepend-icon="mdi-web" value="websites">Websites</v-tab>
          <v-tab prepend-icon="mdi-tag-multiple-outline" value="tags">Tags</v-tab>
        </v-tabs>
      </v-col>
    </v-row>

    <div v-show="tab === 'websites'">
      <website-browser ref="browser" />
    </div>
    <div v-show="tab === 'tags'">
      <website-tag-manager @click:websites="showWebsitesWithTag" />
    </div>
  </page-container>
</template>
