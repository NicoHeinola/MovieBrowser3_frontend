<script lang="ts" setup>
import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router';

const props = defineProps<{
  name: string;
  path: string | RouteLocationAsPathGeneric | RouteLocationAsRelativeGeneric;
  icon?: string;
}>();
</script>

<template>
  <router-link class="d-flex ga-2 align-center nav-link-wrapper" :to="props.path">
    <v-icon v-if="props.icon">
      {{ props.icon }}
    </v-icon>
    <span>
      {{ props.name }}
    </span>
  </router-link>
</template>

<style lang="scss" scoped>
.nav-link-wrapper {
  cursor: pointer;

  span {
    transition:
      color 220ms ease,
      text-shadow 220ms ease,
      transform 220ms ease;
  }

  :deep(.v-icon) {
    transition: color 220ms ease;
  }

  &:hover {
    color: rgb(var(--v-theme-link));
    text-decoration: none !important;
    text-shadow: 0 0 8px rgba(var(--v-theme-link), 0.55);

    span {
      transform: translateY(-2px);
    }

    :deep(.v-icon) {
      color: rgb(var(--v-theme-link)) !important;
    }
  }
}
</style>
