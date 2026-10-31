export interface CreateUserRequest {
  username: string;
  password: string;
  password_confirmation: string;
  is_admin?: boolean;
}
