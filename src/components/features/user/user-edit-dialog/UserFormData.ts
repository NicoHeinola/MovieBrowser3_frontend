export interface UserFormData {
  id: number;
  username: string;
  is_admin: boolean;
  /** Blank keeps the current password when editing. */
  password: string;
  password_confirmation: string;
}
