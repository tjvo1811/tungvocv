/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { ArrowDown, Menu, X, Mail, Linkedin, FileText, LayoutTemplate, ExternalLink, Moon, Sun, ChevronDown } from 'lucide-react';
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
    date: 'Expected May 2028',
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
      degree: 'Cử nhân khoa học ngành toán học ứng dụng',
      date: 'Dự kiến tốt nghiệp tháng 5 năm 2028',
      honor: 'Chuyên ngành phụ: Phân tích dữ liệu',
      url: 'https://stthom.edu/',
      color: 'bg-[#ebd6d8] dark:bg-[#7B1113]/50',
    },
    {
      school: 'Trường Cao đẳng Cộng đồng Lone Star',
      degree: 'Bằng phó học sĩ khoa học / đại cương',
      date: 'Tháng 5 năm 2025',
      honor: 'Danh hiệu xuất sắc tối cao (Summa Cum Laude) | Học giả toàn cầu xuất sắc (Distinguished Global Scholar)',
      url: 'https://www.lonestar.edu/',
      color: 'bg-[#e3eaf5] dark:bg-[#0c2347]/45',
    },
    {
      school: 'Trường Trung học Jersey Village',
      degree: 'Bằng tốt nghiệp trung học phổ thông',
      date: 'Tháng 5 năm 2023',
      honor: 'Danh hiệu xuất sắc (Cum Laude)',
      url: 'https://jerseyvillage.cfisd.net/',
      color: 'bg-[#ebe4f7] dark:bg-[#2d2248]/45',
    },
  ],
};

type HonorEntry = { title: string; org: string; date: string };

