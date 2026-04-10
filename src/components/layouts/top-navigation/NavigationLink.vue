<script lang="ts" setup>
const props = defineProps<{
  label: string;
  routeName: string;
  icon?: string;
}>();
</script>

<template>
  <router-link :to="{ name: props.routeName }" class="d-flex ga-2 align-center nav-link-wrapper">
    <v-icon v-if="props.icon">
      {{ props.icon }}
    </v-icon>
    <span>
      {{ props.label }}
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
