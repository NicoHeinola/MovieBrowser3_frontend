<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { YouTubePlayer } from '@/components/common/youtube-player';
import { useSettingStore } from '@/stores/setting/useSettingStore';
import { getYouTubeVideoId } from '@/utils/youtube/getYouTubeVideoId';

const activeVideoUrl = ref<string | null>(null);

const settingStore = useSettingStore();

const items = computed<Array<{ thumbnailUrl: string | null; url: string; videoId: string | null }>>(() => {
  return settingStore.bannerDefaultVideos.map((url: string) => {
    const videoId = getYouTubeVideoId(url);

    return {
      url,
      videoId,
      thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null,
    };
  });
});

const isActiveVideo = (url: string): boolean => {
  return activeVideoUrl.value === url;
};

const playVideo = (url: string, videoId: string | null): void => {
  if (!videoId) {
    return;
  }

  activeVideoUrl.value = url;
};

const stopVideo = (): void => {
  activeVideoUrl.value = null;
};

watch(items, (nextItems) => {
  if (!activeVideoUrl.value) {
    return;
  }

  const hasActiveVideo = nextItems.some((item) => item.url === activeVideoUrl.value);

  if (!hasActiveVideo) {
    activeVideoUrl.value = null;
  }
});
</script>

<template>
  <v-skeleton-loader type="card" width="390" v-if="settingStore.isLoading" />

  <div class="d-flex" v-else-if="items.length === 0">
    <v-alert class="flex-0-1" type="info" border> No videos available. </v-alert>
  </div>

  <v-row v-else>
    <v-col v-for="item in items" cols="auto" :key="item.url">
      <v-card class="overflow-hidden" width="390" border>
        <div class="position-relative" style="height: 220px">
          <template v-if="item.videoId && isActiveVideo(item.url)">
            <you-tube-player
              :autoplay="true"
              :controls="true"
              :loop="false"
              :muted="false"
              :video-id="item.videoId"
              :volume="20"
              @error="stopVideo"
            />
          </template>

          <v-img :src="item.thumbnailUrl" class="cursor-pointer" height="220" cover v-else-if="item.thumbnailUrl">
            <div class="position-absolute w-100 h-100 d-flex align-center justify-center">
              <v-btn
                class="h-100 w-100"
                color="transparent"
                variant="elevated"
                @click.stop="playVideo(item.url, item.videoId)"
              >
                <v-btn color="surface" icon="mdi-play" style="pointer-events: none" variant="elevated"></v-btn>
              </v-btn>
            </div>
          </v-img>

          <v-sheet class="d-flex align-center justify-center" color="background" height="220" v-else>
            <div class="d-flex flex-column align-center ga-2 text-medium-emphasis">
              <v-icon icon="mdi-youtube" size="40" />
              <span class="text-body-2">Preview unavailable</span>
            </div>
          </v-sheet>
        </div>

        <v-card-text>
          <div class="d-flex align-center ga-4">
            <div class="d-flex ga-2 flex-0-1-100 text-truncate">
              <v-icon color="error" icon="mdi-youtube" />

              <a
                :href="item.url"
                class="text-medium-emphasis link text-truncate"
                rel="noopener noreferrer"
                target="_blank"
              >
                {{ item.url }}
              </a>
            </div>

            <div class="flex-0-0">
              <slot :url="item.url" name="actions" />
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
