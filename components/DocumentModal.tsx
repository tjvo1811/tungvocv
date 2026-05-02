/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef } from 'react';
import { X, FileText, LayoutTemplate, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResearchDocument } from '../data/researchData';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ResearchDocument | null;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, document }) => {
  // Retain the last document during the exit animation so AnimatePresence can
  // fade it out cleanly even after the parent has cleared `document` to null.
  const lastDocRef = useRef<ResearchDocument | null>(null);
  if (document) lastDocRef.current = document;
  const doc = document ?? lastDocRef.current;

  // Close on Escape and lock body scroll while the modal is open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      window.document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!doc) return null;

  const isPoster = doc.type === 'Poster';
  const hasPdf = !!doc.pdfUrl;

  const showVisual = hasPdf;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-forest/30 dark:bg-black/50 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed ${isPoster || showVisual ? 'inset-2 md:inset-6' : 'inset-4 md:inset-10'} z-[70] rounded-2xl shadow-2xl overflow-hidden flex flex-col mx-auto bg-[#EDEAE2]/95 dark:bg-[#0c1a11]/95 backdrop-blur-md border border-white/60 dark:border-white/10 ${isPoster || showVisual ? 'max-w-[95vw] h-[95vh]' : 'max-w-4xl'}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 md:p-6 border-b border-white/50 dark:border-white/10 bg-white/40 dark:bg-white/5">
              <div className="pr-8">
                <div className="flex items-center gap-2 mb-2 text-nobel-gold font-bold text-xs uppercase tracking-widest">
                  {isPoster ? <LayoutTemplate size={13} /> : <FileText size={13} />}
                  {doc.type} Viewer
                </div>
                <h2 className="font-display font-bold text-xl md:text-2xl text-forest dark:text-white leading-tight">
                  {doc.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-forest/10 dark:hover:bg-white/10 text-forest/50 dark:text-white/50 hover:text-forest dark:hover:text-white transition-colors flex-shrink-0"
              >
                <X size={22} />
              </button>
            </div>

            {/* Content - PDF or Text */}
            <div className="flex-1 overflow-hidden flex flex-col relative">
              {hasPdf ? (
                <div className="flex-1 w-full h-full relative">
                  <iframe
                    src={doc.pdfUrl}
                    className="w-full h-full"
                    title="PDF Viewer"
                  >
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center text-forest/60 dark:text-white/60">
                      <FileText size={48} className="text-forest/20 dark:text-white/20 mb-4" />
                      <h3 className="font-display font-bold text-xl text-forest dark:text-white mb-2">Unable to display PDF</h3>
                      <p className="mb-6 max-w-md mx-auto text-sm">
                        The PDF file could not be loaded directly. Please check if the file <b>{doc.pdfUrl?.split('/').pop()}</b> exists in your <b>public/documents/</b> folder.
                      </p>
                      <a
                        href={doc.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-forest dark:bg-white text-white dark:text-forest rounded-full hover:bg-forest/85 dark:hover:bg-white/90 transition-colors font-medium text-sm"
                      >
                        <Download size={16} /> Download PDF
                      </a>
                    </div>
                  </iframe>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  {isPoster ? (
                    /* POSTER LAYOUT - GRID */
                    <div className="p-6 md:p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
                        {doc.content.map((section, idx) => (
                          <div key={idx} className={`bg-white/60 dark:bg-white/5 p-6 rounded-2xl border border-white/70 dark:border-white/10 ${idx === 0 || idx === doc.content.length - 1 ? 'md:col-span-3 lg:col-span-1' : ''}`}>
                            {section.heading && (
                              <div className="mb-3 pb-2 border-b-2 border-nobel-gold/30">
                                <h3 className="font-display font-bold text-lg text-forest dark:text-white">{section.heading}</h3>
                              </div>
                            )}
                            <p className="text-sm md:text-base text-forest/75 dark:text-white/65 leading-relaxed whitespace-pre-line text-justify">
                              {section.body}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* PAPER LAYOUT - SINGLE COLUMN */
                    <div className="p-8 md:p-16 max-w-3xl mx-auto bg-white/60 dark:bg-white/5 min-h-full border-x border-white/50 dark:border-white/8">
                      {doc.content.map((section, idx) => (
                        <div key={idx} className="mb-10">
                          {section.heading && (
                            <h3 className="font-display font-bold text-base text-forest dark:text-white mb-4 uppercase tracking-widest">{section.heading}</h3>
                          )}
                          <p className="text-base text-forest/80 dark:text-white/65 leading-8 font-serif whitespace-pre-line">
                            {section.body}
                          </p>
                        </div>
                      ))}
                      <div className="pt-12 mt-12 border-t border-forest/10 dark:border-white/10 text-center text-forest/30 dark:text-white/25 italic font-serif text-sm">
                        *** End of Document ***
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/50 dark:border-white/10 bg-white/40 dark:bg-white/5 flex justify-end gap-3">
              {hasPdf && (
                <a
                  href={doc.pdfUrl}
                  download
                  className="flex items-center gap-2 px-5 py-2 border border-forest/20 dark:border-white/15 text-forest/70 dark:text-white/70 rounded-full hover:bg-forest/8 dark:hover:bg-white/8 transition-colors font-medium text-sm"
                >
                  <Download size={15} /> Download PDF
                </a>
              )}
              <button
                onClick={onClose}
                className="px-5 py-2 bg-forest dark:bg-white text-white dark:text-forest rounded-full hover:bg-forest/85 dark:hover:bg-white/90 transition-colors font-medium text-sm"
              >
                Close Viewer
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
