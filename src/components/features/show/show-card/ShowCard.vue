<script lang="ts" setup>
const props = defineProps<{
  isSelected?: boolean;
  imageUrl?: string;
}>();
</script>

<template>
  <v-card :class="{ 'border-sm': props.isSelected }" class="pa-0 bg-white">
    <v-img :src="props.imageUrl" class="h-100 w-100" cover></v-img>
  </v-card>
</template>
