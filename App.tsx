/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { ArrowDown, ArrowUp, Menu, X, Mail, Linkedin, FileText, LayoutTemplate, ExternalLink, Moon, Sun, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { govtPaper, ricePoster, histPaper, histPoster, nmunPaper, ustGraphTheoryPoster, ResearchDocument } from './data/researchData';
import { DocumentModal } from './components/DocumentModal';
import { HeroBioWeather } from './components/HeroBioWeather';
import { BrandMark } from './components/BrandMark';

type TabId = 'home' | 'about' | 'research' | 'leadership' | 'work' | 'honors';
type Language = 'en' | 'vi';

/* ─── Animation variants ──────────────────────────────────────────── */
const cubicEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Tab shell only — no `variants` here so children are not forced to animate on tab switch. */
const tabShellTransition = {
  duration: 0.4,
  ease: cubicEase,
};

const tabShellExit = { duration: 0.2 };

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: cubicEase },
  },
};

const scrollViewport = { once: true, amount: 0.14, margin: '0px 0px -52px 0px' } as const;

const scrollReveal = {
  initial: 'initial' as const,
  whileInView: 'animate' as const,
  viewport: scrollViewport,
  variants: fadeIn,
};

/** For grids/lists: stagger children when the block enters the viewport. */
const staggerContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const mainTabMotion = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: tabShellTransition },
  exit: { opacity: 0, y: -10, transition: tabShellExit },
};

/* ─── Static data ─────────────────────────────────────────────────── */
const educationData: Record<Language, Array<{
  school: string;
  degree: string;
  date: string;
  honor: string;
  url: string;
  color: string;
}>> = {
  en: [
  {
    school: 'University of St. Thomas',
    degree: 'B.S. Applied Mathematics',
    date: 'Expected May 2027',
    honor: 'Minor: Data Analytics',
    url: 'https://stthom.edu/',
    color: 'bg-[#ebd6d8] dark:bg-[#7B1113]/50',
  },
  { school: 'Lone Star College', degree: 'Honors A.S. / General', date: 'May 2025', honor: 'Summa Cum Laude | Distinguished Global Scholars', url: 'https://www.lonestar.edu/', color: 'bg-[#e3eaf5] dark:bg-[#0c2347]/45' },
  { school: 'Jersey Village High School', degree: 'High School Diploma', date: 'May 2023', honor: 'Cum Laude', url: 'https://jerseyvillage.cfisd.net/', color: 'bg-[#ebe4f7] dark:bg-[#2d2248]/45' },
  ],
  vi: [
    {
      school: 'Đại học St. Thomas',
      degree: 'Cử nhân Khoa học ngành Toán học Ứng dụng',
      date: 'Dự kiến tháng 5 năm 2028',
      honor: 'Chuyên ngành phụ: Phân tích Dữ liệu',
      url: 'https://stthom.edu/',
      color: 'bg-[#ebd6d8] dark:bg-[#7B1113]/50',
    },
    {
      school: 'Trường Cao đẳng Cộng đồng Lone Star',
      degree: 'Bằng Phó Học sĩ Khoa học / Đại cương',
      date: 'Tháng 5 năm 2025',
      honor: 'Danh hiệu Xuất sắc Tối cao (Summa Cum Laude) | Học giả Toàn cầu Xuất sắc',
      url: 'https://www.lonestar.edu/',
      color: 'bg-[#e3eaf5] dark:bg-[#0c2347]/45',
    },
    {
      school: 'Trường Trung học Jersey Village',
      degree: 'Bằng Tốt nghiệp Trung học',
      date: 'Tháng 5 năm 2023',
      honor: 'Danh hiệu Xuất sắc (Cum Laude)',
      url: 'https://jerseyvillage.cfisd.net/',
      color: 'bg-[#ebe4f7] dark:bg-[#2d2248]/45',
    },
  ],
};

type HonorEntry = { title: string; org: string; date: string; color: string };

const honorData: Record<Language, HonorEntry[]> = {
  en: [
    { title: 'Monaghan Excellence Scholarship', org: 'University of St. Thomas', date: 'Fall 2025 – Spring 2027', color: 'bg-[#e9d4d6] dark:bg-[#7B1113]/42' },
    { title: 'Hispanic Serving Institution STEM (Dunn) Endowed Scholarship', org: 'University of St. Thomas', date: '2025', color: 'bg-[#e9d4d6] dark:bg-[#7B1113]/42' },
    { title: 'CASE Finalist', org: 'Amideast Education Abroad Connect', date: 'Summer 2025', color: 'bg-[#e8d4d4] dark:bg-[#3d1a1a]/30' },
    { title: 'Distinguished Global Scholar Study Abroad Scholarship', org: 'Lone Star College Houston-North', date: 'Summer 2025', color: 'bg-[#e3eaf5] dark:bg-[#0c2347]/35' },
    { title: 'Distinguished Global Scholar', org: 'Lone Star College', date: 'Fall 2024 – Spring 2025', color: 'bg-[#dde6f3] dark:bg-[#0c2347]/35' },
    { title: 'Global Scholar Language Scholarship', org: 'Lone Star College Houston-North', date: 'Fall 2024 – Spring 2025', color: 'bg-[#e8eef8] dark:bg-[#0c2347]/35' },
    { title: 'Best In Committee Award', org: 'National Model United Nations, NY', date: '2024', color: 'bg-[#f0dcd4] dark:bg-[#3e2218]/30' },
    { title: 'Outstanding Delegation Award', org: 'National Model United Nations, NY', date: '2024', color: 'bg-[#d4dce8] dark:bg-[#1a2a3e]/30' },
    { title: 'Global Scholar Award', org: 'Lone Star College Houston-North', date: 'Fall 2023 – Spring 2025', color: 'bg-[#e3eaf5] dark:bg-[#0c2347]/35' },
    { title: "President's List", org: 'Lone Star College', date: '2023 – 2025', color: 'bg-[#dde6f3] dark:bg-[#0c2347]/35' },
    { title: 'Academic All-American Award', org: 'National Speech and Debate Association', date: 'Fall 2022', color: 'bg-[#ebe4f7] dark:bg-[#2d2248]/30' },
    { title: '6x Tournament Champion', org: 'Speech and Debate, Houston, TX', date: 'High School', color: 'bg-[#ebe4f7] dark:bg-[#2d2248]/30' },
    { title: '2x State TFA Qualifier', org: 'Texas Forensics Association', date: 'High School', color: 'bg-[#ebe4f7] dark:bg-[#2d2248]/30' },
    { title: 'TFA Quarter Finalists', org: 'Texas Forensics Association', date: 'High School', color: 'bg-[#ebe4f7] dark:bg-[#2d2248]/30' },
    { title: 'NIETOC Qualifier', org: 'National Individual Events Tournament of Champions', date: 'High School', color: 'bg-[#ebe4f7] dark:bg-[#2d2248]/30' },
  ],
  vi: [
    { title: 'Học bổng Xuất sắc Monaghan', org: 'Đại học St. Thomas', date: 'Mùa thu 2025 – Mùa xuân 2027', color: 'bg-[#e9d4d6] dark:bg-[#7B1113]/42' },
    { title: 'Học bổng Tài trợ Dunn dành cho Sinh viên STEM thuộc Cơ sở Giáo dục Phục vụ Cộng đồng Gốc Hispanic', org: 'Đại học St. Thomas', date: '2025', color: 'bg-[#e9d4d6] dark:bg-[#7B1113]/42' },
    { title: 'Ứng viên Vào Vòng Chung kết Chương trình CASE', org: 'Chương trình Kết nối Du học Amideast', date: 'Mùa hè 2025', color: 'bg-[#e8d4d4] dark:bg-[#3d1a1a]/30' },
    { title: 'Học bổng Du học dành cho Học giả Toàn cầu Xuất sắc', org: 'Trường Cao đẳng Cộng đồng Lone Star – Phân hiệu Houston-North', date: 'Mùa hè 2025', color: 'bg-[#e3eaf5] dark:bg-[#0c2347]/35' },
    { title: 'Danh hiệu Học giả Toàn cầu Xuất sắc', org: 'Trường Cao đẳng Cộng đồng Lone Star', date: 'Mùa thu 2024 – Mùa xuân 2025', color: 'bg-[#dde6f3] dark:bg-[#0c2347]/35' },
    { title: 'Học bổng Ngoại ngữ dành cho Học giả Toàn cầu', org: 'Trường Cao đẳng Cộng đồng Lone Star – Phân hiệu Houston-North', date: 'Mùa thu 2024 – Mùa xuân 2025', color: 'bg-[#e8eef8] dark:bg-[#0c2347]/35' },
    { title: 'Giải thưởng Đại biểu Xuất sắc nhất Ủy ban', org: 'Hội nghị Mô phỏng Liên Hợp Quốc Toàn quốc, New York', date: '2024', color: 'bg-[#f0dcd4] dark:bg-[#3e2218]/30' },
    { title: 'Giải thưởng Đoàn Đại biểu Xuất sắc', org: 'Hội nghị Mô phỏng Liên Hợp Quốc Toàn quốc, New York', date: '2024', color: 'bg-[#d4dce8] dark:bg-[#1a2a3e]/30' },
    { title: 'Giải thưởng Học giả Toàn cầu', org: 'Trường Cao đẳng Cộng đồng Lone Star – Phân hiệu Houston-North', date: 'Mùa thu 2023 – Mùa xuân 2025', color: 'bg-[#e3eaf5] dark:bg-[#0c2347]/35' },
    { title: 'Danh sách Tuyên dương của Hiệu trưởng', org: 'Trường Cao đẳng Cộng đồng Lone Star', date: '2023 – 2025', color: 'bg-[#dde6f3] dark:bg-[#0c2347]/35' },
    { title: 'Giải thưởng Học thuật Toàn Hoa Kỳ', org: 'Hiệp hội Hùng biện và Tranh luận Toàn quốc Hoa Kỳ', date: 'Mùa thu 2022', color: 'bg-[#ebe4f7] dark:bg-[#2d2248]/30' },
    { title: 'Sáu lần Vô địch Giải đấu', org: 'Bộ môn Hùng biện và Tranh luận, Houston, Texas', date: 'Bậc Trung học Phổ thông', color: 'bg-[#ebe4f7] dark:bg-[#2d2248]/30' },
    { title: 'Hai lần Đạt Chuẩn Tham dự Giải Cấp Tiểu bang TFA', org: 'Hiệp hội Hùng biện Tranh luận Tiểu bang Texas', date: 'Bậc Trung học Phổ thông', color: 'bg-[#ebe4f7] dark:bg-[#2d2248]/30' },
    { title: 'Vào Tứ kết Giải TFA', org: 'Hiệp hội Hùng biện Tranh luận Tiểu bang Texas', date: 'Bậc Trung học Phổ thông', color: 'bg-[#ebe4f7] dark:bg-[#2d2248]/30' },
    { title: 'Đạt Chuẩn Tham dự Giải NIETOC', org: 'Giải Vô địch Toàn quốc các Nội dung Hùng biện Cá nhân', date: 'Bậc Trung học Phổ thông', color: 'bg-[#ebe4f7] dark:bg-[#2d2248]/30' },
  ],
};

