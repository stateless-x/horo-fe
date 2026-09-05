'use client';

import { useEffect, useState } from 'react';

/**
 * True when the current device is an iPhone, iPad, or iPod.
 *
 * Detection runs in an effect rather than during render: navigator does not
 * exist on the server, and reading it while rendering would make the first
 * client paint disagree with the server HTML. Callers get `false` until the
 * effect lands, so any iOS-only branch needs a sensible non-iOS default.
 */
export function useIsIOS(): boolean {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    // iPadOS reports itself as a Mac, so a touch-capable "MacIntel" is an iPad.
    const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) || isIPadOS);
  }, []);

  return isIOS;
}
