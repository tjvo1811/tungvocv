/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import {
  getDocument,
  GlobalWorkerOptions,
  type PDFDocumentProxy,
  type PDFPageProxy,
} from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfjsWorker;

const MOBILE_QUERY = '(max-width: 767px)';
const MAX_DPR = 3;
const MAX_CANVAS_PX = 8192;
const RENDER_DEBOUNCE_MS = 100;
const WHEEL_ZOOM_COMMIT_MS = 120;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 6;
const ZOOM_STEP = 1.2;

interface PdfViewerProps {
  url: string;
  fitMode: 'page' | 'width';
  className?: string;
  onLoadError?: () => void;
}

type PageEntry = {
  pageNum: number;
  canvas: HTMLCanvasElement;
};

function touchDistance(t0: Touch, t1: Touch) {
  return Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
}

function computeBaseScale(
  pageWidth: number,
  pageHeight: number,
  container: HTMLElement,
  mode: 'page' | 'width',
) {
  const pad = 16;
  const w = container.clientWidth - pad;
  const h = container.clientHeight - pad;
  const scaleW = w / pageWidth;
  if (mode === 'width') return Math.max(0.1, scaleW);
  const scaleH = h / pageHeight;
  return Math.max(0.1, Math.min(scaleW, scaleH));
}

function pixelRatioFor(viewportWidth: number, viewportHeight: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  let ratio = dpr;
  const pxW = viewportWidth * ratio;
  const pxH = viewportHeight * ratio;
  if (pxW > MAX_CANVAS_PX) ratio *= MAX_CANVAS_PX / pxW;
  if (pxH > MAX_CANVAS_PX) ratio *= MAX_CANVAS_PX / pxH;
  return ratio;
}

async function renderPageToCanvas(page: PDFPageProxy, layoutScale: number, zoom: number) {
  const displayScale = layoutScale * zoom;
  const displayVp = page.getViewport({ scale: displayScale });
  let ratio = pixelRatioFor(displayVp.width, displayVp.height);
  const renderVp = page.getViewport({ scale: displayScale * ratio });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas not supported');

  canvas.width = Math.floor(renderVp.width);
  canvas.height = Math.floor(renderVp.height);
  canvas.style.width = `${displayVp.width}px`;
  canvas.style.height = `${displayVp.height}px`;
  canvas.className = 'block max-w-none';

  await page.render({
    canvasContext: ctx,
    viewport: renderVp,
    canvas,
    intent: 'display',
  }).promise;

  return canvas;
}

function PageMount({ canvas }: { canvas: HTMLCanvasElement }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.replaceChildren(canvas);
  }, [canvas]);
  return <div ref={ref} />;
}

type ScrollAnchor = { centerXRatio: number; centerYRatio: number };

function captureScrollAnchor(container: HTMLDivElement): ScrollAnchor | null {
  const sw = container.scrollWidth;
  const sh = container.scrollHeight;
  if (sw <= 0 || sh <= 0) return null;
  return {
    centerXRatio: (container.scrollLeft + container.clientWidth / 2) / sw,
    centerYRatio: (container.scrollTop + container.clientHeight / 2) / sh,
  };
}