/* ─── Leadership timeline ─────────────────────────────────────────── */
type StaircaseEntry = {
  title: string;
  role: string;
  shortDate: string;
  location?: string;
  description: React.ReactNode;
};

const leadershipData: Record<Language, StaircaseEntry[]> = {
  en: [
    {
      title: 'Community, Action, and Social Entrepreneurship',
      role: 'Finalist',
      shortDate: "Summer '25",
      location: 'Amideast Education Abroad Connect',
      description:
        'An 8-day guided program in Tunisia. Selected finalists are introduced to civil society organizations through daily presentations, panel discussions, community service, and engagement with local peers.',
    },
    {
      title: 'Honors College Student Advisory Board',
      role: 'Campus Representative',
      shortDate: "'24–'25",
      location: 'Lone Star College Houston-North',
      description:
        'Met with the Associate Vice Chancellor of Honors and International Education biannually. Collaborated to provide student perspectives on Honors College programming and system-wide activities.',
    },
    {
      title: 'HIE Emissary',
      role: 'System Liaison Emeritus',
      shortDate: "Spring '25",
      location: 'Lone Star College',
      description:
        'As Emeritus, collaborated with the current System Liaison Emissary and mentored them while promoting programs within The Honors College and International Education branch.',
    },
    {
      title: 'HIE Emissary',
      role: 'System Liaison',
      shortDate: "Fall '24",
      location: 'Lone Star College',
      description:
        'Promoted The Honors College throughout the semester, collaborating with campus liaisons for system-wide events. Also promoted the Rice University Take Flight program, NMUN team, and scholarships.',
    },
    {
      title: 'Global Leadership Program',
      role: 'Member',
      shortDate: "'24–'25",
      location: 'Lone Star College',
      description:
        'Cultivated ethical, inclusive leadership skills in a global context through international diplomacy training, conference participation, and partnerships with local and national organizations.',
    },
    {
      title: 'Distinguished Global Scholar',
      role: 'Member',
      shortDate: "'24–'25",
      location: 'Lone Star College',
      description:
        'Selected from ~100 applicants as one of eight cohort members. Coursework includes International Study (IS) designated classes that add an international scope to the curriculum.',
    },
    {
      title: 'Texas Boys State',
      role: 'Press Team Member and Statesman',
      shortDate: "Summer '22",
      location: 'The American Legion',
      description:
        'One of two students nominated from Jersey Village High School. Attended mock House of Representatives meetings, conceptualized social media campaigns, and composed website articles on current events.',
    },
  ],
  vi: [
    {
      title: 'Chương trình Cộng đồng, Hành động và Khởi nghiệp Xã hội',
      role: 'Ứng viên Vào Vòng Chung kết',
      shortDate: 'Hè 2025',
      location: 'Chương trình Kết nối Du học Amideast',
      description:
        'Chương trình học tập có hướng dẫn kéo dài tám ngày tại Cộng hòa Tunisia. Các ứng viên được tuyển chọn vào vòng chung kết được giới thiệu với các tổ chức xã hội dân sự thông qua các buổi thuyết trình hằng ngày, các cuộc thảo luận chuyên đề, hoạt động phục vụ cộng đồng và giao lưu với sinh viên bản địa.',
    },
    {
      title: 'Hội đồng Cố vấn Sinh viên Trường Cao đẳng Danh dự',
      role: 'Đại diện Cơ sở',
      shortDate: '2024 – 2025',
      location: 'Trường Cao đẳng Cộng đồng Lone Star – Phân hiệu Houston-North',
      description:
        'Định kỳ hai lần mỗi năm tham dự các cuộc họp với Phó Hiệu trưởng Phụ trách Giáo dục Danh dự và Quốc tế. Phối hợp đóng góp quan điểm của sinh viên đối với các chương trình của Trường Cao đẳng Danh dự cũng như các hoạt động trên toàn hệ thống.',
    },
    {
      title: 'Đại sứ Chương trình HIE',
      role: 'Đại sứ Liên lạc Hệ thống Danh dự (Emeritus)',
      shortDate: 'Mùa xuân 2025',
      location: 'Trường Cao đẳng Cộng đồng Lone Star',
      description:
        'Với tư cách là Đại sứ Danh dự (Emeritus), phối hợp và cố vấn cho Đại sứ Liên lạc Hệ thống đương nhiệm, đồng thời tiếp tục quảng bá các chương trình thuộc Trường Cao đẳng Danh dự và bộ phận Giáo dục Quốc tế.',
    },
    {
      title: 'Đại sứ Chương trình HIE',
      role: 'Đại sứ Liên lạc Hệ thống',
      shortDate: 'Mùa thu 2024',
      location: 'Trường Cao đẳng Cộng đồng Lone Star',
      description:
        'Quảng bá Trường Cao đẳng Danh dự trong suốt học kỳ, phối hợp với các đại diện liên lạc tại các cơ sở để tổ chức các sự kiện trên toàn hệ thống. Đồng thời, giới thiệu chương trình Take Flight của Đại học Rice, đội tuyển NMUN cũng như các chương trình học bổng liên quan.',
    },
    {
      title: 'Chương trình Lãnh đạo Toàn cầu',
      role: 'Thành viên',
      shortDate: '2024 – 2025',
      location: 'Trường Cao đẳng Cộng đồng Lone Star',
      description:
        'Trau dồi kỹ năng lãnh đạo có đạo đức và bao trùm trong bối cảnh toàn cầu thông qua các khóa đào tạo về ngoại giao quốc tế, tham dự hội nghị và hợp tác với các tổ chức trong nước và quốc tế.',
    },
    {
      title: 'Chương trình Học giả Toàn cầu Xuất sắc',
      role: 'Thành viên',
      shortDate: '2024 – 2025',
      location: 'Trường Cao đẳng Cộng đồng Lone Star',
      description:
        'Được tuyển chọn từ khoảng một trăm ứng viên, là một trong tám thành viên chính thức của khóa. Chương trình bao gồm các học phần được chỉ định là Học phần Quốc tế (IS), nhằm bổ sung chiều kích quốc tế cho chương trình đào tạo.',
    },
    {
      title: 'Chương trình Texas Boys State',
      role: 'Thành viên Đội Báo chí kiêm Đại biểu (Statesman)',
      shortDate: 'Hè 2022',
      location: 'Tổ chức Cựu chiến binh Hoa Kỳ (The American Legion)',
      description:
        'Là một trong hai học sinh được Trường Trung học Phổ thông Jersey Village đề cử tham dự chương trình. Tham gia các phiên họp mô phỏng Hạ viện, xây dựng ý tưởng cho các chiến dịch truyền thông xã hội và soạn thảo các bài viết về thời sự đăng tải trên trang điện tử của chương trình.',
    },
  ],
};

