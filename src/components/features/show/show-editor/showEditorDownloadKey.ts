import type { ShowEditorDownload } from './ShowEditorDownload';
import type { ComputedRef, InjectionKey } from 'vue';

/**
 * `ShowEditor` provides its attached torrent under this key, so the episode parts several levels down read it without
 * every part between passing it on.
 */
export const showEditorDownloadKey: InjectionKey<ComputedRef<ShowEditorDownload>> = Symbol('showEditorDownload');
