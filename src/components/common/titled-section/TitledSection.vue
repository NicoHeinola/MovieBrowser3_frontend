<script setup lang="ts">
const props = defineProps<{
  title: string;
  icon?: string;
  iconColor?: string;
  subtitle?: string;
}>();
</script>

<template>
  <v-col class="position-relative" cols="12">
    <v-row gap="12">
      <v-col class="z-10" cols="12">
        <div class="d-flex ga-4 align-center">
          <slot name="prepend" />
          <v-sheet border="white sm" class="px-2 py-1" color="surface" rounded="lg" v-if="props.icon">
            <v-icon :color="props.iconColor" size="small">{{ props.icon }}</v-icon>
          </v-sheet>
          <h1>{{ props.title }}</h1>
          <slot name="append" />
        </div>
        <p class="text-body-medium text-medium-emphasis" v-if="props.subtitle">{{ props.subtitle }}</p>
      </v-col>
      <v-col cols="12">
        <slot />
      </v-col>
    </v-row>
  </v-col>
</template>
