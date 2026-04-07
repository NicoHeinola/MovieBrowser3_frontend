import type { DialogApi } from './DialogApi';
import type { InjectionKey } from 'vue';

export const dialogApiKey: InjectionKey<DialogApi> = Symbol('dialogApi');
