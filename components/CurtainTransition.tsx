import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';

export type CurtainHandle = {
  play: (label: string, onCovered: () => void) => Promise<void>;
};

const CurtainTransition = forwardRef<CurtainHandle>((_, ref) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const backPanelRef = useRef<HTMLDivElement>(null);
  const frontPanelRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const playingRef = useRef(false);

  useImperativeHandle(ref, () => ({
    play(label: string, onCovered: () => void) {
      if (playingRef.current) {
        return Promise.resolve();
      }

      const overlay = overlayRef.current;
      const back = backPanelRef.current;
      const front = frontPanelRef.current;
      const labelEl = labelRef.current;
      if (!overlay || !back || !front || !labelEl) {
        onCovered();
        return Promise.resolve();
      }

      if (prefersReducedMotion()) {
        onCovered();
        return Promise.resolve();
      }

      playingRef.current = true;
      labelEl.textContent = label;

      return new Promise<void>((resolve) => {
        gsap.set([back, front], { scaleY: 0, transformOrigin: 'top' });
        gsap.set(labelEl, { opacity: 0 });
        overlay.style.pointerEvents = 'auto';

        const tl = gsap.timeline({
          onComplete: () => {
            overlay.style.pointerEvents = 'none';
            playingRef.current = false;
            resolve();
          },
        });

        tl.to(back, { scaleY: 1, duration: 0.45, ease: 'power4.inOut' }, 0)
          .to(front, { scaleY: 1, duration: 0.45, ease: 'power4.inOut' }, 0.07)
          .to(labelEl, { opacity: 1, duration: 0.25, ease: 'power2.out' }, 0.2)
          .add(() => {
            onCovered();
          })
          .to({}, { duration: 0.15 })
          .add(() => {
            gsap.set([front, back], { transformOrigin: 'bottom' });
          })
          .to(front, { scaleY: 0, duration: 0.45, ease: 'power4.inOut' }, '+=0')
          .to(back, { scaleY: 0, duration: 0.45, ease: 'power4.inOut' }, '-=0.38')
          .to(labelEl, { opacity: 0, duration: 0.2 }, '-=0.45');
      });
    },
  }));

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[70] pointer-events-none"
      aria-hidden="true"
    >
      <div
        ref={backPanelRef}
        className="absolute inset-0 origin-top"
        style={{ backgroundColor: 'var(--sage)', transform: 'scaleY(0)' }}
      />
      <div
        ref={frontPanelRef}
        className="absolute inset-0 origin-top"
        style={{ backgroundColor: 'var(--paper-2)', transform: 'scaleY(0)' }}
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          ref={labelRef}
          className="font-mono text-[11px] tracking-[0.3em] uppercase opacity-0"
          style={{ color: 'var(--paper)' }}
        />
      </div>
    </div>
  );
});

CurtainTransition.displayName = 'CurtainTransition';

export default CurtainTransition;
