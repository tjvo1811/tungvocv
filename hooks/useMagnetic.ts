import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/motion';

const POINTER_FINE = '(pointer: fine)';

export function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      if (!window.matchMedia(POINTER_FINE).matches) return;

      const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });

      const onMove = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const padX = rect.width * 0.2;
        const padY = rect.height * 0.2;
        const inBounds =
          e.clientX >= rect.left - padX &&
          e.clientX <= rect.right + padX &&
          e.clientY >= rect.top - padY &&
          e.clientY <= rect.bottom + padY;
        if (!inBounds) return;

        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const max = 6;
        const dist = Math.hypot(dx, dy) || 1;
        const pull = Math.min(max, dist * 0.12);
        xTo((dx / dist) * pull);
        yTo((dy / dist) * pull);
      };

      const onLeave = () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      };

      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);

      return () => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
        gsap.set(el, { x: 0, y: 0 });
      };
    },
    { scope: ref },
  );

  return ref;
}
