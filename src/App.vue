<script setup lang="ts">
import { DnDProvider } from '@vue-dnd-kit/core';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { LanguagePrompt } from '@/components/features/locale/language-prompt';
import { DialogProvider } from '@/components/layouts/dialog-provider';
import { SnackbarProvider } from '@/components/layouts/snackbar-provider';
import { TopNavigation } from '@/components/layouts/top-navigation';
import { useRouteLoading } from '@/composables/router/useRouteLoading';
import { useWatchProgressStream } from '@/composables/show/useWatchProgressStream';

const isRouterReady = ref<boolean>(false);

const route = useRoute();
const router = useRouter();
const { isNavigating } = useRouteLoading();
useWatchProgressStream();

onMounted(async () => {
  await router.isReady();
  isRouterReady.value = true;
});

const shouldShowNavigation = computed<boolean>(() => isRouterReady.value && route.meta.hideNavigation !== true);
</script>

<template>
  <v-app>
    <DnDProvider animate-changes>
      <snackbar-provider>
        <dialog-provider>
          <language-prompt />
          <v-main class="z-10">
            <v-progress-linear
              :active="isNavigating"
              class="position-fixed top-0 left-0 w-100"
              color="secondary"
              height="3"
              style="z-index: 1100"
              indeterminate
            />
            <top-navigation v-if="shouldShowNavigation" />
            <router-view />
          </v-main>
        </dialog-provider>
      </snackbar-provider>
    </DnDProvider>
  </v-app>
</template>
