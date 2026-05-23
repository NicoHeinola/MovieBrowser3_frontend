import type { PaginatedResponse } from './PaginatedResponse';
import type { Setting } from '@/interfaces/api/models/Setting';

export type SettingsResponse = PaginatedResponse<Setting>;
