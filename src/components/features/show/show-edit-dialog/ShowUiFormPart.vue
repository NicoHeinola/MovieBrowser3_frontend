<script setup lang="ts">
import type { ShowUiFormData } from './ShowUiFormData';

import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { MediaPlaceholder } from '@/components/common/media-placeholder';
import { YouTubePlayer } from '@/components/common/youtube-player';
import { getPrimaryTitle } from '@/utils/show/getPrimaryTitle';
import { getYouTubeVideoId } from '@/utils/youtube/getYouTubeVideoId';

import { getRules } from './showUiFormRules';

const { t } = useI18n();

const show = defineModel<ShowUiFormData>('show', { required: true });

const rules = computed(() => getRules(show.value));

const youTubeVideoId = computed<string | null>(() => getYouTubeVideoId(show.value?.preview_url ?? ''));

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
      <v-card :image="show!.banner_url" border="sm">
        <v-card-text class="d-flex align-center justify-center" style="height: 300px">
          <v-slide-y-transition>
            <media-placeholder :text="t('show.noBanner')" icon="mdi-image-off-outline" v-if="!show?.banner_url" />
          </v-slide-y-transition>
        </v-card-text>
        <v-card-actions>
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
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>

  <v-row>
    <v-col cols="12" md="6">
      <v-card :image="show!.card_image_url" border="sm">
        <v-card-text class="d-flex align-center justify-center" style="height: 200px">
          <v-slide-y-transition>
            <media-placeholder
              :text="t('show.noCardImage')"
              icon="mdi-image-off-outline"
              v-if="!show?.card_image_url"
            />
          </v-slide-y-transition>
        </v-card-text>
        <v-card-actions>
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
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card border="sm">
        <v-card-text class="position-relative d-flex align-center justify-center pa-0" style="height: 200px">
          <v-slide-y-transition>
            <media-placeholder :text="t('show.noPreview')" icon="mdi-youtube" v-if="!youTubeVideoId" />
            <you-tube-player
              :autoplay="false"
              :controls="true"
              :loop="false"
              :muted="false"
              :video-id="youTubeVideoId"
              v-else
            />
          </v-slide-y-transition>
        </v-card-text>
        <v-card-actions>
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
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>