/* ─── Work history ────────────────────────────────────────────────── */
const workData: Record<Language, StaircaseEntry[]> = {
  en: [
    {
      title: 'Geospace Technology',
      role: 'Electro-Mechanical Assembler',
      shortDate: "'25–",
      location: 'Houston, Texas',
      description: (
        <ul className="list-disc pl-4 space-y-1">
          <li>Operate coiling machinery to assemble water cable; troubleshoot minor mechanical issues.</li>
          <li>Enter coil data into systems and follow electrical schematics to ensure correct cable builds.</li>
          <li>Maintain clean, safe workstation and adhere to safety protocols.</li>
        </ul>
      ),
    },
    {
      title: 'Lone Star College – CyFair',
      role: 'College Relations Intern',
      shortDate: "'24–'25",
      location: 'Cypress, Texas',
      description: (
        <ul className="list-disc pl-4 space-y-1">
          <li>Drafted and planned campus-wide events.</li>
          <li>Coordinated and managed social media platforms and posts.</li>
          <li>Conceptualized social media campaigns across X, Instagram, and Facebook.</li>
        </ul>
      ),
    },
    {
      title: 'East Aldine BakerRipley',
      role: 'Front Desk Volunteer',
      shortDate: "'24–'25",
      location: 'Aldine, Texas',
      description: (
        <ul className="list-disc pl-4 space-y-1">
          <li>Answered incoming calls and routed inquiries appropriately.</li>
          <li>Greeted residents and visitors, providing a welcoming environment.</li>
          <li>Assisted with administrative tasks to ensure smooth front-desk operations.</li>
        </ul>
      ),
    },
  ],
  vi: [
    {
      title: 'Công ty Geospace Technology',
      role: 'Kỹ thuật viên Lắp ráp Cơ – Điện',
      shortDate: '2025 – Hiện tại',
      location: 'Thành phố Houston, Tiểu bang Texas',
      description: (
        <ul className="list-disc pl-4 space-y-1">
          <li>Vận hành máy quấn cáp để lắp ráp cáp truyền dẫn dưới nước; xử lý các sự cố cơ khí ở mức độ thông thường.</li>
          <li>Nhập liệu thông số cuộn cáp vào hệ thống và tuân thủ sơ đồ mạch điện nhằm bảo đảm sản phẩm được lắp ráp chính xác.</li>
          <li>Duy trì khu vực làm việc sạch sẽ, an toàn và tuân thủ nghiêm ngặt các quy định về an toàn lao động.</li>
        </ul>
      ),
    },
    {
      title: 'Trường Cao đẳng Cộng đồng Lone Star – Phân hiệu CyFair',
      role: 'Thực tập sinh Quan hệ Đối ngoại',
      shortDate: '2024 – 2025',
      location: 'Thành phố Cypress, Tiểu bang Texas',
      description: (
        <ul className="list-disc pl-4 space-y-1">
          <li>Soạn thảo và lập kế hoạch tổ chức các sự kiện trên phạm vi toàn cơ sở.</li>
          <li>Điều phối và quản lý các nền tảng truyền thông xã hội cùng nội dung đăng tải.</li>
          <li>Xây dựng ý tưởng cho các chiến dịch truyền thông trên các nền tảng X, Instagram và Facebook.</li>
        </ul>
      ),
    },
    {
      title: 'Tổ chức Cộng đồng East Aldine BakerRipley',
      role: 'Tình nguyện viên Lễ tân',
      shortDate: '2024 – 2025',
      location: 'Khu Aldine, Tiểu bang Texas',
      description: (
        <ul className="list-disc pl-4 space-y-1">
          <li>Tiếp nhận các cuộc gọi đến và chuyển hướng yêu cầu đến bộ phận phù hợp.</li>
          <li>Tiếp đón cư dân và khách đến liên hệ, kiến tạo môi trường thân thiện và chuyên nghiệp.</li>
          <li>Hỗ trợ các công tác hành chính nhằm bảo đảm hoạt động của bộ phận lễ tân được vận hành thông suốt.</li>
        </ul>
      ),
    },
  ],
};

/* ─── Conference presentations ────────────────────────────────────── */
type PresentationEntry = {
  title: string;
  venue: string;
  location: string;
  year: string;
  poster?: ResearchDocument;
};

const presentationsData: Record<Language, PresentationEntry[]> = {
  en: [
    { title: '"Competitive Zero Forcing: A Novel Two-Player Graph Coloring Game"', venue: 'University of St. Thomas - Houston Research Symposium', location: 'Houston, Texas', year: '2026', poster: ustGraphTheoryPoster },
    { title: '"A Systemic Approach to Understanding the Natural World"', venue: "Rice University's Environmental Data Academy Poster Session", location: 'Houston, TX', year: '2025', poster: ricePoster },
    { title: '"A Systemic Approach to Understanding the Natural World"', venue: 'Spring Honors and International Education Conference', location: 'Houston, TX', year: '2025', poster: ricePoster },
    { title: '"The Fortunes of War or the Luck of the Draw": Examining the Influence of Recruitment Tactics on Desertion Rates During the Vietnam War', venue: 'World History Association of Texas Annual Conference', location: 'Commerce, TX', year: '2025', poster: histPoster },
    { title: '"The Fortunes of War or the Luck of the Draw": Examining the Influence of Recruitment Tactics on Desertion Rates During the Vietnam War', venue: 'Fall Honors and International Education Conference', location: 'Houston, TX', year: '2024', poster: histPoster },
    { title: '"The Fortunes of War or the Luck of the Draw": Examining the Influence of Recruitment Tactics on Desertion Rates During the Vietnam War', venue: 'International Ed Biennial Conference', location: 'Houston, TX', year: '2024', poster: histPoster },
    { title: '"Life Expectancy and Air Pollution: A Comparative Analysis of the United States and Chad"', venue: 'Spring Honors and International Education Conference', location: 'Houston, TX', year: '2024' },
    { title: 'National Model United Nations – New York Panelist', venue: 'Spring Honors and International Education Conference', location: 'Houston, TX', year: '2024' },
  ],
  vi: [
    { title: '“Buộc-Không Cạnh Tranh: Một Mô Hình Hai Đối Thủ Mới trong Tô Màu Đồ Thị”', venue: 'Hội nghị Nghiên cứu của Đại học St. Thomas – Houston', location: 'Thành phố Houston, Tiểu bang Texas', year: '2026', poster: ustGraphTheoryPoster },
    { title: '“Một Cách Tiếp cận Hệ thống nhằm Tìm hiểu Thế giới Tự nhiên”', venue: 'Phiên Trình bày Áp phích – Học viện Dữ liệu Môi trường, Đại học Rice', location: 'Thành phố Houston, Tiểu bang Texas', year: '2025', poster: ricePoster },
    { title: '“Một Cách Tiếp cận Hệ thống nhằm Tìm hiểu Thế giới Tự nhiên”', venue: 'Hội nghị Giáo dục Danh dự và Quốc tế Mùa Xuân', location: 'Thành phố Houston, Tiểu bang Texas', year: '2025', poster: ricePoster },
    { title: '“Vận mệnh của Chiến tranh hay Sự May rủi của Số phận”: Khảo cứu Ảnh hưởng của Các Chiến thuật Tuyển quân đối với Tỷ lệ Đào ngũ trong Chiến tranh Việt Nam', venue: 'Hội nghị Thường niên Hiệp hội Lịch sử Thế giới Tiểu bang Texas', location: 'Thành phố Commerce, Tiểu bang Texas', year: '2025', poster: histPoster },
    { title: '“Vận mệnh của Chiến tranh hay Sự May rủi của Số phận”: Khảo cứu Ảnh hưởng của Các Chiến thuật Tuyển quân đối với Tỷ lệ Đào ngũ trong Chiến tranh Việt Nam', venue: 'Hội nghị Giáo dục Danh dự và Quốc tế Mùa Thu', location: 'Thành phố Houston, Tiểu bang Texas', year: '2024', poster: histPoster },
    { title: '“Vận mệnh của Chiến tranh hay Sự May rủi của Số phận”: Khảo cứu Ảnh hưởng của Các Chiến thuật Tuyển quân đối với Tỷ lệ Đào ngũ trong Chiến tranh Việt Nam', venue: 'Hội nghị Giáo dục Quốc tế Hai năm Một lần', location: 'Thành phố Houston, Tiểu bang Texas', year: '2024', poster: histPoster },
    { title: '“Tuổi thọ Bình quân và Ô nhiễm Không khí: Phân tích So sánh giữa Hoa Kỳ và Cộng hòa Chad”', venue: 'Hội nghị Giáo dục Danh dự và Quốc tế Mùa Xuân', location: 'Thành phố Houston, Tiểu bang Texas', year: '2024' },
    { title: 'Diễn giả Tham luận – Hội nghị Mô phỏng Liên Hợp Quốc Toàn quốc tại New York', venue: 'Hội nghị Giáo dục Danh dự và Quốc tế Mùa Xuân', location: 'Thành phố Houston, Tiểu bang Texas', year: '2024' },
  ],
};

