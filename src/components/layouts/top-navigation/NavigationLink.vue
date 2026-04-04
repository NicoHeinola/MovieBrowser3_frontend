<script lang="ts" setup>
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router';

const props = defineProps<{
  name: string;
  path: string | RouteLocationAsPathGeneric | RouteLocationAsRelativeGeneric;
  icon?: string;
}>();
</script>

<template>
  <div class="d-flex nav-link-wrapper">
    <v-icon v-if="props.icon" class="me-2">{{ props.icon }}</v-icon>
    <router-link class="d-flex align-center" :to="props.path">
      {{ props.name }}
    </router-link>
  </div>
</template>

<style lang="scss" scoped>
.nav-link-wrapper {
  cursor: pointer;

  :deep(.v-icon) {
    transition: color 220ms ease;
  }

  a {
    transition:
      color 220ms ease,
      text-shadow 220ms ease,
      transform 220ms ease;
  }

  &:hover {
    a {
      color: rgb(var(--v-theme-link));
      text-decoration: none !important;
      text-shadow: 0 0 8px rgba(var(--v-theme-link), 0.55);
      transform: translateY(-2px);
    }

    :deep(.v-icon) {
      color: rgb(var(--v-theme-link)) !important;
    }
  }
}
</style>
