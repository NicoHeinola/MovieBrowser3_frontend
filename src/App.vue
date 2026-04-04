<script lang="ts" setup>
import { TopNavigation } from './components/layouts/top-navigation';
</script>

<template>
  <v-app>
    <v-main>
      <top-navigation />
      <router-view />
    </v-main>
  </v-app>
</template>
