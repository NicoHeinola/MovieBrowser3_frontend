import type { Category } from './Category';

export interface ShowSection {
  id: number;
  category_id: number;
  description: string | null;
  sort_order: number;
  category: Category;
}
