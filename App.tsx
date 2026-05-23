/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, X, Mail, Linkedin, FileText, LayoutTemplate, ExternalLink, Moon, Sun } from 'lucide-react';
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
}>> = {
  en: [
  {
    school: 'University of St. Thomas',
    degree: 'B.S. Applied Mathematics',
    date: 'Expected May 2028',
    honor: 'Minor: Data Analytics',
    url: 'https://stthom.edu/',
  },
  { school: 'Lone Star College', degree: 'Honors A.S. / General', date: 'May 2025', honor: 'Summa Cum Laude | Distinguished Global Scholars', url: 'https://www.lonestar.edu/' },
  { school: 'Jersey Village High School', degree: 'High School Diploma', date: 'May 2023', honor: 'Cum Laude', url: 'https://jerseyvillage.cfisd.net/' },
  ],
  vi: [
    {
      school: 'Đại học St. Thomas',
      degree: 'Cử nhân khoa học ngành toán học ứng dụng',
      date: 'Dự kiến tốt nghiệp tháng 5 năm 2028',
      honor: 'Chuyên ngành phụ: Phân tích dữ liệu',
      url: 'https://stthom.edu/',
    },
    {
      school: 'Trường Cao đẳng Cộng đồng Lone Star',
      degree: 'Bằng phó học sĩ khoa học / đại cương',
      date: 'Tháng 5 năm 2025',
      honor: 'Danh hiệu xuất sắc tối cao (Summa Cum Laude) | Học giả toàn cầu xuất sắc (Distinguished Global Scholar)',
      url: 'https://www.lonestar.edu/',
    },
    {
      school: 'Trường Trung học Jersey Village',
      degree: 'Bằng tốt nghiệp trung học phổ thông',
      date: 'Tháng 5 năm 2023',
      honor: 'Danh hiệu xuất sắc (Cum Laude)',
      url: 'https://jerseyvillage.cfisd.net/',
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
  },
  vi: {
    connect: 'Kết nối',
    contact: 'Liên hệ',
    educationLabel: 'Học vấn',
    educationHeading: 'Nền tảng học thuật.',
    researchExperienceMenu: 'Kinh nghiệm nghiên cứu',
    conferencePresentationsMenu: 'Báo cáo hội nghị',
    personalProjectsMenu: 'Dự án cá nhân',
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
  },
} as const;

/* ─── Utility ─────────────────────────────────────────────────────── */
const getStaircaseOffset = (index: number, total: number) =>
  ((total - 1 - index) / Math.max(total - 1, 1)) * 50;

/* ─── Tab hero heading (editorial masthead) ─────────────────────── */
const TabHero = ({ children, index }: { children: React.ReactNode; index?: number }) => (
  <motion.div {...scrollReveal} className="text-center mb-16 pt-4">
    {index !== undefined && (
      <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-muted)] mb-4 uppercase">
        № {String(index).padStart(2, '0')}
      </div>
    )}
    <h2
      className="font-display italic text-[var(--ink)] leading-[0.92]"
      style={{
        fontSize: 'clamp(2.5rem, 7vw, 6rem)',
        fontWeight: 500,
        fontVariationSettings: '"opsz" 60',
        letterSpacing: '-0.01em',
      }}
    >
      {children}
    </h2>
    <div
      className="mx-auto mt-6 h-px w-12"
      style={{ backgroundColor: 'var(--sage)' }}
      aria-hidden
    />
  </motion.div>
);

