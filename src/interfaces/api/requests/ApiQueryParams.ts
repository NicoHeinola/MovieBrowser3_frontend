export interface ApiQueryParams {
  sort?: string;
  filter?: string;
  page: {
    number?: number;
    size?: number;
  };
}
