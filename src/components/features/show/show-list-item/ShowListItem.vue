<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';

import { CoverListItem } from '@/components/common/cover-list-item';
import { getPrimaryTitle } from '@/utils/show/getPrimaryTitle';

/** A show as a list row with its cover. Listeners such as `@click` and props such as `value` fall through to the row. */
const props = defineProps<{
  show: Show;
  subtitle?: string;
}>();
</script>

<template>
  <cover-list-item
    :image-url="props.show.card_image_url"
    :subtitle="props.subtitle"
    :title="getPrimaryTitle(props.show)"
    icon="mdi-television-classic"
  />
</template>
