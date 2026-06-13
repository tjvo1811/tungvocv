import { useRef } from 'react';
import {
  gsap,
  SplitText,
  useGSAP,
  prefersReducedMotion,
  EASE_EXPO,
} from '../lib/motion';

export function useHeroIntro(language: 'en' | 'vi') {
  const scopeRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const scope = scopeRef.current;
      if (!scope) return;

      const kicker = scope.querySelector('[data-hero-kicker]');
      const title = scope.querySelector('[data-hero-title]');
      const bio = scope.querySelector('[data-hero-bio]');
      const actions = scope.querySelector('[data-hero-actions]');
      const research = scope.querySelector('[data-hero-research]');

      if (prefersReducedMotion()) {
        gsap.set([kicker, title, bio, actions, research], { opacity: 1, y: 0, clearProps: 'all' });
        if (kicker) gsap.set(kicker, { letterSpacing: '0.22em' });
        return;
      }

      const isReplay = scope.dataset.heroIntroPlayed === '1';
      scope.dataset.heroIntroPlayed = '1';

      const titleDuration = isReplay ? 0.5 : 0.9;
      const titleStagger = isReplay ? 0.05 : 0.08;
      const titleDelay = isReplay ? 0 : 0.15;

      let split: SplitText | null = null;
      if (title) {
        split = new SplitText(title, {
          type: 'words',
          wordsClass: 'hero-word',
          aria: 'auto',
        });
        if (split.words) {
          gsap.set(split.words, { yPercent: 110 });
        }
      }

      const tl = gsap.timeline();

      if (kicker && !isReplay) {
        tl.fromTo(
          kicker,
          { opacity: 0, letterSpacing: '0.4em' },
          { opacity: 1, letterSpacing: '0.22em', duration: 0.8, ease: 'power3.out' },
          0,
        );
      }

      if (split?.words) {
        tl.to(
          split.words,
          {
            yPercent: 0,
            duration: titleDuration,
            ease: EASE_EXPO,
            stagger: titleStagger,
          },
          titleDelay,
        );
      }

      if (bio && actions) {
        const startAt = isReplay ? 0.2 : 0.55;
        tl.fromTo(
          [bio, actions, research],
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.12 },
          startAt,
        );
      }

      return () => {
        split?.revert();
      };
    },
    { scope: scopeRef, dependencies: [language], revertOnUpdate: true },
  );

  return scopeRef;
}
