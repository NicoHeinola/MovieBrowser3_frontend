import type { RouteLocationRaw } from 'vue-router';

export interface DashboardStatTile {
  label: string;
  icon: string;
  color: string;
  /** Null until the stats load, or when they fail to. */
  value: number | null;
  /** Turns the value into display text; defaults to a localized number. */
  format?: (value: number) => string;
  /** The page that lists what the tile counts, with its filters applied. Left out when no page can list exactly that. */
  to?: RouteLocationRaw;
}
