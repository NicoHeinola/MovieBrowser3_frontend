<script setup lang="ts">
const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <v-btn
    class="glass-panel position-fixed bottom-0 right-0 ma-6"
    color="primary"
    elevation="2"
    size="large"
    @click="emit('click')"
  />
</template>
