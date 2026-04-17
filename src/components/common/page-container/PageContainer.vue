<script setup lang="ts">
const props = defineProps<{
  class?: string;
}>();
</script>

<template>
  <v-container :class="['pa-12', 'position-relative', props.class]" fluid>
    <slot />
  </v-container>
</template>
