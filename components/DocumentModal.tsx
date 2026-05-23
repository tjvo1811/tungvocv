/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { X, FileText, LayoutTemplate, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResearchDocument } from '../data/researchData';

const PdfViewer = lazy(() => import('./PdfViewer').then((m) => ({ default: m.PdfViewer })));

type Language = 'en' | 'vi';

const modalStrings = {
  en: {
    paperViewer: 'Paper Viewer',
    posterViewer: 'Poster Viewer',
    pdfViewer: 'PDF Viewer',
    unableToDisplayPdf: 'Unable to display PDF',
    pdfFallback:
      'The PDF file could not be loaded directly. Please check if the file',
    existsIn: 'exists in your',
    folder: 'folder.',
    downloadPdf: 'Download PDF',
    closeViewer: 'Close Viewer',
    endOfDocument: '*** End of Document ***',
  },
  vi: {
    paperViewer: 'Trình xem bài nghiên cứu',
    posterViewer: 'Trình xem áp phích',
    pdfViewer: 'Trình xem PDF',
    unableToDisplayPdf: 'Không thể hiển thị tệp PDF',
    pdfFallback: 'Không thể tải trực tiếp tệp PDF. Vui lòng kiểm tra xem tệp',
    existsIn: 'có tồn tại trong thư mục',
    folder: 'của bạn hay không.',
    downloadPdf: 'Tải tệp PDF',
    closeViewer: 'Đóng',
    endOfDocument: '*** Hết tài liệu ***',
  },
} as const;

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ResearchDocument | null;
  language: Language;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, document, language }) => {
  const strings = modalStrings[language];

  // Retain the last document during the exit animation so AnimatePresence can
  // fade it out cleanly even after the parent has cleared `document` to null.
  const lastDocRef = useRef<ResearchDocument | null>(null);
  if (document) lastDocRef.current = document;
  const doc = document ?? lastDocRef.current;

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [pdfFailed, setPdfFailed] = useState(false);
  useEffect(() => {
    if (!isOpen) setPdfFailed(false);
  }, [isOpen, document?.id]);

  const DEFAULT_VIEWPORT = 'width=device-width, initial-scale=1.0';

  // Close on Escape, lock body scroll, and prevent page pinch-zoom while open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = 'hidden';

    const viewportMeta = window.document.querySelector('meta[name="viewport"]');
    const prevViewport = viewportMeta?.getAttribute('content') ?? DEFAULT_VIEWPORT;
    viewportMeta?.setAttribute(
      'content',
      'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
    );

    return () => {
      window.removeEventListener('keydown', onKey);
      window.document.body.style.overflow = prevOverflow;
      if (viewportMeta) {
        viewportMeta.setAttribute('content', prevViewport);
      }
    };
  }, [isOpen]);

  if (!doc) return null;

  const isPoster = doc.type === 'Poster';
  const hasPdf = !!doc.pdfUrl;
  const showPdf = hasPdf && !pdfFailed;
  const hasInlineContent = doc.content.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
            style={{ backgroundColor: 'var(--ink)' }}
          />
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed ${isPoster || showPdf ? 'inset-2 md:inset-6' : 'inset-4 md:inset-10'} z-[70] overflow-hidden flex flex-col mx-auto ${isPoster || showPdf ? 'max-w-[95vw] h-[95vh]' : 'max-w-4xl'}`}
            style={{
              backgroundColor: 'var(--paper)',
              border: '1px solid var(--rule)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-start justify-between p-5 md:p-6"
              style={{ borderBottom: '1px solid var(--rule)' }}
            >
              <div className="pr-8">
                <div className="flex items-center gap-2 mb-2 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--sage)]">
                  {isPoster ? <LayoutTemplate size={12} /> : <FileText size={12} />}
                  {isPoster ? strings.posterViewer : strings.paperViewer}
                </div>
                <h2
                  className="font-display italic text-[var(--ink)] text-xl md:text-2xl leading-tight"
                  style={{ fontWeight: 500 }}
                >
                  {doc.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[var(--ink-muted)] hover:text-[var(--sage)] transition-colors flex-shrink-0"
                aria-label={strings.closeViewer}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content - PDF or Text */}
            <div className="flex-1 overflow-hidden flex flex-col relative overscroll-contain">
              {showPdf ? (
                <Suspense
                  fallback={
                    <div className="flex-1 flex items-center justify-center font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--ink-muted)]">
                      Loading…
                    </div>
                  }
                >
                  <PdfViewer
                    url={doc.pdfUrl!}
                    fitMode={isPoster ? 'page' : 'width'}
                    className="flex-1"
                    onLoadError={() => setPdfFailed(true)}
                  />
                </Suspense>
              ) : hasInlineContent ? (
                <div className="flex-1 overflow-y-auto">
                  {isPoster ? (
                    /* POSTER LAYOUT - GRID */
                    <div className="p-6 md:p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
                        {doc.content.map((section, idx) => (
                          <div
                            key={idx}
                            className={`p-6 ${idx === 0 || idx === doc.content.length - 1 ? 'md:col-span-3 lg:col-span-1' : ''}`}
                            style={{ border: '1px solid var(--rule)' }}
                          >
                            {section.heading && (
                              <div
                                className="mb-3 pb-2"
                                style={{ borderBottom: '1px solid var(--sage)' }}
                              >
                                <h3
                                  className="font-display italic text-[var(--ink)] text-lg"
                                  style={{ fontWeight: 500 }}
                                >
                                  {section.heading}
                                </h3>
                              </div>
                            )}
                            <p className="font-serif text-sm md:text-base text-[var(--ink)] leading-relaxed whitespace-pre-line text-justify">
                              {section.body}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* PAPER LAYOUT - SINGLE COLUMN */
                    <div
                      className="p-8 md:p-16 max-w-3xl mx-auto min-h-full"
                      style={{
                        borderLeft: '1px solid var(--rule)',
                        borderRight: '1px solid var(--rule)',
                      }}
                    >
                      {doc.content.map((section, idx) => (
                        <div key={idx} className="mb-10">
                          {section.heading && (
                            <h3 className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--sage)] mb-4">
                              {section.heading}
                            </h3>
                          )}
                          <p className="font-serif text-base text-[var(--ink)] leading-8 whitespace-pre-line">
                            {section.body}
                          </p>
                        </div>
                      ))}
                      <div
                        className="pt-12 mt-12 text-center font-serif italic text-sm text-[var(--ink-muted)]"
                        style={{ borderTop: '1px solid var(--rule)' }}
                      >
                        {strings.endOfDocument}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
                  <p className="font-serif text-sm text-[var(--ink-muted)] leading-relaxed max-w-md">
                    {strings.unableToDisplayPdf}. {strings.pdfFallback}{' '}
                    <code className="font-mono text-xs">public/documents/</code> {strings.folder}
                  </p>
                  {hasPdf && (
                    <a
                      href={doc.pdfUrl}
                      download
                      className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--sage)] hover:text-[var(--ink)] transition-colors"
                    >
                      <Download size={12} />
                      {strings.downloadPdf}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="p-4 flex justify-end gap-5"
              style={{ borderTop: '1px solid var(--rule)' }}
            >
              {hasPdf && (
                <a
                  href={doc.pdfUrl}
                  download
                  className="group inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors py-2"
                >
                  <Download size={12} />
                  <span className="relative">
                    {strings.downloadPdf}
                    <span
                      className="absolute left-0 right-0 -bottom-0.5 h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
                      style={{ backgroundColor: 'var(--sage)' }}
                      aria-hidden
                    />
                  </span>
                </a>
              )}
              <button
                onClick={onClose}
                className="font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--paper)] py-2 px-4 transition-colors"
                style={{ backgroundColor: 'var(--ink)' }}
              >
                {strings.closeViewer}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
