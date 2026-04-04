<script lang="ts" setup>
import type { NavigationLinkItem } from './navigationLinkItem';
import NavigationLink from './NavigationLink.vue';

const prependLinks: NavigationLinkItem[] = [
  { name: 'Home', path: '/', icon: 'mdi-home' },
  { name: 'Shows', path: '/shows', icon: 'mdi-television-play' },
  { name: 'Site Settings', path: '/settings', icon: 'mdi-cog' },
];

const appendLinks: NavigationLinkItem[] = [
  { name: 'Login', path: '/login' },
  { name: 'Register', path: '/register' },
];
</script>

<template>
  <v-app-bar class="navigation-bar" color="transparent" flat>
    <template #prepend>
      <v-list class="d-flex flex-row bg-transparent">
        <v-list-item v-for="link in prependLinks" :key="link.name">
          <navigation-link :key="link.name" :icon="link.icon" :name="link.name" :path="link.path" />
        </v-list-item>
      </v-list>
    </template>
    <template #append>
      <v-list class="d-flex flex-row bg-transparent">
        <v-list-item v-for="link in appendLinks" :key="link.name">
          <navigation-link :key="link.name" :icon="link.icon" :name="link.name" :path="link.path" />
        </v-list-item>
      </v-list>
    </template>
  </v-app-bar>
</template>

<style lang="scss" scoped>
.navigation-bar {
  background: linear-gradient(to bottom, black, transparent);
}
</style>
