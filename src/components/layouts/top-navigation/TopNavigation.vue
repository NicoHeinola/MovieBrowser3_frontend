<script lang="ts" setup>
import type { NavigationLink } from './navigationLink';

const navigationLinks: NavigationLink[] = [
  { name: 'Home', path: '/', icon: 'mdi-home' },
  { name: 'Shows', path: '/shows', icon: 'mdi-television-play' },
  { name: 'Site Settings', path: '/settings', icon: 'mdi-cog' },
];

const authLinks: NavigationLink[] = [
  { name: 'Login', path: '/login' },
  { name: 'Register', path: '/register' },
];
</script>

<template>
  <v-app-bar>
    <template #prepend>
      <v-list class="d-flex flex-row">
        <v-list-item v-for="link in navigationLinks" :key="link.name">
          <router-link class="d-flex align-center ga-2" :to="link.path">
            <v-icon v-if="link.icon">{{ link.icon }}</v-icon>
            <p class="link">{{ link.name }}</p>
          </router-link>
        </v-list-item>
      </v-list>
    </template>
    <template #append>
      <v-list class="d-flex flex-row">
        <v-list-item v-for="link in authLinks" :key="link.name">
          <router-link :to="link.path">
            <p>{{ link.name }}</p>
          </router-link>
        </v-list-item>
      </v-list>
    </template>
  </v-app-bar>
</template>

<style scoped>
a {
  color: inherit;
  text-decoration: none;
}

.link {
  &:hover {
    text-decoration: underline;
  }
}
</style>
