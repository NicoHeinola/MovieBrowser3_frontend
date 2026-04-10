import type { AuthRegisterRequest } from '@/interfaces/api/requests/AuthRegisterRequest';

export interface RegisterRequest extends AuthRegisterRequest {
  password_confirmed: string;
}
