import { PieChart } from 'echarts/charts';
import { GraphicComponent, TooltipComponent } from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

/**
 * Registers the ECharts parts the app draws with, so `vue-echarts` bundles only those instead of all of ECharts.
 * Call it from the chart component, not `registerPlugins`: that keeps ECharts in the lazy admin chunk instead of
 * the main bundle every visitor downloads. Registering twice is harmless.
 * @returns Nothing.
 */
export const registerECharts = (): void => {
  use([PieChart, TooltipComponent, GraphicComponent, CanvasRenderer]);
};
