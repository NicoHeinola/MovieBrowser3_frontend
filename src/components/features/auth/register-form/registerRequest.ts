import type { AuthRegisterRequest } from '@/interfaces/api/AuthRegisterRequest';

export interface RegisterRequest extends AuthRegisterRequest {
  password_confirmed: string;
}
