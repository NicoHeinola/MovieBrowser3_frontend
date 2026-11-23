<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { SurpriseButton } from '@/components/features/show/surprise-button';
import { useSurpriseShow } from '@/composables/show/useSurpriseShow';
import { useShowDrawerStore } from '@/stores/show/useShowDrawerStore';

const showDrawerStore = useShowDrawerStore();
const { t } = useI18n();

// Shown as the drawer's action, so a new pick only swaps the show and this button stays.
const { isPicking, pickShow } = useSurpriseShow((show) => {
  showDrawerStore.showId = show.id;
});
</script>

<template>
  <surprise-button
    :loading="isPicking"
    :tooltip="t('show.pickAnother')"
    density="default"
    variant="text"
    @click="pickShow"
  />
</template>
