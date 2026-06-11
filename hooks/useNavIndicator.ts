import { RefObject, useEffect } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';

type TabId = 'home' | 'about' | 'research' | 'leadership' | 'work' | 'honors';

export function useNavIndicator(
  navRef: RefObject<HTMLElement | null>,
  indicatorRef: RefObject<HTMLElement | null>,
  activeTab: TabId,
  language: string,
) {
  useEffect(() => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator) return;

    const measure = () => {
      if (activeTab === 'home') {
        gsap.to(indicator, { opacity: 0, duration: 0.3, ease: 'power3.out' });
        return;
      }

      const link = nav.querySelector<HTMLElement>(
        `[data-nav-id="${activeTab}"]`,
      );
      if (!link) return;

      const navRect = nav.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      const x = linkRect.left - navRect.left + 8;
      const w = linkRect.width - 16;

      gsap.to(indicator, {
        x,
        width: w,
        opacity: 1,
        duration: prefersReducedMotion() ? 0 : 0.4,
        ease: 'power3.out',
      });
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [navRef, indicatorRef, activeTab, language]);
}
