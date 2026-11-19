/**
 * Tells whether a video may start with its sound on. Browsers block autoplay with sound until the user has clicked or
 * pressed a key on the page, and a blocked video doesn't start at all, so players start muted until then.
 * @returns `true` once the user has interacted with the page, or when the browser can't tell.
 */
export const canAutoplaySound = (): boolean => {
  // Browsers without the API get the old behavior: try with sound.
  if (!('userActivation' in navigator)) {
    return true;
  }

  return navigator.userActivation.hasBeenActive;
};
