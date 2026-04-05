<script lang="ts" setup>
const props = defineProps<{
  isSelected?: boolean;
  imageUrl?: string;
}>();
</script>

<template>
  <v-card :style="{ outline: props.isSelected ? '1px solid white' : '' }" class="pa-0 bg-white">
    <v-img :src="props.imageUrl" class="h-100 w-100" cover></v-img>
  </v-card>
</template>