const honorData: Record<Language, HonorEntry[]> = {
  en: [
    { title: 'Monaghan Excellence Scholarship', org: 'University of St. Thomas', date: 'Fall 2025 – Spring 2027' },
    { title: 'Hispanic Serving Institution STEM (Dunn) Endowed Scholarship', org: 'University of St. Thomas', date: '2025' },
    { title: 'CASE Finalist', org: 'Amideast Education Abroad Connect', date: 'Summer 2025' },
    { title: 'Distinguished Global Scholar Study Abroad Scholarship', org: 'Lone Star College Houston-North', date: 'Summer 2025' },
    { title: 'Distinguished Global Scholar', org: 'Lone Star College', date: 'Fall 2024 – Spring 2025' },
    { title: 'Global Scholar Language Scholarship', org: 'Lone Star College Houston-North', date: 'Fall 2024 – Spring 2025' },
    { title: 'Best In Committee Award', org: 'National Model United Nations, NY', date: '2024' },
    { title: 'Outstanding Delegation Award', org: 'National Model United Nations, NY', date: '2024' },
    { title: 'Global Scholar Award', org: 'Lone Star College Houston-North', date: 'Fall 2023 – Spring 2025' },
    { title: "President's List", org: 'Lone Star College', date: '2023 – 2025' },
    { title: 'Academic All-American Award', org: 'National Speech and Debate Association', date: 'Fall 2022' },
    { title: '6x Tournament Champion', org: 'Speech and Debate, Houston, TX', date: 'High School' },
    { title: '2x State TFA Qualifier', org: 'Texas Forensics Association', date: 'High School' },
    { title: 'TFA Quarter Finalists', org: 'Texas Forensics Association', date: 'High School' },
    { title: 'NIETOC Qualifier', org: 'National Individual Events Tournament of Champions', date: 'High School' },
  ],
  vi: [
    { title: 'Học bổng xuất sắc Monaghan', org: 'Đại học St. Thomas', date: 'Mùa thu 2025 – Mùa xuân 2027' },
    { title: 'Học bổng STEM dành cho cơ sở phục vụ cộng đồng gốc Tây Ban Nha (Hispanic Serving Institution) – Quỹ Dunn', org: 'Đại học St. Thomas', date: '2025' },
    { title: 'Ứng viên vào vòng chung kết CASE (Cộng đồng, Hành động và Khởi nghiệp Xã hội)', org: 'Chương trình Kết nối Du học Amideast', date: 'Mùa hè 2025' },
    { title: 'Học bổng du học dành cho học giả toàn cầu xuất sắc', org: 'Trường Cao đẳng Cộng đồng Lone Star – Phân hiệu Houston-North', date: 'Mùa hè 2025' },
    { title: 'Danh hiệu học giả toàn cầu xuất sắc', org: 'Trường Cao đẳng Cộng đồng Lone Star', date: 'Mùa thu 2024 – Mùa xuân 2025' },
    { title: 'Học bổng ngoại ngữ dành cho học giả toàn cầu', org: 'Trường Cao đẳng Cộng đồng Lone Star – Phân hiệu Houston-North', date: 'Mùa thu 2024 – Mùa xuân 2025' },
    { title: 'Giải thưởng đại biểu xuất sắc nhất ủy ban', org: 'NMUN (Hội nghị Mô phỏng Liên Hợp Quốc Toàn quốc), New York', date: '2024' },
    { title: 'Giải thưởng đoàn đại biểu xuất sắc', org: 'NMUN (Hội nghị Mô phỏng Liên Hợp Quốc Toàn quốc), New York', date: '2024' },
    { title: 'Giải thưởng học giả toàn cầu', org: 'Trường Cao đẳng Cộng đồng Lone Star – Phân hiệu Houston-North', date: 'Mùa thu 2023 – Mùa xuân 2025' },
    { title: 'Danh sách tuyên dương của hiệu trưởng (President\'s List)', org: 'Trường Cao đẳng Cộng đồng Lone Star', date: '2023 – 2025' },
    { title: 'Giải thưởng học thuật toàn Hoa Kỳ', org: 'Hiệp hội Hùng biện và Tranh luận Quốc gia Hoa Kỳ (National Speech and Debate Association)', date: 'Mùa thu 2022' },
    { title: 'Sáu lần vô địch giải đấu', org: 'Bộ môn hùng biện và tranh luận, Houston, Texas', date: 'Bậc trung học phổ thông' },
    { title: 'Hai lần đạt chuẩn tham dự giải cấp tiểu bang TFA (Hiệp hội Hùng biện và Tranh luận Texas)', org: 'Hiệp hội Hùng biện và Tranh luận Texas', date: 'Bậc trung học phổ thông' },
    { title: 'Vào tứ kết giải TFA (Hiệp hội Hùng biện và Tranh luận Texas)', org: 'Hiệp hội Hùng biện và Tranh luận Texas', date: 'Bậc trung học phổ thông' },
    { title: 'Đạt chuẩn tham dự giải NIETOC (Giải vô địch toàn quốc các nội dung hùng biện cá nhân)', org: 'Giải vô địch toàn quốc các nội dung hùng biện cá nhân', date: 'Bậc trung học phổ thông' },
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
      title: 'Chương trình CASE (Cộng đồng, Hành động và Khởi nghiệp Xã hội)',
      role: 'Ứng viên vào vòng chung kết',
      shortDate: 'Hè 2025',
      location: 'Chương trình Kết nối Du học Amideast',
      description:
        'Chương trình học tập có hướng dẫn kéo dài tám ngày tại Cộng hòa Tunisia. Các ứng viên được tuyển chọn vào vòng chung kết được giới thiệu với các tổ chức xã hội dân sự thông qua các buổi thuyết trình, thảo luận chuyên đề, hoạt động phục vụ cộng đồng và giao lưu với sinh viên bản địa.',
    },
    {
      title: 'Hội đồng cố vấn sinh viên Trường cao đẳng danh dự',
      role: 'Đại diện cơ sở',
      shortDate: '2024 – 2025',
      location: 'Trường Cao đẳng Cộng đồng Lone Star – Phân hiệu Houston-North',
      description:
        'Định kỳ hai lần mỗi năm tham dự các cuộc họp với Phó Hiệu trưởng phụ trách HIE (Giáo dục Danh dự và Quốc tế). Phối hợp đóng góp quan điểm của sinh viên đối với các chương trình của Trường cao đẳng danh dự cũng như các hoạt động trên toàn hệ thống.',
    },
    {
      title: 'Đại diện HIE (Giáo dục Danh dự và Quốc tế)',
      role: 'Đại sứ liên lạc hệ thống Emeritus (danh dự)',
      shortDate: 'Mùa xuân 2025',
      location: 'Trường Cao đẳng Cộng đồng Lone Star',
      description:
        'Với tư cách Emeritus (danh dự), phối hợp và cố vấn cho đại sứ liên lạc hệ thống đương nhiệm, đồng thời tiếp tục quảng bá các chương trình thuộc Trường cao đẳng danh dự và bộ phận giáo dục quốc tế.',
    },
    {
      title: 'Đại diện HIE (Giáo dục Danh dự và Quốc tế)',
      role: 'Đại sứ liên lạc hệ thống',
      shortDate: 'Mùa thu 2024',
      location: 'Trường Cao đẳng Cộng đồng Lone Star',
      description:
        'Quảng bá Trường cao đẳng danh dự trong suốt học kỳ, phối hợp với các đại diện liên lạc tại các cơ sở để tổ chức các sự kiện trên toàn hệ thống. Đồng thời giới thiệu chương trình Take Flight của Đại học Rice, đội tuyển NMUN (Hội nghị Mô phỏng Liên Hợp Quốc Toàn quốc) cũng như các chương trình học bổng liên quan.',
    },
    {
      title: 'Chương trình lãnh đạo toàn cầu',
      role: 'Thành viên',
      shortDate: '2024 – 2025',
      location: 'Trường Cao đẳng Cộng đồng Lone Star',
      description:
        'Trau dồi kỹ năng lãnh đạo có đạo đức và bao trùm trong bối cảnh toàn cầu thông qua các khóa đào tạo về ngoại giao quốc tế, tham dự hội nghị và hợp tác với các tổ chức trong nước và quốc tế.',
    },
    {
      title: 'Chương trình học giả toàn cầu xuất sắc',
      role: 'Thành viên',
      shortDate: '2024 – 2025',
      location: 'Trường Cao đẳng Cộng đồng Lone Star',
      description:
        'Được tuyển chọn từ khoảng một trăm ứng viên, là một trong tám thành viên chính thức của khóa. Chương trình bao gồm các học phần được chỉ định là IS (Nghiên cứu Quốc tế), nhằm bổ sung chiều kích quốc tế cho chương trình đào tạo.',
    },
    {
      title: 'Chương trình Texas Boys State',
      role: 'Thành viên đội báo chí kiêm đại biểu (Statesman)',
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
      role: 'Kỹ thuật viên lắp ráp cơ – điện',
      shortDate: '2025 – Hiện tại',
      location: 'Houston, Texas',
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
      role: 'Thực tập sinh quan hệ đối ngoại',
      shortDate: '2024 – 2025',
      location: 'Cypress, Texas',
      description: (
        <ul className="list-disc pl-4 space-y-1">
          <li>Soạn thảo và lập kế hoạch tổ chức các sự kiện trên phạm vi toàn cơ sở.</li>
          <li>Điều phối và quản lý các nền tảng truyền thông xã hội cùng nội dung đăng tải.</li>
          <li>Xây dựng ý tưởng cho các chiến dịch truyền thông trên các nền tảng X (Twitter), Instagram và Facebook.</li>
        </ul>
      ),
    },
    {
      title: 'Tổ chức cộng đồng East Aldine BakerRipley',
      role: 'Tình nguyện viên lễ tân',
      shortDate: '2024 – 2025',
      location: 'Aldine, Texas',
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
    { title: '“Buộc-không cạnh tranh (competitive zero forcing): Một quá trình lan truyền trên đồ thị hai tác nhân”', venue: 'Hội nghị nghiên cứu Đại học St. Thomas – Houston', location: 'Houston, Texas', year: '2026', poster: ustGraphTheoryPoster },
    { title: '“Một phương pháp hệ thống để hiểu thế giới tự nhiên”', venue: 'Phiên trình bày áp phích – Học viện Khoa học Dữ liệu Môi trường, Đại học Rice', location: 'Houston, Texas', year: '2025', poster: ricePoster },
    { title: '“Một phương pháp hệ thống để hiểu thế giới tự nhiên”', venue: 'Hội nghị giáo dục danh dự và quốc tế mùa xuân', location: 'Houston, Texas', year: '2025', poster: ricePoster },
    { title: '“Vận may trong chiến tranh hay là số trời định”: Xem xét ảnh hưởng của chiến thuật tuyển quân đến tỷ lệ đào ngũ trong Chiến tranh Việt Nam', venue: 'Hội nghị thường niên Hiệp hội Lịch sử Thế giới Texas', location: 'Commerce, Texas', year: '2025', poster: histPoster },
    { title: '“Vận may trong chiến tranh hay là số trời định”: Xem xét ảnh hưởng của chiến thuật tuyển quân đến tỷ lệ đào ngũ trong Chiến tranh Việt Nam', venue: 'Hội nghị giáo dục danh dự và quốc tế mùa thu', location: 'Houston, Texas', year: '2024', poster: histPoster },
    { title: '“Vận may trong chiến tranh hay là số trời định”: Xem xét ảnh hưởng của chiến thuật tuyển quân đến tỷ lệ đào ngũ trong Chiến tranh Việt Nam', venue: 'Hội nghị giáo dục quốc tế hai năm một lần', location: 'Houston, Texas', year: '2024', poster: histPoster },
    { title: '“Tuổi thọ và ô nhiễm không khí: Phân tích so sánh giữa Hoa Kỳ và Cộng hòa Chad”', venue: 'Hội nghị giáo dục danh dự và quốc tế mùa xuân', location: 'Houston, Texas', year: '2024' },
    { title: 'Diễn giả tham luận – NMUN (Hội nghị Mô phỏng Liên Hợp Quốc Toàn quốc) tại New York', venue: 'Hội nghị giáo dục danh dự và quốc tế mùa xuân', location: 'Houston, Texas', year: '2024' },
  ],
};

