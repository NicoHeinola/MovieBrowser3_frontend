import type { RouteLocationRaw } from 'vue-router';

export interface DashboardStatTile {
  label: string;
  icon: string;
  color: string;
  /** Null until the stats load, or when they fail to. */
  value: number | null;
  /** The page that lists what the tile counts, with its filters applied. Left out when no page can list exactly that. */
  to?: RouteLocationRaw;
}
