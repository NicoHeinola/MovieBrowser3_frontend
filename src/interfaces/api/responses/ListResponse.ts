/** A full, unpaginated list in the API's `data` envelope. */
export interface ListResponse<T> {
  data: T[];
}
