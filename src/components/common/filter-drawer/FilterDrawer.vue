<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  activeFilterCount: number;
  totalResults: number;
  isLoading: boolean;
}>();

const isShown = defineModel<boolean>('isShown', {
  default: false,
});

const emit = defineEmits<{
  clear: [];
}>();

const resultLabel = computed<string>(() => {
  return `Show ${props.totalResults} result${props.totalResults === 1 ? '' : 's'}`;
});
</script>

<template>
  <v-navigation-drawer
    v-model="isShown"
    location="right"
    style="height: 100vh !important; top: 0; z-index: 2000"
    width="470"
    temporary
  >
    <v-container>
      <v-row align="center">
        <v-col cols="auto">
          <v-sheet border="white sm" class="px-2 py-1" color="surface" rounded="lg">
            <v-icon color="primary" size="small">mdi-tune-variant</v-icon>
          </v-sheet>
        </v-col>
        <v-col>
          <h2>Filters</h2>
        </v-col>
        <v-col cols="auto">
          <v-btn color="default" icon="mdi-close" variant="text" @click="isShown = false" />
        </v-col>
      </v-row>
    </v-container>

    <v-divider />

    <v-container>
      <v-row>
        <slot />
      </v-row>
    </v-container>

    <template #append>
      <v-divider />
      <v-container>
        <v-row density="compact">
          <v-col cols="auto">
            <v-btn
              :disabled="props.activeFilterCount === 0"
              color="default"
              prepend-icon="mdi-filter-off-outline"
              variant="text"
              @click="emit('clear')"
            >
              Clear
            </v-btn>
          </v-col>
          <v-col>
            <v-btn :loading="props.isLoading" variant="flat" block @click="isShown = false">
              {{ resultLabel }}
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </v-navigation-drawer>
</template>
