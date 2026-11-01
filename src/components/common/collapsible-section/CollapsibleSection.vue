<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { SectionLabel } from '@/components/common/section-label';

const { t } = useI18n();

const props = defineProps<{
  /** The section label, also used in the toggle button's aria label. */
  title: string;
}>();

/** Whether the section body is shown. */
const isOpen = defineModel<boolean>({
  default: true,
});
</script>

<template>
  <v-row>
    <v-col cols="12">
      <!-- The button's click bubbles here, so the whole header toggles once. -->
      <div class="d-flex ga-2 align-center justify-space-between cursor-pointer" @click="isOpen = !isOpen">
        <section-label :title="props.title" />
        <v-btn
          :aria-label="
            isOpen ? t('common.closeSection', { title: props.title }) : t('common.openSection', { title: props.title })
          "
          :icon="isOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          class="text-medium-emphasis"
          color="default"
          size="small"
          variant="text"
        />
      </div>
    </v-col>
  </v-row>

  <!--
    The row margin above the body would only snap shut after the height animation, so it is zeroed and
    an inner padding collapses with the content instead. The body stays a row so later sibling rows keep their margin.
  -->
  <v-expand-transition>
    <v-row class="mt-0" v-show="isOpen">
      <v-col class="pt-6" cols="12">
        <v-row>
          <slot />
        </v-row>
      </v-col>
    </v-row>
  </v-expand-transition>
</template>
