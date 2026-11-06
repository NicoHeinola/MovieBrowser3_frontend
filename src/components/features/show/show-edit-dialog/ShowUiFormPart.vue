<script setup lang="ts">
import type { ShowUiFormData } from './ShowUiFormData';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { MediaPreviewCard } from '@/components/common/media-preview-card';
import { getPrimaryTitle } from '@/utils/show/getPrimaryTitle';

import { getRules } from './showUiFormRules';

const { t } = useI18n();

const show = defineModel<ShowUiFormData>('show', { required: true });

const rules = computed(() => getRules(show.value));

const googleSearch = (searchTerm: string, size?: 'm' | 'l') => {
  const baseUrl = 'https://www.google.com/search';
  const params = new URLSearchParams({ q: searchTerm, tbm: 'isch' });

  if (size) {
    params.set('tbs', `isz:${size}`);
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
  <v-row>
    <v-col cols="12">
      <media-preview-card :image-src="show?.banner_url" :placeholder-text="t('show.noBanner')">
        <v-text-field
          v-model="show!.banner_url"
          :label="t('show.bannerUrl')"
          :rules="rules.bannerUrl"
          class="glass-panel rounded-lg required"
        >
          <template #prepend-inner>
            <v-icon icon="mdi-help-circle" v-tooltip:bottom="t('show.bannerHint')" />
          </template>
        </v-text-field>
        <v-btn
          class="glass-panel"
          color="primary"
          icon="mdi-auto-fix"
          size="small"
          @click="googleSearch('Wallpaper ' + getPrimaryTitle(show) + ' show', 'l')"
          v-tooltip:bottom="t('show.autofill')"
        />
      </media-preview-card>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12" md="6">
      <media-preview-card
        :height="200"
        :image-src="show?.card_image_url"
        :placeholder-text="t('show.noCardImage')"
        disable-preview
      >
        <v-text-field
          v-model="show!.card_image_url"
          :label="t('show.cardImageUrl')"
          :rules="rules.cardImageUrl"
          class="glass-panel rounded-lg required"
        >
          <template #prepend-inner>
            <v-icon icon="mdi-help-circle" v-tooltip:bottom="t('show.cardImageHint')" />
          </template>
        </v-text-field>
        <v-btn
          class="glass-panel"
          color="primary"
          icon="mdi-auto-fix"
          size="small"
          @click="googleSearch('Cover image ' + getPrimaryTitle(show))"
          v-tooltip:bottom="t('show.autofill')"
        />
      </media-preview-card>
    </v-col>
    <v-col cols="12" md="6">
      <media-preview-card
        :height="200"
        :placeholder-text="t('show.noPreview')"
        :video-src="show?.preview_url"
        placeholder-icon="mdi-youtube"
      >
        <v-text-field
          v-model="show!.preview_url"
          :label="t('show.previewUrl')"
          :rules="rules.previewUrl"
          class="glass-panel rounded-lg"
        >
          <template #prepend-inner>
            <v-icon icon="mdi-help-circle" v-tooltip:bottom="t('show.previewHint')" />
          </template>
        </v-text-field>
        <v-btn
          class="glass-panel"
          color="primary"
          icon="mdi-auto-fix"
          size="small"
          @click="youTubeSearch(getPrimaryTitle(show) + ' trailer')"
          v-tooltip:bottom="t('show.autofill')"
        />
      </media-preview-card>
    </v-col>
  </v-row>
</template>
