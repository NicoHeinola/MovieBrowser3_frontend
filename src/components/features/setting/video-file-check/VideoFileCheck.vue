<script setup lang="ts">
const props = defineProps<{
  alert: { text: string; type: 'error' | 'info' | 'success' | 'warning' };
  loading?: boolean;
}>();
</script>

<template>
  <v-skeleton-loader type="text" width="390" v-if="props.loading" />

  <div class="d-flex" v-else>
    <v-alert :type="props.alert.type" class="flex-0-1" border>
      {{ props.alert.text }}
    </v-alert>
  </div>
</template>
