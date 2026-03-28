/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown, Menu, X, Mail, Linkedin, FileText, LayoutTemplate, Moon, Sun, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { govtPaper, ricePoster, histPaper, histPoster, nmunPaper, ResearchDocument } from './data/researchData';
import { DocumentModal } from './components/DocumentModal';

type TabId = 'home' | 'about' | 'research' | 'leadership' | 'work' | 'honors';

/* ─── Animation variants ──────────────────────────────────────────── */
const cubicEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

const pageTransition = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: cubicEase, staggerChildren: 0.07 },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: cubicEase },
  },
};

/* ─── Static data ─────────────────────────────────────────────────── */
const educationData = [
  { school: 'University of St. Thomas', degree: 'B.S. Applied Mathematics', date: 'Expected May 2027', honor: 'Minor: Data Analytics', url: 'https://stthom.edu/', color: 'bg-[#d4e8dc] dark:bg-[#1a3d2b]/40' },
  { school: 'Lone Star College', degree: 'Honors A.S. / General', date: 'May 2025', honor: 'Summa Cum Laude | Distinguished Global Scholars', url: 'https://www.lonestar.edu/', color: 'bg-[#e0d6f0] dark:bg-[#2a1e46]/40' },
  { school: 'Jersey Village High School', degree: 'High School Diploma', date: 'May 2023', honor: 'Cum Laude', url: 'https://jerseyvillage.cfisd.net/', color: 'bg-[#f0dcd4] dark:bg-[#3e2218]/40' },
];

const honorData = [
  { title: 'Monaghan Excellence Scholarship', org: 'University of St. Thomas', date: 'Fall 2025 – Spring 2027', color: 'bg-[#d4e8dc] dark:bg-[#1a3d2b]/30' },
  { title: 'CASE Finalist', org: 'Amideast Education Abroad Connect', date: 'Summer 2025', color: 'bg-[#e8d4d4] dark:bg-[#3d1a1a]/30' },
  { title: 'Distinguished Global Scholar Study Abroad Scholarship', org: 'Lone Star College Houston-North', date: 'Summer 2025', color: 'bg-[#d4e0e8] dark:bg-[#1a2e3d]/30' },
  { title: 'Distinguished Global Scholar', org: 'Lone Star College', date: 'Fall 2024 – Spring 2025', color: 'bg-[#e0d6f0] dark:bg-[#2a1e46]/30' },
  { title: 'Global Scholar Language Scholarship', org: 'Lone Star College Houston-North', date: 'Fall 2024 – Spring 2025', color: 'bg-[#f0e0d6] dark:bg-[#3e2a1e]/30' },
  { title: 'Best In Committee Award', org: 'National Model United Nations, NY', date: '2024', color: 'bg-[#f0dcd4] dark:bg-[#3e2218]/30' },
  { title: 'Outstanding Delegation Award', org: 'National Model United Nations, NY', date: '2024', color: 'bg-[#d4dce8] dark:bg-[#1a2a3e]/30' },
  { title: 'Global Scholar Award', org: 'Lone Star College Houston-North', date: 'Fall 2023 – Spring 2025', color: 'bg-[#f0e8d4] dark:bg-[#3e3218]/30' },
  { title: "President's List", org: 'Lone Star College', date: '2023 – 2025', color: 'bg-[#d4e8e4] dark:bg-[#1a3d35]/30' },
  { title: 'Academic All-American Award', org: 'National Speech and Debate Association', date: 'Fall 2022', color: 'bg-[#e8dce0] dark:bg-[#3d1a2e]/30' },
  { title: '6x Tournament Champion', org: 'Speech and Debate, Houston, TX', date: 'High School', color: 'bg-[#d6e0d4] dark:bg-[#1e2a1a]/30' },
  { title: '2x State TFA Qualifier', org: 'Texas Forensics Association', date: 'High School', color: 'bg-[#e0d4e8] dark:bg-[#2a1a3d]/30' },
  { title: 'TFA Quarter Finalists', org: 'Texas Forensics Association', date: 'High School', color: 'bg-[#d4e8dc] dark:bg-[#1a3d2b]/30' },
  { title: 'NIETOC Qualifier', org: 'National Individual Events Tournament of Champions', date: 'High School', color: 'bg-[#e8e0d4] dark:bg-[#3d351a]/30' },
];

/* ─── Utility ─────────────────────────────────────────────────────── */
const getStaircaseOffset = (index: number, total: number) =>
  ((total - 1 - index) / Math.max(total - 1, 1)) * 50;

