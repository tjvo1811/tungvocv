
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { HeroScene, GlobalScene } from './components/QuantumScene';
import { GraphTheoryDiagram, DataPipelineDiagram } from './components/Diagrams';
import { ArrowDown, Menu, X, Mail, Linkedin, FileText } from 'lucide-react';
import { govtPaper, ricePoster, histPaper, nmunPaper, ResearchDocument } from './data/researchData';
import { DocumentModal } from './components/DocumentModal';

const HonorCard = ({ title, org, date, delay }: { title: string, org: string, date: string, delay: string }) => {
    return (
        <div className="flex flex-col group animate-fade-in-up items-center p-6 bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 w-full hover:border-nobel-gold/50" style={{ animationDelay: delay }}>
            <h3 className="font-serif text-lg text-stone-900 text-center mb-2 leading-tight">{title}</h3>
            <div className="w-8 h-0.5 bg-nobel-gold mb-3 opacity-60"></div>
            <p className="text-xs text-stone-500 font-bold uppercase tracking-widest text-center">{org}</p>
            <p className="text-xs text-stone-400 mt-2 font-serif italic">{date}</p>
        </div>
    );
};

const ExperienceItem = ({
    title,
    role,
    date,
    children,
    location,
    documentData,
    onOpenDocument
}: {
    title: string,
    role: string,
    date: string,
    children: React.ReactNode,
    location?: string,
    documentData?: ResearchDocument,
    onOpenDocument?: (doc: ResearchDocument) => void
}) => (
    <div className="mb-12 border-l-2 border-stone-200 pl-6 relative">
        <div className="absolute w-3 h-3 bg-nobel-gold rounded-full -left-[7px] top-1.5"></div>
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
            <div className="flex items-center gap-3">
                <h3 className="text-xl font-serif text-stone-900 font-medium">{title}</h3>
                {documentData && onOpenDocument && (
                    <button
                        onClick={() => onOpenDocument(documentData)}
                        className="flex items-center gap-1.5 px-2 py-1 bg-white border border-nobel-gold/30 rounded-md text-nobel-gold hover:bg-nobel-gold hover:text-white transition-all duration-300 text-xs uppercase font-bold tracking-wider shadow-sm group"
                        title="View Paper/Poster"
                    >
                        <FileText size={14} className="group-hover:scale-110 transition-transform" />
                        <span className="hidden sm:inline">View {documentData.type}</span>
                    </button>
                )}
            </div>
            <span className="text-sm text-stone-500 font-mono whitespace-nowrap ml-4">{date}</span>
        </div>
        <div className="text-sm font-bold text-stone-600 uppercase tracking-wider mb-1">{role}</div>
        {location && <div className="text-xs text-stone-400 mb-3 italic">{location}</div>}
        <div className="text-stone-600 leading-relaxed text-lg">
            {children}
        </div>
    </div>
);