/* ─── Personal projects ───────────────────────────────────────────── */
type ProjectEntry = { title: string; blurb: string; url: string; color: string };

const projectsData: Record<Language, ProjectEntry[]> = {
  en: [
    { title: 'The Fortunes of War', blurb: 'An interactive follow-up to Vietnam War recruitment and desertion research, with charts and narrative built for a general audience.', url: 'https://thefortunesofwar.netlify.app/', color: 'bg-[#e8d4d4] dark:bg-[#3d1a1a]/35' },
    { title: 'The Pollution Paradox', blurb: 'A public companion to the US vs. Chad air pollution and life expectancy paper, with data stories that highlight the paradox between pollution and outcomes.', url: 'https://thepollutionparadox.netlify.app/', color: 'bg-[#d4e0e8] dark:bg-[#1a2e3d]/35' },
    { title: 'Genuine', blurb: 'A follow-on to the NMUN autoethnography on intercultural communication and relational leadership—reimagined as a site where visitors can explore the ideas beyond the PDF.', url: 'https://genuinenmun.netlify.app/', color: 'bg-[#e4e8e0] dark:bg-[#222d24]/35' },
  ],
  vi: [
    { title: 'The Fortunes of War', blurb: 'Một trang điện tử tương tác mở rộng từ công trình nghiên cứu về chiến thuật tuyển quân và hiện tượng đào ngũ trong Chiến tranh Việt Nam, được trình bày qua biểu đồ và lối tự sự dành cho công chúng phổ thông.', url: 'https://thefortunesofwar.netlify.app/', color: 'bg-[#e8d4d4] dark:bg-[#3d1a1a]/35' },
    { title: 'The Pollution Paradox', blurb: 'Phiên bản công cộng đi kèm bài nghiên cứu so sánh về ô nhiễm không khí và tuổi thọ bình quân giữa Hoa Kỳ và Cộng hòa Chad, sử dụng các câu chuyện dữ liệu nhằm làm nổi bật nghịch lý giữa mức độ ô nhiễm và kết quả về sức khỏe.', url: 'https://thepollutionparadox.netlify.app/', color: 'bg-[#d4e0e8] dark:bg-[#1a2e3d]/35' },
    { title: 'Genuine', blurb: 'Công trình tiếp nối nghiên cứu tự dân tộc học (autoethnography) tại NMUN về giao tiếp liên văn hóa và lãnh đạo theo quan hệ — được tái hình dung dưới dạng một trang điện tử, nơi độc giả có thể khám phá các luận điểm vượt ra ngoài khuôn khổ của bản PDF.', url: 'https://genuinenmun.netlify.app/', color: 'bg-[#e4e8e0] dark:bg-[#222d24]/35' },
  ],
};

/* ─── Certifications & memberships ────────────────────────────────── */
const certificationsData: Record<Language, string[]> = {
  en: [
    'Micro-Credential: Environmental Data Science (Rice)',
    'Foundations: Data, Data, Everywhere (Coursera)',
    'Ask Questions to Make Data-Driven Decisions (Coursera)',
    'Prepare Data for Explorations (Coursera)',
    'OSHA 10',
    'Phi Theta Kappa Member',
    'Rice Take Flight Program',
    'Global Scholar',
  ],
  vi: [
    'Chứng chỉ Vi mô: Khoa học Dữ liệu Môi trường (Đại học Rice)',
    'Nền tảng: Dữ liệu Hiện diện Khắp nơi (Coursera)',
    'Đặt Câu hỏi để Ra Quyết định dựa trên Dữ liệu (Coursera)',
    'Chuẩn bị Dữ liệu cho Quá trình Khảo sát (Coursera)',
    'Chứng chỉ An toàn Lao động OSHA 10',
    'Hội viên Hiệp hội Danh dự Phi Theta Kappa',
    'Chương trình Take Flight của Đại học Rice',
    'Học giả Toàn cầu',
  ],
};

/* ─── UI strings ──────────────────────────────────────────────────── */
const uiStrings = {
  en: {
    connect: 'Connect',
    contact: 'Contact Me',
    portfolioBadge: 'Portfolio ✦',
    educationLabel: 'Education',
    educationHeading: 'Academic Foundation.',
    researchExperienceMenu: 'Research Experience',
    conferencePresentationsMenu: 'Conference Presentations',
    personalProjectsMenu: 'Personal Projects',
    researchFocusBadge: 'Research Focus',
    graphTheoryHead1: 'Graph Theory &',
    graphTheoryHead2: 'Network Dynamics.',
    historyHead1: 'History &',
    historyHead2: 'Public Policy.',
    presentationsLabel: 'Presentations',
    presentationsHeading: 'Conference Presentations.',
    projectsLabel: 'Personal projects',
    projectsHeading: 'Research, for everyone.',
    projectsSub: 'These sites grow out of earlier Honors papers, reimagined as full websites with data visualization so more people can explore the evidence and ideas behind the work.',
    visitSite: 'Visit site →',
    honorsSub: 'Selected competitive accomplishments and scholarships.',
    certHeading: 'Certifications & Memberships',
    viewPoster: 'View Poster',
    viewPaper: 'View Paper',
    viewDocPrefix: 'View ',
    liveTool: 'Live Tool',
    rightsReserved: '© 2025 Tung Vo. All rights reserved.',
    fullName: 'Tung (TJ) Vo.',
  },
  vi: {
    connect: 'Kết nối',
    contact: 'Liên hệ',
    portfolioBadge: 'Hồ sơ Cá nhân ✦',
    educationLabel: 'Học vấn',
    educationHeading: 'Nền tảng Học thuật.',
    researchExperienceMenu: 'Kinh nghiệm Nghiên cứu',
    conferencePresentationsMenu: 'Báo cáo Hội nghị',
    personalProjectsMenu: 'Dự án Cá nhân',
    researchFocusBadge: 'Trọng tâm Nghiên cứu',
    graphTheoryHead1: 'Lý thuyết Đồ thị &',
    graphTheoryHead2: 'Động lực học Mạng lưới.',
    historyHead1: 'Lịch sử &',
    historyHead2: 'Chính sách Công.',
    presentationsLabel: 'Báo cáo',
    presentationsHeading: 'Báo cáo Hội nghị.',
    projectsLabel: 'Dự án Cá nhân',
    projectsHeading: 'Nghiên cứu, dành cho tất cả mọi người.',
    projectsSub: 'Các trang điện tử này được phát triển từ những bài nghiên cứu Danh dự trước đây, được tái hình dung thành các trang web hoàn chỉnh kèm theo công cụ trực quan hóa dữ liệu, nhằm giúp đông đảo công chúng có thể tiếp cận và khảo sát các luận cứ cũng như tư tưởng đằng sau công trình nghiên cứu.',
    visitSite: 'Truy cập trang →',
    honorsSub: 'Tuyển chọn các thành tích và học bổng có tính cạnh tranh tiêu biểu.',
    certHeading: 'Chứng chỉ và Tư cách Hội viên',
    viewPoster: 'Xem Áp phích',
    viewPaper: 'Xem Bài Nghiên cứu',
    viewDocPrefix: 'Xem ',
    liveTool: 'Công cụ Trực tuyến',
    rightsReserved: '© 2025 Võ Sơn Tùng. Bảo lưu toàn bộ quyền.',
    fullName: 'Võ Sơn Tùng.',
  },
} as const;

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
      d="M18.00,4.00C20.07,4.00 21.36,8.33 23.76,10.07C26.16,11.81 30.67,11.70 31.31,13.67C31.96,15.65 28.24,18.21 27.32,21.03C26.40,23.85 27.91,28.11 26.23,29.33C24.55,30.55 20.96,27.80 18.00,27.80C15.04,27.80 11.45,30.55 9.77,29.33C8.09,28.11 9.60,23.85 8.68,21.03C7.76,18.21 4.04,15.65 4.69,13.67C5.33,11.70 9.84,11.81 12.24,10.07C14.64,8.33 15.93,4.00 18.00,4.00Z"
      fill="currentColor"
    />
  </svg>
);

