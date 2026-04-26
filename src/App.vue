<script setup lang="ts">
import { DnDProvider } from '@vue-dnd-kit/core';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { DialogProvider } from './components/layouts/dialog-provider';
import { SnackbarProvider } from './components/layouts/snackbar-provider';
import { TopNavigation } from './components/layouts/top-navigation';

const route = useRoute();
const router = useRouter();
const isRouterReady = ref<boolean>(false);

onMounted(async () => {
  await router.isReady();
  isRouterReady.value = true;
});

const shouldShowNavigation = computed<boolean>(() => isRouterReady.value && route.meta.hideNavigation !== true);
</script>

<template>
  <v-app>
    <DnDProvider>
      <snackbar-provider>
        <dialog-provider>
          <v-main class="z-10">
            <top-navigation v-if="shouldShowNavigation" />
            <router-view />
          </v-main>
        </dialog-provider>
      </snackbar-provider>
    </DnDProvider>
  </v-app>
</template>
