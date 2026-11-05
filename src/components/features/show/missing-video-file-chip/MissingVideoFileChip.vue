<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <v-chip class="flex-shrink-0" color="warning" prepend-icon="mdi-file-alert-outline" size="small" variant="tonal">
    {{ t('show.noVideoFile') }}
  </v-chip>
</template>