/* ─── Project card (editorial bordered) ───────────────────────────── */
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
    <div
      className="relative h-full flex flex-col gap-3 p-5 transition-colors duration-300"
      style={{
        backgroundColor: 'transparent',
        border: '1px solid var(--rule)',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display italic text-[var(--ink)] text-base leading-snug" style={{ fontWeight: 600 }}>
          {title}
        </h3>
        <ExternalLink
          size={13}
          className="shrink-0 mt-1 text-[var(--ink-muted)] group-hover:text-[var(--sage)] transition-colors"
          aria-hidden
        />
      </div>
      <p className="font-serif text-[var(--ink-muted)] text-[13px] leading-relaxed flex-1">{blurb}</p>
      <span className="font-mono text-[10px] tracking-[0.18em] uppercase mt-auto pt-2 text-[var(--ink-muted)] group-hover:text-[var(--sage)] transition-colors">
        {visitLabel}
      </span>
    </div>
  </motion.a>
);

/* ─── Honor row (editorial ruled list) ───────────────────────────── */
const HonorCard = ({ title, org, date }: { title: string; org: string; date: string }) => (
  <motion.div
    variants={fadeIn}
    className="group flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-6 py-4"
    style={{ borderTop: '1px solid var(--rule)' }}
  >
    <div className="flex-1 min-w-0">
      <h3 className="font-display italic text-[var(--ink)] text-[15px] leading-snug" style={{ fontWeight: 500 }}>
        {title}
      </h3>
      <p className="font-serif text-[var(--ink-muted)] text-[13px] leading-snug mt-0.5">
        {org}
      </p>
    </div>
    <p className="font-mono text-[11px] text-[var(--ink-muted)] tabular-nums whitespace-nowrap sm:text-right">
      {date}
    </p>
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
    className="mb-10 pl-6 relative"
    style={{ borderLeft: '1px solid var(--rule)' }}
  >
    <div
      className="absolute w-1.5 h-1.5 -left-[3.5px] top-2"
      style={{ backgroundColor: 'var(--sage)' }}
      aria-hidden
    />

    <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2 gap-2">
      <div className="flex items-baseline gap-4 flex-wrap">
        <h3
          className="font-display italic text-[var(--ink)] text-xl leading-snug"
          style={{ fontWeight: 500 }}
        >
          {title}
        </h3>
        {documentData && onOpenDocument && (
          <button
            onClick={() => onOpenDocument(documentData)}
            className="group inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-muted)] hover:text-[var(--sage)] transition-colors py-1"
            title={uiStrings[language].viewPaper}
          >
            <FileText size={11} />
            <span className="relative">
              {uiStrings[language].viewPaper}
              <span
                className="absolute left-0 right-0 -bottom-0.5 h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
                style={{ backgroundColor: 'var(--sage)' }}
                aria-hidden
              />
            </span>
          </button>
        )}
        {posterData && onOpenDocument && (
          <button
            onClick={() => onOpenDocument(posterData)}
            className="group inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-muted)] hover:text-[var(--sage)] transition-colors py-1"
            title={uiStrings[language].viewPoster}
          >
            <LayoutTemplate size={11} />
            <span className="relative">
              {uiStrings[language].viewPoster}
              <span
                className="absolute left-0 right-0 -bottom-0.5 h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
                style={{ backgroundColor: 'var(--sage)' }}
                aria-hidden
              />
            </span>
          </button>
        )}
        {toolUrl && (
          <a
            href={toolUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-muted)] hover:text-[var(--sage)] transition-colors py-1"
          >
            <ExternalLink size={11} />
            <span className="relative">
              {uiStrings[language].liveTool}
              <span
                className="absolute left-0 right-0 -bottom-0.5 h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
                style={{ backgroundColor: 'var(--sage)' }}
                aria-hidden
              />
            </span>
          </a>
        )}
      </div>
      <span className="font-mono text-[11px] text-[var(--ink-muted)] tabular-nums whitespace-nowrap">
        {date}
      </span>
    </div>

    <div className="font-sans text-[11px] tracking-[0.16em] uppercase text-[var(--ink-muted)] mb-1">
      {role}
    </div>
    {location && (
      <div className="font-serif italic text-[12px] text-[var(--ink-muted)] mb-3">
        {location}
      </div>
    )}
    <div className="font-serif text-[var(--ink)] leading-relaxed text-[15px]">
      {children}
    </div>
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
    <div className="font-mono text-[11px] tracking-[0.18em] text-[var(--ink-muted)] uppercase mb-3">
      {label}
    </div>
    <h2
      className="font-display italic text-[var(--ink)] leading-[0.95]"
      style={{
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
        fontWeight: 500,
        fontVariationSettings: '"opsz" 48',
        letterSpacing: '-0.01em',
      }}
    >
      {heading}
    </h2>
    <div
      className={`${center ? 'mx-auto' : ''} mt-5 h-px w-12`}
      style={{ backgroundColor: 'var(--sage)' }}
      aria-hidden
    />
    {sub && (
      <p className={`mt-5 ${center ? 'mx-auto' : ''} text-[var(--ink-muted)] max-w-xl text-base font-serif leading-relaxed`}>{sub}</p>
    )}
  </motion.div>
);

