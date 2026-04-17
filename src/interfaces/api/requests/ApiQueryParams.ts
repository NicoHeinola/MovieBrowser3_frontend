export interface ApiQueryParams {
  sort?: string;
  filter?: Record<string, string>;
  page: {
    number?: number;
    size?: number;
  };
}
