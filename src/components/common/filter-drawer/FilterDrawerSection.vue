<script setup lang="ts">
import { SectionLabel } from '@/components/common/section-label';

const props = defineProps<{
  title: string;
}>();
</script>

<template>
  <v-col cols="12">
    <v-row gap="12">
      <v-col cols="12">
        <section-label :title="props.title">
          <template #subtitle v-if="$slots.subtitle">
            <slot name="subtitle" />
          </template>
        </section-label>
      </v-col>
      <slot />
    </v-row>
  </v-col>
</template>
