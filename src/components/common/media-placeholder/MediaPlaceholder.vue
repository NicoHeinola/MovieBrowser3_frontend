<script setup lang="ts">
const props = defineProps<{
  text: string;
  icon?: string;
}>();
</script>

<template>
  <div class="d-flex flex-column align-center ga-2 text-medium-emphasis">
    <v-icon :icon="props.icon" size="32" v-if="props.icon" />
    <span class="text-body-medium">{{ props.text }}</span>
  </div>
</template>
