export interface UpdateUserRequest {
  username?: string;
  password?: string;
  password_confirmation?: string;
  /** Only admins may send this. */
  is_admin?: boolean;
}
