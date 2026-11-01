/** Hooks the API client uses to authenticate requests and react to an expired session. */
export interface ApiClientAuthOptions {
  getToken: () => string | null;
  onUnauthorized: () => void | Promise<void>;
}
