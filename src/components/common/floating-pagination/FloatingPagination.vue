<script setup lang="ts">
const length = defineModel<number>('length', {
  default: 1,
});

const page = defineModel<number>('page', {
  default: 1,
});
</script>

<template>
  <div class="position-fixed bottom-0 w-100" style="z-index: 100">
    <v-slide-y-reverse-transition>
      <v-row justify="center" no-gutters v-if="length > 1">
        <v-col cols="12" lg="5" md="4" xl="3">
          <v-sheet class="glass-panel" elevation="2" rounded="xl" border>
            <v-pagination v-model="page" :length="length" density="comfortable" variant="text" />
          </v-sheet>
        </v-col>
      </v-row>
    </v-slide-y-reverse-transition>
  </div>
</template>
