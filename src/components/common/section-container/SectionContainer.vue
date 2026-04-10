<script setup lang="ts">
const props = defineProps<{
  class?: string;
}>();
</script>

<template>
  <v-container :class="['pa-8', props.class]" fluid>
    <slot />
  </v-container>
</template>
