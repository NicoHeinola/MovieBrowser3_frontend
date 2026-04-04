import type { RouteLocationAsPathGeneric, RouteLocationAsRelativeGeneric } from 'vue-router';

export interface NavigationLink {
  name: string;
  path: string | RouteLocationAsPathGeneric | RouteLocationAsRelativeGeneric;
  icon?: string;
}
