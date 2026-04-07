import type { DialogCloseFunction } from './DialogCloseFunction';

export interface DialogComponentProps<Result = void> {
  modelValue: boolean;
  close: DialogCloseFunction<Result>;
}
