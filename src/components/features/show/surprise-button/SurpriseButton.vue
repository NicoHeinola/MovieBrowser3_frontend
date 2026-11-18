<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  /** Tooltip text, "Surprise me" by default. */
  tooltip?: string;
}>();

const { t } = useI18n();
</script>

<template>
  <v-btn
    class="surprise-button"
    color="primary"
    density="comfortable"
    icon="mdi-dice-multiple"
    variant="flat"
    v-tooltip:bottom="props.tooltip ?? t('show.surpriseMe')"
  />
</template>

<style lang="scss" scoped>
// The dice rolls on hover, so the button invites a press.
.surprise-button:hover:not(.v-btn--disabled) :deep(.v-icon) {
  animation: dice-roll 0.6s ease-in-out;
}

@keyframes dice-roll {
  0% {
    transform: rotate(0deg) scale(1);
  }

  60% {
    transform: rotate(380deg) scale(1.2);
  }

  100% {
    transform: rotate(360deg) scale(1);
  }
}
</style>
