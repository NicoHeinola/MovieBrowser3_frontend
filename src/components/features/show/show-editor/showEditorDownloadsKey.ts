import type { ShowEditorDownloads } from './ShowEditorDownloads';
import type { ComputedRef, InjectionKey } from 'vue';

/**
 * `ShowEditor` provides the torrents it follows under this key, so the episode parts several levels down read them
 * without every part between passing them on.
 */
export const showEditorDownloadsKey: InjectionKey<ComputedRef<ShowEditorDownloads>> = Symbol('showEditorDownloads');
