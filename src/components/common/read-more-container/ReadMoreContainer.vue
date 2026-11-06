<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core';
import { computed, ref, useTemplateRef } from 'vue';
import { useI18n } from 'vue-i18n';

const props = withDefaults(
  defineProps<{
    /** Height in pixels the content is cut to while collapsed. */
    collapsedHeight?: number;
    /** Whether the content starts fully shown. The user can still collapse it. */
    defaultExpanded?: boolean;
  }>(),
  { collapsedHeight: 320, defaultExpanded: false },
);

/** Whether the whole content is shown. */
const isExpanded = ref<boolean>(props.defaultExpanded);

/** The content's full height, tracked so short content shows no button. */
const contentHeight = ref<number>(0);

const content = useTemplateRef<HTMLElement>('content');
const { t } = useI18n();

/** Whether the content is tall enough to need collapsing, with slack so a slightly taller one is not cut. */
const isCollapsible = computed<boolean>(() => contentHeight.value > props.collapsedHeight * 1.2);

/** Whether the content is currently cut and faded. */
const isCut = computed<boolean>(() => isCollapsible.value && !isExpanded.value);

useResizeObserver(content, (entries) => {
  contentHeight.value = entries[0]?.target.scrollHeight ?? 0;
});
</script>

<template>
  <div class="position-relative">
    <div
      :style="{
        // Heights are explicit in both states, because CSS cannot animate to or from `auto`.
        height: isCollapsible ? `${isCut ? props.collapsedHeight : contentHeight}px` : undefined,
        overflow: 'hidden',
        transition: 'height 0.3s ease',
        // Fade the cut content out with a mask, which works on any surface color.
        maskImage: isCut ? 'linear-gradient(to bottom, black 55%, transparent 100%)' : undefined,
      }"
    >
      <div ref="content">
        <slot />
      </div>
    </div>

    <!-- Floats over the faded bottom edge while collapsed, and sits under the content once expanded. -->
    <div
      :class="isCut ? 'position-absolute w-100 bottom-0' : 'mt-2'"
      class="d-flex justify-center"
      v-if="isCollapsible"
    >
      <v-btn color="link" variant="text" @click="isExpanded = !isExpanded">
        {{ isExpanded ? t('common.showLess') : t('changelog.readMore') }}
      </v-btn>
    </div>
  </div>
</template>
