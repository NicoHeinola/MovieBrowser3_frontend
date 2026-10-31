<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';
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
      <v-expansion-panels color="background" variant="accordion">
        <v-expansion-panel>
          <v-expansion-panel-title class="text-body-2 text-medium-emphasis">
            Related shows ({{ show?.outgoing_links?.length ?? 0 }})
          </v-expansion-panel-title>

          <v-expansion-panel-text>
            <v-list density="compact">
              <v-list-item
                v-for="link in show?.outgoing_links"
                class="d-flex ga-2 justify-space-between"
                :key="link.id"
              >
                <p
                  :class="{ link: !isLoading, 'text-medium-emphasis': isLoading }"
                  class="text-body-medium cursor-pointer text-truncate"
                  @click="changeShow(link.target_show!.id)"
                >
                  {{ getPrimaryTitle(link.target_show) }}
                </p>
                <template #append>
                  <v-chip color="primary" size="small" variant="tonal">
                    <v-icon :icon="getShowLinkTypeIcon(link.type)" start />
                    {{ $t(`showLink.type.${link.type}`) }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-col>
  </v-row>
</template>