const App: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [activeDocument, setActiveDocument] = useState<ResearchDocument | null>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        setMenuOpen(false);
        const element = document.getElementById(id);
        if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    const handleOpenDocument = (doc: ResearchDocument) => {
        setActiveDocument(doc);
    };

    return (
        <div className="min-h-screen bg-[#F9F8F4] text-stone-800 selection:bg-nobel-gold selection:text-white">

            <DocumentModal
                isOpen={!!activeDocument}
                onClose={() => setActiveDocument(null)}
                document={activeDocument}
            />

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#F9F8F4]/95 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-8 h-8 bg-nobel-gold rounded-full flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm pb-1">T</div>
                        <span className={`font-serif font-bold text-lg tracking-wide transition-opacity ${scrolled ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
                            TUNG VO
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-6 text-sm font-medium tracking-wide text-stone-600">
                        <a href="#about" onClick={scrollToSection('about')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">About</a>
                        <a href="#research" onClick={scrollToSection('research')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">Research</a>
                        <a href="#leadership" onClick={scrollToSection('leadership')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">Leadership</a>
                        <a href="#work" onClick={scrollToSection('work')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">Work</a>
                        <a href="#honors" onClick={scrollToSection('honors')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">Honors</a>
                        <a
                            href="https://www.linkedin.com/in/tung-vo-4728b7235/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-colors shadow-sm cursor-pointer flex items-center gap-2"
                        >
                            <Linkedin size={14} /> Connect
                        </a>
                    </div>

                    <button className="md:hidden text-stone-900 p-2" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="fixed inset-0 z-40 bg-[#F9F8F4] flex flex-col items-center justify-center gap-8 text-xl font-serif animate-fade-in">
                    <a href="#about" onClick={scrollToSection('about')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">About</a>
                    <a href="#research" onClick={scrollToSection('research')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">Research</a>
                    <a href="#leadership" onClick={scrollToSection('leadership')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">Leadership</a>
                    <a href="#work" onClick={scrollToSection('work')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">Work</a>
                    <a href="#honors" onClick={scrollToSection('honors')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">Honors</a>
                    <a href="mailto:vo.tung@stthom.edu" className="px-6 py-3 bg-stone-900 text-white rounded-full shadow-lg cursor-pointer">Contact Me</a>
                </div>
            )}

            {/* Hero Section */}
            <header className="relative h-screen flex items-center justify-center overflow-hidden">
                <HeroScene />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(249,248,244,0.92)_0%,rgba(249,248,244,0.7)_50%,rgba(249,248,244,0.4)_100%)]" />

                <div className="relative z-10 container mx-auto px-6 text-center">
                    <div className="inline-block mb-4 px-3 py-1 border border-nobel-gold text-nobel-gold text-xs tracking-[0.2em] uppercase font-bold rounded-full backdrop-blur-sm bg-white/30">
                        Portfolio
                    </div>
                    <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium leading-tight md:leading-[1.1] mb-6 text-stone-900 drop-shadow-sm">
                        Tung (TJ) Vo <br />
                        <span className="italic font-normal text-stone-600 text-2xl md:text-4xl block mt-4">Applied Mathematics Student</span>
                    </h1>

                    <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-sm font-medium">
                        <a href="mailto:vo.tung@stthom.edu" className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-colors">
                            <Mail size={16} /> vo.tung@stthom.edu
                        </a>
                        <div className="px-6 py-3 border border-stone-300 rounded-full text-stone-600 bg-white/50">
                            Houston, Texas
                        </div>
                    </div>

                    <div className="absolute bottom-10 left-0 right-0 flex justify-center animate-bounce">
                        <a href="#about" onClick={scrollToSection('about')} className="text-stone-400 hover:text-stone-900 transition-colors cursor-pointer">
                            <ArrowDown size={24} />
                        </a>
                    </div>
                </div>
            </header>

            <main>
                {/* Education Section */}
                <section id="about" className="py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <div className="inline-block mb-3 text-xs font-bold tracking-widest text-stone-500 uppercase">Education</div>
                            <h2 className="font-serif text-4xl leading-tight text-stone-900">Academic Foundation</h2>
                            <div className="w-16 h-1 bg-nobel-gold mx-auto mt-6"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <div className="p-6 bg-[#F9F8F4] rounded-xl border border-stone-200 text-center hover:shadow-md transition-shadow">
                                <h4 className="font-bold text-stone-900 text-lg mb-2">University of St. Thomas</h4>
                                <p className="text-stone-600 font-serif italic mb-2">B.S. Applied Mathematics</p>
                                <p className="text-sm text-stone-500">Expected May 2027</p>
                                <p className="text-xs text-stone-400 mt-2 uppercase tracking-wide">Minor: Data Analytics</p>
                            </div>
                            <div className="p-6 bg-[#F9F8F4] rounded-xl border border-stone-200 text-center hover:shadow-md transition-shadow">
                                <h4 className="font-bold text-stone-900 text-lg mb-2">Lone Star College</h4>
                                <p className="text-stone-600 font-serif italic mb-2">Honors A.S. / General</p>
                                <p className="text-sm text-stone-500">May 2025</p>
                                <p className="text-xs text-stone-400 mt-2 uppercase tracking-wide">Summa Cum Laude</p>
                            </div>
                            <div className="p-6 bg-[#F9F8F4] rounded-xl border border-stone-200 text-center hover:shadow-md transition-shadow">
                                <h4 className="font-bold text-stone-900 text-lg mb-2">Jersey Village High School</h4>
                                <p className="text-stone-600 font-serif italic mb-2">High School Diploma</p>
                                <p className="text-sm text-stone-500">May 2023</p>
                                <p className="text-xs text-stone-400 mt-2 uppercase tracking-wide">Cum Laude</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Research Experience */}
                <section id="research" className="py-24 bg-[#F5F4F0] border-t border-stone-200">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-stone-600 text-xs font-bold tracking-widest uppercase rounded-full mb-6 border border-stone-200 shadow-sm">
                                    Research Focus
                                </div>
                                <h2 className="font-serif text-4xl md:text-5xl mb-6 text-stone-900">Graph Theory &<br />Network Dynamics</h2>
                                <ExperienceItem
                                    title="University of St. Thomas"
                                    role="Undergraduate Researcher"
                                    date="Fall 2025 (Upcoming)"
                                    location="Supervisor: Dr. Mary Flagg"
                                >
                                    Focusing on graph theory topics such as competing zero forcing sets. Conducting theoretical analysis and computational modeling of vertex connectivity across graph families to explore network dynamics and efficiency.
                                </ExperienceItem>
                                <div className="hidden lg:block">
                                    <GraphTheoryDiagram />
                                    <p className="text-xs text-center text-stone-500 mt-2">Interactive: Click nodes to explore connectivity</p>
                                </div>
                            </div>

                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-stone-600 text-xs font-bold tracking-widest uppercase rounded-full mb-6 border border-stone-200 shadow-sm">
                                    Data Science
                                </div>
                                <h2 className="font-serif text-4xl md:text-5xl mb-6 text-stone-900">Sustainability &<br />Data Analytics</h2>
                                <ExperienceItem
                                    title="Rice University"
                                    role="Undergraduate Researcher"
                                    date="Spring 2025"
                                    location="Supervisors: Dr. Carrie Masiello, Dr. Risa Myers, Dr. Canek Phillips"
                                    documentData={ricePoster}
                                    onOpenDocument={handleOpenDocument}
                                >
                                    Exploring the vast world of Data Science within the lens of sustainability. Using scientific methods, programming skills, and mathematics to extract insight regarding food webs, data visualization, and the ethics of data centers.
                                </ExperienceItem>

                                <div className="my-8">
                                    <DataPipelineDiagram />
                                </div>



                                <ExperienceItem
                                    title="Lone Star College Honors College"
                                    role="Researcher - Vietnam War Analysis"
                                    date="Fall 2024"
                                    location="Supervisor: Dr. Kelly Phillips"
                                    documentData={histPaper}
                                    onOpenDocument={handleOpenDocument}
                                >
                                    Explored differences in recruitment tactics and desertion motivations among U.S. and Viet Cong soldiers. Aimed to understand the relationship between recruitment tactics and wartime desertion rates.
                                </ExperienceItem>

                                <ExperienceItem
                                    title="National Model United Nations (NMUN)"
                                    role="Delegate & Researcher"
                                    date="Spring 2024"
                                    location="New York, NY | Supervisors: Dr. Tiffee & Prof. Garcia"
                                    documentData={nmunPaper}
                                    onOpenDocument={handleOpenDocument}
                                >
                                    Conducted an autoethnographic study on intercultural communication and leadership dynamics at the NMUN conference. Analyzed the effectiveness of relational leadership theory and public speaking strategies in a high-stakes diplomatic simulation, resulting in a 'Best in Committee' award.
                                </ExperienceItem>

                                <ExperienceItem
                                    title="Lone Star College Honors College"
                                    role="Researcher - Air Pollution"
                                    date="Spring 2024"
                                    location="Supervisor: Dr. Dana Van De Walker"
                                    documentData={govtPaper}
                                    onOpenDocument={handleOpenDocument}
                                >
                                    Compared and analyzed major air polluters (US and Chad) to identify factors decreasing life expectancy. Investigated correlations between air pollution levels and public health outcomes.
                                </ExperienceItem>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Leadership Development */}
                <section id="leadership" className="py-24 bg-white border-t border-stone-200">
                    <div className="container mx-auto px-6">
                        <div className="flex flex-col md:flex-row gap-12 mb-16">
                            <div className="md:w-1/3">
                                <div className="inline-block mb-3 text-xs font-bold tracking-widest text-stone-500 uppercase">Impact</div>
                                <h2 className="font-serif text-4xl mb-6 text-stone-900">Leadership Development</h2>
                                <div className="aspect-[4/5] bg-stone-900 rounded-xl overflow-hidden relative border border-stone-800 shadow-2xl sticky top-24">
                                    <GlobalScene />
                                    <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                                        <div className="text-white font-serif text-2xl mb-2">Global Vision</div>
                                        <p className="text-stone-400 text-sm">Cultivating ethical leadership and cultural competency on an international stage.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="md:w-2/3">
                                <ExperienceItem
                                    title="Community, Action, and Social Entrepreneurship"
                                    role="Finalist"
                                    date="Summer 2025"
                                    location="Amideast Education Abroad Connect"
                                >
                                    An 8-day guided program in Tunisia. Selected finalists will be introduced to the world of civil society organizations in and around Tunis through daily presentations, panel discussions, engagement with local peers, tours, and community service. Additionally interact with leading regional organizations and community leaders on topics of civic engagement, sustainability, identity, gender, labor, and other critical global justice issues through Tunisian and North African lenses.
                                </ExperienceItem>

                                <ExperienceItem
                                    title="Honors College Student Advisory Board"
                                    role="Campus Representative"
                                    date="Fall 2024 – Spring 2025"
                                    location="Lone Star College Houston-North"
                                >
                                    Meet with the Associate Vice Chancellor of Honors and International Education biannually as a campus representative. Collaborating with other campus representatives to contribute student perspectives on the Honors College programming, providing recommendations and feedback regarding system-wide student activities.
                                </ExperienceItem>

                                <ExperienceItem
                                    title="Honors and International Education Emissary"
                                    role="System Liaison Emeritus"
                                    date="Spring 2025"
                                    location="Lone Star College"
                                >
                                    As an Emeritus, responsible for collaborating with the current System Liaison Emissary and mentoring them. Additionally, assisting in promoting all related programs within The Honors College and all programs within the International Education branch.
                                </ExperienceItem>

                                <ExperienceItem
                                    title="Honors and International Education Emissary"
                                    role="System Liaison"
                                    date="Fall 2024"
                                    location="Lone Star College"
                                >
                                    Responsible for promoting The Honors College throughout the semester, collaborating with other campus liaisons for system-wide events or opportunities. Additionally responsible for promoting the Rice University Take Flight program, the National Model United Nations team, and scholarships.
                                </ExperienceItem>

                                <ExperienceItem
                                    title="Global Leadership Program"
                                    role="Member"
                                    date="Fall 2024 – Spring 2025"
                                    location="Lone Star College"
                                >
                                    Cultivating ethical, inclusive leadership skills in a global context. Gaining hands-on exposure to international diplomacy and cultural engagement through immersive experiences such as global leadership training and conference participation and in partnership with local and national organizations.
                                </ExperienceItem>

                                <ExperienceItem
                                    title="Distinguished Global Scholar"
                                    role="Member"
                                    date="Fall 2024 – Spring 2025"
                                    location="Lone Star College"
                                >
                                    In a competitive selection process with approximately 100 applicants, I was one of eight cohorts of academically talented students selected. As part of my commitment to the program and my interest in developing cultural competency, my coursework contains International Study (IS) designated classes. These IS classes add components of an international scope to the curriculum.
                                </ExperienceItem>

                                <ExperienceItem
                                    title="Texas Boys State"
                                    role="Press Team Member and Stateman"
                                    date="Summer 2022"
                                    location="The American Legion"
                                >
                                    In a nominated competitive selection process in a class of 800 students, I was one of two students selected to represent Jersey Village High School at Texas Boys State. Responsible for attending Texas Boys State’s mock House of Representative meetings and conceptualized campaigns for social media platforms. Additionally, composing website articles on current events happening within the House of Representatives.
                                </ExperienceItem>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Work Experience */}
                <section id="work" className="py-24 bg-[#F5F4F0] border-t border-stone-200">
                    <div className="container mx-auto px-6 max-w-4xl">
                        <div className="text-center mb-16">
                            <div className="inline-block mb-3 text-xs font-bold tracking-widest text-stone-500 uppercase">Professional</div>
                            <h2 className="font-serif text-3xl md:text-5xl text-stone-900">Work Experience</h2>
                        </div>

                        <ExperienceItem
                            title="Geospace Technology"
                            role="Electro-Mechanical Assembler"
                            date="June 2025 – Present"
                            location="Houston, Texas"
                        >
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Operate coiling machinery to assemble water cable, troubleshoot minor mechanical issues.</li>
                                <li>Enter coil data into systems and follow electrical schematics to ensure correct cable builds.</li>
                                <li>Maintain clean, safe workstation and follow safety protocols.</li>
                            </ul>
                        </ExperienceItem>

                        <ExperienceItem
                            title="Lone Star College – CyFair"
                            role="College Relations Intern"
                            date="March 2024 – May 2025"
                            location="Cypress, Texas"
                        >
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Drafting/Planning events throughout campus.</li>
                                <li>Coordinate/Manage Social Media platforms and posts.</li>
                                <li>Conceptualized Social Media Campaign for (X, Instagram, Facebook).</li>
                            </ul>
                        </ExperienceItem>

                        <ExperienceItem
                            title="East Aldine BakerRipley"
                            role="Front Desk Volunteer (Unpaid)"
                            date="November 2024 – May 2025"
                            location="Aldine, Texas"
                        >
                            <ul className="list-disc pl-5 space-y-2">
                                <li>Answer incoming calls and route inquiries appropriately.</li>
                                <li>Greet residents and visitors, providing a friendly and welcoming environment.</li>
                                <li>Assist with basic administrative tasks, ensuring smooth front desk operations.</li>
                            </ul>
                        </ExperienceItem>
                    </div>
                </section>

                {/* Honors & Awards */}
                <section id="honors" className="py-24 bg-white border-t border-stone-300">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <div className="inline-block mb-3 text-xs font-bold tracking-widest text-stone-500 uppercase">Recognition</div>
                            <h2 className="font-serif text-3xl md:text-5xl mb-4 text-stone-900">Honors & Awards</h2>
                            <p className="text-stone-500 max-w-2xl mx-auto">Selected competitive accomplishments and scholarships.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <HonorCard
                                title="Monaghan Excellence Scholarship"
                                org="University of St. Thomas"
                                date="Fall 2025 - Spring 2027"
                                delay="0s"
                            />
                            <HonorCard
                                title="Distinguished Global Scholar"
                                org="Lone Star College"
                                date="Fall 2024 - Spring 2025"
                                delay="0.1s"
                            />
                            <HonorCard
                                title="Best In Committee Award"
                                org="National Model United Nations, NY"
                                date="2024"
                                delay="0.2s"
                            />
                            <HonorCard
                                title="Outstanding Delegation Award"
                                org="National Model United Nations, NY"
                                date="2024"
                                delay="0.3s"
                            />
                            <HonorCard
                                title="Global Scholar Award"
                                org="Lone Star College Houston-North"
                                date="Fall 2023 – Spring 2025"
                                delay="0.4s"
                            />
                            <HonorCard
                                title="President’s List"
                                org="Lone Star College"
                                date="2023 - 2025"
                                delay="0.5s"
                            />
                        </div>

                        <div className="mt-16 text-center">
                            <h3 className="font-serif text-2xl mb-6">Certifications & Memberships</h3>
                            <div className="flex flex-wrap justify-center gap-4">
                                <span className="px-4 py-2 bg-white border border-stone-200 rounded-full text-sm text-stone-600 shadow-sm">Micro-Credential: Environmental Data Science (Rice)</span>
                                <span className="px-4 py-2 bg-white border border-stone-200 rounded-full text-sm text-stone-600 shadow-sm">Google Data Analytics (Coursera)</span>
                                <span className="px-4 py-2 bg-white border border-stone-200 rounded-full text-sm text-stone-600 shadow-sm">OSHA 10</span>
                                <span className="px-4 py-2 bg-white border border-stone-200 rounded-full text-sm text-stone-600 shadow-sm">Phi Theta Kappa Member</span>
                                <span className="px-4 py-2 bg-white border border-stone-200 rounded-full text-sm text-stone-600 shadow-sm">Rice Take Flight Program</span>
                                <span className="px-4 py-2 bg-white border border-stone-200 rounded-full text-sm text-stone-600 shadow-sm">Global Scholar</span>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            <footer className="bg-stone-900 text-stone-400 py-16">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <div className="text-white font-serif font-bold text-2xl mb-2">Tung (TJ) Vo</div>
                        <p className="text-sm">Driven by curiosity, grounded in data.</p>
                    </div>
                    <div className="flex gap-6">
                        <a href="mailto:vo.tung@stthom.edu" className="hover:text-nobel-gold transition-colors"><Mail /></a>
                        <a href="https://www.linkedin.com/in/tung-vo-4728b7235/" target="_blank" className="hover:text-nobel-gold transition-colors"><Linkedin /></a>
                    </div>
                </div>
                <div className="text-center mt-12 text-xs text-stone-600">
                    &copy; 2025 Tung Vo. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default App;
