import { RefObject } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/motion';

const MOBILE_MQ = '(max-width: 767px)';

export function useTabEntrance(ref: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) return;
      if (window.matchMedia(MOBILE_MQ).matches) return;

      const targets = el.querySelectorAll('[data-reveal]');
      if (targets.length === 0) return;

      const each = Math.min(0.07, 1.2 / targets.length);

      const underlines = el.querySelectorAll('[data-underline]');
      const stairLines = el.querySelectorAll('[data-staircase-line]');

      gsap.set(targets, { y: 28, opacity: 0 });
      gsap.set(underlines, { scaleX: 0, transformOrigin: 'left center' });
      gsap.set(stairLines, { scaleY: 0, transformOrigin: 'top center' });

      const tl = gsap.timeline({ delay: 0.1 });
      tl.to(targets, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: { each, from: 'start' },
        clearProps: 'transform',
      });
      tl.to(
        underlines,
        { scaleX: 1, duration: 0.8, ease: 'power3.inOut', stagger: 0.1 },
        0.2,
      );
      tl.to(
        stairLines,
        { scaleY: 1, duration: 0.8, ease: 'power3.inOut', stagger: 0.08 },
        0.15,
      );
    },
    { scope: ref, dependencies: [] },
  );
}