/* ─── Personal projects ───────────────────────────────────────────── */
type ProjectEntry = { title: string; blurb: string; url: string };

const projectsData: Record<Language, ProjectEntry[]> = {
  en: [
    { title: 'The Fortunes of War', blurb: 'An interactive follow-up to Vietnam War recruitment and desertion research, with charts and narrative built for a general audience.', url: 'https://thefortunesofwar.netlify.app/' },
    { title: 'The Pollution Paradox', blurb: 'A public companion to the US vs. Chad air pollution and life expectancy paper, with data stories that highlight the paradox between pollution and outcomes.', url: 'https://thepollutionparadox.netlify.app/' },
    { title: 'Genuine', blurb: 'A follow-on to the NMUN autoethnography on intercultural communication and relational leadership—reimagined as a site where visitors can explore the ideas beyond the PDF.', url: 'https://genuinenmun.netlify.app/' },
  ],
  vi: [
    { title: 'The Fortunes of War', blurb: 'Một trang điện tử tương tác mở rộng từ công trình nghiên cứu về chiến thuật tuyển quân và hiện tượng đào ngũ trong Chiến tranh Việt Nam, được trình bày qua biểu đồ và lối tự sự dành cho công chúng phổ thông.', url: 'https://thefortunesofwar.netlify.app/' },
    { title: 'The Pollution Paradox', blurb: 'Phiên bản công cộng đi kèm bài nghiên cứu so sánh về ô nhiễm không khí và tuổi thọ bình quân giữa Hoa Kỳ và Cộng hòa Chad, sử dụng các câu chuyện dữ liệu nhằm làm nổi bật nghịch lý giữa mức độ ô nhiễm và kết quả về sức khỏe.', url: 'https://thepollutionparadox.netlify.app/' },
    { title: 'Genuine', blurb: 'Công trình tiếp nối nghiên cứu tự dân tộc học (autoethnography) tại NMUN (Hội nghị Mô phỏng Liên Hợp Quốc Toàn quốc) về giao tiếp liên văn hóa và lãnh đạo theo quan hệ — được tái hình dung dưới dạng một trang điện tử, nơi độc giả có thể khám phá các luận điểm vượt ra ngoài khuôn khổ của bản PDF.', url: 'https://genuinenmun.netlify.app/' },
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
    'Chứng chỉ vi mô: Khoa học dữ liệu môi trường (Đại học Rice)',
    'Nền tảng: Dữ liệu, dữ liệu, ở khắp nơi (Foundations: Data, Data, Everywhere) — Coursera',
    'Đặt câu hỏi để ra quyết định dựa trên dữ liệu (Ask Questions to Make Data-Driven Decisions) — Coursera',
    'Chuẩn bị dữ liệu cho việc khám phá (Prepare Data for Explorations) — Coursera',
    'Chứng chỉ OSHA 10 (Cơ quan An toàn và Sức khỏe Nghề nghiệp Hoa Kỳ)',
    'Hội viên Hiệp hội Danh dự Phi Theta Kappa',
    'Chương trình Take Flight – Đại học Rice',
    'Học giả toàn cầu',
  ],
};