/* ─── Staircase entry (editorial marginalia offset) ────────────── */
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
    className="mb-8 staircase-step group overflow-visible"
    style={{ paddingLeft: `${offset}%` }}
  >
    <div
      className="relative pl-6 pr-2 py-3 max-w-2xl overflow-visible"
      style={{ borderLeft: '1px solid var(--rule)' }}
    >
      <div className="font-mono text-[10px] tracking-[0.12em] text-[var(--ink-muted)] tabular-nums mb-2">
        {shortDate}
      </div>
      <h3
        className="font-display italic text-[var(--ink)] text-lg md:text-xl leading-normal"
        style={{ fontWeight: 500 }}
      >
        {title}
      </h3>
      <div className="font-sans text-[11px] tracking-[0.16em] uppercase text-[var(--ink-muted)] mt-1">
        {role}
      </div>
      {location && (
        <div className="font-serif italic text-[12px] text-[var(--ink-muted)]/85 mt-0.5">
          {location}
        </div>
      )}
      {children && (
        <div className="font-serif text-[14px] text-[var(--ink)] leading-relaxed mt-3">
          {children}
        </div>
      )}
    </div>
  </motion.div>
);

/* ─── Education entries (editorial bordered columns) ─────────────── */
const EducationCards = ({ language }: { language: Language }) => (
  <motion.div
    variants={staggerContainer}
    initial="initial"
    whileInView="animate"
    viewport={scrollViewport}
    className="grid grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto"
    style={{
      borderTop: '1px solid var(--rule)',
      borderLeft: '1px solid var(--rule)',
      borderRight: '1px solid var(--rule)',
    }}
  >
    {educationData[language].map((item, i) => (
      <motion.a
        key={`edu-${i}`}
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        variants={fadeIn}
        className={`group block p-6 md:p-8 transition-colors duration-300${
          i < educationData[language].length - 1 ? ' education-card-divider' : ''
        }`}
        style={{
          borderBottom: '1px solid var(--rule)',
        }}
      >
        <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-muted)] mb-3">
          № {String(i + 1).padStart(2, '0')}
        </div>
        <h4
          className="font-display italic text-[var(--ink)] text-xl leading-tight mb-2 group-hover:text-[var(--sage)] transition-colors"
          style={{ fontWeight: 500 }}
        >
          {item.school}
        </h4>
        <p className="font-serif italic text-[var(--ink-muted)] text-[14px] mb-3">
          {item.degree}
        </p>
        <div className="font-mono text-[11px] text-[var(--ink-muted)] mb-2 tabular-nums">
          {item.date}
        </div>
        <p className="font-serif text-[13px] text-[var(--ink)] leading-snug">
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

const navLinkClass = (active: boolean) =>
  `relative px-2 py-3 font-sans text-[11px] tracking-[0.18em] uppercase cursor-pointer whitespace-nowrap transition-colors duration-200 ${
    active
      ? 'text-[var(--ink)] after:absolute after:left-2 after:right-2 after:bottom-1.5 after:h-px after:bg-[var(--sage)]'
      : 'text-[var(--ink-muted)] hover:text-[var(--ink)] after:absolute after:left-2 after:right-2 after:bottom-1.5 after:h-px after:bg-[var(--sage)] after:origin-left after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200'
  }`;

const getSystemPrefersDark = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

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
  const [isDark, setIsDark] = useState(getSystemPrefersDark);
  const themeOverride = useRef<'light' | 'dark' | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [navResearchOpen, setNavResearchOpen] = useState(false);
  const navResearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [langHintVisible, setLangHintVisible] = useState(false);
  const [langHintDismissed, setLangHintDismissed] = useState(false);
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
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const syncWithSystem = (event: MediaQueryList | MediaQueryListEvent) => {
      if (themeOverride.current !== null) return;
      setIsDark(event.matches);
    };
    if (themeOverride.current === null) {
      setIsDark(mq.matches);
    }
    mq.addEventListener('change', syncWithSystem);
    return () => mq.removeEventListener('change', syncWithSystem);
  }, []);

  const toggleDarkMode = () => {
    setIsDark((prev) => {
      const next = !prev;
      themeOverride.current = next ? 'dark' : 'light';
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Show hints on every visit; auto-dismiss after 3 s.
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

  /* Masthead nav (no sliding indicator — underlines handle active/hover state) */

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

  const closeDocumentModal = useCallback(() => setActiveDocument(null), []);

  const navLinks = NAV_LINKS[language];
  const localizedName = language === 'vi' ? 'Võ Sơn Tùng' : 'TJ Vo';

  return (
    <div className="site-shell min-h-screen transition-colors duration-300">
      <DocumentModal
        isOpen={!!activeDocument}
        onClose={closeDocumentModal}
        document={activeDocument}
        language={language}
      />

      {/* ── Editorial masthead nav ─────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-colors duration-300"
        style={{
          backgroundColor: navBarSolid ? 'var(--paper)' : 'transparent',
          borderBottom: navBarSolid ? '1px solid var(--rule)' : '1px solid transparent',
        }}
      >
        {/* Desktop masthead */}
        <div className="hidden md:flex items-center justify-between gap-6 px-8 lg:px-12 h-14">
          <button
            type="button"
            onClick={() => switchTab('home')}
            className="group flex items-center cursor-pointer border-0 bg-transparent p-0"
            aria-label={uiStrings[language].ariaHome}
          >
            <BrandMark className="h-7" />
          </button>

          <div className="flex items-center gap-0">
            {navLinks.map(({ id, label }) =>
              id === 'research' ? (
                <div
                  key={id}
                  className="relative"
                  onMouseEnter={() => {
                    if (navResearchTimer.current) clearTimeout(navResearchTimer.current);
                    setNavResearchOpen(true);
                  }}
                  onMouseLeave={() => {
                    navResearchTimer.current = setTimeout(() => setNavResearchOpen(false), 120);
                  }}
                >
                  <button
                    onClick={() => switchTab(id)}
                    className={navLinkClass(activeTab === id)}
                  >
                    {label}
                  </button>
                  <AnimatePresence>
                    {navResearchOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.15 } }}
                        exit={{ opacity: 0, y: -4, transition: { duration: 0.1 } }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-60 overflow-hidden"
                        style={{
                          backgroundColor: 'var(--paper)',
                          border: '1px solid var(--rule)',
                          borderTop: 'none',
                        }}
                        onMouseEnter={() => {
                          if (navResearchTimer.current) clearTimeout(navResearchTimer.current);
                        }}
                        onMouseLeave={() => {
                          navResearchTimer.current = setTimeout(() => setNavResearchOpen(false), 120);
                        }}
                      >
                        <button
                          onClick={() => switchTab('research')}
                          className="block w-full text-left px-5 py-3 font-sans text-[11px] tracking-[0.16em] uppercase text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--paper-2)] transition-colors"
                        >
                          {uiStrings[language].researchExperienceMenu}
                        </button>
                        <div className="hairline-t mx-5" />
                        <button
                          onClick={() => switchTab('research', 'research-presentations')}
                          className="block w-full text-left px-5 py-3 font-sans text-[11px] tracking-[0.16em] uppercase text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--paper-2)] transition-colors"
                        >
                          {uiStrings[language].conferencePresentationsMenu}
                        </button>
                        <div className="hairline-t mx-5" />
                        <button
                          onClick={() => switchTab('research', 'research-projects')}
                          className="block w-full text-left px-5 py-3 font-sans text-[11px] tracking-[0.16em] uppercase text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--paper-2)] transition-colors"
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
                  onClick={() => switchTab(id)}
                  className={navLinkClass(activeTab === id)}
                >
                  {label}
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-5">
            <div className="relative">
              <button
                onClick={handleLanguageToggle}
                className="relative font-mono text-[11px] tracking-[0.12em] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors py-2"
                aria-label={uiStrings[language].ariaToggleLanguage}
              >
                <span
                  style={{
                    display: 'inline-block',
                    transition: 'transform 0.19s cubic-bezier(0.4,0,0.2,1), opacity 0.19s ease',
                    transform: langTransition ? 'translateY(-4px)' : 'translateY(0)',
                    opacity: langTransition ? 0 : 1,
                  }}
                >
                  {language === 'en' ? 'EN / VI' : 'VI / EN'}
                </span>
                {showLangHint && (
                  <span
                    className="absolute -top-0.5 -right-2 w-1.5 h-1.5"
                    style={{ backgroundColor: 'var(--sage)' }}
                    aria-hidden
                  />
                )}
              </button>
              <AnimatePresence>
                {showLangHint && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
                    exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
                    className="absolute top-full right-0 mt-2 w-64 overflow-hidden"
                    style={{
                      backgroundColor: 'var(--paper)',
                      border: '1px solid var(--rule)',
                    }}
                    role="status"
                  >
                    <button
                      type="button"
                      onClick={handleLanguageToggle}
                      className="w-full text-left px-4 pt-3 pb-2.5 font-serif italic text-[13px] text-[var(--ink)] hover:bg-[var(--paper-2)] transition-colors"
                    >
                      <span className="pr-5">{langHintText}</span>
                    </button>
                    <button
                      type="button"
                      onClick={dismissLangHint}
                      aria-label={uiStrings[language].ariaDismiss}
                      className="absolute top-2 right-2 p-1 text-[var(--ink-muted)] hover:text-[var(--ink)]"
                    >
                      <X size={11} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <a
              href="https://www.linkedin.com/in/tung-vo-4728b7235/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-sans text-[11px] tracking-[0.18em] uppercase text-[var(--ink)] hover:text-[var(--sage)] transition-colors flex items-center gap-1.5 whitespace-nowrap py-2"
            >
              <Linkedin size={12} />
              {uiStrings[language].connect}
            </a>
            <button
              onClick={toggleDarkMode}
              className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors p-2 -mr-2"
              aria-label={uiStrings[language].ariaToggleDarkMode}
            >
              {isDark ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </div>

        {/* Mobile masthead */}
        <div className="flex md:hidden items-center justify-between gap-2 px-5 h-14">
          <button
            onClick={() => switchTab('home')}
            className="flex items-center gap-2 cursor-pointer border-0 bg-transparent p-0"
            aria-label={uiStrings[language].ariaHome}
          >
            <BrandMark className="h-6" />
            <span className="font-display italic text-[var(--ink)] text-sm" style={{ fontWeight: 600 }}>
              {localizedName}
            </span>
          </button>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                className="relative font-mono text-[11px] tracking-[0.12em] text-[var(--ink-muted)] p-2 -mx-2"
                onClick={handleLanguageToggle}
                aria-label={uiStrings[language].ariaToggleLanguage}
              >
                <span
                  style={{
                    display: 'inline-block',
                    transition: 'transform 0.19s cubic-bezier(0.4,0,0.2,1), opacity 0.19s ease',
                    transform: langTransition ? 'translateY(-4px)' : 'translateY(0)',
                    opacity: langTransition ? 0 : 1,
                  }}
                >
                  {language === 'en' ? 'EN/VI' : 'VI/EN'}
                </span>
                {showLangHint && (
                  <span
                    className="absolute top-1 right-0 w-1.5 h-1.5"
                    style={{ backgroundColor: 'var(--sage)' }}
                    aria-hidden
                  />
                )}
              </button>
              <AnimatePresence>
                {showLangHint && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
                    exit={{ opacity: 0, y: -4, transition: { duration: 0.15 } }}
                    className="absolute top-full right-0 mt-2 w-60 z-50 overflow-hidden"
                    style={{
                      backgroundColor: 'var(--paper)',
                      border: '1px solid var(--rule)',
                    }}
                    role="status"
                  >
                    <button
                      type="button"
                      onClick={handleLanguageToggle}
                      className="w-full text-left px-4 pt-3 pb-2.5 font-serif italic text-[13px] text-[var(--ink)] hover:bg-[var(--paper-2)] transition-colors"
                    >
                      <span className="pr-5">{langHintText}</span>
                    </button>
                    <button
                      type="button"
                      onClick={dismissLangHint}
                      aria-label={uiStrings[language].ariaDismiss}
                      className="absolute top-2 right-2 p-1 text-[var(--ink-muted)] hover:text-[var(--ink)]"
                    >
                      <X size={11} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              className="text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors p-2 -mx-1"
              onClick={toggleDarkMode}
              aria-label={uiStrings[language].ariaToggleDarkMode}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              className="text-[var(--ink)] p-2 -mr-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? (language === 'vi' ? 'Đóng menu' : 'Close menu') : (language === 'vi' ? 'Mở menu' : 'Open menu')}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile fullscreen menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8"
          style={{ backgroundColor: 'var(--paper)' }}
        >
          {navLinks.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => switchTab(id)}
              className="font-display italic text-4xl text-[var(--ink)] hover:text-[var(--sage)] transition-colors"
              style={{ fontWeight: 500 }}
            >
              {label}
            </button>
          ))}
          <a
            href="mailto:vo.tung@stthom.edu"
            className="mt-4 px-8 py-3 font-sans text-[11px] tracking-[0.2em] uppercase text-[var(--ink)] hover:text-[var(--paper)] hover:bg-[var(--ink)] transition-colors"
            style={{ border: '1px solid var(--rule)' }}
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
            <header className="relative min-h-screen pb-28 md:pb-36 flex items-center justify-center overflow-hidden">
              <div className="relative z-10 container mx-auto px-6 max-w-4xl">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.32, ease: cubicEase, delay: 0.1 }}
                  className="text-center"
                >
                  <div className="font-mono text-[11px] tracking-[0.22em] text-[var(--ink-muted)] uppercase mb-6">
                    Portfolio · Tung (TJ) Vo
                  </div>
                  <h1
                    className="font-display italic text-[var(--ink)] leading-[0.95] mb-8 md:mb-10"
                    style={{
                      fontSize: 'clamp(3rem, 9vw, 7.5rem)',
                      fontWeight: 500,
                      fontVariationSettings: '"opsz" 60',
                      letterSpacing: '-0.015em',
                    }}
                  >
                    {language === 'vi' ? 'Tôi là Võ Sơn Tùng.' : "Hi. I'm TJ."}
                  </h1>
                </motion.div>

                <HeroBioWeather language={language} />

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.32, ease: cubicEase, delay: 0.35 }}
                  className="flex flex-col sm:flex-row justify-center items-center gap-3 -mt-1"
                >
                  <a
                    href="mailto:vo.tung@stthom.edu"
                    className="group inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.1em] text-[var(--ink)] transition-colors"
                  >
                    <Mail size={14} className="text-[var(--sage)]" />
                    <span className="relative">
                      vo.tung@stthom.edu
                      <span
                        className="absolute left-0 right-0 -bottom-0.5 h-px origin-left scale-x-100 transition-transform duration-300"
                        style={{ backgroundColor: 'var(--sage)' }}
                        aria-hidden
                      />
                    </span>
                  </a>
                </motion.div>

                {/* Language availability banner — visible in hero until user switches or dismisses */}
                <AnimatePresence>
                  {!langHintDismissed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: 1.0, duration: 0.4 } }}
                      exit={{ opacity: 0, transition: { duration: 0.2 } }}
                      className="mt-8 flex justify-center"
                    >
                      <div className="flex items-center gap-3 max-w-xl">
                        <span
                          className="w-1.5 h-1.5 flex-shrink-0"
                          style={{ backgroundColor: 'var(--sage)' }}
                          aria-hidden
                        />
                        <button
                          onClick={handleLanguageToggle}
                          className="font-serif italic text-[13px] text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
                          aria-label={language === 'en' ? uiStrings.en.ariaSwitchToVietnamese : uiStrings.vi.ariaSwitchToEnglish}
                        >
                          {language === 'en'
                            ? uiStrings.en.langHintEn
                            : uiStrings.vi.langHintVi}
                        </button>
                        <button
                          onClick={dismissLangHint}
                          className="p-1 text-[var(--ink-muted)]/60 hover:text-[var(--ink)] transition-colors flex-shrink-0"
                          aria-label={uiStrings[language].ariaDismissLangHint}
                        >
                          <X size={11} />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </header>
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
            <TabHero index={1}>{language === 'vi' ? 'Học vấn.' : 'Education.'}</TabHero>
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
            <TabHero index={2}>{language === 'vi' ? 'Nghiên cứu.' : 'Research.'}</TabHero>

            {/* Research experience */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              {/* Left column */}
              <div>
                <ExperienceItem
                  language={language}
                  title={language === 'vi' ? 'Đại học Rice' : 'Rice University'}
                  role={
                    language === 'vi'
                      ? 'Trợ lý nghiên cứu bậc đại học'
                      : 'Undergraduate Research Assistant'
                  }
                  date={language === 'vi' ? 'Hè 2026 – Hiện tại' : 'Summer 2026 – Current'}
                  location={
                    language === 'vi'
                      ? 'Trưởng dự án: Saber Dinpazhouh (Nghiên cứu sinh tiến sĩ) | Giáo sư hướng dẫn: Tiến sĩ Illya Hicks'
                      : 'Project Lead: Saber Dinpazhouh (PhD Candidate) | Supervisor: Dr. Illya Hicks'
                  }
                >
                  {language === 'vi'
                    ? 'Nghiên cứu về bài toán định tuyến qubit (qubit routing) trong tối ưu hóa mạch lượng tử. Xây dựng các mô hình quy hoạch nguyên (integer programming) được giải bằng phần mềm Gurobi và đối chiếu các lời giải tối ưu chính xác với thuật toán SABRE (thuật toán tìm kiếm heuristic hai chiều dựa trên cổng SWAP).'
                    : 'On the qubit routing problem in quantum circuit optimization. Developing integer programming formulations solved with Gurobi and benchmarking exact solutions against the SABRE heuristic.'}
                </ExperienceItem>
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
              <div
                className="max-w-3xl mx-auto"
                style={{ borderTop: '1px solid var(--rule)' }}
              >
                {presentationsData[language].map((p, i) => (
                  <motion.div
                    key={i}
                    {...scrollReveal}
                    className="flex gap-5 items-baseline py-5"
                    style={{ borderBottom: '1px solid var(--rule)' }}
                  >
                    <span className="flex-shrink-0 font-mono text-[11px] tabular-nums text-[var(--ink-muted)] w-6">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h4
                          className="font-display italic text-[var(--ink)] leading-snug text-[16px]"
                          style={{ fontWeight: 500 }}
                        >
                          {p.title}
                        </h4>
                        {p.poster && (
                          <button
                            onClick={() => setActiveDocument(p.poster!)}
                            className="group flex-shrink-0 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--ink-muted)] hover:text-[var(--sage)] transition-colors py-1"
                          >
                            <LayoutTemplate size={11} />
                            <span className="relative">
                              {uiStrings[language].viewPoster}
                              <span
                                className="absolute left-0 right-0 -bottom-0.5 h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
                                style={{ backgroundColor: 'var(--sage)' }}
                                aria-hidden
                              />
                            </span>
                          </button>
                        )}
                      </div>
                      <p className="font-serif text-[13px] text-[var(--ink-muted)] mt-1">
                        {p.venue}
                        <span className="mx-1.5 text-[var(--sage)]">·</span>
                        {p.location}
                        <span className="mx-1.5 text-[var(--ink-muted)]/40">/</span>
                        <span className="font-mono text-[11px]">{p.year}</span>
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
                className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4"
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
            <TabHero index={3}>{language === 'vi' ? 'Lãnh đạo.' : 'Leadership.'}</TabHero>
            <div className="overflow-x-clip overflow-y-visible">
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
            <TabHero index={4}>{language === 'vi' ? 'Kinh nghiệm.' : 'Work.'}</TabHero>
            <div className="overflow-x-clip overflow-y-visible">
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
            <TabHero index={5}>{language === 'vi' ? 'Thành tích.' : 'Honors.'}</TabHero>
            <motion.div
              {...scrollReveal}
              className="mb-10 text-center font-serif italic text-[var(--ink-muted)] text-base max-w-xl mx-auto"
            >
              {uiStrings[language].honorsSub}
            </motion.div>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={scrollViewport}
              className="max-w-3xl mx-auto"
              style={{ borderBottom: '1px solid var(--rule)' }}
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

            <motion.div {...scrollReveal} className="mt-20 max-w-3xl mx-auto text-center">
              <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-[var(--ink-muted)] mb-4">
                {uiStrings[language].certHeading}
              </div>
              <div
                className="mx-auto mb-8 h-px w-12"
                style={{ backgroundColor: 'var(--sage)' }}
                aria-hidden
              />
              <p className="font-serif text-[15px] leading-loose text-[var(--ink)]">
                {certificationsData[language].map((cert, i) => (
                  <React.Fragment key={`cert-${i}`}>
                    <span className="italic">{cert}</span>
                    {i < certificationsData[language].length - 1 && (
                      <span className="mx-3 text-[var(--sage)]">·</span>
                    )}
                  </React.Fragment>
                ))}
              </p>
            </motion.div>
          </motion.main>
        )}
      </AnimatePresence>

      {/* ── Footer (editorial masthead colophon) ───────────── */}
      <footer
        className="mt-24 py-9 px-6 md:px-12"
        style={{ borderTop: '1px solid var(--rule)' }}
      >
        <motion.div {...scrollReveal}>
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-baseline gap-5">
            <div>
              <div
                className="font-display italic text-[var(--ink)] text-2xl mb-1"
                style={{ fontWeight: 500 }}
              >
                {uiStrings[language].fullName}
              </div>
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--ink-muted)]">
                Houston, Texas
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <div className="flex gap-5">
                <a
                  href="mailto:vo.tung@stthom.edu"
                  className="group inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
                >
                  <Mail size={12} />
                  <span className="relative">
                    Email
                    <span
                      className="absolute left-0 right-0 -bottom-0.5 h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
                      style={{ backgroundColor: 'var(--sage)' }}
                      aria-hidden
                    />
                  </span>
                </a>
                <a
                  href="https://www.linkedin.com/in/tung-vo-4728b7235/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors"
                >
                  <Linkedin size={12} />
                  <span className="relative">
                    LinkedIn
                    <span
                      className="absolute left-0 right-0 -bottom-0.5 h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
                      style={{ backgroundColor: 'var(--sage)' }}
                      aria-hidden
                    />
                  </span>
                </a>
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
