<script lang="ts" setup>
import type { NavigationLinkItem } from './navigationLinkItem';
import { ref } from 'vue';
import { captureComponentEl } from '@/utils/vue/captureComponentEl';
import NavigationLink from './NavigationLink.vue';
import NavIndicator from './NavIndicator.vue';

const links: NavigationLinkItem[] = [
  { label: 'Dashboard', routeName: 'control-panel-dashboard', icon: 'mdi-view-dashboard' },
  { label: 'Shows', routeName: 'control-panel-shows', icon: 'mdi-movie-edit' },
  { label: 'Settings', routeName: 'control-panel-settings', icon: 'mdi-cog' },
];

const linkEls = ref<HTMLElement[]>([]);
const linkRouteNames = links.map((link) => link.routeName);
</script>

<template>
  <v-list-item v-for="(link, index) in links" :key="link.routeName">
    <navigation-link
      :icon="link.icon"
      :label="link.label"
      :route-name="link.routeName"
      :ref="(el) => captureComponentEl(linkEls, el, index)"
    />
  </v-list-item>
  <nav-indicator :link-els="linkEls" :link-route-names="linkRouteNames" />
</template>
