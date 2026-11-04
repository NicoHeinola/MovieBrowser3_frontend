/** One API error: a code for the frontend to translate and the values for its message. */
export interface ApiErrorDetail {
  /** An `ApiErrorCode`, kept as a string because a newer backend can send codes this build doesn't know. */
  code: string;
  params: Record<string, string>;
}
