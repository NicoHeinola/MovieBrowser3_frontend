<script setup lang="ts">
const props = defineProps<{
  count: number;
}>();
</script>

<template>
  <v-row>
    <v-col cols="12">
      <p class="text-center">{{ props.count }} result{{ props.count === 1 ? '' : 's' }} found</p>
    </v-col>
  </v-row>
</template>
