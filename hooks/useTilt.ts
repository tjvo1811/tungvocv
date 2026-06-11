import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/motion';

const POINTER_FINE = '(pointer: fine)';

export function useTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      if (!window.matchMedia(POINTER_FINE).matches) return;

      const inner = el.querySelector('[data-tilt-inner]') as HTMLElement | null;
      const target = inner ?? el;

      const rotX = gsap.quickTo(target, 'rotateX', { duration: 0.35, ease: 'power3' });
      const rotY = gsap.quickTo(target, 'rotateY', { duration: 0.35, ease: 'power3' });
      const lift = gsap.quickTo(target, 'y', { duration: 0.35, ease: 'power3' });

      const onMove = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        rotY(px * 7);
        rotX(-py * 7);
        lift(-2);
      };

      const onLeave = () => {
        rotX(0);
        rotY(0);
        lift(0);
      };

      el.style.perspective = '800px';
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);

      return () => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
        gsap.set(target, { rotateX: 0, rotateY: 0, y: 0 });
      };
    },
    { scope: ref },
  );

  return ref;
}
