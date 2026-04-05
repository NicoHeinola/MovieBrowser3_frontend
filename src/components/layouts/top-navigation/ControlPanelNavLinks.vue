<script lang="ts" setup>
import type { NavigationLinkItem } from './navigationLinkItem';
import { ref } from 'vue';
import NavigationLink from './NavigationLink.vue';
import NavIndicator from './NavIndicator.vue';

const links: NavigationLinkItem[] = [
  { name: 'Dashboard', path: '/control-panel', icon: 'mdi-view-dashboard' },
  { name: 'Shows', path: '/control-panel/shows', icon: 'mdi-movie-edit' },
  { name: 'Settings', path: '/control-panel/settings', icon: 'mdi-cog' },
];

const linkEls = ref<HTMLElement[]>([]);
const linkPaths = links.map((l) => l.path as string);

const captureEl = (els: HTMLElement[], el: unknown, index: number) => {
  if (el) {
    els[index] = ((el as { $el?: HTMLElement }).$el ?? el) as HTMLElement;
  }
};
</script>

<template>
  <v-list-item v-for="(link, index) in links" :key="link.name">
    <navigation-link
      :ref="(el) => captureEl(linkEls, el, index)"
      :icon="link.icon"
      :name="link.name"
      :path="link.path"
    />
  </v-list-item>
  <nav-indicator :link-els="linkEls" :link-paths="linkPaths" />
</template>
