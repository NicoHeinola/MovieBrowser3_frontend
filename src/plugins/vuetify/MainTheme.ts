import type { ThemeDefinition } from 'vuetify';

export const MainTheme: ThemeDefinition = {
  dark: true,
  colors: {
    primary: '#f8d125',
    /** Calm blue accent that complements the yellow primary without reading as an error. */
    secondary: '#7FA8FF',
    'on-secondary': '#0F131B',
    background: '#0F131B',
    'background-lighten-1': '#171E2B',
    surface: '#171E2B',
    link: '#8EDCFF',
    info: '#74D0FF',
    success: '#65C89B',
    warning: '#E7B657',
    error: '#FF8A8A',
    'watch-status-watching': '#74D0FF',
    'watch-status-plan-to-watch': '#B39DFF',
    'watch-status-completed': '#65C89B',
    'watch-status-on-hold': '#E7B657',
    'watch-status-dropped': '#FF8A8A',
    /** A show whose entries have different watch statuses, or only some have one. */
    'watch-status-mixed': '#8A93A6',
    /** Dots of older versions on the changelog timeline; the latest uses `primary`. */
    'changelog-dot': '#616161',
    /** Free space in the dashboard storage chart: a quiet track behind the used parts. */
    'storage-free': '#2A3242',
    /** The shows too small for their own arc in the storage chart, grouped. */
    'storage-other-shows': '#6B7486',
    'pattern-start': '#6B4FCC',
    'pattern-end': '#2A7A8A',
  },
};
