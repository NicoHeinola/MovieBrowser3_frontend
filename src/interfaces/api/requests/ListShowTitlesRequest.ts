export interface ListShowTitlesRequest {
  sort?: string;
  filter?: {
    title?: string;
    show_id?: number;
    is_primary?: boolean;
  };
  page?: {
    number?: number;
    size?: number;
  };
}
