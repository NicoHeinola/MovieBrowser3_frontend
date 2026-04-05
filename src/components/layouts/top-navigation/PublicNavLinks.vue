<script lang="ts" setup>
import type { NavigationLinkItem } from './navigationLinkItem';
import { ref } from 'vue';
import NavigationLink from './NavigationLink.vue';
import NavIndicator from './NavIndicator.vue';

const links: NavigationLinkItem[] = [
  { name: 'Home', path: '/', icon: 'mdi-home' },
  { name: 'Search', path: '/search', icon: 'mdi-magnify' },
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
      :icon="link.icon"
      :name="link.name"
      :path="link.path"
      :ref="(el) => captureEl(linkEls, el, index)"
    />
  </v-list-item>
  <nav-indicator :link-els="linkEls" :link-paths="linkPaths" />
</template>
