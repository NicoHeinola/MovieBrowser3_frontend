import { useEventListener } from '@vueuse/core';
import { onMounted, ref } from 'vue';

/** How far down the viewport a section's top has to be scrolled past to count as the one being read. */
const ACTIVE_LINE_RATIO = 0.3;

/**
 * Tracks which of a page's sections is being read while the window scrolls, for a table of contents that follows
 * along, and scrolls to a section when one is picked.
 * @param sectionIds - The element ids of the sections, in page order.
 * @param offset - How far below the top of the window a picked section stops, in pixels, to clear fixed bars.
 * @returns The active section id, `scrollToSection` and `updateActiveSection`.
 */
export const useScrollSpy = (sectionIds: readonly string[], offset = 0) => {
  /** The id of the section being read. */
  const activeSectionId = ref<string>(sectionIds[0] ?? '');
  /** Whether a scroll started by `scrollToSection` is still running; the picked section stays active until it ends. */
  let isScrollingToSection = false;

  /**
   * Picks the lowest section whose top has passed the active line. Sections side by side share a top, and the first
   * of them wins.
   * @returns Nothing.
   */
  const updateActiveSection = (): void => {
    // A short section near the bottom can't reach the line, so a scroll to it must not hand the highlight on.
    if (isScrollingToSection) {
      return;
    }

    // At the very bottom the last sections can never reach the line, so the last one wins there.
    const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (isAtBottom && sectionIds.length > 0) {
      activeSectionId.value = sectionIds.at(-1)!;
      return;
    }

    const activeLine = window.innerHeight * ACTIVE_LINE_RATIO;
    let activeId = sectionIds[0] ?? '';
    let activeTop = Number.NEGATIVE_INFINITY;

    for (const id of sectionIds) {
      const top = document.querySelector(`#${id}`)?.getBoundingClientRect().top;

      // Strictly lower only, so a section beside the active one (same top) doesn't take over.
      if (top !== undefined && top <= activeLine && top > activeTop) {
        activeId = id;
        activeTop = top;
      }
    }

    activeSectionId.value = activeId;
  };

  /**
   * Scrolls a section to just below the fixed bars and marks it active right away, so the highlight doesn't trail
   * the scroll.
   * @param id - The element id of the section.
   * @returns Nothing.
   */
  const scrollToSection = (id: string): void => {
    const section = document.querySelector(`#${id}`);

    if (!section) {
      return;
    }

    activeSectionId.value = id;

    // A section already in place doesn't scroll, and then no scrollend would ever release the highlight.
    const distance = section.getBoundingClientRect().top - offset;
    isScrollingToSection = Math.abs(distance) >= 2;

    window.scrollTo({ top: window.scrollY + distance, behavior: 'smooth' });
  };

  useEventListener(window, 'scroll', updateActiveSection, { passive: true });
  useEventListener(window, 'resize', updateActiveSection, { passive: true });
  useEventListener(window, 'scrollend', () => (isScrollingToSection = false), { passive: true });
  // Wheel, touch or keys take the scroll over, so the highlight follows the user again.
  useEventListener(window, ['wheel', 'touchstart', 'keydown'], () => (isScrollingToSection = false), {
    passive: true,
  });
  onMounted(updateActiveSection);

  return {
    activeSectionId,
    scrollToSection,
    updateActiveSection,
  };
};
