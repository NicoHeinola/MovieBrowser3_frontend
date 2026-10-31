<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';
import { SectionLabel } from '@/components/common/section-label';
import { getPrimaryTitle } from '@/utils/show/getPrimaryTitle';
import { getShowLinkTypeIcon } from '@/utils/show/getShowLinkTypeIcon';

const props = defineProps<{
  isLoading: boolean;
  show: Show | null;
}>();

const showId = defineModel<number | null>('showId', { required: true });

/**
 * Switches the drawer to a linked show; the drawer loads it.
 * @param targetShowId - The id of the show to switch to.
 */
const changeShow = (targetShowId: number): void => {
  if (!props.isLoading) {
    showId.value = targetShowId;
  }
};
</script>

<template>
  <v-row v-if="(show?.outgoing_links?.length ?? 0) > 0">
    <v-col cols="12">
      <v-divider></v-divider>
    </v-col>

    <v-col cols="12">
      <section-label title="Related shows" />
    </v-col>

    <v-col
      v-for="link in show?.outgoing_links"
      class="d-flex ga-2 align-center justify-space-between"
      cols="12"
      :key="link.id"
    >
      <p
        :class="{ link: !isLoading, 'text-medium-emphasis': isLoading }"
        class="text-body-medium cursor-pointer text-truncate"
        @click="changeShow(link.target_show!.id)"
      >
        {{ getPrimaryTitle(link.target_show) }}
      </p>
      <v-chip color="primary" size="small" variant="tonal">
        <v-icon :icon="getShowLinkTypeIcon(link.type)" start />
        {{ $t(`showLink.type.${link.type}`) }}
      </v-chip>
    </v-col>
  </v-row>
</template>