/* ─── Sparkle ─────────────────────────────────────────────────────── */
const Sparkle = ({
  className = '',
  size = 36,
  style,
}: {
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <path
      d="M18 0 C10 3 3 10 0 18 C3 26 10 33 18 36 C26 33 33 26 36 18 C33 10 26 3 18 0 Z"
      fill="currentColor"
    />
  </svg>
);

/* ─── Tab hero heading (like seanhalpin.xyz) ──────────────────────── */
const TabHero = ({ children }: { children: React.ReactNode }) => (
  <motion.div variants={fadeIn} className="text-center mb-16 pt-4">
    <h1
      className="font-display font-black text-forest dark:text-white leading-[0.88]"
      style={{ fontSize: 'clamp(3.5rem, 10vw, 8rem)' }}
    >
      {children}
    </h1>
  </motion.div>
);

/* ─── Honor card ─────────────────────────────────────────────────── */
const HonorCard = ({
  title,
  org,
  date,
  color,
}: {
  title: string;
  org: string;
  date: string;
  color: string;
}) => (
  <motion.div
    variants={fadeIn}
    className={`flex flex-col group items-center p-6 ${color} rounded-2xl border border-white/40 dark:border-white/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
  >
    <h3 className="font-display font-bold text-lg text-forest dark:text-white text-center mb-2 leading-tight">
      {title}
    </h3>
    <div className="w-8 h-0.5 bg-nobel-gold mb-3 opacity-60" />
    <p className="text-xs text-stone-500 dark:text-white/55 font-bold uppercase tracking-widest text-center">
      {org}
    </p>
    <p className="text-xs text-stone-400 dark:text-white/35 mt-2 italic">{date}</p>
  </motion.div>
);

/* ─── Experience item (used in Research) ──────────────────────────── */
const ExperienceItem = ({
  title,
  role,
  date,
  children,
  location,
  documentData,
  posterData,
  onOpenDocument,
}: {
  title: string;
  role: string;
  date: string;
  children: React.ReactNode;
  location?: string;
  documentData?: ResearchDocument;
  posterData?: ResearchDocument;
  onOpenDocument?: (doc: ResearchDocument) => void;
}) => (
  <motion.div
    variants={fadeIn}
    className="mb-12 border-l-2 border-forest/20 dark:border-white/15 pl-6 relative"
  >
    <div className="absolute w-3 h-3 bg-forest dark:bg-white/70 rounded-full -left-[6.5px] top-1.5 ring-2 ring-white/80 dark:ring-black/30" />

    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
      <div className="flex items-center gap-3 flex-wrap">
        <h3 className="text-xl font-display font-bold text-forest dark:text-white">{title}</h3>
        {documentData && onOpenDocument && (
          <button
            onClick={() => onOpenDocument(documentData)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/70 dark:bg-white/10 border border-forest/20 dark:border-white/15 rounded-full text-forest dark:text-white/80 hover:bg-forest dark:hover:bg-white hover:text-white dark:hover:text-forest transition-all duration-300 text-xs uppercase font-bold tracking-wider group"
            title="View Paper/Poster"
          >
            <FileText size={13} className="group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">View {documentData.type}</span>
          </button>
        )}
        {posterData && onOpenDocument && (
          <button
            onClick={() => onOpenDocument(posterData)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/70 dark:bg-white/10 border border-forest/20 dark:border-white/15 rounded-full text-forest dark:text-white/80 hover:bg-forest dark:hover:bg-white hover:text-white dark:hover:text-forest transition-all duration-300 text-xs uppercase font-bold tracking-wider group"
            title="View Poster"
          >
            <LayoutTemplate size={13} className="group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">View Poster</span>
          </button>
        )}
      </div>
      <span className="text-xs text-forest/50 dark:text-white/40 font-mono whitespace-nowrap mt-1 md:mt-0 md:ml-4 bg-white/50 dark:bg-white/8 px-2 py-0.5 rounded-full">
        {date}
      </span>
    </div>

    <div className="text-sm font-bold text-forest/70 dark:text-white/55 uppercase tracking-wider mb-1">{role}</div>
    {location && (
      <div className="text-xs text-forest/50 dark:text-white/40 mb-3 italic">{location}</div>
    )}
    <div className="text-forest/80 dark:text-white/65 leading-relaxed text-base">{children}</div>
  </motion.div>
);

/* ─── Section heading (smaller, used within sections) ────────────── */
const SectionHeading = ({
  label,
  heading,
  sub,
  center = false,
}: {
  label: string;
  heading: string;
  sub?: string;
  center?: boolean;
}) => (
  <motion.div
    variants={fadeIn}
    className={`mb-12 ${center ? 'text-center' : ''}`}
  >
    <div className="inline-block mb-3 text-xs font-bold tracking-[0.2em] text-forest/50 dark:text-white/40 uppercase">
      {label}
    </div>
    <h2 className="font-display font-black text-5xl md:text-6xl text-forest dark:text-white leading-[0.92]">
      {heading}
    </h2>
    {sub && (
      <p className="mt-4 text-forest/60 dark:text-white/50 max-w-xl mx-auto text-base">{sub}</p>
    )}
  </motion.div>
);

/* ─── Staircase card (like seanhalpin.xyz About timeline) ─────────── */
const StaircaseCard = ({
  title,
  role,
  shortDate,
  location,
  offset,
  children,
}: {
  title: string;
  role: string;
  shortDate: string;
  location?: string;
  offset: number;
  children?: React.ReactNode;
}) => (
  <motion.div
    variants={fadeIn}
    className="mb-3 staircase-step"
    style={{ paddingLeft: `${offset}%` }}
  >
    <div className="bg-forest dark:bg-forest-light text-white rounded-2xl p-5 md:p-6 max-w-lg">
      <div className="flex items-baseline justify-between gap-4 mb-1">
        <h3 className="font-display font-bold text-base md:text-lg leading-tight">
          {title}
        </h3>
        <span className="font-display font-black text-lg md:text-xl whitespace-nowrap opacity-70">
          {shortDate}
        </span>
      </div>
      <div className="text-white/70 text-sm font-bold uppercase tracking-wider">
        {role}
      </div>
      {location && (
        <div className="text-white/50 text-xs italic mt-1">{location}</div>
      )}
      {children && (
        <div className="text-white/60 text-sm leading-relaxed mt-3">{children}</div>
      )}
    </div>
  </motion.div>
);

/* ─── Education cards (reused on home + Education tab) ────────────── */
const EducationCards = () => (
  <motion.div
    variants={fadeIn}
    className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto"
  >
    {educationData.map((item) => (
      <a
        key={item.school}
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`p-6 ${item.color} rounded-2xl border border-white/40 dark:border-white/10 hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center block`}
      >
        <h4 className="font-display font-black text-forest dark:text-white text-lg mb-2">
          {item.school}
        </h4>
        <p className="text-forest/60 dark:text-white/50 italic mb-2 text-sm">
          {item.degree}
        </p>
        <p className="text-sm text-forest/50 dark:text-white/40">{item.date}</p>
        <p className="text-xs text-forest/60 dark:text-white/50 mt-2 uppercase tracking-wide font-bold">
          {item.honor}
        </p>
      </a>
    ))}
  </motion.div>
);

/* ─── Nav links ──────────────────────────────────────────────────── */
const NAV_LINKS: { id: TabId; label: string }[] = [
  { id: 'about',      label: 'Education'  },
  { id: 'research',   label: 'Research'   },
  { id: 'leadership', label: 'Leadership' },
  { id: 'work',       label: 'Work'       },
  { id: 'honors',     label: 'Honors'     },
];

/* ─── App ────────────────────────────────────────────────────────── */
const App: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDocument, setActiveDocument] = useState<ResearchDocument | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [navResearchOpen, setNavResearchOpen] = useState(false);
  const navResearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activeTab]);

  /* sliding nav pill */
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLElement | null>>({});
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, visible: false });

  useEffect(() => {
    const targetId = hoveredId ?? (activeTab !== 'home' ? activeTab : null);
    if (targetId && navRef.current && linkRefs.current[targetId]) {
      const navRect = navRef.current.getBoundingClientRect();
      const linkRect = linkRefs.current[targetId]!.getBoundingClientRect();
      setPillStyle({
        left: linkRect.left - navRect.left,
        width: linkRect.width,
        visible: true,
      });
    } else {
      setPillStyle((prev) => ({ ...prev, visible: false }));
    }
  }, [hoveredId, activeTab]);

  const switchTab = (id: TabId, scrollTo?: string) => {
    setActiveTab(id);
    setMenuOpen(false);
    setNavResearchOpen(false);
    if (scrollTo) {
      // Wait for the tab transition to finish, then scroll
      setTimeout(() => {
        document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 450);
    }
  };

  return (
    <div className="site-shell min-h-screen text-forest dark:text-white selection:bg-forest selection:text-white transition-colors duration-300">
      <DocumentModal
        isOpen={!!activeDocument}
        onClose={() => setActiveDocument(null)}
        document={activeDocument}
      />

      {/* ── Floating pill nav ──────────────────────────────── */}
      <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        {/* Desktop */}
        <div
          ref={navRef}
          className="hidden md:flex pointer-events-auto items-center gap-0.5 px-2 py-1.5 bg-white/75 dark:bg-forest/60 backdrop-blur-md rounded-full shadow-lg border border-white/70 dark:border-white/10 relative"
        >
          <div
            className="absolute rounded-full bg-forest/10 dark:bg-white/15 pointer-events-none"
            style={{
              left: pillStyle.left,
              width: pillStyle.width,
              top: 6,
              bottom: 6,
              opacity: pillStyle.visible ? 1 : 0,
              transition:
                'left 320ms cubic-bezier(0.4, 0, 0.2, 1), width 320ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease',
            }}
          />

          <button
            onClick={() => switchTab('home')}
            className="w-8 h-8 bg-forest dark:bg-white rounded-full flex items-center justify-center text-white dark:text-forest font-display font-black text-sm mr-1 flex-shrink-0 hover:bg-forest/80 dark:hover:bg-white/90 transition-colors relative z-10"
          >
            T
          </button>
          {NAV_LINKS.map(({ id, label }) =>
            id === 'research' ? (
              <div
                key={id}
                className="relative z-20"
                onMouseEnter={() => {
                  if (navResearchTimer.current) clearTimeout(navResearchTimer.current);
                  setHoveredId(id);
                  setNavResearchOpen(true);
                }}
                onMouseLeave={() => {
                  setHoveredId(null);
                  navResearchTimer.current = setTimeout(() => setNavResearchOpen(false), 120);
                }}
              >
                <button
                  ref={(el) => { linkRefs.current[id] = el; }}
                  onClick={() => switchTab(id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    activeTab === id
                      ? 'text-forest dark:text-white'
                      : 'text-forest/70 dark:text-white/70 hover:text-forest dark:hover:text-white'
                  }`}
                >
                  {label}
                  <ChevronDown
                    size={12}
                    className={`transition-transform duration-200 ${navResearchOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence>
                  {navResearchOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.15 } }}
                      exit={{ opacity: 0, y: -6, scale: 0.96, transition: { duration: 0.1 } }}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 bg-white/95 dark:bg-[#0f2919]/95 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden"
                      onMouseEnter={() => {
                        if (navResearchTimer.current) clearTimeout(navResearchTimer.current);
                      }}
                      onMouseLeave={() => {
                        navResearchTimer.current = setTimeout(() => setNavResearchOpen(false), 120);
                      }}
                    >
                      <button
                        onClick={() => switchTab('research')}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-forest/70 dark:text-white/60 hover:bg-forest/5 dark:hover:bg-white/8 transition-colors"
                      >
                        Research Experience
                      </button>
                      <div className="mx-4 h-px bg-forest/8 dark:bg-white/8" />
                      <button
                        onClick={() => switchTab('research', 'research-presentations')}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-forest/70 dark:text-white/60 hover:bg-forest/5 dark:hover:bg-white/8 transition-colors"
                      >
                        Conference Presentations
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                key={id}
                ref={(el) => { linkRefs.current[id] = el; }}
                onClick={() => switchTab(id)}
                onMouseEnter={() => setHoveredId(id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer whitespace-nowrap relative z-10 ${
                  activeTab === id
                    ? 'text-forest dark:text-white'
                    : 'text-forest/70 dark:text-white/70 hover:text-forest dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            )
          )}
          <a
            href="https://www.linkedin.com/in/tung-vo-4728b7235/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 px-4 py-1.5 bg-forest text-white text-sm font-medium rounded-full hover:bg-forest/80 transition-colors flex items-center gap-1.5 flex-shrink-0 relative z-10"
          >
            <Linkedin size={13} />
            Connect
          </a>
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-8 h-8 ml-0.5 rounded-full flex items-center justify-center text-forest/50 hover:text-forest hover:bg-forest/10 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-all flex-shrink-0 relative z-10"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden w-full pointer-events-auto justify-between items-center gap-2">
          <button
            onClick={() => switchTab('home')}
            className="flex items-center gap-2 px-3 py-2 bg-white/75 dark:bg-forest/60 backdrop-blur-md rounded-full shadow-lg border border-white/70 dark:border-white/10"
          >
            <div className="w-7 h-7 bg-forest dark:bg-white rounded-full flex items-center justify-center text-white dark:text-forest font-display font-black text-sm">
              T
            </div>
            <span className="font-display font-black text-forest dark:text-white text-sm">
              TJ Vo
            </span>
          </button>
          <div className="flex items-center gap-1.5">
            <button
              className="p-2.5 bg-white/75 dark:bg-forest/60 backdrop-blur-md rounded-full shadow-lg border border-white/70 dark:border-white/10 text-forest dark:text-white/60"
              onClick={() => setIsDark(!isDark)}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="p-2.5 bg-white/75 dark:bg-forest/60 backdrop-blur-md rounded-full shadow-lg border border-white/70 dark:border-white/10 text-forest dark:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile fullscreen menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#EDEAE2]/95 dark:bg-[#0c1a11]/95 backdrop-blur-md flex flex-col items-center justify-center gap-7">
          {NAV_LINKS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => switchTab(id)}
              className="font-display font-black text-3xl text-forest dark:text-white hover:text-forest/60 dark:hover:text-white/60 transition-colors"
            >
              {label}
            </button>
          ))}
          <a
            href="mailto:vo.tung@stthom.edu"
            className="mt-4 px-8 py-3 bg-forest text-white rounded-full text-sm font-medium shadow-lg"
          >
            Contact Me
          </a>
        </div>
      )}

      {/* ── Content area ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {/* ── Home (Hero + Education) ──────────────────────── */}
        {activeTab === 'home' && (
          <motion.div
            key="hero-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <header className="hero-fade relative min-h-screen pb-28 md:pb-36 flex items-center justify-center overflow-hidden mesh-gradient">
              <span
                className="absolute hero-pop pointer-events-none"
                style={{ top: '16%', left: '9%', animationDelay: '0.35s' }}
              >
                <Sparkle className="text-white/80 sparkle-anim" size={60} style={{ animationDuration: '9s' }} />
              </span>
              <span
                className="absolute hero-pop pointer-events-none"
                style={{ top: '19%', right: '8%', animationDelay: '0.55s' }}
              >
                <Sparkle className="text-white/65 sparkle-anim-rev" size={38} style={{ animationDuration: '13s' }} />
              </span>
              <span
                className="absolute hero-pop pointer-events-none"
                style={{ bottom: '26%', left: '7%', animationDelay: '0.70s' }}
              >
                <Sparkle className="text-white/45 sparkle-anim" size={26} style={{ animationDuration: '7s' }} />
              </span>
              <span
                className="absolute hero-pop pointer-events-none"
                style={{ bottom: '31%', right: '10%', animationDelay: '0.50s' }}
              >
                <Sparkle className="text-white/50 sparkle-anim-rev" size={20} style={{ animationDuration: '11s' }} />
              </span>

              <div className="relative z-10 container mx-auto px-6 text-center">
                <div className="hero-pop hero-pop-1 inline-block mb-7 px-4 py-1.5 bg-white/50 dark:bg-white/10 backdrop-blur-sm text-forest dark:text-white/80 text-xs tracking-[0.22em] uppercase font-bold rounded-full border border-white/70 dark:border-white/20">
                  Portfolio ✦
                </div>

                <h1
                  className="hero-pop hero-pop-2 font-display font-black text-forest dark:text-white leading-[0.88] mb-8"
                  style={{ fontSize: 'clamp(3.2rem, 10.5vw, 8.5rem)' }}
                >
                  Hi. I'm TJ.
                </h1>

                <div className="hero-pop hero-pop-3 flex flex-col sm:flex-row justify-center items-center gap-3">
                  <a
                    href="mailto:vo.tung@stthom.edu"
                    className="flex items-center gap-2 px-7 py-3 bg-forest dark:bg-white text-white dark:text-forest rounded-full hover:bg-forest/85 dark:hover:bg-white/90 transition-colors font-medium text-sm shadow-md"
                  >
                    <Mail size={15} />
                    vo.tung@stthom.edu
                  </a>
                  <div className="px-7 py-3 border-2 border-white/55 dark:border-white/20 rounded-full text-forest/75 dark:text-white/60 bg-white/35 dark:bg-white/5 backdrop-blur-sm text-sm font-medium">
                    Houston, Texas
                  </div>
                </div>

                <div className="hero-pop hero-pop-4 absolute bottom-10 left-0 right-0 flex justify-center animate-bounce">
                  <button
                    onClick={() =>
                      document
                        .getElementById('home-education')
                        ?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="text-forest/40 hover:text-forest transition-colors cursor-pointer"
                  >
                    <ArrowDown size={24} />
                  </button>
                </div>
              </div>
            </header>

            {/* Education below hero */}
            <motion.section
              id="home-education"
              className="py-24 px-6 md:px-16"
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.15 }}
              variants={pageTransition}
            >
              <SectionHeading label="Education" heading="Academic Foundation." center />
              <EducationCards />
            </motion.section>
          </motion.div>
        )}

        {/* ── Education ───────────────────────────────────────── */}
        {activeTab === 'about' && (
          <motion.main
            key="about"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="tab-content pt-24 pb-24 px-6 md:px-16"
          >
            <TabHero>Education.</TabHero>
            <EducationCards />
          </motion.main>
        )}

        {/* ── Research ────────────────────────────────────────── */}
        {activeTab === 'research' && (
          <motion.main
            key="research"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="tab-content pt-24 pb-24 px-6 md:px-16"
          >
            <TabHero>Research.</TabHero>

            {/* Research experience */}
            <motion.div
              variants={fadeIn}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start"
            >
              {/* Left column */}
              <div>
                <div className="mb-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/55 dark:bg-white/10 text-forest dark:text-white/80 text-xs font-bold tracking-widest uppercase rounded-full mb-5 border border-white/70 dark:border-white/15">
                    Research Focus
                  </div>
                  <h2 className="font-display font-black text-4xl md:text-5xl text-forest dark:text-white leading-[0.92]">
                    Graph Theory &amp;
                    <br />
                    Network Dynamics.
                  </h2>
                </div>
                <ExperienceItem
                  title="University of St. Thomas"
                  role="Undergraduate Researcher"
                  date="Fall 2025 – Current"
                  location="Supervisor: Dr. Mary Flagg"
                >
                  Focusing on graph theory topics such as competing zero forcing sets.
                  Conducting theoretical analysis and computational modeling of vertex
                  connectivity across graph families to explore network dynamics and
                  efficiency.
                </ExperienceItem>
              </div>

              {/* Right column */}
              <div>
                <div className="mb-10">
                  <h2 className="font-display font-black text-4xl md:text-5xl text-forest dark:text-white leading-[0.92]">
                    Sustainability &amp;
                    <br />
                    Public Policy.
                  </h2>
                </div>
                <ExperienceItem
                  title="Rice University"
                  role="Undergraduate Researcher"
                  date="Spring 2025"
                  location="Supervisors: Dr. Carrie Masiello, Dr. Risa Myers, Dr. Canek Phillips"
                  documentData={ricePoster}
                  onOpenDocument={(doc) => setActiveDocument(doc)}
                >
                  Exploring the vast world of Data Science within the lens of
                  sustainability. Using scientific methods, programming skills, and
                  mathematics to extract insight regarding food webs, data visualization,
                  and the ethics of data centers.
                </ExperienceItem>
                <ExperienceItem
                  title="Lone Star College | The Honors College"
                  role="Researcher – Vietnam War Analysis"
                  date="Fall 2024"
                  location="Supervisor: Dr. Kelly Phillips"
                  documentData={histPaper}
                  posterData={histPoster}
                  onOpenDocument={(doc) => setActiveDocument(doc)}
                >
                  Explored differences in recruitment tactics and desertion motivations
                  among U.S. and Viet Cong soldiers. Aimed to understand the relationship
                  between recruitment tactics and wartime desertion rates.
                </ExperienceItem>
                <ExperienceItem
                  title="National Model United Nations (NMUN)"
                  role="Delegate &amp; Researcher"
                  date="Spring 2024"
                  location="New York, NY | Supervisors: Dr. Sean Tiffee, Dr. Rebecca Howard, Dr. Peggy Lambert, Prof. Casey Garcia"
                  documentData={nmunPaper}
                  onOpenDocument={(doc) => setActiveDocument(doc)}
                >
                  Conducted an autoethnographic study on intercultural communication and
                  leadership dynamics at NMUN. Analyzed relational leadership theory and
                  public speaking strategies, resulting in a 'Best in Committee' award.
                </ExperienceItem>
                <ExperienceItem
                  title="Lone Star College | The Honors College"
                  role="Researcher – Air Pollution"
                  date="Spring 2024"
                  location="Supervisor: Dr. Dana Van De Walker"
                  documentData={govtPaper}
                  onOpenDocument={(doc) => setActiveDocument(doc)}
                >
                  Compared and analyzed major air polluters (US and Chad) to identify
                  factors decreasing life expectancy. Investigated correlations between air
                  pollution levels and public health outcomes.
                </ExperienceItem>
              </div>
            </motion.div>

            {/* Conference Presentations */}
            <motion.div
              id="research-presentations"
              variants={fadeIn}
              className="mt-20 scroll-mt-24"
            >
              <SectionHeading
                label="Presentations"
                heading="Conference Presentations."
                center
              />
              <div className="max-w-3xl mx-auto space-y-4">
                {[
                  { title: '"A Systemic Approach to Understanding the Natural World"', venue: "Rice University's Environmental Data Academy Poster Session", location: 'Houston, TX', year: '2025' },
                  { title: '"A Systemic Approach to Understanding the Natural World"', venue: 'Spring Honors and International Education Conference', location: 'Houston, TX', year: '2025' },
                  { title: '"The Fortunes of War or the Luck of the Draw": Examining the Influence of Recruitment Tactics on Desertion Rates During the Vietnam War', venue: 'World History Association of Texas Annual Conference', location: 'Commerce, TX', year: '2025' },
                  { title: '"The Fortunes of War or the Luck of the Draw": Examining the Influence of Recruitment Tactics on Desertion Rates During the Vietnam War', venue: 'Fall Honors and International Education Conference', location: 'Houston, TX', year: '2024' },
                  { title: '"The Fortunes of War or the Luck of the Draw": Examining the Influence of Recruitment Tactics on Desertion Rates During the Vietnam War', venue: 'International Ed Biennial Conference', location: 'Houston, TX', year: '2024' },
                  { title: '"Life Expectancy and Air Pollution: A Comparative Analysis of the United States and Chad"', venue: 'Spring Honors and International Education Conference', location: 'Houston, TX', year: '2024' },
                  { title: 'National Model United Nations – New York Panelist', venue: 'Spring Honors and International Education Conference', location: 'Houston, TX', year: '2024' },
                ].map((p, i) => (
                  <motion.div
                    key={i}
                    variants={fadeIn}
                    className="flex gap-4 items-start p-5 bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-2xl hover:shadow-md transition-all duration-300"
                  >
                    <span className="flex-shrink-0 mt-1 font-display font-black text-lg text-forest/30 dark:text-white/25 w-6 text-right">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="font-display font-bold text-forest dark:text-white leading-snug text-base">
                        {p.title}
                      </h4>
                      <p className="text-sm text-forest/60 dark:text-white/50 mt-1">
                        {p.venue} — {p.location}, {p.year}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.main>
        )}

        {/* ── Leadership ──────────────────────────────────────── */}
        {activeTab === 'leadership' && (
          <motion.main
            key="leadership"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="tab-content pt-24 pb-24 px-6 md:px-16"
          >
            <TabHero>Leadership.</TabHero>
            <div className="overflow-hidden">
              <StaircaseCard
                title="Community, Action, and Social Entrepreneurship"
                role="Finalist"
                shortDate="Summer '25"
                location="Amideast Education Abroad Connect"
                offset={getStaircaseOffset(0, 7)}
              >
                An 8-day guided program in Tunisia. Selected finalists are introduced to
                civil society organizations through daily presentations, panel discussions,
                community service, and engagement with local peers.
              </StaircaseCard>
              <StaircaseCard
                title="Honors College Student Advisory Board"
                role="Campus Representative"
                shortDate="'24–'25"
                location="Lone Star College Houston-North"
                offset={getStaircaseOffset(1, 7)}
              >
                Met with the Associate Vice Chancellor of Honors and International
                Education biannually. Collaborated to provide student perspectives on
                Honors College programming and system-wide activities.
              </StaircaseCard>
              <StaircaseCard
                title="HIE Emissary"
                role="System Liaison Emeritus"
                shortDate="Spring '25"
                location="Lone Star College"
                offset={getStaircaseOffset(2, 7)}
              >
                As Emeritus, collaborated with the current System Liaison Emissary and
                mentored them while promoting programs within The Honors College and
                International Education branch.
              </StaircaseCard>
              <StaircaseCard
                title="HIE Emissary"
                role="System Liaison"
                shortDate="Fall '24"
                location="Lone Star College"
                offset={getStaircaseOffset(3, 7)}
              >
                Promoted The Honors College throughout the semester, collaborating with
                campus liaisons for system-wide events. Also promoted the Rice University
                Take Flight program, NMUN team, and scholarships.
              </StaircaseCard>
              <StaircaseCard
                title="Global Leadership Program"
                role="Member"
                shortDate="'24–'25"
                location="Lone Star College"
                offset={getStaircaseOffset(4, 7)}
              >
                Cultivated ethical, inclusive leadership skills in a global context through
                international diplomacy training, conference participation, and partnerships
                with local and national organizations.
              </StaircaseCard>
              <StaircaseCard
                title="Distinguished Global Scholar"
                role="Member"
                shortDate="'24–'25"
                location="Lone Star College"
                offset={getStaircaseOffset(5, 7)}
              >
                Selected from ~100 applicants as one of eight cohort members. Coursework
                includes International Study (IS) designated classes that add an
                international scope to the curriculum.
              </StaircaseCard>
              <StaircaseCard
                title="Texas Boys State"
                role="Press Team Member and Statesman"
                shortDate="Summer '22"
                location="The American Legion"
                offset={getStaircaseOffset(6, 7)}
              >
                One of two students nominated from Jersey Village High School. Attended
                mock House of Representatives meetings, conceptualized social media
                campaigns, and composed website articles on current events.
              </StaircaseCard>
            </div>
          </motion.main>
        )}

        {/* ── Work ────────────────────────────────────────────── */}
        {activeTab === 'work' && (
          <motion.main
            key="work"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="tab-content pt-24 pb-24 px-6 md:px-16"
          >
            <TabHero>Work.</TabHero>
            <div className="overflow-hidden">
              <StaircaseCard
                title="Geospace Technology"
                role="Electro-Mechanical Assembler"
                shortDate="'25–"
                location="Houston, Texas"
                offset={getStaircaseOffset(0, 3)}
              >
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    Operate coiling machinery to assemble water cable; troubleshoot minor
                    mechanical issues.
                  </li>
                  <li>
                    Enter coil data into systems and follow electrical schematics to ensure
                    correct cable builds.
                  </li>
                  <li>
                    Maintain clean, safe workstation and adhere to safety protocols.
                  </li>
                </ul>
              </StaircaseCard>
              <StaircaseCard
                title="Lone Star College – CyFair"
                role="College Relations Intern"
                shortDate="'24–'25"
                location="Cypress, Texas"
                offset={getStaircaseOffset(1, 3)}
              >
                <ul className="list-disc pl-4 space-y-1">
                  <li>Drafted and planned campus-wide events.</li>
                  <li>
                    Coordinated and managed social media platforms and posts.
                  </li>
                  <li>
                    Conceptualized social media campaigns across X, Instagram, and
                    Facebook.
                  </li>
                </ul>
              </StaircaseCard>
              <StaircaseCard
                title="East Aldine BakerRipley"
                role="Front Desk Volunteer"
                shortDate="'24–'25"
                location="Aldine, Texas"
                offset={getStaircaseOffset(2, 3)}
              >
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    Answered incoming calls and routed inquiries appropriately.
                  </li>
                  <li>
                    Greeted residents and visitors, providing a welcoming environment.
                  </li>
                  <li>
                    Assisted with administrative tasks to ensure smooth front-desk
                    operations.
                  </li>
                </ul>
              </StaircaseCard>
            </div>
          </motion.main>
        )}

        {/* ── Honors ──────────────────────────────────────────── */}
        {activeTab === 'honors' && (
          <motion.main
            key="honors"
            variants={pageTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            className="tab-content pt-24 pb-24 px-6 md:px-16"
          >
            <TabHero>Honors.</TabHero>
            <motion.div
              variants={fadeIn}
              className="mb-6 text-center text-forest/60 dark:text-white/50 text-base max-w-xl mx-auto"
            >
              Selected competitive accomplishments and scholarships.
            </motion.div>
            <motion.div
              variants={fadeIn}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {honorData.map((h) => (
                <HonorCard
                  key={h.title}
                  title={h.title}
                  org={h.org}
                  date={h.date}
                  color={h.color}
                />
              ))}
            </motion.div>

            <motion.div variants={fadeIn} className="mt-16 text-center">
              <h3 className="font-display font-bold text-2xl text-forest dark:text-white mb-6">
                Certifications &amp; Memberships
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  'Micro-Credential: Environmental Data Science (Rice)',
                  'Foundations: Data, Data, Everywhere (Coursera)',
                  'Ask Questions to Make Data-Driven Decisions (Coursera)',
                  'Prepare Data for Explorations (Coursera)',
                  'OSHA 10',
                  'Phi Theta Kappa Member',
                  'Rice Take Flight Program',
                  'Global Scholar',
                ].map((cert) => (
                  <span
                    key={cert}
                    className="px-4 py-2 bg-[#EDEAE2] dark:bg-white/15 border border-stone-200 dark:border-white/25 rounded-full text-sm text-forest/70 dark:text-white/85 font-medium"
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.main>
        )}
      </AnimatePresence>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="bg-forest text-white/70 py-16">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <div className="text-white font-display font-black text-3xl mb-1">
              Tung (TJ) Vo.
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href="mailto:vo.tung@stthom.edu"
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Mail size={18} />
            </a>
            <a
              href="https://www.linkedin.com/in/tung-vo-4728b7235/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Linkedin size={18} />
            </a>
          </div>
        </div>
        <div className="text-center mt-10 text-xs text-white/25">
          © 2025 Tung Vo. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;
