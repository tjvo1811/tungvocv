import { RefObject } from 'react';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../lib/motion';

const MOBILE_MQ = '(max-width: 767px)';

export function useHeroParallax(heroRef: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      if (!window.matchMedia(MOBILE_MQ).matches) return;

      const hero = heroRef.current;
      if (!hero) return;

      const content = hero.querySelector('[data-hero-content]');
      const graph = hero.querySelector('[data-graph-field]');

      if (content) {
        gsap.to(content, {
          yPercent: -18,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      if (graph) {
        gsap.to(graph, {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    },
    { scope: heroRef, dependencies: [] },
  );
}

export function useUnderlineDraw(scopeRef: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const scope = scopeRef.current;
      if (!scope) return;

      const underlines = scope.querySelectorAll('[data-underline]');
      if (underlines.length === 0) return;

      const isMobile = window.matchMedia(MOBILE_MQ).matches;
      const reduced = prefersReducedMotion();

      if (reduced) {
        gsap.set(underlines, { scaleX: 1 });
        return;
      }

      gsap.set(underlines, { scaleX: 0, transformOrigin: 'left center' });

      if (isMobile) {
        underlines.forEach((el) => {
          gsap.to(el, {
            scaleX: 1,
            duration: 0.8,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: el,
              start: 'top 80%',
              once: true,
            },
          });
        });
      }
    },
    { scope: scopeRef, dependencies: [] },
  );
}

export function useStaircaseLineDraw(
  scopeRef: RefObject<HTMLElement | null>,
  enabled = true,
) {
  useGSAP(
    () => {
      if (!enabled) return;
      if (prefersReducedMotion()) return;
      if (!window.matchMedia(MOBILE_MQ).matches) return;

      const scope = scopeRef.current;
      if (!scope) return;

      const lines = scope.querySelectorAll('[data-staircase-line]');
      lines.forEach((el) => {
        gsap.set(el, { scaleY: 0, transformOrigin: 'top center' });
        gsap.to(el, {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: scope,
            start: 'top 70%',
            end: 'bottom 40%',
            scrub: true,
          },
        });
      });
    },
    { scope: scopeRef, dependencies: [enabled] },
  );
}

export function refreshScrollTriggers() {
  ScrollTrigger.refresh();
}
