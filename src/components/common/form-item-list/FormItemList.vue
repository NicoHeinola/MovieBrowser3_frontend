<script setup lang="ts">
const props = defineProps<{
  /** Whether the list has items. Without them, the actions sit at the top with no gap above. */
  hasItems: boolean;
}>();
</script>

<template>
  <v-row gap="12">
    <!-- v-show, not v-if: drop zones in the slot must stay mounted while the list is empty. -->
    <v-col cols="12" v-show="props.hasItems">
      <slot />
    </v-col>
    <v-col class="d-flex flex-wrap align-center ga-2" cols="12">
      <slot name="actions" />
    </v-col>
  </v-row>
</template>
