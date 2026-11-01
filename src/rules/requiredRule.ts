import { i18n } from '@/plugins/i18n';

export const requiredRule = (value: string) => Boolean(value) || i18n.global.t('common.required');
