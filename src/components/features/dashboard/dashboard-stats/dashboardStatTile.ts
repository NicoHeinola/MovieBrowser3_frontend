export interface DashboardStatTile {
  label: string;
  icon: string;
  color: string;
  /** Null until the stats load, or when they fail to. */
  value: number | null;
}
