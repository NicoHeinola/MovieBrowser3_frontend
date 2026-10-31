<script setup lang="ts">
const props = defineProps<{
  count: number;
  loading?: boolean;
}>();
</script>

<template>
  <v-row>
    <v-col cols="12">
      <v-skeleton-loader class="mx-auto" type="text" width="140" v-if="props.loading" />
      <p class="text-center" v-else>{{ props.count }} result{{ props.count === 1 ? '' : 's' }} found</p>
    </v-col>
  </v-row>
</template>
