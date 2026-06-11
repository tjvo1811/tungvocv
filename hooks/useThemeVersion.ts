import { useEffect, useState } from 'react';

/**
 * Increments whenever `document.documentElement` class list changes (e.g. dark mode).
 * Consumers re-read CSS custom properties when this value changes.
 */
export function useThemeVersion(): number {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    const observer = new MutationObserver(() => {
      setVersion((v) => v + 1);
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return version;
}
