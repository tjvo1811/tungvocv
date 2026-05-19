/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfjsWorker;

const MOBILE_QUERY = '(max-width: 767px)';

interface PdfViewerProps {
  url: string;
  /** Posters (landscape): fit entire page. Papers: fit width so the full page is visible on phone. */
  fitMode: 'page' | 'width';
  className?: string;
}

type TouchPoint = { x: number; y: number };

function touchDistance(a: TouchPoint, b: TouchPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
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
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const panRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canvases, setCanvases] = useState<HTMLCanvasElement[]>([]);
  const [userScale, setUserScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const computeBaseScale = useCallback(
    (pageWidth: number, pageHeight: number, container: HTMLElement, mode: 'page' | 'width') => {
      const pad = 16;
      const w = container.clientWidth - pad;
      const h = container.clientHeight - pad;
      const scaleW = w / pageWidth;
      if (mode === 'width') return Math.max(0.1, scaleW);
      const scaleH = h / pageHeight;
      return Math.max(0.1, Math.min(scaleW, scaleH));
    },
    [],
  );

  const renderPdf = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    setLoading(true);
    setError(null);
    setUserScale(1);
    setOffset({ x: 0, y: 0 });

    try {
      pdfRef.current?.destroy();
      const pdf = await getDocument(url).promise;
      pdfRef.current = pdf;

      const isMobile = window.matchMedia(MOBILE_QUERY).matches;
      // On phone, always fit the full page in view first; desktop uses fitMode.
      const mode = isMobile ? 'page' : fitMode;

      const firstPage = await pdf.getPage(1);
      const baseViewport = firstPage.getViewport({ scale: 1 });
      const baseScale = computeBaseScale(baseViewport.width, baseViewport.height, container, mode);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rendered: HTMLCanvasElement[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: baseScale });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        canvas.className = 'block max-w-none shadow-sm';

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        rendered.push(canvas);
      }

      setCanvases(rendered);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load PDF');
    } finally {
      setLoading(false);
    }
  }, [url, fitMode, computeBaseScale]);

  useEffect(() => {
    renderPdf();
    return () => {
      pdfRef.current?.destroy();
      pdfRef.current = null;
    };
  }, [renderPdf]);

  useEffect(() => {
    const onChange = () => renderPdf();
    const mq = window.matchMedia(MOBILE_QUERY);
    mq.addEventListener('change', onChange);
    window.addEventListener('resize', onChange);
    return () => {
      mq.removeEventListener('change', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, [renderPdf]);

  const clampOffset = useCallback((tx: number, ty: number, scale: number) => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return { x: tx, y: ty };

    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const sw = content.offsetWidth * scale;
    const sh = content.offsetHeight * scale;
    const maxX = Math.max(0, (sw - cw) / 2);
    const maxY = Math.max(0, (sh - ch) / 2);

    return {
      x: Math.min(maxX, Math.max(-maxX, tx)),
      y: Math.min(maxY, Math.max(-maxY, ty)),
    };
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const a = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const b = { x: e.touches[1].clientX, y: e.touches[1].clientY };
      pinchRef.current = { dist: touchDistance(a, b), scale: userScale };
      panRef.current = null;
    } else if (e.touches.length === 1 && userScale > 1) {
      panRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        tx: offset.x,
        ty: offset.y,
      };
      pinchRef.current = null;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const a = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const b = { x: e.touches[1].clientX, y: e.touches[1].clientY };
      const dist = touchDistance(a, b);
      const ratio = dist / pinchRef.current.dist;
      const next = Math.min(6, Math.max(0.5, pinchRef.current.scale * ratio));
      pinchRef.current = { dist, scale: next };
      setUserScale(next);
    } else if (e.touches.length === 1 && panRef.current && userScale > 1) {
      e.preventDefault();
      const dx = e.touches[0].clientX - panRef.current.x;
      const dy = e.touches[0].clientY - panRef.current.y;
      setOffset(clampOffset(panRef.current.tx + dx, panRef.current.ty + dy, userScale));
    }
  };

  const onTouchEnd = () => {
    pinchRef.current = null;
    panRef.current = null;
  };

  const canPan = userScale > 1.02;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${canPan ? 'overflow-hidden' : 'overflow-auto'} touch-none ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-forest/50 dark:text-white/50 text-sm">
          Loading…
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-red-600/80 dark:text-red-400/80 text-sm px-6 text-center">
          {error}
        </div>
      )}
      {!loading && !error && canvases.length > 0 && (
        <div className={`min-h-full flex justify-center ${canPan ? 'items-center h-full' : 'py-2'}`}>
          <div
            ref={contentRef}
            className="flex flex-col items-center gap-3 origin-center"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${userScale})`,
            }}
          >
            {canvases.map((canvas, i) => (
              <PageMount key={i} canvas={canvas} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
