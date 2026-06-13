import React, { Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, FileText, X } from 'lucide-react';
import { CurrentResearch } from './CurrentResearch';
import { HeroBioWeather } from './HeroBioWeather';
import { useHeroIntro } from '../hooks/useHeroIntro';
import { useHeroParallax } from '../hooks/useScrollEffects';
import { useMagnetic } from '../hooks/useMagnetic';
const GraphField = lazy(() => import('./GraphField'));

type Language = 'en' | 'vi';

type HeroSectionProps = {
  language: Language;
  uiStrings: {
    ariaViewCv: string;
    downloadCv: string;
    ariaSwitchToVietnamese: string;
    ariaSwitchToEnglish: string;
    ariaDismissLangHint: string;
    langHintEn: string;
    langHintVi: string;
  };
  langHintDismissed: boolean;
  onLanguageToggle: () => void;
  onDismissLangHint: () => void;
  onOpenCv: () => void;
  onPrefetchPdf: () => void;
  isMobile: boolean;
  onOpenResearch: () => void;
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  language,
  uiStrings,
  langHintDismissed,
  onLanguageToggle,
  onDismissLangHint,
  onOpenCv,
  onPrefetchPdf,
  isMobile,
  onOpenResearch,
}) => {
  const heroRef = useHeroIntro(language);
  useHeroParallax(heroRef);
  const emailRef = useMagnetic<HTMLAnchorElement>();
  const cvRef = useMagnetic<HTMLButtonElement>();

  return (
    <header
      ref={heroRef}
      className="hero-viewport relative pt-24 pb-16 md:pt-28 md:pb-20 flex items-center justify-center overflow-hidden"
    >
      <Suspense fallback={null}>
        <GraphField />
      </Suspense>
      <div
        data-hero-content
        className="relative z-10 container mx-auto px-6 max-w-4xl"
      >
        <div className="text-center">
          <div
            data-hero-kicker
            className="font-mono text-[11px] tracking-[0.22em] text-[var(--ink-muted)] uppercase mb-6"
          >
            Portfolio · Tung (TJ) Vo
          </div>
          <h1
            data-hero-title
            className="font-display italic text-[var(--ink)] leading-[0.95] mb-8 md:mb-10"
            style={{
              fontSize: 'clamp(3rem, 9vw, 7.5rem)',
              fontWeight: 500,
              fontVariationSettings: '"opsz" 60',
              letterSpacing: '-0.015em',
            }}
          >
            {language === 'vi' ? 'Tôi là Võ Sơn Tùng.' : "Hi. I'm TJ."}
          </h1>
        </div>

        <div data-hero-bio>
          <HeroBioWeather language={language} />
        </div>

        <div
          data-hero-actions
          className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 -mt-1"
        >
          <a
            ref={emailRef}
            href="mailto:vo.tung@stthom.edu"
            className="group inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.1em] text-[var(--ink)] transition-colors"
          >
            <Mail size={14} className="text-[var(--sage)]" />
            <span className="relative">
              vo.tung@stthom.edu
              <span
                className="absolute left-0 right-0 -bottom-0.5 h-px origin-left scale-x-100 underline-ease transition-transform duration-300"
                style={{ backgroundColor: 'var(--sage)' }}
                aria-hidden
              />
            </span>
          </a>
          <span className="hidden sm:inline text-[var(--ink-muted)]/40" aria-hidden>
            ·
          </span>
          <button
            ref={cvRef}
            type="button"
            onClick={onOpenCv}
            onMouseEnter={onPrefetchPdf}
            onFocus={onPrefetchPdf}
            className="group inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.1em] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            aria-label={uiStrings.ariaViewCv}
          >
            <FileText size={14} className="text-[var(--sage)]" />
            <span className="relative">
              {uiStrings.downloadCv}
              <span
                className="absolute left-0 right-0 -bottom-0.5 h-px origin-left scale-x-0 group-hover:scale-x-100 underline-ease transition-transform duration-300"
                style={{ backgroundColor: 'var(--sage)' }}
                aria-hidden
              />
            </span>
          </button>
        </div>

        <div data-hero-research className="mt-8 sm:mt-10">
          <CurrentResearch
            language={language}
            isMobile={isMobile}
            onOpenResearch={onOpenResearch}
          />
        </div>

        <AnimatePresence>
          {!langHintDismissed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 1.0, duration: 0.4 } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="mt-8 flex justify-center"
              data-hero-banner
            >
              <div className="flex items-center gap-3 max-w-xl">
                <span
                  className="w-1.5 h-1.5 shrink-0"
                  style={{ backgroundColor: 'var(--sage)' }}
                  aria-hidden
                />
                <button
                  onClick={onLanguageToggle}
                  className="font-serif italic text-[13px] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
                  aria-label={
                    language === 'en'
                      ? uiStrings.ariaSwitchToVietnamese
                      : uiStrings.ariaSwitchToEnglish
                  }
                >
                  {language === 'en' ? uiStrings.langHintEn : uiStrings.langHintVi}
                </button>
                <button
                  onClick={onDismissLangHint}
                  className="p-1 text-[var(--ink-muted)]/60 hover:text-[var(--ink)] transition-colors shrink-0"
                  aria-label={uiStrings.ariaDismissLangHint}
                >
                  <X size={11} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
