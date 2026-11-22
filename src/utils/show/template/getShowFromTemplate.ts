import type { Show } from '@/interfaces/api/models/Show';
import type { ShowTemplate } from '@/interfaces/api/models/ShowTemplate';

import { createEmptyShow } from '@/utils/show/createEmptyShow';

/**
 * Builds a new show's draft from a show template: an empty new show with the template's titles (the first as
 * primary), categories, images and description. Its seasons and episodes are left to the user, so it keeps the empty
 * show's one season. Nothing in it exists on the backend yet, so every item is created on save.
 * @param template - The template.
 * @returns The draft.
 */
export const getShowFromTemplate = (template: ShowTemplate): Show => {
  const show = createEmptyShow();

  return {
    ...show,
    // A template without titles keeps the empty show's one empty title
    titles:
      template.titles.length > 0
        ? template.titles.map((title, index) => ({ title, is_primary: index === 0 }))
        : show.titles,
    description: template.description ?? '',
    banner_url: template.banner_url ?? '',
    card_image_url: template.card_image_url ?? '',
    preview_url: template.preview_url,
    categories: template.categories,
  } as Show;
};
