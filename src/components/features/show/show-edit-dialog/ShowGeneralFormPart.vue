<script setup lang="ts">
import type { ShowGeneralFormData } from './ShowGeneralFormData';
import { computed } from 'vue';
import { useConfirmDialog } from '@/composables/dialog/useConfirmDialog';
import { getPrimaryTitle } from '@/utils/show/getPrimaryTitle';
import { getRules } from './showGeneralFormRules';

const show = defineModel<ShowGeneralFormData | null>('show', { required: true });

const rules = computed(() => getRules(show.value));

const { confirm } = useConfirmDialog();

const getShowTitleRoundedClass = (index: number) => {
  if (index === 0) {
    return 'b-0';
  }

  if (index === (show.value?.titles.length || 1) - 1) {
    return 't-0';
  }

  return '0';
};

const removeTitle = async (index: number) => {
  const hasTitleTitle = !!show.value?.titles[index].title;
  if (hasTitleTitle) {
    const isConfirmed = await confirm({
      message: 'Are you sure you want to remove this title?',
      confirmColor: 'error',
      confirmText: 'Remove',
    });

    if (!isConfirmed) {
      return;
    }
  }

  const wasPrimary = show.value?.titles[index].is_primary;

  show.value?.titles.splice(index, 1);

  if (wasPrimary) {
    setPrimaryTitle(0);
  }
};

const setPrimaryTitle = (index: number) => {
  if (!show.value) {
    return;
  }

  for (const [i, title] of show.value.titles.entries()) {
    title.is_primary = i === index;
  }
};

const addTitle = () => {
  show.value?.titles.push({ title: '', is_primary: false });
};

const googleSearch = (searchTerm: string, options: { isImageSearch?: boolean; size?: 'm' | 'l' } = {}) => {
  const { isImageSearch = false, size } = options;
  const baseUrl = 'https://www.google.com/search';
  const params = new URLSearchParams({ q: searchTerm });

  if (isImageSearch) {
    params.set('tbm', 'isch');

    if (size) {
      params.set('tbs', `isz:${size}`);
    }
  }

  window.open(`${baseUrl}?${params.toString()}`, '_blank');
};

const youTubeSearch = (searchTerm: string) => {
  const baseUrl = 'https://www.youtube.com/results';
  const params = new URLSearchParams({ search_query: searchTerm });

  window.open(`${baseUrl}?${params.toString()}`, '_blank');
};
</script>

<template>
  <v-row gap="0">
    <v-col v-for="(title, index) in show?.titles" cols="12" :key="index">
      <v-text-field
        v-model="show!.titles[index].title"
        :class="{ required: index === 0 }"
        :label="index === 0 ? 'Show title' : undefined"
        :rounded="getShowTitleRoundedClass(index)"
        :rules="[...rules.title, (value: string) => rules.titles(value, index)]"
        :style="{ marginTop: index === 0 ? undefined : '-1px' }"
      >
        <template #append>
          <div class="d-flex ga-2">
            <v-btn
              :icon="title.is_primary ? 'mdi-star' : 'mdi-star-outline'"
              size="x-small"
              @click="setPrimaryTitle(index)"
            ></v-btn>
            <v-btn
              :disabled="show!.titles.length === 1"
              color="error"
              icon="mdi-trash-can"
              size="x-small"
              @click="removeTitle(index)"
            ></v-btn>
          </div>
        </template>
      </v-text-field>
    </v-col>
    <v-col cols="12">
      <v-btn size="small" variant="text" @click="addTitle"> Add another title </v-btn>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12">
      <v-textarea v-model="show!.description" :rules="rules.description" label="Description">
        <template #append>
          <v-btn
            icon="mdi-auto-fix"
            size="small"
            @click="googleSearch('Short description for show: ' + getPrimaryTitle(show))"
            v-tooltip:bottom="'Autofill search'"
          />
        </template>
      </v-textarea>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12">
      <v-text-field v-model="show!.banner_url" :rules="rules.bannerUrl" label="Banner URL">
        <template #append>
          <v-btn
            icon="mdi-auto-fix"
            size="small"
            @click="googleSearch('Wallpaper ' + getPrimaryTitle(show) + ' show', { isImageSearch: true, size: 'l' })"
            v-tooltip:bottom="'Autofill search'"
          />
        </template>
      </v-text-field>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12" md="6">
      <v-text-field v-model="show!.card_image_url" :rules="rules.cardImageUrl" label="Card Image URL">
        <template #append>
          <v-btn
            icon="mdi-auto-fix"
            size="small"
            @click="googleSearch('Cover image ' + getPrimaryTitle(show), { isImageSearch: true })"
            v-tooltip:bottom="'Autofill search'"
          />
        </template>
      </v-text-field>
    </v-col>
    <v-col cols="12" md="6">
      <v-text-field v-model="show!.preview_url" :rules="rules.previewUrl" label="Preview URL (YouTube)">
        <template #append>
          <v-btn
            icon="mdi-auto-fix"
            size="small"
            @click="youTubeSearch(getPrimaryTitle(show) + ' trailer')"
            v-tooltip:bottom="'Autofill search'"
          />
        </template>
      </v-text-field>
    </v-col>
  </v-row>
</template>
