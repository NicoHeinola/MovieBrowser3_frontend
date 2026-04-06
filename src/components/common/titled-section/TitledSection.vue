<script setup lang="ts">
const props = defineProps<{
  title: string;
  icon?: string;
  iconColor?: string;
}>();
</script>

<template>
  <v-col>
    <v-row gap="8">
      <v-col class="d-flex ga-2 align-center" cols="12">
        <v-icon :color="props.iconColor" v-if="props.icon">{{ props.icon }}</v-icon>
        <h1>{{ props.title }}</h1>
      </v-col>
      <v-col cols="12">
        <slot />
      </v-col>
    </v-row>
  </v-col>
</template>
