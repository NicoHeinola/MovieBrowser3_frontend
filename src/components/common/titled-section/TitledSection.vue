<script setup lang="ts">
import { HeadingText } from '@/components/common/heading-text';

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
        <heading-text :subtitle="props.subtitle" :title="props.title">
          <template #prepend>
            <slot name="prepend" />
            <v-sheet border="white sm" class="pa-2" color="surface" rounded="lg" v-if="props.icon">
              <v-icon :color="props.iconColor" size="small">{{ props.icon }}</v-icon>
            </v-sheet>
          </template>
          <template #append>
            <slot name="append" />
          </template>
        </heading-text>
      </v-col>
      <v-col cols="12">
        <slot />
      </v-col>
    </v-row>
  </v-col>
</template>
