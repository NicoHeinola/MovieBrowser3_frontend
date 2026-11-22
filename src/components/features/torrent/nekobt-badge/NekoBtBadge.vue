<script setup lang="ts">
import type { NekoBtBadge } from '@/interfaces/nekobt/NekoBtBadge';
import { useI18n } from 'vue-i18n';

const props = withDefaults(
  defineProps<{
    badge: NekoBtBadge;
    /** Shows the badge's hint on hover; off where the hint is written out next to it. */
    showHint?: boolean;
  }>(),
  {
    showHint: true,
  },
);

const { t } = useI18n();
</script>

<template>
  <!-- A plain span with a `title`, not a chip with a tooltip: a page of torrents shows hundreds of these. -->
  <span
    :class="`bg-${props.badge.color}`"
    :title="props.showHint && props.badge.hintKey ? t(props.badge.hintKey) : undefined"
    class="rounded-sm px-2 text-label-small font-weight-bold text-no-wrap"
  >
    {{ t(props.badge.textKey) }}
  </span>
</template>
