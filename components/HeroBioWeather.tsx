/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from 'lucide-react';
import { cToF, useHoustonWeather } from '../hooks/useHoustonWeather';

function weatherIcon(code: number, size = 14): React.ReactNode {
  const cls = 'inline-block shrink-0 align-[-0.15em] mx-0.5 text-[var(--sage)]';
  if (code === 0) return <Sun size={size} className={cls} aria-hidden />;
  if (code <= 3) return <CloudSun size={size} className={cls} aria-hidden />;
  if (code <= 48) return <Cloud size={size} className={cls} aria-hidden />;
  if (code <= 67) return <CloudRain size={size} className={cls} aria-hidden />;
  if (code <= 77) return <CloudSnow size={size} className={cls} aria-hidden />;
  if (code <= 82) return <CloudRain size={size} className={cls} aria-hidden />;
  return <CloudLightning size={size} className={cls} aria-hidden />;
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function Degree({ value, unit }: { value: number | null; unit: 'F' | 'C' }) {
  const target =
    value !== null && !Number.isNaN(value) ? Math.round(value) : null;
  const [display, setDisplay] = useState(target === null ? null : 0);
  const rafRef = useRef(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (target === null) {
      setDisplay(null);
      startedRef.current = false;
      return;
    }

    if (prefersReducedMotion()) {
      setDisplay(target);
      return;
    }

    if (startedRef.current) {
      setDisplay(target);
      return;
    }
    startedRef.current = true;

    const start = performance.now();
    const duration = 800;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(target * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    setDisplay(0);
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  if (display === null) return null;
  return (
    <span className="font-mono tabular-nums text-[var(--ink)]">
      {display}°{unit}
    </span>
  );
}

const bioLineClass =
  'font-serif text-[0.95rem] sm:text-[1.05rem] leading-relaxed text-[var(--ink-muted)]';

export const HeroBioWeather: React.FC<{ language: 'en' | 'vi' }> = ({ language }) => {
  const { status, tempC, weatherCode } = useHoustonWeather();
  const tempF = tempC !== null ? cToF(tempC) : null;
  const live = status === 'ok' && tempC !== null;

  return (
    <div className="max-w-2xl mx-auto mb-4 px-2 text-center">
      <p className={`${bioLineClass} mb-3 sm:mb-3.5`}>
        <span className="text-[var(--ink)] font-medium">
          {language === 'vi' ? 'Cử nhân khoa học' : 'B.S.'}
        </span>
        <span className="mx-2 text-[var(--sage)]">·</span>
        {language === 'vi' ? 'Toán học ứng dụng' : 'Applied Mathematics'}
        <span className="mx-3 text-[var(--ink-muted)]/40">/</span>
        <span className="text-[var(--ink)] font-medium">
          {language === 'vi' ? 'Cử nhân nghệ thuật' : 'B.A.'}
        </span>
        <span className="mx-2 text-[var(--sage)]">·</span>
        {language === 'vi' ? 'Toán học' : 'Mathematics'}
      </p>

      <p
        className={bioLineClass}
        role="status"
        aria-live="polite"
        aria-label={
          live
            ? language === 'vi'
              ? `Sinh sống tại Houston, Texas; khoảng ${Math.round(tempF!)} độ F và ${Math.round(tempC!)} độ C`
              : `Based in Houston, Texas; about ${Math.round(tempF!)} degrees Fahrenheit and ${Math.round(tempC!)} degrees Celsius`
            : language === 'vi'
              ? 'Sinh sống tại Houston, Texas'
              : 'Based in Houston, Texas'
        }
      >
        <span className="italic">
          {language === 'vi' ? 'Hiện sống tại ' : 'Based in '}
        </span>
        <span className="text-[var(--ink)] font-medium">Houston, Texas</span>
        <span className="inline-block min-w-[7.5rem] text-left align-baseline">
          {live && (
            <>
              <span className="mx-2 text-[var(--ink-muted)]/50">—</span>
              <Degree value={tempF} unit="F" />
              <span className="mx-1 text-[var(--ink-muted)]/50">·</span>
              <Degree value={tempC} unit="C" /> {weatherIcon(weatherCode)}
            </>
          )}
          {status === 'loading' && (
            <>
              <span className="mx-2 text-[var(--ink-muted)]/50">—</span>
              <span className="font-mono text-[var(--ink-muted)]/70 text-sm">
                {language === 'vi' ? 'đang tải thời tiết' : 'reading weather'}
              </span>
            </>
          )}
          {status === 'error' && (
            <>
              <span className="mx-2 text-[var(--ink-muted)]/50">—</span>
              <span className="italic text-[var(--ink-muted)]/70 text-sm">
                {language === 'vi' ? 'không có dự báo' : 'forecast unavailable'}
              </span>
            </>
          )}
        </span>
      </p>
    </div>
  );
};
