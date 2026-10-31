<script setup lang="ts">
import type { FilterChipState } from '@/components/common/filter-chip';
import type { WebsiteSearchFilters } from '@/composables/website/WebsiteSearchFilters';
import type { WebsiteTag } from '@/interfaces/api/models/WebsiteTag';
import type { PaginatedResponse } from '@/interfaces/api/responses/PaginatedResponse';
import { computed, watch } from 'vue';

import { FilterChip } from '@/components/common/filter-chip';
import { FilterDrawer, FilterDrawerSection } from '@/components/common/filter-drawer';
import { useAPIQuery } from '@/composables/api/useAPIQuery';
import { WebsiteTagQueryKey } from '@/enums/query/websiteTagQueryKey';
import { websiteTagService } from '@/services/website/websiteTagService';
import { getFilterState } from '@/utils/filter/getFilterState';
import { toggleFilterValue } from '@/utils/filter/toggleFilterValue';

const props = defineProps<{
  activeFilterCount: number;
  totalResults: number;
  isLoading: boolean;
}>();

const isShown = defineModel<boolean>('isShown', {
  default: false,
});

const filters = defineModel<WebsiteSearchFilters>('filters', { required: true });

const emit = defineEmits<{
  clear: [];
}>();

const tagsQuery = useAPIQuery<PaginatedResponse<WebsiteTag>>({
  queryKey: [WebsiteTagQueryKey.WebsiteFilterTags],
  queryFn: async () => {
    return await websiteTagService.list({
      sort: 'name',
      page: { number: 0, size: 0 },
    });
  },
  placeholderData: (previousData) => previousData,
});

const tags = computed<WebsiteTag[]>(() => tagsQuery.data.value?.data ?? []);

/**
 * Includes, excludes or stops filtering on a tag.
 * @param tagId - The tag id.
 * @param state - The new filter state.
 * @returns void
 */
const setTagState = (tagId: number, state: FilterChipState): void => {
  filters.value = {
    tagIds: toggleFilterValue(filters.value.tagIds, tagId, state === 'include'),
    excludedTagIds: toggleFilterValue(filters.value.excludedTagIds, tagId, state === 'exclude'),
  };
};

watch(tags, (currentTags) => {
  /** Stop filtering on tags that were deleted, which would otherwise hide every website without a visible chip. */
  const tagIds = new Set(currentTags.map((tag) => tag.id));
  const { tagIds: included, excludedTagIds: excluded } = filters.value;

  if (tagsQuery.isPending.value || [...included, ...excluded].every((tagId) => tagIds.has(tagId))) {
    return;
  }

  filters.value = {
    tagIds: included.filter((tagId) => tagIds.has(tagId)),
    excludedTagIds: excluded.filter((tagId) => tagIds.has(tagId)),
  };
});
</script>

<template>
  <filter-drawer
    v-model:is-shown="isShown"
    :active-filter-count="props.activeFilterCount"
    :is-loading="props.isLoading"
    :total-results="props.totalResults"
    @clear="emit('clear')"
  >
    <filter-drawer-section title="Tags">
      <template #subtitle>
        Matches <span class="text-primary">every</span> included, <span class="text-error">none</span> excluded.
      </template>
      <v-col cols="12" v-if="tagsQuery.isPending.value">
        <v-skeleton-loader class="bg-transparent" type="chip@6" />
      </v-col>
      <v-col class="d-flex flex-wrap ga-3" cols="12" v-else-if="tags.length > 0">
        <filter-chip
          v-for="tag in tags"
          :model-value="getFilterState(filters.tagIds, filters.excludedTagIds, tag.id)"
          :text="tag.websites_count === undefined ? tag.name : `${tag.name} · ${tag.websites_count}`"
          @update:model-value="setTagState(tag.id, $event)"
          :key="tag.id"
        />
      </v-col>
      <v-col cols="12" v-else>
        <p class="text-body-small text-disabled">No tags yet.</p>
      </v-col>
    </filter-drawer-section>
  </filter-drawer>
</template>
