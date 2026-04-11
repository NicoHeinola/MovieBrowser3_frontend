<script setup lang="ts">
import type { ExpandableTextProps } from './expandableTextProps';
import { computed } from 'vue';

const props = withDefaults(defineProps<ExpandableTextProps>(), {
  maxChars: 150,
});

const isExpanded = defineModel<boolean>({
  default: false,
});

const shouldTruncate = computed(() => {
  if (!props.text) return false;
  return props.text.length > props.maxChars;
});

const displayedText = computed(() => {
  if (!props.text) return '';
  if (!shouldTruncate.value || isExpanded.value) return props.text;
  return props.text.slice(0, props.maxChars) + '...';
});

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<template>
  <div>
    <span class="text-pre-wrap text-body-1">{{ displayedText }}</span>
    <div>
      <v-btn class="pa-0" color="link" density="compact" variant="text" @click="toggleExpand" v-if="shouldTruncate">
        {{ isExpanded ? 'Show Less' : 'Show More' }}
      </v-btn>
    </div>
  </div>
</template>
