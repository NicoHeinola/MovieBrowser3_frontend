<script setup lang="ts">
import type { StorageRings } from './StorageRings';
import type { StorageSlice } from './StorageSlice';
import type { Show } from '@/interfaces/api/models/Show';
import type { EChartsOption } from 'echarts';

import { computed, getCurrentInstance, h, onBeforeUnmount, ref, render, watch } from 'vue';
import VChart from 'vue-echarts';
import { useI18n } from 'vue-i18n';
import { useTheme } from 'vuetify';
import { registerECharts } from '@/plugins/echarts/registerECharts';
import { formatFileSize } from '@/utils/file/formatFileSize';

import { getStorageSliceColor } from './getStorageSliceColor';
import { getStorageSliceLabel } from './getStorageSliceLabel';
import StorageTooltip from './StorageTooltip.vue';

const props = defineProps<{
  rings: StorageRings;
  /** All video files, shown in the middle of the ring. */
  videoBytes: number;
  /** The base of every percentage: the disk when it is known, otherwise the videos. */
  totalBytes: number;
}>();

/** The show hovered here or in the list, shared so each highlights what the other points at. */
const highlightedShowId = defineModel<number | null>('highlightedShowId', { required: true });

const emit = defineEmits<{
  'click:show': [show: Show];
}>();

// Registered here instead of in `registerPlugins`, so ECharts ships in the lazy dashboard chunk only.
registerECharts();

const chart = ref<InstanceType<typeof VChart> | null>(null);
/** The element ECharts shows as the tooltip; `StorageTooltip` is rendered into it on every hover. */
const tooltipElement = document.createElement('div');
/** This app's context, so the tooltip rendered outside the component tree can still use Vuetify. */
const appContext = getCurrentInstance()?.appContext ?? null;

const { t, locale } = useI18n();
const theme = useTheme();

const colors = computed<Record<string, string>>(() => theme.current.value.colors as Record<string, string>);

/** The show ring's position among the series: it comes after the disk ring when there is one. */
const showSeriesIndex = computed<number>(() => (props.rings.disk ? 1 : 0));

const option = computed<EChartsOption>(() => {
  const { disk, shows } = props.rings;
  const textColor = colors.value['on-surface'];
  const ringStyle = { borderColor: colors.value.surface, borderWidth: 2, borderRadius: 4 };

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: colors.value.surface,
      borderColor: colors.value['storage-free'],
      textStyle: { color: textColor },
      extraCssText: 'border-radius: 8px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);',
      formatter: (params) => {
        // ECharts hands one item for `trigger: 'item'`; the slice rides along in its data.
        const { slice } = (Array.isArray(params) ? params[0] : params).data as { slice: StorageSlice };
        return renderTooltip(slice);
      },
    },
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '42%',
        style: {
          text: formatFileSize(props.videoBytes, locale.value),
          fill: textColor,
          fontSize: 20,
          fontWeight: 600,
          align: 'center',
        },
      },
      {
        type: 'text',
        left: 'center',
        top: '54%',
        style: { text: t('dashboard.storageVideos'), fill: textColor, opacity: 0.6, fontSize: 12, align: 'center' },
      },
    ],
    series: [
      ...(disk
        ? [
            {
              type: 'pie' as const,
              radius: ['78%', '92%'],
              startAngle: 90,
              label: { show: false },
              itemStyle: ringStyle,
              emphasis: { scale: true, scaleSize: 4 },
              data: disk.map((slice) => toDatum(slice, 0)),
            },
          ]
        : []),
      {
        type: 'pie' as const,
        radius: disk ? ['56%', '74%'] : ['62%', '88%'],
        startAngle: 90,
        label: { show: false },
        itemStyle: ringStyle,
        emphasis: { scale: true, scaleSize: 6 },
        data: shows.map((slice, index) => toDatum(slice, index)),
      },
    ],
  };
});

/**
 * Turns a byte count into its share of the chart's total.
 * @param bytes - The size in bytes.
 * @returns The share, such as `12.5 %`; empty when there is no total.
 */
const getPercent = (bytes: number): string =>
  props.totalBytes > 0
    ? `${((bytes / props.totalBytes) * 100).toLocaleString(locale.value, { maximumFractionDigits: 1 })} %`
    : '';

/**
 * Renders the tooltip for a slice into the shared tooltip element.
 * @param slice - The hovered slice.
 * @returns The element for ECharts to show.
 */
const renderTooltip = (slice: StorageSlice): HTMLElement => {
  const vnode = h(StorageTooltip, {
    label: getStorageSliceLabel(slice, t),
    size: formatFileSize(slice.bytes, locale.value),
    percent: getPercent(slice.bytes),
    show: slice.show,
  });

  // Hand over the app context, so components inside (such as `v-img`) find Vuetify.
  vnode.appContext = appContext;
  render(vnode, tooltipElement);

  return tooltipElement;
};

/**
 * Builds one ECharts data item, keeping the slice on it for the tooltip and the pointer handlers.
 * @param slice - The slice.
 * @param index - Its position in its ring.
 * @returns The data item.
 */
const toDatum = (slice: StorageSlice, index: number) => ({
  value: slice.bytes,
  name: slice.show ? String(slice.show.id) : slice.kind,
  slice,
  // Only show arcs open something, so only they get the pointer.
  cursor: slice.show ? 'pointer' : 'default',
  itemStyle: {
    color: getStorageSliceColor(slice, index, colors.value),
    ...(slice.kind === 'gap' ? { borderWidth: 0 } : {}),
  },
  // The gap only spaces the show arcs; it should not react to the pointer.
  ...(slice.kind === 'gap' ? { emphasis: { disabled: true }, tooltip: { show: false }, silent: true } : {}),
});

/**
 * Reads the slice from an ECharts pointer event.
 * @param params - The event.
 * @param params.data - The data item under the pointer.
 * @returns The slice, if the event hit one.
 */
const getEventSlice = (params: { data?: unknown }): StorageSlice | undefined =>
  (params.data as { slice?: StorageSlice } | undefined)?.slice;

/**
 * Opens the clicked show.
 * @param params - The ECharts click event.
 * @param params.data - The clicked data item.
 * @returns Nothing.
 */
const handleClick = (params: { data?: unknown }): void => {
  const show = getEventSlice(params)?.show;

  if (show) {
    emit('click:show', show);
  }
};

/**
 * Shares the hovered show arc with the list.
 * @param params - The ECharts mouseover event.
 * @param params.data - The hovered data item.
 * @returns Nothing.
 */
const handleMouseover = (params: { data?: unknown }): void => {
  highlightedShowId.value = getEventSlice(params)?.show?.id ?? null;
};

// Mirror a hovered list row onto its arc. Hovering the arc itself sets the same id, and ECharts ignores a repeat.
watch(highlightedShowId, (showId, previousShowId) => {
  if (previousShowId !== null) {
    chart.value?.dispatchAction({ type: 'downplay', seriesIndex: showSeriesIndex.value, name: String(previousShowId) });
  }

  if (showId !== null) {
    chart.value?.dispatchAction({ type: 'highlight', seriesIndex: showSeriesIndex.value, name: String(showId) });
  }
});

// Unmount the tooltip's component, which lives outside this component's tree and would otherwise leak.
onBeforeUnmount(() => {
  render(null, tooltipElement);
});
</script>

<template>
  <v-chart
    :option="option"
    style="height: 260px; width: 100%; max-width: 280px"
    autoresize
    @click="handleClick"
    @globalout="highlightedShowId = null"
    @mouseout="highlightedShowId = null"
    @mouseover="handleMouseover"
    ref="chart"
  />
</template>
