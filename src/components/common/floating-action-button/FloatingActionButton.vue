<script setup lang="ts">
const emit = defineEmits<{
  click: [];
}>();
</script>

<!-- A page's main action as a floating button; place it with `floating-container`. -->
<template>
  <v-btn class="glass-panel" color="primary" elevation="2" size="large" @click="emit('click')" />
</template>