/* ─── Tab hero heading (like seanhalpin.xyz) ──────────────────────── */
const TabHero = ({ children }: { children: React.ReactNode }) => (
  <motion.div {...scrollReveal} className="text-center mb-16 pt-4">
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
  toolUrl,
  onOpenDocument,
  language,
}: {
  title: string;
  role: string;
  date: string;
  children: React.ReactNode;
  location?: string;
  documentData?: ResearchDocument;
  posterData?: ResearchDocument;
  toolUrl?: string;
  onOpenDocument?: (doc: ResearchDocument) => void;
  language: Language;
}) => (
  <motion.div
    {...scrollReveal}
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
            title={uiStrings[language].viewPaper}
          >
            <FileText size={13} className="group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">
              {uiStrings[language].viewDocPrefix}
              {documentData.type}
            </span>
          </button>
        )}
        {posterData && onOpenDocument && (
          <button
            onClick={() => onOpenDocument(posterData)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/70 dark:bg-white/10 border border-forest/20 dark:border-white/15 rounded-full text-forest dark:text-white/80 hover:bg-forest dark:hover:bg-white hover:text-white dark:hover:text-forest transition-all duration-300 text-xs uppercase font-bold tracking-wider group"
            title={uiStrings[language].viewPoster}
          >
            <LayoutTemplate size={13} className="group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">{uiStrings[language].viewPoster}</span>
          </button>
        )}
        {toolUrl && (
          <a
            href={toolUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 bg-white/70 dark:bg-white/10 border border-forest/20 dark:border-white/15 rounded-full text-forest dark:text-white/80 hover:bg-forest dark:hover:bg-white hover:text-white dark:hover:text-forest transition-all duration-300 text-xs uppercase font-bold tracking-wider group"
          >
            <ExternalLink size={13} className="group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">{uiStrings[language].liveTool}</span>
          </a>
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
    {...scrollReveal}
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
    {...scrollReveal}
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
const EducationCards = ({ language }: { language: Language }) => (
  <motion.div
    variants={staggerContainer}
    initial="initial"
    whileInView="animate"
    viewport={scrollViewport}
    className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto"
  >
    {educationData[language].map((item, i) => (
      <motion.a
        key={`edu-${i}`}
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        variants={fadeIn}
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
      </motion.a>
    ))}
  </motion.div>
);

/* ─── Nav links ──────────────────────────────────────────────────── */
const NAV_LINKS: Record<Language, { id: TabId; label: string; altLabel: string }[]> = {
  en: [
    { id: 'about', label: 'Education', altLabel: 'Học vấn' },
    { id: 'research', label: 'Research', altLabel: 'Nghiên cứu' },
    { id: 'leadership', label: 'Leadership', altLabel: 'Lãnh đạo' },
    { id: 'work', label: 'Work', altLabel: 'Kinh nghiệm' },
    { id: 'honors', label: 'Honors', altLabel: 'Thành tích' },
  ],
  vi: [
    { id: 'about', label: 'Học vấn', altLabel: 'Education' },
    { id: 'research', label: 'Nghiên cứu', altLabel: 'Research' },
    { id: 'leadership', label: 'Lãnh đạo', altLabel: 'Leadership' },
    { id: 'work', label: 'Kinh nghiệm', altLabel: 'Work' },
    { id: 'honors', label: 'Thành tích', altLabel: 'Honors' },
  ],
};

/**
 * Renders a nav-link label that reserves space for both the EN and VI text,
 * so toggling languages doesn't reflow the nav (and the sliding pill stays
 * aligned). The longer of the two labels invisibly reserves the width.
 */
const NavLabel: React.FC<{ label: string; altLabel: string }> = ({ label, altLabel }) => (
  <span className="relative inline-block align-middle">
    {/* Width reservation: render both labels stacked; the longer one defines the box. */}
    <span aria-hidden="true" className="invisible block whitespace-nowrap">
      {label.length >= altLabel.length ? label : altLabel}
    </span>
    <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap">
      {label}
    </span>
  </span>
);

/* ─── App ────────────────────────────────────────────────────────── */
const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof navigator === 'undefined') return 'en';
    const langs = [
      ...(navigator.languages ?? []),
      navigator.language,
    ].filter(Boolean) as string[];
    return langs.some((l) => l.toLowerCase().startsWith('vi')) ? 'vi' : 'en';
  });
  const [langTransition, setLangTransition] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDocument, setActiveDocument] = useState<ResearchDocument | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [navResearchOpen, setNavResearchOpen] = useState(false);
  const navResearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [langHintVisible, setLangHintVisible] = useState(false);
  const [langHintDismissed, setLangHintDismissed] = useState(true);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 767px)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Show a one-time pulsing hint on the language toggle so visitors know a
  // translation exists. Persist dismissal in localStorage so returning users
  // aren't pestered.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem('langHintDismissed') === '1';
    } catch {
      // Ignore storage errors (private mode, etc.) and just show the hint.
    }
    setLangHintDismissed(dismissed);
    if (!dismissed) {
      const showTimer = setTimeout(() => setLangHintVisible(true), 1200);
      // Nav tooltip stays visible until the user interacts with the toggle;
      // the hero banner provides the primary persistent indicator.
      return () => clearTimeout(showTimer);
    }
  }, []);

  const dismissLangHint = () => {
    setLangHintVisible(false);
    setLangHintDismissed(true);
    try {
      window.localStorage.setItem('langHintDismissed', '1');
    } catch {
      // No-op if storage is unavailable.
    }
  };

  useEffect(() => {
    if (isMobile) return;
    window.scrollTo({ top: 0 });
  }, [activeTab, isMobile]);

  /* sliding nav pill */
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLElement | null>>({});
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, visible: false });

  useLayoutEffect(() => {
    const measure = () => {
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
    };

    measure();
    // Re-measure once fonts settle / after the next frame, since label widths
    // change when toggling language and the first measurement can race the layout.
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [hoveredId, activeTab, language]);

  const switchTab = (id: TabId, scrollTo?: string) => {
    setMenuOpen(false);
    setNavResearchOpen(false);

    if (isMobile) {
      // On mobile, everything is rendered as a continuous scroll.
      // Tab clicks just scroll to the corresponding section.
      const targetId = scrollTo
        ? scrollTo
        : id === 'home'
          ? null
          : `section-${id}`;
      if (targetId === null) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Defer slightly so the menu close animation doesn't fight the scroll.
        setTimeout(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
      return;
    }

    setActiveTab(id);
    if (scrollTo) {
      setTimeout(() => {
        document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 450);
    }
  };

  const handleLanguageToggle = () => {
    if (langTransition) return;
    if (!langHintDismissed) dismissLangHint();
    setLangTransition(true);
    setTimeout(() => setLanguage((prev) => (prev === 'en' ? 'vi' : 'en')), 190);
    setTimeout(() => setLangTransition(false), 390);
  };

  // Localized hint copy: tell EN users about the VI version and vice versa.
  const langHintText = language === 'en'
    ? 'Cũng có bằng tiếng Việt — bấm vào đây.'
    : 'Also available in English — click here.';
  const showLangHint = langHintVisible && !langHintDismissed;

  const navLinks = NAV_LINKS[language];
  const localizedName = language === 'vi' ? 'Võ Sơn Tùng' : 'TJ Vo';

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
            type="button"
            onClick={() => switchTab('home')}
            className="group w-8 h-8 p-0 rounded-full mr-1 flex-shrink-0 relative z-10 border-0 bg-transparent cursor-pointer"
            aria-label="Home"
          >
            <BrandMark className="w-full h-full" />
          </button>
          {navLinks.map(({ id, label, altLabel }) =>
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
                  <NavLabel label={label} altLabel={altLabel} />
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
                        {language === 'vi' ? 'Kinh nghiệm nghiên cứu' : 'Research Experience'}
                      </button>
                      <div className="mx-4 h-px bg-forest/8 dark:bg-white/8" />
                      <button
                        onClick={() => switchTab('research', 'research-presentations')}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-forest/70 dark:text-white/60 hover:bg-forest/5 dark:hover:bg-white/8 transition-colors"
                      >
                        {language === 'vi' ? 'Báo cáo hội nghị' : 'Conference Presentations'}
                      </button>
                      <div className="mx-4 h-px bg-forest/8 dark:bg-white/8" />
                      <button
                        onClick={() => switchTab('research', 'research-projects')}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-forest/70 dark:text-white/60 hover:bg-forest/5 dark:hover:bg-white/8 transition-colors"
                      >
                        {language === 'vi' ? 'Dự án cá nhân' : 'Personal Projects'}
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
                <NavLabel label={label} altLabel={altLabel} />
              </button>
            )
          )}
          <div className="relative ml-1 flex-shrink-0 z-10">
            <button
              onClick={handleLanguageToggle}
              className="relative px-3 py-1.5 border border-forest/20 dark:border-white/20 text-forest dark:text-white text-xs font-bold rounded-full hover:bg-forest/10 dark:hover:bg-white/10 transition-colors overflow-hidden"
              aria-label="Toggle language"
            >
              <span
                style={{
                  display: 'inline-block',
                  transition: 'transform 0.19s cubic-bezier(0.4,0,0.2,1), opacity 0.19s ease',
                  transform: langTransition ? 'translateY(-6px) scale(0.8)' : 'translateY(0) scale(1)',
                  opacity: langTransition ? 0 : 1,
                }}
              >
                {language === 'en' ? 'VI' : 'EN'}
              </span>
            </button>
            {!langHintDismissed && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 pointer-events-none">
                <span className="absolute inline-flex h-full w-full rounded-full bg-nobel-gold opacity-70 animate-ping" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-nobel-gold ring-2 ring-white/80 dark:ring-forest" />
              </span>
            )}
            <AnimatePresence>
              {showLangHint && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } }}
                  exit={{ opacity: 0, y: -6, scale: 0.96, transition: { duration: 0.15 } }}
                  className="absolute top-full right-0 mt-3 w-56 rounded-2xl bg-forest text-white dark:bg-white dark:text-forest shadow-xl text-xs leading-snug overflow-hidden"
                  role="status"
                >
                  <button
                    type="button"
                    onClick={handleLanguageToggle}
                    className="w-full text-left px-4 pt-3 pb-2.5 hover:bg-white/10 dark:hover:bg-forest/10 transition-colors"
                  >
                    <div className="font-bold mb-0.5">
                      {language === 'en' ? 'Tiếng Việt' : 'English'}
                    </div>
                    <div className="opacity-80 pr-5">{langHintText}</div>
                  </button>
                  <button
                    type="button"
                    onClick={dismissLangHint}
                    aria-label="Dismiss"
                    className="absolute top-1.5 right-1.5 p-1 rounded-full text-white/70 hover:text-white dark:text-forest/60 dark:hover:text-forest"
                  >
                    <X size={11} />
                  </button>
                  <span
                    aria-hidden
                    className="absolute -top-1.5 right-4 w-3 h-3 rotate-45 bg-forest dark:bg-white"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <a
            href="https://www.linkedin.com/in/tung-vo-4728b7235/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 px-4 py-1.5 bg-forest text-white text-sm font-medium rounded-full hover:bg-forest/80 transition-colors flex items-center gap-1.5 flex-shrink-0 relative z-10"
          >
            <Linkedin size={13} />
            {uiStrings[language].connect}
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
            <BrandMark className="w-7 h-7 flex-shrink-0" />
            <span className="font-display font-black text-forest dark:text-white text-sm">
              {localizedName}
            </span>
          </button>
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <button
                className="px-3 py-2 bg-white/75 dark:bg-forest/60 backdrop-blur-md rounded-full shadow-lg border border-white/70 dark:border-white/10 text-forest dark:text-white/70 text-xs font-bold overflow-hidden"
                onClick={handleLanguageToggle}
                aria-label="Toggle language"
              >
                <span
                  style={{
                    display: 'inline-block',
                    transition: 'transform 0.19s cubic-bezier(0.4,0,0.2,1), opacity 0.19s ease',
                    transform: langTransition ? 'translateY(-6px) scale(0.8)' : 'translateY(0) scale(1)',
                    opacity: langTransition ? 0 : 1,
                  }}
                >
                  {language === 'en' ? 'VI' : 'EN'}
                </span>
              </button>
              {!langHintDismissed && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 pointer-events-none">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-nobel-gold opacity-70 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-nobel-gold ring-2 ring-white/80 dark:ring-forest" />
                </span>
              )}
              <AnimatePresence>
                {showLangHint && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } }}
                    exit={{ opacity: 0, y: -6, scale: 0.96, transition: { duration: 0.15 } }}
                    className="absolute top-full right-0 mt-2 w-52 rounded-2xl bg-forest text-white dark:bg-white dark:text-forest shadow-xl text-xs leading-snug z-50 overflow-hidden"
                    role="status"
                  >
                    <button
                      type="button"
                      onClick={handleLanguageToggle}
                      className="w-full text-left px-4 pt-3 pb-2.5 hover:bg-white/10 dark:hover:bg-forest/10 transition-colors"
                    >
                      <div className="font-bold mb-0.5">
                        {language === 'en' ? 'Tiếng Việt' : 'English'}
                      </div>
                      <div className="opacity-80 pr-5">{langHintText}</div>
                    </button>
                    <button
                      type="button"
                      onClick={dismissLangHint}
                      aria-label="Dismiss"
                      className="absolute top-1.5 right-1.5 p-1 rounded-full text-white/70 hover:text-white dark:text-forest/60 dark:hover:text-forest"
                    >
                      <X size={11} />
                    </button>
                    <span
                      aria-hidden
                      className="absolute -top-1.5 right-4 w-3 h-3 rotate-45 bg-forest dark:bg-white"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
          {navLinks.map(({ id, label }) => (
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
            {uiStrings[language].contact}
          </a>
        </div>
      )}

      {/* ── Content area ─────────────────────────────────────── */}
      <div
        style={{
          transition: 'opacity 0.19s ease, filter 0.19s ease, transform 0.19s ease',
          opacity: langTransition ? 0 : 1,
          filter: langTransition ? 'blur(6px)' : 'blur(0px)',
          transform: langTransition ? 'scale(0.988)' : 'scale(1)',
          willChange: 'opacity, filter, transform',
        }}
      >
      <AnimatePresence mode={isMobile ? 'sync' : 'wait'}>
        {/* ── Home (Hero + Education) ──────────────────────── */}
        {(isMobile || activeTab === 'home') && (
          <motion.div
            key="hero-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <header className="hero-fade relative min-h-screen pb-28 md:pb-36 flex items-center justify-center overflow-hidden mesh-gradient">
              <span
                className="absolute hero-pop pointer-events-none drop-shadow-[0_1px_6px_rgba(26,61,43,0.12)] dark:drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]"
                style={{ top: '16%', left: '9%', animationDelay: '0.35s' }}
              >
                <Sparkle
                  className="text-forest/95 dark:text-white/92 sparkle-anim"
                  size={64}
                  style={{ animationDuration: '24s' }}
                />
              </span>
              <span
                className="absolute hero-pop pointer-events-none drop-shadow-[0_1px_5px_rgba(197,160,89,0.35)] dark:drop-shadow-[0_1px_10px_rgba(197,160,89,0.25)]"
                style={{ top: '19%', right: '8%', animationDelay: '0.55s' }}
              >
                <Sparkle
                  className="text-nobel-gold dark:text-nobel-gold sparkle-anim-rev"
                  size={44}
                  style={{ animationDuration: '29s' }}
                />
              </span>
              <span
                className="absolute hero-pop pointer-events-none drop-shadow-[0_1px_5px_rgba(26,61,43,0.14)] dark:drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]"
                style={{ bottom: '26%', left: '7%', animationDelay: '0.70s' }}
              >
                <Sparkle
                  className="text-forest/95 dark:text-white/90 sparkle-anim"
                  size={34}
                  style={{ animationDuration: '20s' }}
                />
              </span>
              <span
                className="absolute hero-pop pointer-events-none drop-shadow-[0_1px_5px_rgba(197,160,89,0.32)] dark:drop-shadow-[0_1px_10px_rgba(197,160,89,0.22)]"
                style={{ bottom: '31%', right: '10%', animationDelay: '0.50s' }}
              >
                <Sparkle
                  className="text-nobel-gold dark:text-nobel-gold sparkle-anim-rev"
                  size={28}
                  style={{ animationDuration: '26s' }}
                />
              </span>
              <span
                className="absolute hero-pop pointer-events-none drop-shadow-[0_1px_5px_rgba(26,61,43,0.12)] dark:drop-shadow-[0_1px_8px_rgba(0,0,0,0.32)]"
                style={{ top: '10%', left: '50%', animationDelay: '0.22s' }}
              >
                <span className="block -translate-x-1/2">
                  <Sparkle
                    className="text-forest/92 dark:text-white/88 sparkle-anim-rev"
                    size={30}
                    style={{ animationDuration: '22s' }}
                  />
                </span>
              </span>
              <span
                className="absolute hero-pop pointer-events-none drop-shadow-[0_1px_5px_rgba(197,160,89,0.3)] dark:drop-shadow-[0_1px_10px_rgba(197,160,89,0.2)]"
                style={{ top: '44%', left: '2%', animationDelay: '0.42s' }}
              >
                <Sparkle
                  className="text-nobel-gold dark:text-nobel-gold sparkle-anim"
                  size={38}
                  style={{ animationDuration: '31s' }}
                />
              </span>
              <span
                className="absolute hero-pop pointer-events-none drop-shadow-[0_1px_5px_rgba(26,61,43,0.14)] dark:drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]"
                style={{ top: '40%', right: '2%', animationDelay: '0.33s' }}
              >
                <Sparkle
                  className="text-forest/95 dark:text-white/90 sparkle-anim-rev"
                  size={32}
                  style={{ animationDuration: '21s' }}
                />
              </span>
              <span
                className="absolute hero-pop pointer-events-none drop-shadow-[0_1px_5px_rgba(197,160,89,0.3)] dark:drop-shadow-[0_1px_10px_rgba(197,160,89,0.2)]"
                style={{ bottom: '20%', left: '18%', animationDelay: '0.62s' }}
              >
                <Sparkle
                  className="text-nobel-gold dark:text-nobel-gold sparkle-anim"
                  size={36}
                  style={{ animationDuration: '27s' }}
                />
              </span>

              <div className="relative z-10 container mx-auto px-6 text-center">
                <div className="hero-pop hero-pop-1 inline-block mb-7 px-4 py-1.5 bg-white/50 dark:bg-white/10 backdrop-blur-sm text-forest dark:text-white/80 text-xs tracking-[0.22em] uppercase font-bold rounded-full border border-white/70 dark:border-white/20">
                  {uiStrings[language].portfolioBadge}
                </div>

                <h1
                  className="hero-pop hero-pop-2 font-display font-black text-forest dark:text-white leading-[0.88] mb-4 md:mb-5"
                  style={{ fontSize: 'clamp(3.2rem, 10.5vw, 8.5rem)' }}
                >
                  {language === 'vi' ? 'Tôi là Võ Sơn Tùng.' : "Hi. I'm TJ."}
                </h1>

                <HeroBioWeather language={language} />

                <div className="hero-pop hero-pop-3 flex flex-col sm:flex-row justify-center items-center gap-3">
                  <a
                    href="mailto:vo.tung@stthom.edu"
                    className="flex items-center gap-2 px-7 py-3 bg-forest dark:bg-white text-white dark:text-forest rounded-full hover:bg-forest/85 dark:hover:bg-white/90 transition-colors font-medium text-sm shadow-md"
                  >
                    <Mail size={15} />
                    vo.tung@stthom.edu
                  </a>
                </div>

                {/* Language availability banner — visible in hero until user switches or dismisses */}
                <AnimatePresence>
                  {!langHintDismissed && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 1.3, duration: 0.45 } }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                      className="mt-5 flex justify-center"
                    >
                      <div className="flex items-center bg-white/45 dark:bg-white/10 backdrop-blur-sm border border-white/60 dark:border-white/20 rounded-full shadow-sm overflow-hidden">
                        <button
                          onClick={handleLanguageToggle}
                          className="flex items-center gap-2.5 pl-4 pr-3 py-2.5 text-xs font-medium text-forest/75 dark:text-white/65 hover:text-forest dark:hover:text-white transition-colors"
                          aria-label={language === 'en' ? 'Switch to Vietnamese' : 'Switch to English'}
                        >
                          <span className="relative flex h-2 w-2 flex-shrink-0">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-nobel-gold opacity-75 animate-ping" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-nobel-gold" />
                          </span>
                          <span>
                            {language === 'en'
                              ? 'Cũng có bằng tiếng Việt — bấm để đổi.'
                              : 'Also available in English — click to switch.'}
                          </span>
                        </button>
                        <button
                          onClick={dismissLangHint}
                          className="px-2.5 py-2.5 text-forest/35 dark:text-white/30 hover:text-forest/60 dark:hover:text-white/55 transition-colors border-l border-white/40 dark:border-white/15 flex-shrink-0"
                          aria-label="Dismiss language hint"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="hero-pop hero-pop-4 absolute bottom-10 left-0 right-0 flex justify-center animate-bounce">
                  <button
                    onClick={() =>
                      document
                        .getElementById(isMobile ? 'section-about' : 'home-education')
                        ?.scrollIntoView({ behavior: 'smooth' })
                    }
                    className="text-forest/40 hover:text-forest transition-colors cursor-pointer"
                  >
                    <ArrowDown size={24} />
                  </button>
                </div>
              </div>
            </header>

            {/* Education below hero — hidden on mobile since the Education section below renders these cards in continuous-scroll mode. */}
            <section id="home-education" className="py-24 px-6 md:px-16 hidden md:block">
              <SectionHeading
                label={language === 'vi' ? 'Học vấn' : 'Education'}
                heading={language === 'vi' ? 'Nền tảng học thuật.' : 'Academic Foundation.'}
                center
              />
              <EducationCards language={language} />
            </section>
          </motion.div>
        )}

        {/* ── Education ───────────────────────────────────────── */}
        {(isMobile || activeTab === 'about') && (
          <motion.main
            key="about"
            id="section-about"
            {...mainTabMotion}
            className="tab-content pt-24 pb-24 px-6 md:px-16 scroll-mt-20"
          >
            <TabHero>{language === 'vi' ? 'Học vấn.' : 'Education.'}</TabHero>
            <EducationCards language={language} />
          </motion.main>
        )}

        {/* ── Research ────────────────────────────────────────── */}
        {(isMobile || activeTab === 'research') && (
          <motion.main
            key="research"
            id="section-research"
            {...mainTabMotion}
            className="tab-content pt-24 pb-24 px-6 md:px-16 scroll-mt-20"
          >
            <TabHero>{language === 'vi' ? 'Nghiên cứu.' : 'Research.'}</TabHero>

            {/* Research experience */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* Left column */}
              <div>
                <motion.div {...scrollReveal} className="mb-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/55 dark:bg-white/10 text-forest dark:text-white/80 text-xs font-bold tracking-widest uppercase rounded-full mb-5 border border-white/70 dark:border-white/15">
                    {language === 'vi' ? 'Trọng tâm nghiên cứu' : 'Research Focus'}
                  </div>
                  <h2 className="font-display font-black text-4xl md:text-5xl text-forest dark:text-white leading-[0.92]">
                    {language === 'vi' ? 'Lý thuyết đồ thị &' : 'Graph Theory &'}
                    <br />
                    {language === 'vi' ? 'Động lực mạng.' : 'Network Dynamics.'}
                  </h2>
                </motion.div>
                <ExperienceItem
                  language={language}
                  title={language === 'vi' ? 'Đại học St. Thomas' : 'University of St. Thomas'}
                  role={language === 'vi' ? 'Nghiên cứu viên Bậc Đại học' : 'Undergraduate Researcher'}
                  date={language === 'vi' ? 'Mùa thu 2025 – Hiện tại' : 'Fall 2025 – Current'}
                  location={language === 'vi' ? 'Giảng viên Hướng dẫn: Tiến sĩ Mary Flagg' : 'Supervisor: Dr. Mary Flagg'}
                  posterData={ustGraphTheoryPoster}
                  onOpenDocument={(doc) => setActiveDocument(doc)}
                >
                  {language === 'vi'
                    ? 'Nghiên cứu được tài trợ bởi chương trình NSF PRIMES PAIR dưới sự hướng dẫn của Tiến sĩ Mary Flagg về các tập buộc-không cạnh tranh trong lý thuyết đồ thị. Thực hiện phân tích lý thuyết và thực nghiệm tính toán trên các họ đồ thị nhằm nghiên cứu động lực lan truyền trong các quá trình buộc-không cạnh tranh.'
                    : 'NSF PRIMES PAIR-funded research under Dr. Mary Flagg on competitive zero forcing sets in graph theory. Conducted theoretical analysis and computational experiments across graph families to study propagation dynamics in competing zero forcing processes.'}
                </ExperienceItem>
              </div>

              {/* Right column */}
              <div>
                <motion.div {...scrollReveal} className="mb-10">
                  <h2 className="font-display font-black text-4xl md:text-5xl text-forest dark:text-white leading-[0.92]">
                    {language === 'vi' ? 'Lịch sử &' : 'History &'}
                    <br />
                    {language === 'vi' ? 'Chính sách công.' : 'Public Policy.'}
                  </h2>
                </motion.div>
                <ExperienceItem
                  language={language}
                  title={language === 'vi' ? 'Trường Cao đẳng Cộng đồng Lone Star | Trường Cao đẳng Danh dự' : 'Lone Star College | The Honors College'}
                  role={language === 'vi' ? 'Nghiên cứu viên – Phân tích Chiến tranh Việt Nam' : 'Researcher – Vietnam War Analysis'}
                  date={language === 'vi' ? 'Mùa thu 2024' : 'Fall 2024'}
                  location={language === 'vi' ? 'Giảng viên Hướng dẫn: Tiến sĩ Kelly Phillips' : 'Supervisor: Dr. Kelly Phillips'}
                  documentData={histPaper}
                  posterData={histPoster}
                  onOpenDocument={(doc) => setActiveDocument(doc)}
                >
                  {language === 'vi'
                    ? 'Nghiên cứu khám phá sự khác biệt trong chiến thuật tuyển quân và động cơ đào ngũ của lính Mỹ và lính Việt Cộng trong Chiến tranh Việt Nam. Mục tiêu là tìm hiểu mối quan hệ giữa chiến thuật tuyển quân và tỷ lệ đào ngũ trong thời chiến.'
                    : 'Explored differences in recruitment tactics and desertion motivations among U.S. and Viet Cong soldiers. Aimed to understand the relationship between recruitment tactics and wartime desertion rates.'}
                </ExperienceItem>
                <ExperienceItem
                  language={language}
                  title={language === 'vi' ? 'Hội nghị Mô phỏng Liên Hợp Quốc Toàn quốc (NMUN)' : 'National Model United Nations (NMUN)'}
                  role={language === 'vi' ? 'Đại biểu kiêm Nghiên cứu viên' : 'Delegate & Researcher'}
                  date={language === 'vi' ? 'Mùa xuân 2024' : 'Spring 2024'}
                  location={
                    language === 'vi'
                      ? 'Thành phố New York, Tiểu bang New York | Giảng viên Hướng dẫn: Tiến sĩ Sean Tiffee, Tiến sĩ Rebecca Howard, Tiến sĩ Peggy Lambert, Giáo sư Casey Garcia'
                      : 'New York, NY | Supervisors: Dr. Sean Tiffee, Dr. Rebecca Howard, Dr. Peggy Lambert, Prof. Casey Garcia'
                  }
                  documentData={nmunPaper}
                  onOpenDocument={(doc) => setActiveDocument(doc)}
                >
                  {language === 'vi'
                    ? 'Thực hiện một nghiên cứu tự dân tộc học về giao tiếp liên văn hóa và động lực lãnh đạo tại Hội nghị NMUN. Phân tích lý thuyết lãnh đạo theo quan hệ cùng các chiến lược thuyết trình trước công chúng; kết quả nghiên cứu đã đạt Giải thưởng “Đại biểu Xuất sắc nhất Ủy ban”.'
                    : "Conducted an autoethnographic study on intercultural communication and leadership dynamics at NMUN. Analyzed relational leadership theory and public speaking strategies, resulting in a 'Best in Committee' award."}
                </ExperienceItem>
                <ExperienceItem
                  language={language}
                  title={language === 'vi' ? 'Trường Cao đẳng Cộng đồng Lone Star | Trường Cao đẳng Danh dự' : 'Lone Star College | The Honors College'}
                  role={language === 'vi' ? 'Nghiên cứu viên – Ô nhiễm Không khí' : 'Researcher – Air Pollution'}
                  date={language === 'vi' ? 'Mùa xuân 2024' : 'Spring 2024'}
                  location={language === 'vi' ? 'Giảng viên Hướng dẫn: Tiến sĩ Dana Van De Walker' : 'Supervisor: Dr. Dana Van De Walker'}
                  documentData={govtPaper}
                  onOpenDocument={(doc) => setActiveDocument(doc)}
                >
                  {language === 'vi'
                    ? 'So sánh và phân tích các quốc gia có mức phát thải gây ô nhiễm không khí lớn (Hoa Kỳ và Cộng hòa Chad) nhằm xác định các yếu tố làm suy giảm tuổi thọ bình quân. Khảo sát mối tương quan giữa mức độ ô nhiễm không khí và các chỉ số sức khỏe cộng đồng.'
                    : 'Compared and analyzed major air polluters (US and Chad) to identify factors decreasing life expectancy. Investigated correlations between air pollution levels and public health outcomes.'}
                </ExperienceItem>
              </div>
            </div>

            {/* Conference Presentations */}
            <div id="research-presentations" className="mt-20 scroll-mt-24">
              <SectionHeading
                label={uiStrings[language].presentationsLabel}
                heading={uiStrings[language].presentationsHeading}
                center
              />
              <div className="max-w-3xl mx-auto space-y-4">
                {presentationsData[language].map((p, i) => (
                  <motion.div
                    key={i}
                    {...scrollReveal}
                    className="flex gap-4 items-start p-5 bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 rounded-2xl hover:shadow-md transition-all duration-300"
                  >
                    <span className="flex-shrink-0 mt-1 font-display font-black text-lg text-forest/30 dark:text-white/25 w-6 text-right">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h4 className="font-display font-bold text-forest dark:text-white leading-snug text-base">
                          {p.title}
                        </h4>
                        {p.poster && (
                          <button
                            onClick={() => setActiveDocument(p.poster!)}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 bg-white/70 dark:bg-white/10 border border-forest/20 dark:border-white/15 rounded-full text-forest dark:text-white/80 hover:bg-forest dark:hover:bg-white hover:text-white dark:hover:text-forest transition-all duration-300 text-xs uppercase font-bold tracking-wider group"
                          >
                            <LayoutTemplate size={12} className="group-hover:scale-110 transition-transform" />
                            <span>{uiStrings[language].viewPoster}</span>
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-forest/60 dark:text-white/50">
                        {p.venue} · {p.location}, {p.year}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Personal projects: public extensions of prior research */}
            <div id="research-projects" className="mt-20 scroll-mt-24">
              <SectionHeading
                label={uiStrings[language].projectsLabel}
                heading={uiStrings[language].projectsHeading}
                sub={uiStrings[language].projectsSub}
                center
              />
              <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
                {projectsData[language].map((proj) => (
                  <motion.a
                    key={proj.url}
                    href={proj.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...scrollReveal}
                    className={`group block p-6 ${proj.color} rounded-2xl border border-white/50 dark:border-white/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-display font-bold text-lg text-forest dark:text-white leading-snug">
                        {proj.title}
                      </h3>
                      <span className="flex-shrink-0 p-2 rounded-full bg-white/60 dark:bg-white/10 text-forest dark:text-white/80 group-hover:bg-forest group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-forest transition-colors">
                        <ExternalLink size={16} aria-hidden />
                      </span>
                    </div>
                    <p className="text-sm text-forest/70 dark:text-white/55 leading-relaxed">
                      {proj.blurb}
                    </p>
                    <span className="mt-4 block text-xs font-bold uppercase tracking-wider text-forest/50 dark:text-white/40 group-hover:text-forest dark:group-hover:text-white transition-colors">
                      {uiStrings[language].visitSite}
                    </span>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.main>
        )}

        {/* ── Leadership ──────────────────────────────────────── */}
        {(isMobile || activeTab === 'leadership') && (
          <motion.main
            key="leadership"
            id="section-leadership"
            {...mainTabMotion}
            className="tab-content pt-24 pb-24 px-6 md:px-16 scroll-mt-20"
          >
            <TabHero>{language === 'vi' ? 'Lãnh đạo.' : 'Leadership.'}</TabHero>
            <div className="overflow-hidden">
              {leadershipData[language].map((entry, i, arr) => (
                <StaircaseCard
                  key={`leadership-${i}`}
                  title={entry.title}
                  role={entry.role}
                  shortDate={entry.shortDate}
                  location={entry.location}
                  offset={getStaircaseOffset(i, arr.length)}
                >
                  {entry.description}
                </StaircaseCard>
              ))}
            </div>
          </motion.main>
        )}

        {/* ── Work ────────────────────────────────────────────── */}
        {(isMobile || activeTab === 'work') && (
          <motion.main
            key="work"
            id="section-work"
            {...mainTabMotion}
            className="tab-content pt-24 pb-24 px-6 md:px-16 scroll-mt-20"
          >
            <TabHero>{language === 'vi' ? 'Kinh nghiệm.' : 'Work.'}</TabHero>
            <div className="overflow-hidden">
              {workData[language].map((entry, i, arr) => (
                <StaircaseCard
                  key={`work-${i}`}
                  title={entry.title}
                  role={entry.role}
                  shortDate={entry.shortDate}
                  location={entry.location}
                  offset={getStaircaseOffset(i, arr.length)}
                >
                  {entry.description}
                </StaircaseCard>
              ))}
            </div>
          </motion.main>
        )}

        {/* ── Honors ──────────────────────────────────────────── */}
        {(isMobile || activeTab === 'honors') && (
          <motion.main
            key="honors"
            id="section-honors"
            {...mainTabMotion}
            className="tab-content pt-24 pb-24 px-6 md:px-16 scroll-mt-20"
          >
            <TabHero>{language === 'vi' ? 'Thành tích.' : 'Honors.'}</TabHero>
            <motion.div {...scrollReveal} className="mb-6 text-center text-forest/60 dark:text-white/50 text-base max-w-xl mx-auto">
              {uiStrings[language].honorsSub}
            </motion.div>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={scrollViewport}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {honorData[language].map((h, i) => (
                <HonorCard
                  key={`honor-${i}`}
                  title={h.title}
                  org={h.org}
                  date={h.date}
                  color={h.color}
                />
              ))}
            </motion.div>

            <motion.div {...scrollReveal} className="mt-16 text-center">
              <h3 className="font-display font-bold text-2xl text-forest dark:text-white mb-6">
                {uiStrings[language].certHeading}
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {certificationsData[language].map((cert, i) => (
                  <span
                    key={`cert-${i}`}
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
        <motion.div {...scrollReveal}>
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <div className="text-white font-display font-black text-3xl mb-1">
                {uiStrings[language].fullName}
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
            {uiStrings[language].rightsReserved}
          </div>
          <div className="text-center mt-3 flex flex-col items-center gap-1.5">
            <button
              onClick={handleLanguageToggle}
              className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/65 transition-colors group"
            >
              <ArrowUp size={11} className="opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              <span className="underline underline-offset-2 decoration-white/20 group-hover:decoration-white/50">
                {language === 'en'
                  ? 'Trang này cũng có bằng tiếng Việt'
                  : 'This page is also available in English'}
              </span>
              <span className="px-1.5 py-0.5 rounded border border-white/20 font-bold text-[10px] tracking-wide no-underline flex-shrink-0">
                {language === 'en' ? 'VI' : 'EN'}
              </span>
            </button>
          </div>
        </motion.div>
      </footer>
      </div>{/* end lang-transition wrapper */}
    </div>
  );
};

export default App;
