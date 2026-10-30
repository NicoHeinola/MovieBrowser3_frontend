<script setup lang="ts">
import type { Show } from '@/interfaces/api/models/Show';
import { ref } from 'vue';
import { useCommonSnackbar } from '@/composables/snackbar/useCommonSnackbar';
import { showService } from '@/services/show/showService';
import { getPrimaryTitle } from '@/utils/show/getPrimaryTitle';
import { getShowLinkTypeIcon } from '@/utils/show/getShowLinkTypeIcon';

const show = defineModel<Show | null>('show', { required: true });

const isLoadingNextShow = ref<boolean>(false);

const { showAPIErrorSnackbar } = useCommonSnackbar();

/**
 * Loads a linked show and replaces the current one with it.
 * @param showId - The id of the show to switch to.
 */
const changeShow = async (showId: number): Promise<void> => {
  if (isLoadingNextShow.value) {
    return;
  }

  isLoadingNextShow.value = true;

  try {
    show.value = await showService.get(showId);
  } catch (error: unknown) {
    showAPIErrorSnackbar(error);
  } finally {
    isLoadingNextShow.value = false;
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
                  :class="{ link: !isLoadingNextShow, 'text-medium-emphasis': isLoadingNextShow }"
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
