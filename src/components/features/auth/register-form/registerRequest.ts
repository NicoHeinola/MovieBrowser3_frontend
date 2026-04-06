import type { AuthRegisterRequest } from '@/interfaces/api/AuthRegisterRequest';

export interface RegisterRequest extends AuthRegisterRequest {
  confirmPassword: string;
}
