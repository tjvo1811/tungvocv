/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { X, FileText, LayoutTemplate, Download, AlignLeft, File } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResearchDocument } from '../data/researchData';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ResearchDocument | null;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, document }) => {
  const [viewMode, setViewMode] = useState<'text' | 'pdf'>('text');

  // React Error Fix: Hooks must be executed unconditionally. 
  // We handle the logic inside the effect and derive values safely before the return.
  React.useEffect(() => {
    if (isOpen && document) {
        // Default to PDF if available, otherwise text
        if (document.pdfUrl) {
            setViewMode('pdf');
        } else {
            setViewMode('text');
        }
    }
  }, [isOpen, document]);

  if (!document) return null;

  const isPoster = document.type === 'Poster';
  const hasPdf = !!document.pdfUrl;
  
  const showVisual = viewMode === 'pdf' && hasPdf;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-2 md:p-6"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`fixed ${isPoster || showVisual ? 'inset-2 md:inset-6' : 'inset-4 md:inset-10'} bg-[#FDFCF8] z-[70] rounded-xl shadow-2xl overflow-hidden flex flex-col mx-auto border border-stone-200 ${isPoster || showVisual ? 'max-w-[95vw] h-[95vh]' : 'max-w-4xl'}`}
          >
            {/* Header */}
            <div className="flex flex-col border-b border-stone-200 bg-white">
                <div className="flex items-start justify-between p-6 pb-4">
                    <div className="pr-8">
                        <div className="flex items-center gap-2 mb-2 text-nobel-gold font-bold text-xs uppercase tracking-widest">
                            {isPoster ? <LayoutTemplate size={14} /> : <FileText size={14} />}
                            {document.type} Viewer
                        </div>
                        <h2 className="font-serif text-2xl md:text-3xl text-stone-900 leading-tight">
                        {document.title}
                        </h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* View Tabs */}
                {hasPdf && (
                    <div className="flex px-6 gap-6 overflow-x-auto">
                        <button 
                            onClick={() => setViewMode('pdf')}
                            className={`pb-3 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${viewMode === 'pdf' ? 'border-nobel-gold text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
                        >
                            <File size={16} /> Original PDF
                        </button>
                        <button 
                            onClick={() => setViewMode('text')}
                            className={`pb-3 text-sm font-bold uppercase tracking-wider flex items-center gap-2 transition-colors border-b-2 whitespace-nowrap ${viewMode === 'text' ? 'border-nobel-gold text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
                        >
                            <AlignLeft size={16} /> Formatted Text
                        </button>
                    </div>
                )}
            </div>

            {/* Content - PDF or Text */}
            <div className="flex-1 overflow-hidden bg-stone-50/50 flex flex-col relative">
               {viewMode === 'pdf' && hasPdf ? (
                 <div className="flex-1 w-full h-full relative bg-stone-200">
                    <iframe 
                        src={document.pdfUrl} 
                        className="w-full h-full" 
                        title="PDF Viewer"
                    >
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center text-stone-600 bg-white">
                            <FileText size={48} className="text-stone-300 mb-4" />
                            <h3 className="text-xl font-bold mb-2">Unable to display PDF</h3>
                            <p className="mb-6 max-w-md mx-auto">
                                The PDF file could not be loaded directly. Please check if the file <b>{document.pdfUrl?.split('/').pop()}</b> exists in your <b>public/documents/</b> folder.
                            </p>
                            <a 
                                href={document.pdfUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors shadow-sm"
                            >
                                <Download size={18} /> Download PDF
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
                                {document.content.map((section, idx) => (
                                <div key={idx} className={`bg-white p-6 rounded-lg border border-stone-200 shadow-sm ${idx === 0 || idx === document.content.length - 1 ? 'md:col-span-3 lg:col-span-1' : ''}`}>
                                        {section.heading && (
                                            <div className="mb-3 pb-2 border-b-2 border-nobel-gold/30">
                                                <h3 className="font-serif font-bold text-xl text-stone-900">{section.heading}</h3>
                                            </div>
                                        )}
                                        <p className="text-sm md:text-base text-stone-700 leading-relaxed whitespace-pre-line text-justify">
                                            {section.body}
                                        </p>
                                </div> 
                                ))}
                            </div>
                        </div>
                     ) : (
                        /* PAPER LAYOUT - SINGLE COLUMN */
                        <div className="p-8 md:p-16 max-w-3xl mx-auto bg-white min-h-full border-x border-stone-100 shadow-sm">
                            {document.content.map((section, idx) => (
                                <div key={idx} className="mb-10">
                                    {section.heading && (
                                        <h3 className="text-xl font-bold text-stone-900 mb-4 font-sans uppercase tracking-wide">{section.heading}</h3>
                                    )}
                                    <p className="text-lg text-stone-700 leading-8 font-serif whitespace-pre-line">
                                        {section.body}
                                    </p>
                                </div>
                            ))}
                            <div className="pt-12 mt-12 border-t border-stone-200 text-center text-stone-400 italic font-serif">
                                *** End of Document ***
                            </div>
                        </div>
                     )}
                 </div>
               )}
            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-stone-200 bg-white flex justify-end gap-3">
                {hasPdf && viewMode === 'pdf' && (
                    <a 
                        href={document.pdfUrl} 
                        download
                        className="px-6 py-2 border border-stone-300 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors shadow-sm font-medium flex items-center gap-2"
                    >
                        <Download size={16} /> Download PDF
                    </a>
                )}
                <button 
                    onClick={onClose} 
                    className="px-6 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors shadow-sm font-medium"
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
