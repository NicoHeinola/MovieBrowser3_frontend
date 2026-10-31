/** How a website's `icon` value is rendered. */
export enum WebsiteIconKind {
  /** No icon is saved, so the site's own favicon is shown. */
  Favicon = 'favicon',
  /** An `mdi-*` icon name. */
  Mdi = 'mdi',
  /** An http or https image URL. */
  Image = 'image',
}
