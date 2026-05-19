/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
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
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 6;

interface PdfViewerProps {
  url: string;
  fitMode: 'page' | 'width';
  className?: string;
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
  canvas.className = 'block max-w-none shadow-sm';

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

export const PdfViewer: React.FC<PdfViewerProps> = ({ url, fitMode, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const baseScaleRef = useRef(1);
  const zoomRef = useRef(1);
  const renderGenRef = useRef(0);
  const renderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const liveZoomRef = useRef(1);

  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<PageEntry[]>([]);

  const clearPreviewTransform = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    el.style.transform = '';
  }, []);

  const setPreviewTransform = useCallback((liveZoom: number) => {
    const el = contentRef.current;
    if (!el) return;
    const ratio = liveZoom / zoomRef.current;
    if (Math.abs(ratio - 1) < 0.001) {
      el.style.transform = '';
      return;
    }
    el.style.transform = `scale(${ratio})`;
    el.style.transformOrigin = 'center top';
  }, []);

  const renderAllPages = useCallback(
    async (targetZoom: number, showSpinner = false) => {
      const pdf = pdfRef.current;
      if (!pdf) return;

      const gen = ++renderGenRef.current;
      if (showSpinner) setRendering(true);

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
        setPages(next);
        clearPreviewTransform();
      } catch (e) {
        if (gen === renderGenRef.current) {
          setError(e instanceof Error ? e.message : 'Failed to render PDF');
        }
      } finally {
        if (gen === renderGenRef.current && showSpinner) setRendering(false);
      }
    },
    [clearPreviewTransform],
  );

  const scheduleRender = useCallback(
    (targetZoom: number) => {
      if (renderTimerRef.current) clearTimeout(renderTimerRef.current);
      renderTimerRef.current = setTimeout(() => {
        renderTimerRef.current = null;
        void renderAllPages(targetZoom, true);
      }, RENDER_DEBOUNCE_MS);
    },
    [renderAllPages],
  );

  const loadPdf = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    setLoading(true);
    setError(null);
    zoomRef.current = 1;
    liveZoomRef.current = 1;
    clearPreviewTransform();

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
    } finally {
      setLoading(false);
    }
  }, [url, fitMode, renderAllPages, clearPreviewTransform]);

  useEffect(() => {
    void loadPdf();
    return () => {
      renderGenRef.current += 1;
      if (renderTimerRef.current) clearTimeout(renderTimerRef.current);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      pdfRef.current?.destroy();
      pdfRef.current = null;
    };
  }, [loadPdf]);

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

  const queuePreviewZoom = useCallback(
    (liveZoom: number) => {
      const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, liveZoom));
      liveZoomRef.current = clamped;
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        setPreviewTransform(liveZoomRef.current);
      });
    },
    [setPreviewTransform],
  );

  const commitZoom = useCallback(
    (finalZoom: number) => {
      const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, finalZoom));
      liveZoomRef.current = clamped;
      if (Math.abs(clamped - zoomRef.current) < 0.02) {
        clearPreviewTransform();
        return;
      }
      scheduleRender(clamped);
    },
    [scheduleRender, clearPreviewTransform],
  );

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchRef.current = { dist: touchDistance(e.touches[0], e.touches[1]), zoom: zoomRef.current };
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const dist = touchDistance(e.touches[0], e.touches[1]);
      const ratio = dist / pinchRef.current.dist;
      queuePreviewZoom(pinchRef.current.zoom * ratio);
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length >= 2) return;
    if (pinchRef.current) {
      commitZoom(liveZoomRef.current);
    }
    pinchRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      className={`pdf-viewer relative w-full h-full overflow-auto overscroll-contain ${className}`}
      style={{ WebkitOverflowScrolling: 'touch' }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-forest/50 dark:text-white/50 text-sm bg-[#EDEAE2]/80 dark:bg-[#0c1a11]/80">
          Loading…
        </div>
      )}
      {rendering && !loading && (
        <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full text-xs bg-forest/10 dark:bg-white/10 text-forest/60 dark:text-white/60 backdrop-blur-sm pointer-events-none">
          Sharpening…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-red-600/80 dark:text-red-400/80 text-sm px-6 text-center">
          {error}
        </div>
      )}
      {!loading && !error && pages.length > 0 && (
        <div className="flex justify-center py-3 px-2">
          <div ref={contentRef} className="flex flex-col items-center gap-4">
            {pages.map((p) => (
              <PageMount key={p.pageNum} canvas={p.canvas} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
