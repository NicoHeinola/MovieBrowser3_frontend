import type { User } from '../models/User';

export interface AuthTokenResponse {
  token: string;
  user: User;
}
