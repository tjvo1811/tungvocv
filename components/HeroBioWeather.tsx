/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from 'lucide-react';
import { cToF, useHoustonWeather } from '../hooks/useHoustonWeather';

function weatherIcon(code: number, size = 15): React.ReactNode {
  const cls = 'inline-block shrink-0 align-[-0.15em] opacity-85 mx-0.5';
  if (code === 0) return <Sun size={size} className={cls} aria-hidden />;
  if (code <= 3) return <CloudSun size={size} className={cls} aria-hidden />;
  if (code <= 48) return <Cloud size={size} className={cls} aria-hidden />;
  if (code <= 67) return <CloudRain size={size} className={cls} aria-hidden />;
  if (code <= 77) return <CloudSnow size={size} className={cls} aria-hidden />;
  if (code <= 82) return <CloudRain size={size} className={cls} aria-hidden />;
  return <CloudLightning size={size} className={cls} aria-hidden />;
}

function AnimatedDegree({
  value,
  unit,
}: {
  value: number | null;
  unit: 'F' | 'C';
}) {
  const rounded =
    value !== null && !Number.isNaN(value) ? Math.round(value) : null;
  const prev = useRef<number | null>(null);

  const fromY =
    rounded !== null &&
    prev.current !== null &&
    prev.current !== rounded
      ? rounded > prev.current
        ? 11
        : -11
      : 0;

  useLayoutEffect(() => {
    if (rounded !== null) prev.current = rounded;
  }, [rounded]);

  if (rounded === null) {
    return null;
  }

  return (
    <span className="inline-block tabular-nums font-semibold text-forest dark:text-white/90">
      <motion.span
        key={`${unit}-${rounded}`}
        initial={fromY === 0 ? false : { y: fromY, opacity: 0.4 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 440, damping: 26 }}
        className="inline-block"
      >
        {rounded}°{unit}
      </motion.span>
    </span>
  );
}

const lineClass =
  'text-[0.95rem] sm:text-lg leading-relaxed text-forest/72 dark:text-white/58';

export const HeroBioWeather: React.FC = () => {
  const { status, tempC, weatherCode } = useHoustonWeather();
  const tempF = tempC !== null ? cToF(tempC) : null;

  const live = status === 'ok' && tempC !== null;

  return (
    <div className="hero-pop hero-pop-2b max-w-2xl mx-auto mb-8 px-2 text-center">
      <p className={`${lineClass} mb-3 sm:mb-3.5`}>
        <span className="font-semibold text-forest/88 dark:text-white/70">Major:</span>{' '}
        Applied Mathematics
        <span className="mx-2.5 sm:mx-3 text-forest/35 dark:text-white/30">·</span>
        <span className="font-semibold text-forest/88 dark:text-white/70">Minor:</span>{' '}
        Data Analytics
      </p>

      <p
        className={lineClass}
        role="status"
        aria-live="polite"
        aria-label={
          live
            ? `Based in Houston, Texas; about ${Math.round(tempF!)} degrees Fahrenheit and ${Math.round(tempC!)} degrees Celsius`
            : 'Based in Houston, Texas'
        }
      >
        I&apos;m based in{' '}
        {status === 'loading' && (
          <>
            <span className="text-forest/45 dark:text-white/40 tabular-nums">
              …°F · …°C
            </span>{' '}
            <span className="font-medium text-forest/90 dark:text-white/75">
              Houston, Texas
            </span>
            <span className="text-forest/45 dark:text-white/40 text-sm sm:text-base">
              {' '}
              — live read incoming
            </span>
          </>
        )}
        {live && (
          <>
            <AnimatedDegree value={tempF} unit="F" />
            <span className="mx-1 text-forest/50 dark:text-white/35">·</span>
            <AnimatedDegree value={tempC} unit="C" />{' '}
            {weatherIcon(weatherCode)}{' '}
            <span className="font-medium text-forest/90 dark:text-white/75">
              Houston, Texas
            </span>
          </>
        )}
        {status === 'error' && (
          <span className="text-forest/80 dark:text-white/70">
            <span className="font-medium text-forest/90 dark:text-white/75">
              Houston, Texas
            </span>
            <span className="text-forest/50 dark:text-white/45">
              {' '}
              (forecast unavailable right now)
            </span>
          </span>
        )}
      </p>
    </div>
  );
};
