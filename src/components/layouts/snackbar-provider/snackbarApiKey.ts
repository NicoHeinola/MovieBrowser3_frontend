import type { SnackbarApi } from './SnackbarApi';
import type { InjectionKey } from 'vue';

export const snackbarApiKey: InjectionKey<SnackbarApi> = Symbol('snackbarApi');
