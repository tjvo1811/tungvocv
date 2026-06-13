import React from 'react';

type Language = 'en' | 'vi';

type Item = {
  institution: string;
  role: string;
  date: string;
  focus: string;
};

const data: Record<Language, Item[]> = {
  en: [
    {
      institution: 'Rice University',
      role: 'Undergraduate Research Assistant',
      date: 'Summer 2026 –',
      focus: 'Quantum circuit optimization',
    },
    {
      institution: 'University of St. Thomas',
      role: 'Undergraduate Researcher',
      date: 'Fall 2025 –',
      focus: 'Competitive zero forcing',
    },
    {
      institution: 'University of Puerto Rico – Ponce',
      role: 'Undergraduate REU Fellow',
      date: 'Summer 2026',
      focus: 'Coding theory and combinatorics',
    },
  ],
  vi: [
    {
      institution: 'Đại học Rice',
      role: 'Trợ lý nghiên cứu',
      date: 'Hè 2026 –',
      focus: 'Tối ưu hóa mạch lượng tử',
    },
    {
      institution: 'Đại học St. Thomas',
      role: 'Nghiên cứu viên',
      date: 'Thu 2025 –',
      focus: 'Buộc-không cạnh tranh',
    },
    {
      institution: 'Đại học Puerto Rico – Ponce',
      role: 'Học giả REU bậc đại học',
      date: 'Hè 2026',
      focus: 'Lý thuyết mã hóa và tổ hợp',
    },
  ],
};

const strings = {
  en: {
    label: 'Current Research',
    summary: 'On quantum routing, graph theory, combinatorics, and coding theory.',
    seeMore: 'See full research',
  },
  vi: {
    label: 'Nghiên cứu hiện tại',
    summary: 'Về định tuyến lượng tử, lý thuyết đồ thị, tổ hợp và lý thuyết mã hóa.',
    seeMore: 'Xem nghiên cứu đầy đủ',
  },
} as const;

type CurrentResearchProps = {
  language: Language;
  isMobile: boolean;
  onOpenResearch: () => void;
};

const SeeMoreButton = ({
  language,
  onOpenResearch,
}: {
  language: Language;
  onOpenResearch: () => void;
}) => (
  <button
    type="button"
    onClick={onOpenResearch}
    className="group inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-muted)] hover:text-[var(--sage)] transition-colors py-1"
  >
    <span className="relative">
      {strings[language].seeMore} →
      <span
        className="absolute left-0 right-0 -bottom-0.5 h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
        style={{ backgroundColor: 'var(--sage)' }}
        aria-hidden
      />
    </span>
  </button>
);

export const CurrentResearch: React.FC<CurrentResearchProps> = ({
  language,
  isMobile: _isMobile,
  onOpenResearch,
}) => {
  const items = data[language];

  return (
    <section aria-label={strings[language].label}>
      <div
        className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-5"
        style={{
          borderTop: '1px solid var(--rule)',
          borderBottom: '1px solid var(--rule)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-6 text-center sm:text-left">
          <div>
            <div className="font-mono text-[10px] tracking-[0.18em] text-[var(--ink-muted)] uppercase mb-2">
              {strings[language].label}
            </div>
            <p className="font-serif text-[13px] sm:text-[14px] leading-relaxed text-[var(--ink)]">
              {strings[language].summary}
            </p>
          </div>
          <div className="sm:pt-0.5 shrink-0">
            <SeeMoreButton language={language} onOpenResearch={onOpenResearch} />
          </div>
        </div>

        <div
          className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-y-5 sm:gap-x-10 pt-5"
          style={{ borderTop: '1px solid var(--rule)' }}
        >
          {items.map((item, i) => (
            <div key={item.institution} className="min-w-0 text-center sm:text-left">
              <div
                className="hidden sm:block mb-4 h-px w-8"
                style={{ backgroundColor: 'var(--rule)' }}
                aria-hidden
              />
              <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-[var(--ink-muted)] mb-2">
                № {String(i + 1).padStart(2, '0')} / {item.date}
              </div>
              <h3
                className="font-display italic text-[14px] sm:text-[15px] leading-snug text-[var(--ink)]"
                style={{ fontWeight: 500 }}
              >
                {item.institution}
              </h3>
              <p className="font-sans text-[10px] tracking-[0.12em] uppercase text-[var(--ink-muted)] mt-2 leading-relaxed">
                {item.focus}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
