<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { TopNavigation } from './components/layouts/top-navigation';

const route = useRoute();
const router = useRouter();
const isRouterReady = ref(false);

onMounted(async () => {
  await router.isReady();
  isRouterReady.value = true;
});

const shouldShowNavigation = computed(() => isRouterReady.value && route.meta.hideNavigation !== true);
</script>

<template>
  <v-app>
    <div class="background"></div>
    <v-main class="z-10">
      <top-navigation v-if="shouldShowNavigation" />
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

  mask-image: url('/patterns/bubbles.svg');
  mask-repeat: repeat;
  mask-size: 300px 300px;

  pointer-events: none;
}
</style>
