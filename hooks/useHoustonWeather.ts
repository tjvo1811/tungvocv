/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';

/** Downtown Houston — Open-Meteo expects WGS84 */
export const HOUSTON = { latitude: 29.7604, longitude: -95.3698 };

export const HOUSTON_WEATHER_POLL_MS = 60 * 1000;

export type HoustonWeatherStatus = 'loading' | 'ok' | 'error';

export function cToF(c: number): number {
  return (c * 9) / 5 + 32;
}

export function useHoustonWeather(pollMs: number = HOUSTON_WEATHER_POLL_MS): {
  status: HoustonWeatherStatus;
  tempC: number | null;
  weatherCode: number;
} {
  const [status, setStatus] = useState<HoustonWeatherStatus>('loading');
  const [tempC, setTempC] = useState<number | null>(null);
  const [weatherCode, setWeatherCode] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const url = new URL('https://api.open-meteo.com/v1/forecast');
        url.searchParams.set('latitude', String(HOUSTON.latitude));
        url.searchParams.set('longitude', String(HOUSTON.longitude));
        url.searchParams.set('current', 'temperature_2m,weather_code');
        url.searchParams.set('timezone', 'America/Chicago');

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('forecast failed');
        const data = (await res.json()) as {
          current?: { temperature_2m?: number; weather_code?: number };
        };
        const t = data.current?.temperature_2m;
        const wc = data.current?.weather_code;
        if (typeof t !== 'number' || Number.isNaN(t)) throw new Error('bad payload');

        if (!cancelled) {
          setTempC(t);
          setWeatherCode(typeof wc === 'number' ? wc : 0);
          setStatus('ok');
        }
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    void load();
    let id = window.setInterval(load, pollMs);

    // Pause polling while the tab is hidden; refresh once on return.
    const onVisibility = () => {
      window.clearInterval(id);
      if (document.visibilityState === 'visible') {
        void load();
        id = window.setInterval(load, pollMs);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [pollMs]);

  return { status, tempC, weatherCode };
}
