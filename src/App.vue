<script lang="ts" setup>
import { TopNavigation } from './components/layouts/top-navigation';
</script>

<template>
  <v-app>
    <div class="background"></div>
    <v-main>
      <top-navigation />
      <router-view />
    </v-main>
  </v-app>
</template>

<style lang="scss" scoped>
@use 'sass:map';
@use '@/styles/settings' as settings;

.background {
  position: absolute;
  width: 100%;
  height: 100%;

  background-color: map.get(settings.$grey, 'darken-4');
  opacity: 0.3;

  mask-image: url('/backgrounds/bubbles.svg');
  mask-repeat: repeat;
  mask-size: 300px 300px;
}
</style>
