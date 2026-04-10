<script setup lang="ts">
const props = defineProps<{
  class?: string;
}>();
</script>

<template>
  <v-container :class="['pa-12', props.class]" fluid>
    <slot />
  </v-container>
</template>
