export interface ApiQueryParams {
  sort?: string;
  filter?: Record<string, string | string[]>;
  page: {
    number?: number;
    size?: number;
  };
}