/* ─── UI strings ──────────────────────────────────────────────────── */
const uiStrings = {
  en: {
    connect: 'Connect',
    contact: 'Contact Me',
    educationLabel: 'Education',
    educationHeading: 'Academic Foundation.',
    researchExperienceMenu: 'Research Experience',
    conferencePresentationsMenu: 'Conference Presentations',
    personalProjectsMenu: 'Personal Projects',
    researchFocusBadge: 'Research Focus',
    graphTheoryHead1: 'Graph Theory &',
    graphTheoryHead2: 'Network Dynamics.',
    codingTheoryHead1: 'Coding Theory &',
    codingTheoryHead2: 'Combinatorics.',
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
    ariaHome: 'Home',
    ariaToggleLanguage: 'Toggle language',
    ariaToggleDarkMode: 'Toggle dark mode',
    ariaDismiss: 'Dismiss',
    ariaDismissLangHint: 'Dismiss language hint',
    ariaSwitchToVietnamese: 'Switch to Vietnamese',
    ariaSwitchToEnglish: 'Switch to English',
    langHintVi: '🇺🇸 Also available in English — click to switch.',
    langHintEn: '🇻🇳 Có tiếng Việt — bấm để chuyển đổi.',
    langHintFooterVi: 'This page is also available in English',
  },
  vi: {
    connect: 'Kết nối',
    contact: 'Liên hệ',
    educationLabel: 'Học vấn',
    educationHeading: 'Nền tảng học thuật.',
    researchExperienceMenu: 'Kinh nghiệm nghiên cứu',
    conferencePresentationsMenu: 'Báo cáo hội nghị',
    personalProjectsMenu: 'Dự án cá nhân',
    researchFocusBadge: 'Trọng tâm nghiên cứu',
    graphTheoryHead1: 'Lý thuyết đồ thị &',
    graphTheoryHead2: 'Động lực mạng lưới.',
    codingTheoryHead1: 'Lý thuyết mã &',
    codingTheoryHead2: 'Tổ hợp.',
    historyHead1: 'Lịch sử &',
    historyHead2: 'Chính sách công.',
    presentationsLabel: 'Báo cáo',
    presentationsHeading: 'Báo cáo hội nghị.',
    projectsLabel: 'Dự án cá nhân',
    projectsHeading: 'Nghiên cứu, dành cho tất cả mọi người.',
    projectsSub: 'Các trang điện tử này được phát triển từ những bài nghiên cứu danh dự trước đây, được tái hình dung thành các trang web hoàn chỉnh kèm theo công cụ trực quan hóa dữ liệu, nhằm giúp đông đảo công chúng có thể tiếp cận và khảo sát các luận cứ cũng như tư tưởng đằng sau công trình nghiên cứu.',
    visitSite: 'Truy cập trang →',
    honorsSub: 'Tuyển chọn các thành tích và học bổng có tính cạnh tranh tiêu biểu.',
    certHeading: 'Chứng chỉ và tư cách hội viên',
    viewPoster: 'Xem áp phích',
    viewPaper: 'Xem bài nghiên cứu',
    viewDocPrefix: 'Xem ',
    liveTool: 'Công cụ tương tác trực tuyến',
    rightsReserved: '© 2025 Võ Sơn Tùng. Bảo lưu toàn bộ quyền.',
    fullName: 'Võ Sơn Tùng.',
    ariaHome: 'Trang chủ',
    ariaToggleLanguage: 'Chuyển ngôn ngữ',
    ariaToggleDarkMode: 'Chuyển chế độ sáng/tối',
    ariaDismiss: 'Đóng',
    ariaDismissLangHint: 'Ẩn gợi ý ngôn ngữ',
    ariaSwitchToVietnamese: 'Chuyển sang tiếng Việt',
    ariaSwitchToEnglish: 'Chuyển sang tiếng Anh',
    langHintVi: '🇺🇸 Trang này cũng có bản tiếng Anh — bấm để chuyển đổi.',
    langHintEn: '🇻🇳 Có tiếng Việt — bấm để chuyển đổi.',
    langHintFooterVi: 'Trang này cũng có bản tiếng Anh',
  },
} as const;

