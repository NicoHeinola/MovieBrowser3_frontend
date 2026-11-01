<script setup lang="ts">
import { onMounted } from 'vue';

import { LanguageDialog } from '@/components/features/locale/language-dialog';
import { useDialog } from '@/components/layouts/dialog-provider';
import { useLocale } from '@/composables/locale/useLocale';

const dialog = useDialog();
const { hasChosenLocale } = useLocale();

onMounted(() => {
  // First visit in this browser: ask which language to use. Until then the browser language is used.
  if (hasChosenLocale.value) {
    return;
  }

  void dialog.showDialog({ component: LanguageDialog });
});
</script>

<template>
  <span class="d-none" />
</template>
