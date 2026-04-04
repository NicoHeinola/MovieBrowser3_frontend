<script lang="ts" setup>
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router';

const props = defineProps<{
  name: string;
  path: string | RouteLocationAsPathGeneric | RouteLocationAsRelativeGeneric;
  icon?: string;
}>();
</script>

<template>
  <div class="d-flex">
    <v-icon v-if="props.icon" class="me-2">{{ props.icon }}</v-icon>
    <router-link class="d-flex align-center" :to="props.path">
      {{ props.name }}
    </router-link>
  </div>
</template>