/* ─── Utility ─────────────────────────────────────────────────────── */
const getStaircaseOffset = (index: number, total: number) =>
  ((total - 1 - index) / Math.max(total - 1, 1)) * 50;

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

/* ─── Project card ─────────────────────────────────────────────────── */
const ProjectCard = ({
  title,
  blurb,
  url,
  visitLabel,
}: {
  title: string;
  blurb: string;
  url: string;
  visitLabel: string;
}) => (
  <motion.a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    variants={fadeIn}
    className="block h-full group"
  >
    <div className="bg-forest dark:bg-forest-light text-white rounded-xl p-4 h-full flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display font-bold text-sm leading-snug">{title}</h3>
        <ExternalLink
          size={14}
          className="shrink-0 mt-0.5 text-white/40 group-hover:text-white/80 transition-colors"
          aria-hidden
        />
      </div>
      <p className="text-white/65 text-xs leading-relaxed flex-1">{blurb}</p>
      <span className="text-white/45 text-[11px] font-semibold uppercase tracking-wide mt-auto pt-1 group-hover:text-white/70 transition-colors">
        {visitLabel}
      </span>
    </div>
  </motion.a>
);

/* ─── Honor card ─────────────────────────────────────────────────── */
const HonorCard = ({ title, org, date }: { title: string; org: string; date: string }) => (
  <motion.div variants={fadeIn} className="h-full">
    <div className="bg-forest dark:bg-forest-light text-white rounded-xl p-4 h-full flex flex-col gap-2">
      <h3 className="font-display font-bold text-sm leading-snug">{title}</h3>
      <p className="text-white/65 text-[11px] font-semibold uppercase tracking-wide leading-snug">
        {org}
      </p>
      <p className="text-white/45 text-xs mt-auto pt-1">{date}</p>
    </div>
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
            <span className="hidden sm:inline">{uiStrings[language].viewPaper}</span>
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
  const [langHintDismissed, setLangHintDismissed] = useState(false);
  const [langBtnHighlight, setLangBtnHighlight] = useState(false);
  const [langBtnInitPulse, setLangBtnInitPulse] = useState(true);
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

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const t = setTimeout(() => setLangBtnInitPulse(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // Show hints on every visit; auto-dismiss footer pill after 3 s.
  // Dismissal is session-only — no localStorage — so it reappears on each load.
  useEffect(() => {
    const showTimer = setTimeout(() => setLangHintVisible(true), 1200);
    const hideTimer = setTimeout(() => dismissLangHint(), 4200); // 1.2 s delay + 3 s visible
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismissLangHint = () => {
    setLangHintVisible(false);
    setLangHintDismissed(true);
  };

  const pointToLangBtn = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // After scroll completes, flash a highlight ring on the nav language button.
    setTimeout(() => {
      setLangBtnHighlight(true);
      setTimeout(() => setLangBtnHighlight(false), 2000);
    }, 500);
  };

  /* Frosted nav shell fades in once content scrolls near the top */
  const [navBarSolid, setNavBarSolid] = useState(false);
  const NAV_SOLID_AT = 48;

  const syncNavBarSolid = () => {
    setNavBarSolid(window.scrollY > NAV_SOLID_AT);
  };

  useEffect(() => {
    const onScroll = () => syncNavBarSolid();

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    window.scrollTo({ top: 0 });
    setNavBarSolid(false);
  }, [activeTab, isMobile]);

  /* sliding nav pill */
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLElement | null>>({});
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, visible: false });

  const navShellFrost =
    'bg-white/75 dark:bg-forest/60 backdrop-blur-md shadow-lg border border-white/70 dark:border-white/10';

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
        setNavBarSolid(false);
      } else {
        // Defer slightly so the menu close animation doesn't fight the scroll.
        setTimeout(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      }
      return;
    }

    setActiveTab(id);
    setNavBarSolid(false);
    if (scrollTo) {
      setTimeout(() => {
        document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        requestAnimationFrame(syncNavBarSolid);
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
    ? uiStrings.en.langHintEn
    : uiStrings.vi.langHintVi;
  const showLangHint = langHintVisible && !langHintDismissed;

  const navLinks = NAV_LINKS[language];
  const localizedName = language === 'vi' ? 'Võ Sơn Tùng' : 'TJ Vo';

  return (
    <div className="site-shell min-h-screen text-forest dark:text-white selection:bg-forest selection:text-white transition-colors duration-300">
      <DocumentModal
        isOpen={!!activeDocument}
        onClose={() => setActiveDocument(null)}
        document={activeDocument}
        language={language}
      />

      {/* ── Floating pill nav ──────────────────────────────── */}
      <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        {/* Desktop */}
        <motion.div
          ref={navRef}
          className="hidden md:flex pointer-events-auto items-center gap-0.5 px-2 py-1.5 relative rounded-full"
        >
          <motion.div
            aria-hidden
            className={`absolute inset-0 rounded-full pointer-events-none ${navShellFrost}`}
            animate={{ opacity: navBarSolid ? 1 : 0 }}
            transition={{ duration: 0.3, ease: cubicEase }}
          />
          <div
            className="absolute rounded-full bg-white/55 dark:bg-white/12 backdrop-blur-md border border-white/70 dark:border-white/20 shadow-[0_2px_12px_rgba(26,61,43,0.1)] dark:shadow-[0_2px_16px_rgba(0,0,0,0.35)] pointer-events-none"
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
            aria-label={uiStrings[language].ariaHome}
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
                        {uiStrings[language].researchExperienceMenu}
                      </button>
                      <div className="mx-4 h-px bg-forest/8 dark:bg-white/8" />
                      <button
                        onClick={() => switchTab('research', 'research-presentations')}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-forest/70 dark:text-white/60 hover:bg-forest/5 dark:hover:bg-white/8 transition-colors"
                      >
                        {uiStrings[language].conferencePresentationsMenu}
                      </button>
                      <div className="mx-4 h-px bg-forest/8 dark:bg-white/8" />
                      <button
                        onClick={() => switchTab('research', 'research-projects')}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-forest/70 dark:text-white/60 hover:bg-forest/5 dark:hover:bg-white/8 transition-colors"
                      >
                        {uiStrings[language].personalProjectsMenu}
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
            {langBtnHighlight && (
              <span className="absolute inset-0 rounded-full animate-ping bg-nobel-gold/50 pointer-events-none" />
            )}
            <button
              onClick={handleLanguageToggle}
              className={`relative px-3 py-1.5 border text-forest dark:text-white text-xs font-bold rounded-full hover:bg-forest/10 dark:hover:bg-white/10 transition-all overflow-hidden ${langBtnHighlight ? 'border-nobel-gold shadow-[0_0_0_3px_rgba(197,160,89,0.35)]' : 'border-forest/20 dark:border-white/20'}`}
              aria-label={uiStrings[language].ariaToggleLanguage}
            >
              {langBtnInitPulse && (
                <span className="absolute inset-0 rounded-full bg-yellow-200/70 animate-pulse pointer-events-none" />
              )}
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
            {showLangHint && (
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
                    <div className="font-medium pr-5">{langHintText}</div>
                  </button>
                  <button
                    type="button"
                    onClick={dismissLangHint}
                    aria-label={uiStrings[language].ariaDismiss}
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
            aria-label={uiStrings[language].ariaToggleDarkMode}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </motion.div>

        {/* Mobile */}
        <div className="flex md:hidden w-full pointer-events-auto justify-between items-center gap-2">
          <button
            onClick={() => switchTab('home')}
            className="relative flex items-center gap-2 px-3 py-2 rounded-full overflow-hidden"
          >
            <motion.span
              aria-hidden
              className={`absolute inset-0 rounded-full ${navShellFrost}`}
              animate={{ opacity: navBarSolid ? 1 : 0 }}
              transition={{ duration: 0.3, ease: cubicEase }}
            />
            <BrandMark className="relative w-7 h-7 flex-shrink-0" />
            <span className="relative font-display font-black text-forest dark:text-white text-sm">
              {localizedName}
            </span>
          </button>
          <div className="flex items-center gap-1.5">
            <div className="relative">
              {langBtnHighlight && (
                <span className="absolute inset-0 rounded-full animate-ping bg-nobel-gold/50 pointer-events-none" />
              )}
              <button
                className={`relative px-3 py-2 rounded-full text-forest dark:text-white/70 text-xs font-bold overflow-hidden ${langBtnHighlight ? 'ring-2 ring-nobel-gold ring-offset-1 ring-offset-transparent' : ''}`}
                onClick={handleLanguageToggle}
                aria-label={uiStrings[language].ariaToggleLanguage}
              >
                <motion.span
                  aria-hidden
                  className={`absolute inset-0 rounded-full ${navShellFrost}`}
                  animate={{ opacity: navBarSolid ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: cubicEase }}
                />
                {langBtnInitPulse && (
                  <span className="absolute inset-0 rounded-full bg-yellow-200/70 animate-pulse pointer-events-none" />
                )}
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
              {showLangHint && (
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
                      <div className="font-medium pr-5">{langHintText}</div>
                    </button>
                    <button
                      type="button"
                      onClick={dismissLangHint}
                      aria-label={uiStrings[language].ariaDismiss}
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
              className="relative p-2.5 rounded-full text-forest dark:text-white/60 overflow-hidden"
              onClick={() => setIsDark(!isDark)}
              aria-label={uiStrings[language].ariaToggleDarkMode}
            >
              <motion.span
                aria-hidden
                className={`absolute inset-0 rounded-full ${navShellFrost}`}
                animate={{ opacity: navBarSolid ? 1 : 0 }}
                transition={{ duration: 0.3, ease: cubicEase }}
              />
              <span className="relative">{isDark ? <Sun size={16} /> : <Moon size={16} />}</span>
            </button>
            <button
              className="relative p-2.5 rounded-full text-forest dark:text-white overflow-hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <motion.span
                aria-hidden
                className={`absolute inset-0 rounded-full ${navShellFrost}`}
                animate={{ opacity: navBarSolid ? 1 : 0 }}
                transition={{ duration: 0.3, ease: cubicEase }}
              />
              <span className="relative">{menuOpen ? <X size={18} /> : <Menu size={18} />}</span>
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
              <div className="relative z-10 container mx-auto px-6 text-center">
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
                          aria-label={language === 'en' ? uiStrings.en.ariaSwitchToVietnamese : uiStrings.vi.ariaSwitchToEnglish}
                        >
                          <span className="relative flex h-2 w-2 flex-shrink-0">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-nobel-gold opacity-75 animate-ping" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-nobel-gold" />
                          </span>
                          <span>
                            {language === 'en'
                              ? uiStrings.en.langHintEn
                              : uiStrings.vi.langHintVi}
                          </span>
                        </button>
                        <button
                          onClick={dismissLangHint}
                          className="px-2.5 py-2.5 text-forest/35 dark:text-white/30 hover:text-forest/60 dark:hover:text-white/55 transition-colors border-l border-white/40 dark:border-white/15 flex-shrink-0"
                          aria-label={uiStrings[language].ariaDismissLangHint}
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
                  role={language === 'vi' ? 'Nghiên cứu viên bậc đại học' : 'Undergraduate Researcher'}
                  date={language === 'vi' ? 'Mùa thu 2025 – Hiện tại' : 'Fall 2025 – Current'}
                  location={language === 'vi' ? 'Giáo sư hướng dẫn: Tiến sĩ Mary Flagg' : 'Supervisor: Dr. Mary Flagg'}
                  posterData={ustGraphTheoryPoster}
                  onOpenDocument={(doc) => setActiveDocument(doc)}
                >
                  {language === 'vi'
                    ? 'Nghiên cứu được tài trợ bởi chương trình NSF PRIMES PAIR (chương trình hỗ trợ nghiên cứu của Quỹ Khoa học Quốc gia Hoa Kỳ) dưới sự hướng dẫn của Tiến sĩ Mary Flagg về các tập buộc-không cạnh tranh (competitive zero forcing) trong lý thuyết đồ thị. Thực hiện phân tích lý thuyết và thực nghiệm tính toán trên các họ đồ thị nhằm nghiên cứu động lực lan truyền trong các quá trình buộc-không cạnh tranh.'
                    : 'NSF PRIMES PAIR-funded research under Dr. Mary Flagg on competitive zero forcing sets in graph theory. Conducted theoretical analysis and computational experiments across graph families to study propagation dynamics in competing zero forcing processes.'}
                </ExperienceItem>

                <motion.div {...scrollReveal} className="mb-10 mt-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/55 dark:bg-white/10 text-forest dark:text-white/80 text-xs font-bold tracking-widest uppercase rounded-full mb-5 border border-white/70 dark:border-white/15">
                    {language === 'vi' ? 'Trọng tâm nghiên cứu' : 'Research Focus'}
                  </div>
                  <h2 className="font-display font-black text-4xl md:text-5xl text-forest dark:text-white leading-[0.92]">
                    {uiStrings[language].codingTheoryHead1}
                    <br />
                    {uiStrings[language].codingTheoryHead2}
                  </h2>
                </motion.div>
                <ExperienceItem
                  language={language}
                  title={
                    language === 'vi'
                      ? 'Đại học Puerto Rico – Ponce'
                      : 'University of Puerto Rico – Ponce'
                  }
                  role={language === 'vi' ? 'Học giả REU (Chương trình Nghiên cứu Mùa hè dành cho Sinh viên Đại học) dự kiến tham gia' : 'Incoming REU Fellow'}
                  date={language === 'vi' ? 'Hè 2026' : 'Summer 2026'}
                  location={
                    language === 'vi'
                      ? 'Giáo sư hướng dẫn: Tiến sĩ Pamela Harris và Tiến sĩ Fernando Pinero'
                      : 'Supervisor: Dr. Pamela Harris and Dr. Fernando Pinero'
                  }
                >
                  {language === 'vi'
                    ? 'Tập trung vào lý thuyết mã hóa, tổ hợp, lý thuyết đồ thị, mã cục bộ phục hồi được và mã từ các hình học hữu hạn.'
                    : 'Working on coding theory, combinatorics, graph theory, locally recoverable codes, and codes from finite geometries.'}
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
                  location={language === 'vi' ? 'Giáo sư hướng dẫn: Tiến sĩ Kelly Phillips' : 'Supervisor: Dr. Kelly Phillips'}
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
                  title={language === 'vi' ? 'NMUN (Hội nghị Mô phỏng Liên Hợp Quốc Toàn quốc)' : 'National Model United Nations (NMUN)'}
                  role={language === 'vi' ? 'Đại biểu kiêm nghiên cứu viên' : 'Delegate & Researcher'}
                  date={language === 'vi' ? 'Mùa xuân 2024' : 'Spring 2024'}
                  location={
                    language === 'vi'
                      ? 'New York, New York | Giáo sư hướng dẫn: Tiến sĩ Sean Tiffee, Tiến sĩ Rebecca Howard, Tiến sĩ Peggy Lambert, Giáo sư Casey Garcia'
                      : 'New York, NY | Supervisors: Dr. Sean Tiffee, Dr. Rebecca Howard, Dr. Peggy Lambert, Prof. Casey Garcia'
                  }
                  documentData={nmunPaper}
                  onOpenDocument={(doc) => setActiveDocument(doc)}
                >
                  {language === 'vi'
                    ? 'Thực hiện một nghiên cứu tự dân tộc học (autoethnography) về giao tiếp liên văn hóa và động lực lãnh đạo tại NMUN (Hội nghị Mô phỏng Liên Hợp Quốc Toàn quốc). Phân tích lý thuyết lãnh đạo theo quan hệ cùng các chiến lược thuyết trình trước công chúng; kết quả nghiên cứu đạt giải thưởng đại biểu xuất sắc nhất ủy ban.'
                    : "Conducted an autoethnographic study on intercultural communication and leadership dynamics at NMUN. Analyzed relational leadership theory and public speaking strategies, resulting in a 'Best in Committee' award."}
                </ExperienceItem>
                <ExperienceItem
                  language={language}
                  title={language === 'vi' ? 'Trường Cao đẳng Cộng đồng Lone Star | Trường Cao đẳng Danh dự' : 'Lone Star College | The Honors College'}
                  role={language === 'vi' ? 'Nghiên cứu viên – Ô nhiễm không khí' : 'Researcher – Air Pollution'}
                  date={language === 'vi' ? 'Mùa xuân 2024' : 'Spring 2024'}
                  location={language === 'vi' ? 'Giáo sư hướng dẫn: Tiến sĩ Dana Van De Walker' : 'Supervisor: Dr. Dana Van De Walker'}
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
              <motion.div
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={scrollViewport}
                className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {projectsData[language].map((proj) => (
                  <ProjectCard
                    key={proj.url}
                    title={proj.title}
                    blurb={proj.blurb}
                    url={proj.url}
                    visitLabel={uiStrings[language].visitSite}
                  />
                ))}
              </motion.div>
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
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl mx-auto"
            >
              {honorData[language].map((h, i) => (
                <HonorCard
                  key={`honor-${i}`}
                  title={h.title}
                  org={h.org}
                  date={h.date}
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
          <div className="mt-6 flex flex-col items-center gap-0">
            {/* Caret pointing up toward the nav VI/EN button */}
            <span className="w-0 h-0 border-l-[7px] border-r-[7px] border-b-[7px] border-l-transparent border-r-transparent border-b-white/15" />
            <div className="relative">
              {showLangHint && (
                <span className="absolute inset-0 rounded-full bg-nobel-gold/25 animate-ping pointer-events-none" />
              )}
            <div className="relative flex items-center gap-1 bg-white/10 rounded-full px-4 py-2 text-xs text-white/70">
              <button
                onClick={pointToLangBtn}
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <span>{language === 'en' ? '🇻🇳' : '🇺🇸'}</span>
                <span>
                  {language === 'en'
                    ? uiStrings.en.langHintEn.replace('🇻🇳 ', '')
                    : uiStrings.vi.langHintFooterVi}
                </span>
              </button>
              <button
                onClick={dismissLangHint}
                className="ml-1 text-white/40 hover:text-white/80 transition-colors leading-none"
                aria-label={uiStrings[language].ariaDismiss}
              >
                <X size={11} />
              </button>
            </div>
            </div>
          </div>
        </motion.div>
      </footer>
      </div>{/* end lang-transition wrapper */}
    </div>
  );
};

export default App;
