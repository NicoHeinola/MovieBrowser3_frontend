<script setup lang="ts">
import type { NekoBtBadge } from '@/interfaces/nekobt/NekoBtBadge';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  badge: NekoBtBadge;
}>();

const { t } = useI18n();
</script>

<template>
  <!-- A plain span, not a chip: a page of torrents shows hundreds of these. The help explains what each one means. -->
  <span :class="`bg-${props.badge.color}`" class="rounded-sm px-2 text-label-small font-weight-bold text-no-wrap">
    {{ t(props.badge.textKey) }}
  </span>
</template>
