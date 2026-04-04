<script lang="ts" setup>
import type { NavigationLinkItem } from './navigationLinkItem';
import { ref } from 'vue';
import NavigationLink from './NavigationLink.vue';
import NavIndicatorBall from './NavIndicatorBall.vue';

const prependLinks: NavigationLinkItem[] = [
  { name: 'Home', path: '/', icon: 'mdi-home' },
  { name: 'Shows', path: '/shows', icon: 'mdi-television-play' },
  { name: 'Site Settings', path: '/settings', icon: 'mdi-cog' },
];

const appendLinks: NavigationLinkItem[] = [
  { name: 'Login', path: '/login' },
  { name: 'Register', path: '/register' },
];

const prependLinkEls = ref<HTMLElement[]>([]);
const appendLinkEls = ref<HTMLElement[]>([]);

const captureEl = (els: HTMLElement[], el: unknown, index: number) => {
  if (el) {
    els[index] = ((el as { $el?: HTMLElement }).$el ?? el) as HTMLElement;
  }
};

const prependLinkPaths = prependLinks.map((l) => l.path as string);
const appendLinkPaths = appendLinks.map((l) => l.path as string);
</script>

<template>
  <v-app-bar class="navigation-bar" color="transparent" flat>
    <template #prepend>
      <v-list class="d-flex flex-row bg-transparent prepend-list">
        <v-list-item
          v-for="(link, index) in prependLinks"
          :key="link.name"
          :ref="(el) => captureEl(prependLinkEls, el, index)"
        >
          <navigation-link :icon="link.icon" :name="link.name" :path="link.path" />
        </v-list-item>
        <nav-indicator-ball :link-els="prependLinkEls" :link-paths="prependLinkPaths" />
      </v-list>
    </template>
    <template #append>
      <v-list class="d-flex flex-row bg-transparent append-list">
        <v-list-item
          v-for="(link, index) in appendLinks"
          :key="link.name"
          :ref="(el) => captureEl(appendLinkEls, el, index)"
        >
          <navigation-link :icon="link.icon" :name="link.name" :path="link.path" />
        </v-list-item>
        <nav-indicator-ball :link-els="appendLinkEls" :link-paths="appendLinkPaths" />
      </v-list>
    </template>
  </v-app-bar>
</template>

<style lang="scss" scoped>
.navigation-bar {
  background: linear-gradient(to bottom, black, transparent);
}

.prepend-list,
.append-list {
  position: relative;
  overflow: visible;
}
</style>