/** Restore viewport center after re-render; clamp only when content shrinks. */
function restoreScrollAnchor(container: HTMLDivElement, anchor: ScrollAnchor | null) {
  const maxTop = Math.max(0, container.scrollHeight - container.clientHeight);
  const maxLeft = Math.max(0, container.scrollWidth - container.clientWidth);

  if (anchor) {
    const targetLeft = anchor.centerXRatio * container.scrollWidth - container.clientWidth / 2;
    const targetTop = anchor.centerYRatio * container.scrollHeight - container.clientHeight / 2;
    container.scrollLeft = Math.min(maxLeft, Math.max(0, targetLeft));
    container.scrollTop = Math.min(maxTop, Math.max(0, targetTop));
    return;
  }

  if (container.scrollTop > maxTop) container.scrollTop = maxTop;
  if (container.scrollLeft > maxLeft) container.scrollLeft = maxLeft;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({ url, fitMode, className = '', onLoadError }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const baseScaleRef = useRef(1);
  const zoomRef = useRef(1);
  const renderGenRef = useRef(0);
  const renderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);
  const gestureZoomRef = useRef(1);
  const liveZoomRef = useRef(1);
  const wheelCommitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<PageEntry[]>([]);
  const [zoomPct, setZoomPct] = useState(100);

  const syncScrollAfterLayout = useCallback((anchor: ScrollAnchor | null) => {
    const container = containerRef.current;
    if (!container) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        restoreScrollAnchor(container, anchor);
      });
    });
  }, []);

  const setLiveZoom = useCallback((zoom: number) => {
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
    liveZoomRef.current = clamped;
    setZoomPct(Math.round(clamped * 100));
    return clamped;
  }, []);

  const renderAllPages = useCallback(
    async (targetZoom: number, showSpinner = false) => {
      const pdf = pdfRef.current;
      if (!pdf) return;

      const gen = ++renderGenRef.current;
      if (showSpinner) setRendering(true);

      const container = containerRef.current;
      const scrollAnchor = container ? captureScrollAnchor(container) : null;

      try {
        const layoutScale = baseScaleRef.current;
        const next: PageEntry[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          if (gen !== renderGenRef.current) return;
          const page = await pdf.getPage(i);
          const canvas = await renderPageToCanvas(page, layoutScale, targetZoom);
          next.push({ pageNum: i, canvas });
        }

        if (gen !== renderGenRef.current) return;
        zoomRef.current = targetZoom;
        liveZoomRef.current = targetZoom;
        setZoomPct(Math.round(targetZoom * 100));
        setPages(next);
        syncScrollAfterLayout(scrollAnchor);
      } catch (e) {
        if (gen === renderGenRef.current) {
          setError(e instanceof Error ? e.message : 'Failed to render PDF');
        }
      } finally {
        if (gen === renderGenRef.current && showSpinner) setRendering(false);
      }
    },
    [syncScrollAfterLayout],
  );

  const flushPendingRender = useCallback(() => {
    if (renderTimerRef.current) {
      clearTimeout(renderTimerRef.current);
      renderTimerRef.current = null;
    }
  }, []);

  const scheduleRender = useCallback(
    (targetZoom: number) => {
      flushPendingRender();
      renderTimerRef.current = setTimeout(() => {
        renderTimerRef.current = null;
        void renderAllPages(targetZoom, true);
      }, RENDER_DEBOUNCE_MS);
    },
    [renderAllPages, flushPendingRender],
  );

  const commitZoom = useCallback(
    (finalZoom: number) => {
      const clamped = setLiveZoom(finalZoom);
      if (Math.abs(clamped - zoomRef.current) < 0.02) return;
      flushPendingRender();
      void renderAllPages(clamped, true);
    },
    [setLiveZoom, renderAllPages, flushPendingRender],
  );

  const loadPdf = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    setLoading(true);
    setError(null);
    zoomRef.current = 1;
    liveZoomRef.current = 1;
    setZoomPct(100);

    try {
      pdfRef.current?.destroy();
      const pdf = await getDocument(url).promise;
      pdfRef.current = pdf;

      const isMobile = window.matchMedia(MOBILE_QUERY).matches;
      const mode = isMobile ? 'page' : fitMode;

      const firstPage = await pdf.getPage(1);
      const baseViewport = firstPage.getViewport({ scale: 1 });
      baseScaleRef.current = computeBaseScale(
        baseViewport.width,
        baseViewport.height,
        container,
        mode,
      );

      await renderAllPages(1, false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load PDF');
      onLoadError?.();
    } finally {
      setLoading(false);
    }
  }, [url, fitMode, renderAllPages]);

  useEffect(() => {
    void loadPdf();
    return () => {
      renderGenRef.current += 1;
      flushPendingRender();
      if (wheelCommitTimerRef.current) clearTimeout(wheelCommitTimerRef.current);
      pdfRef.current?.destroy();
      pdfRef.current = null;
    };
  }, [loadPdf, flushPendingRender]);

  useEffect(() => {
    const onChange = () => void loadPdf();
    const mq = window.matchMedia(MOBILE_QUERY);
    mq.addEventListener('change', onChange);
    window.addEventListener('resize', onChange);
    return () => {
      mq.removeEventListener('change', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, [loadPdf]);

  const adjustZoom = useCallback(
    (factor: number) => {
      commitZoom(zoomRef.current * factor);
    },
    [commitZoom],
  );

  const resetZoom = useCallback(() => {
    commitZoom(1);
  }, [commitZoom]);

  // Pinch, trackpad pinch (ctrl+wheel), and Safari gestures — re-render at true size (no CSS scale).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchRef.current = { dist: touchDistance(e.touches[0], e.touches[1]), zoom: zoomRef.current };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const dist = touchDistance(e.touches[0], e.touches[1]);
        const ratio = dist / pinchRef.current.dist;
        const next = setLiveZoom(pinchRef.current.zoom * ratio);
        scheduleRender(next);
      }
    };

    const finishTouchZoom = () => {
      if (pinchRef.current) {
        if (wheelCommitTimerRef.current) clearTimeout(wheelCommitTimerRef.current);
        commitZoom(liveZoomRef.current);
      }
      pinchRef.current = null;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length >= 2) return;
      finishTouchZoom();
    };

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      e.stopPropagation();
      const factor = Math.exp(-e.deltaY * 0.002);
      const next = setLiveZoom(liveZoomRef.current * factor);
      scheduleRender(next);
      if (wheelCommitTimerRef.current) clearTimeout(wheelCommitTimerRef.current);
      wheelCommitTimerRef.current = setTimeout(() => {
        wheelCommitTimerRef.current = null;
        commitZoom(liveZoomRef.current);
      }, WHEEL_ZOOM_COMMIT_MS);
    };

    const onGestureStart = (e: Event) => {
      e.preventDefault();
      gestureZoomRef.current = zoomRef.current;
    };

    const onGestureChange = (e: Event) => {
      e.preventDefault();
      const scale = (e as Event & { scale?: number }).scale ?? 1;
      const next = setLiveZoom(gestureZoomRef.current * scale);
      scheduleRender(next);
    };

    const onGestureEnd = (e: Event) => {
      e.preventDefault();
      commitZoom(liveZoomRef.current);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('gesturestart', onGestureStart as EventListener);
    el.addEventListener('gesturechange', onGestureChange as EventListener);
    el.addEventListener('gestureend', onGestureEnd as EventListener);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('gesturestart', onGestureStart as EventListener);
      el.removeEventListener('gesturechange', onGestureChange as EventListener);
      el.removeEventListener('gestureend', onGestureEnd as EventListener);
      if (wheelCommitTimerRef.current) clearTimeout(wheelCommitTimerRef.current);
    };
  }, [setLiveZoom, scheduleRender, commitZoom]);

  return (
    <div className={`pdf-viewer-shell relative w-full h-full ${className}`}>
      <div
        ref={containerRef}
        className="pdf-viewer absolute inset-0 overflow-auto overscroll-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {!loading && !error && pages.length > 0 && (
          <div ref={contentRef} className="pdf-viewer-stage">
            <div className="pdf-viewer-pages">
              {pages.map((p) => (
                <PageMount key={p.pageNum} canvas={p.canvas} />
              ))}
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--ink-muted)] pointer-events-none"
          style={{ backgroundColor: 'var(--paper)' }}
        >
          Loading…
        </div>
      )}
      {rendering && !loading && (
        <div
          className="absolute top-3 right-3 z-20 px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-muted)] pointer-events-none"
          style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--rule)' }}
        >
          Sharpening…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center font-serif italic text-[var(--ink-muted)] text-sm px-6 text-center pointer-events-none">
          {error}
        </div>
      )}
      {!loading && !error && pages.length > 0 && (
        <div
          className="pdf-viewer-zoom-bar absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 px-3 py-2 pointer-events-none"
          style={{ backgroundColor: 'var(--paper)', border: '1px solid var(--rule)' }}
          role="toolbar"
          aria-label="Zoom controls"
        >
          <button
            type="button"
            onClick={() => adjustZoom(1 / ZOOM_STEP)}
            disabled={zoomPct <= MIN_ZOOM * 100}
            className="pointer-events-auto p-1.5 text-[var(--ink-muted)] hover:text-[var(--ink)] disabled:opacity-30 transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut size={14} />
          </button>
          <span className="min-w-[3rem] text-center font-mono text-[11px] tabular-nums text-[var(--ink)]">
            {zoomPct}%
          </span>
          <button
            type="button"
            onClick={() => adjustZoom(ZOOM_STEP)}
            disabled={zoomPct >= MAX_ZOOM * 100}
            className="pointer-events-auto p-1.5 text-[var(--ink-muted)] hover:text-[var(--ink)] disabled:opacity-30 transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn size={14} />
          </button>
          <span
            className="w-px h-4 mx-1"
            style={{ backgroundColor: 'var(--rule)', opacity: 0.4 }}
            aria-hidden
          />
          <button
            type="button"
            onClick={resetZoom}
            className="pointer-events-auto p-1.5 text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
            aria-label="Reset zoom"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      )}
    </div>
  );
};
