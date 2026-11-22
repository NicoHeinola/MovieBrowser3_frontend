export interface Setting {
  key: string;
  value: unknown;
  type: string;
  /** Only on `secret` settings, whose value is always `null`: whether one is saved. */
  is_set?: boolean;
  updated_at: string | null;
}
