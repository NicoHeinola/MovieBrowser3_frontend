<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  count: number;
  loading?: boolean;
}>();
</script>

<template>
  <v-row>
    <v-col cols="12">
      <v-skeleton-loader class="mx-auto" type="text" width="140" v-if="props.loading" />
      <p class="text-center" v-else>{{ t('common.resultsFound', { count: props.count }, props.count) }}</p>
    </v-col>
  </v-row>
</template>
