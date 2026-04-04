import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router';

export interface NavigationLinkItem {
  name: string;
  path: string | RouteLocationAsPathGeneric | RouteLocationAsRelativeGeneric;
  icon?: string;
}
