import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  Award,
  Scroll,
  Feather,
  Compass,
  Cpu,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Rocket,
  ArrowRight,
  Database,
  Layers,
  FileText,
  FileCode2,
  BarChart3,
  Terminal,
  ExternalLink,
  ShieldAlert,
  GitBranch,
  Scale,
  CheckSquare,
  BookMarked,
  Library,
  Star,
  LogOut,
  Play,
  RotateCcw,
  Menu,
  X
} from 'lucide-react';

export default function Landing() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'vericite' | 'prisma' | 'pipeline'>('pipeline');

  // Organized academic navigation items
  const navItems = [
    { label: 'Overview', href: '#hero' },
    { label: 'Workflow', href: '#how-it-works' },
    { label: '12 Agents', href: '#agents' },
    { label: 'VeriCite™', href: '#vericite' },
    { label: 'Architecture', href: '#architecture' },
    { label: 'Workspace', href: '#workspace' },
    { label: 'About', href: '#about' },
  ];
  
  // Interactive Topic State
  const [selectedTopic, setSelectedTopic] = useState<string>(
    'Epistemic Boundaries of Transformer Architectures in Biomedical Literature Synthesis (2020–2026)'
  );

  const [activeAgentIndex, setActiveAgentIndex] = useState<number>(0);

  // The 12 exact backend agents implemented in backend/app/agents/
  const twelveAgents = [
    {
      name: 'Supervisor Agent',
      file: 'supervisor.py',
      icon: Compass,
      tag: 'Orchestration Hub',
      desc: 'Central governor directing deterministic LangGraph state transitions, turn order, and convergence validation.',
      color: '#C69B48',
    },
    {
      name: 'Planner Agent',
      file: 'planner.py',
      icon: Scroll,
      tag: 'Methodological Protocol',
      desc: 'Constructs Boolean taxonomic query matrices, scoping criteria, and PRISMA 2020 protocol specifications.',
      color: '#E5C477',
    },
    {
      name: 'Searcher Agent',
      file: 'searcher.py',
      icon: Search,
      tag: 'Scholarly Retrieval',
      desc: 'Concurrently interrogates CrossRef, arXiv, and academic registries to extract candidate publication metadata.',
      color: '#C69B48',
    },
    {
      name: 'Screener Agent',
      file: 'screener.py',
      icon: CheckSquare,
      tag: 'Semantic Inclusion',
      desc: 'Leverages SBERT semantic similarity to filter abstracts against inclusion/exclusion boundaries, removing irrelevant noise.',
      color: '#E5C477',
    },
    {
      name: 'Reader Agent',
      file: 'reader.py',
      icon: BookOpen,
      tag: 'Evidence Dissection',
      desc: 'Reads accepted full-texts to systematically extract empirical datasets, benchmarks, statistical claims, and methodologies.',
      color: '#C69B48',
    },
    {
      name: 'Thematic Analyzer Agent',
      file: 'analyzer.py',
      icon: Cpu,
      tag: 'Thematic Synthesis',
      desc: 'Discovers latent paradigms, comparative contradictions, and taxonomic clusters across the collected literature corpus.',
      color: '#E5C477',
    },
    {
      name: 'Academic Writer Agent',
      file: 'writer.py',
      icon: Feather,
      tag: 'Manuscript Composition',
      desc: 'Synthesizes rigorous academic prose with precise in-text citations adhering to top-tier peer-review standards.',
      color: '#C69B48',
    },
    {
      name: 'Polish Agent',
      file: 'polish.py',
      icon: Sparkles,
      tag: 'Scholarly Rhetoric',
      desc: 'Refines academic tone, transitions, sentence rhythm, and rhetorical clarity throughout the generated manuscript.',
      color: '#E5C477',
    },
    {
      name: 'Citation Validator Agent',
      file: 'citation_validator.py',
      icon: ShieldCheck,
      tag: 'VeriCite™ Engine',
      desc: 'Audits every citation against CrossRef APIs. Rejects unverified DOIs and confirms semantic claim alignment.',
      color: '#C69B48',
    },
    {
      name: 'Quality Control Agent',
      file: 'quality_control.py',
      icon: Award,
      tag: 'Peer Review Audit',
      desc: 'Executes simulated peer-review audits for logical coherence, citation grounding, and comprehensive coverage.',
      color: '#E5C477',
    },
    {
      name: 'Mediator Agent',
      file: 'mediator.py',
      icon: Scale,
      tag: 'Consensus Resolution',
      desc: 'Resolves analytical conflicts between agents regarding contradictory findings or disputed classifications.',
      color: '#C69B48',
    },
    {
      name: 'Formatter Agent',
      file: 'formatter.py',
      icon: FileCode2,
      tag: 'Venue Typography',
      desc: 'Compiles clean manuscript packages for IEEE 2-Column, ACM SigConf, Springer LNCS, Word DOCX, and BibTeX.',
      color: '#E5C477',
    },
  ];

  // Auto-cycle active agent card
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAgentIndex((prev) => (prev + 1) % twelveAgents.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [twelveAgents.length]);

  const pipelineStages = [
    { num: '01', title: 'Research Topic Submission', desc: 'Researcher inputs core question, temporal range (e.g. 2020–2026), and citation standard.' },
    { num: '02', title: 'Semantic Routing', desc: 'Supervisor & Planner construct query taxonomies and distribute research directives.' },
    { num: '03', title: 'Literature Discovery', desc: 'Searcher queries CrossRef, arXiv, and Semantic Scholar concurrently.' },
    { num: '04', title: 'Paper Screening', desc: 'Screener computes SBERT embeddings to accept only high-relevance publications.' },
    { num: '05', title: 'Methodology Extraction', desc: 'Reader extracts empirical results, dataset benchmarks, and author claims.' },
    { num: '06', title: 'Evidence Synthesis', desc: 'Analyzer & Writer weave findings into rigorous, themed academic prose.' },
    { num: '07', title: 'Citation Verification', desc: 'VeriCite™ audits each claim against CrossRef DOIs to eliminate hallucinated sources.' },
    { num: '08', title: 'Final Research Generation', desc: 'Formatter compiles ready-to-submit IEEE LaTeX, Springer, Word, and BibTeX packages.' },
  ];

  const techStack = [
    { name: 'LangGraph Orchestration', role: 'Deterministic Agent State Machine', icon: GitBranch },
    { name: 'FastAPI High-Speed Backend', role: 'Asynchronous Pipeline Streaming', icon: Terminal },
    { name: 'SBERT Semantic Embeddings', role: 'Literature Routing & Claim Alignment', icon: Cpu },
    { name: 'Vector Memory (Qdrant)', role: 'Embedding Indexing for Fast Retrieval', icon: Database },
    { name: 'Knowledge Graph (Neo4j)', role: 'Citation Co-Occurrence & Relational Graph', icon: Layers },
    { name: 'CrossRef Scholarly API', role: 'Real-Time DOI Verification Engine', icon: ShieldCheck },
  ];

  const faqs = [
    {
      q: 'How does the VeriCite™ engine prevent hallucinated citations and fake DOIs?',
      a: 'VeriCite™ operates a three-layer verification pipeline. Every cited paper is queried in real time against the CrossRef and arXiv APIs. If a DOI does not resolve to the exact author, publication title, and year cited, or if the semantic similarity between the extracted text and source abstract falls below 0.85, the claim is flagged and purged before final compilation.'
    },
    {
      q: 'Is the generated review manuscript compliant with official PRISMA 2020 guidelines?',
      a: 'Yes. AURORA adheres strictly to the PRISMA 2020 statement (Page et al., 2021). The system automatically compiles transparent numerical tracking tables for Identification, Screening, Eligibility, and Inclusion counts, producing an exportable PRISMA flowchart alongside your manuscript.'
    },
    {
      q: 'Which academic publishing templates and formats are supported?',
      a: 'AURORA produces publication-ready files for IEEE 2-Column (LaTeX & Word), ACM Conference (SigConf), Springer Nature LNCS, APA 7th Edition, pure Markdown, and complete BibTeX (.bib) libraries.'
    },
    {
      q: 'How do the twelve specialized agents communicate?',
      a: 'AURORA uses LangGraph deterministic state channels. The Supervisor Agent arbitrates turn-taking, passes typed state payloads between agents, invokes the Mediator Agent to resolve conflicting empirical data, and triggers Quality Control auditing prior to final formatting.'
    },
    {
      q: 'Can I customize the inclusion criteria, temporal bounds, and paper limits?',
      a: 'Yes. Inside the Research Workspace, you can customize publication date ranges (e.g. 2018–2026), paper screening caps (from 20 to 200+ papers), specific review methodologies (Systematic, Scoping, Meta-Analysis), and citation styling.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#24090F] bg-library-grid text-[#F6EBD5] font-sans antialiased selection:bg-[#C69B48] selection:text-[#24090F] relative overflow-x-hidden">
      {/* Subtle Golden Candlelight / Atmospheric Vignette Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-library-vignette pointer-events-none -z-10 animate-candle-glow"></div>
      <div className="fixed top-1/4 -left-40 w-[500px] h-[500px] rounded-full bg-[#E5C477]/5 blur-[140px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-1/4 -right-40 w-[600px] h-[600px] rounded-full bg-[#C69B48]/5 blur-[160px] pointer-events-none -z-10"></div>

      {/* Floating Star / Dust Particles (Tasteful Academic Ambience) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -80, 0],
              opacity: [0.15, 0.45, 0.15],
              scale: [1, 1.25, 1],
            }}
            transition={{
              duration: 8 + (i % 6) * 2,
              repeat: Infinity,
              delay: (i % 5) * 1.5,
              ease: 'easeInOut',
            }}
            className="absolute rounded-full bg-[#E5C477]"
            style={{
              width: i % 3 === 0 ? '3px' : '2px',
              height: i % 3 === 0 ? '3px' : '2px',
              top: `${(i * 19) % 100}%`,
              left: `${(i * 29) % 100}%`,
              boxShadow: '0 0 6px #E5C477',
            }}
          />
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 1. NAVIGATION BAR (Deep Burgundy with Antique Gold Accents)               */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-[#24090F]/95 backdrop-blur-md border-b border-[#75502F]/60 transition-all shadow-md shadow-[#24090F]/50 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 sm:gap-4 w-full">
          {/* Brand Identity (Left) */}
          <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3.5 group shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center shrink-0"
            >
              <img
                src="/aurora-logo.png"
                alt="AURORA Academic Emblem"
                className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(198,155,72,0.4)]"
              />
            </motion.div>
            <div className="shrink-0">
              <div className="flex items-center space-x-2">
                <span className="font-serif font-extrabold text-lg sm:text-2xl tracking-wider text-[#F6EBD5] group-hover:text-[#E5C477] transition-colors whitespace-nowrap">
                  AURORA
                </span>
                <span className="px-1.5 py-0.5 text-[8.5px] sm:text-[9px] font-serif font-bold uppercase tracking-widest bg-[#350E18] text-[#E5C477] border border-[#75502F] rounded whitespace-nowrap">
                  EST. 2026
                </span>
              </div>
              <span className="text-[8.5px] sm:text-[9px] font-serif uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[#C8B99F]/80 block -mt-0.5 whitespace-nowrap">
                Autonomous Research Intelligence
              </span>
            </div>
          </Link>

          {/* Centered Academic Navigation Dock (Middle - visible on 1280px+) */}
          <nav className="hidden xl:flex items-center space-x-1 px-2.5 py-1.5 rounded-full bg-[#350E18]/80 backdrop-blur-md border border-[#75502F]/60 shadow-[inset_0_1px_4px_rgba(0,0,0,0.4)] shrink-0">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-2.5 py-1 rounded-full text-xs font-serif uppercase tracking-wider text-[#C8B99F] hover:text-[#E5C477] hover:bg-[#401923]/80 transition-all duration-200 whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Action / Authentication & Mobile Toggle (Right) */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/dashboard')}
                  className="btn-gold text-xs py-2 px-3.5 sm:px-4.5 rounded-xl flex items-center space-x-1.5 sm:space-x-2 whitespace-nowrap shadow-[0_0_15px_rgba(198,155,72,0.2)]"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#24090F] shrink-0" />
                  <span className="font-serif font-bold tracking-wider">Enter Workspace</span>
                </motion.button>

                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 p-1.5 pl-2.5 pr-2 rounded-xl bg-[#350E18] border border-[#75502F] hover:border-[#C69B48] transition-all"
                  >
                    <div className="w-7 h-7 rounded bg-gradient-to-tr from-[#C69B48] to-[#E5C477] text-[#24090F] flex items-center justify-center text-xs font-serif font-bold shrink-0">
                      {user?.name ? user.name[0].toUpperCase() : 'A'}
                    </div>
                    <span className="text-xs font-serif text-[#F6EBD5] hidden sm:inline-block max-w-[90px] truncate">
                      {user?.name || user?.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#C8B99F] shrink-0" />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 academia-card p-2 text-sm z-50 border border-[#75502F] shadow-2xl"
                      >
                        <div className="px-3 py-2 border-b border-[#75502F]/60">
                          <p className="font-serif font-bold text-[#E5C477] truncate">{user?.name || 'Scholar'}</p>
                          <p className="text-xs text-[#C8B99F] truncate">{user?.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            navigate('/dashboard');
                          }}
                          className="w-full text-left px-3 py-2 text-[#F6EBD5] hover:bg-[#350E18] rounded flex items-center space-x-2 mt-1 font-serif text-xs transition-colors"
                        >
                          <Compass className="w-3.5 h-3.5 text-[#C69B48]" />
                          <span>Research Dashboard</span>
                        </button>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-3 py-2 text-[#E5C477] hover:bg-[#24090F] rounded flex items-center space-x-2 font-serif text-xs transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                <Link
                  to="/login"
                  className="text-xs font-serif uppercase tracking-widest text-[#C8B99F] hover:text-[#E5C477] px-2 py-1.5 rounded-lg hover:bg-[#350E18] transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
                <div className="h-4 w-[1px] bg-[#75502F]/70 hidden sm:block" />
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="shrink-0">
                  <Link
                    to="/signup"
                    className="btn-gold text-xs py-2 px-3 sm:px-4.5 rounded-xl flex items-center space-x-1.5 whitespace-nowrap shadow-[0_0_15px_rgba(198,155,72,0.25)] hover:shadow-[0_0_22px_rgba(229,196,119,0.45)]"
                  >
                    <span className="font-serif font-bold uppercase tracking-wider">Start Research</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#24090F] shrink-0" />
                  </Link>
                </motion.div>
              </div>
            )}

            {/* Mobile / Tablet Menu Trigger (visible < 1280px) */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="xl:hidden p-2 rounded-xl bg-[#350E18] border border-[#75502F] text-[#E5C477] hover:border-[#C69B48] transition-colors shrink-0"
              aria-label="Toggle navigation drawer"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Collapsible Drawer */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="xl:hidden border-t border-[#75502F]/60 bg-[#24090F]/98 backdrop-blur-xl px-4 py-4 space-y-3 overflow-hidden shadow-2xl"
            >
              <div className="flex flex-col space-y-1">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className="px-3 py-2 rounded-lg text-xs font-serif uppercase tracking-wider text-[#C8B99F] hover:text-[#E5C477] hover:bg-[#350E18] transition-colors flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#75502F]" />
                  </a>
                ))}
              </div>

              {!isAuthenticated && (
                <div className="pt-2 border-t border-[#75502F]/40 flex items-center gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex-1 text-center py-2 text-xs font-serif uppercase tracking-widest text-[#C8B99F] bg-[#350E18] border border-[#75502F] rounded-lg hover:text-[#E5C477]"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex-1 text-center py-2 text-xs font-serif font-bold uppercase tracking-wider btn-gold rounded-lg"
                  >
                    Start Research
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION (Ancient Library Atmosphere & Magical Research Symbol)    */}
      {/* ========================================================================= */}
      <section id="hero" className="relative pt-16 pb-24 md:pt-28 md:pb-36 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Subtle Gothic Arch Ornament */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex items-center justify-center space-x-3 mb-6"
          >
            <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#C69B48]"></span>
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-[11px] font-serif uppercase tracking-widest bg-[#350E18] text-[#E5C477] border border-[#75502F] shadow-lg shadow-[#24090F]">
              <Star className="w-3 h-3 text-[#C69B48]" />
              <span>Gothic University Research Intelligence</span>
              <Star className="w-3 h-3 text-[#C69B48]" />
            </div>
            <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#C69B48]"></span>
          </motion.div>

          {/* Central Emblem Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-28 h-28 sm:w-36 sm:h-36 mx-auto mb-6 relative"
          >
            <div className="absolute inset-0 rounded-full bg-[#E5C477]/10 blur-xl animate-pulse"></div>
            <img
              src="/aurora-logo.png"
              alt="AURORA Master Emblem"
              className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(229,196,119,0.35)] relative z-10"
            />
          </motion.div>

          {/* Main Heading: "A NEW ERA OF ACADEMIC DISCOVERY" */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-widest text-[#F6EBD5] leading-[1.15] uppercase max-w-5xl mx-auto"
          >
            A NEW ERA OF <br />
            <span className="gold-gradient-text">ACADEMIC DISCOVERY</span>
          </motion.h1>

          {/* Subheading: "Meet AURORA — Your Autonomous Research Intelligence." */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-xl sm:text-2xl font-serif font-semibold text-[#E5C477] tracking-wider"
          >
            Meet AURORA — Your Autonomous Research Intelligence.
          </motion.h2>

          {/* Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-6 text-base sm:text-lg text-[#C8B99F] max-w-3xl mx-auto font-academic leading-relaxed"
          >
            From a single research question to a fully verified literature review. Twelve specialised AI agents work together to search, analyse, verify, and synthesise academic knowledge.
          </motion.p>

          {/* Primary & Secondary Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
              className="btn-gold py-3.5 px-8 text-sm flex items-center space-x-2"
            >
              <Feather className="w-4 h-4 text-[#24090F]" />
              <span>Begin Your Research</span>
            </motion.button>

            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="#how-it-works"
              className="btn-gold-secondary py-3.5 px-7 text-sm flex items-center space-x-2"
            >
              <Library className="w-4 h-4 text-[#C69B48]" />
              <span>Explore the Framework</span>
            </motion.a>
          </motion.div>

          {/* Interactive Search Inquiry Parchment Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-14 max-w-3xl mx-auto academia-card p-3 sm:p-4 border border-[#75502F] shadow-2xl relative"
          >
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 flex items-center space-x-3 px-3 py-2 w-full">
                <Search className="w-5 h-5 text-[#C69B48] shrink-0" />
                <input
                  type="text"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  placeholder="Inscribe research question or topic inquiry..."
                  className="w-full bg-transparent text-sm text-[#F6EBD5] placeholder-[#C8B99F]/50 focus:outline-none font-academic"
                />
              </div>
              <button
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
                className="w-full sm:w-auto btn-gold py-2.5 px-6 text-xs shrink-0 flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-[#24090F]" />
                <span>Synthesise Review</span>
              </button>
            </div>
          </motion.div>

          {/* Scholarly Hallmarks Strip */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs font-serif uppercase tracking-widest text-[#C8B99F]">
            <span className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#C69B48]" />
              <span>VeriCite™ CrossRef Validation</span>
            </span>
            <span className="flex items-center space-x-2">
              <Scroll className="w-4 h-4 text-[#E5C477]" />
              <span>PRISMA 2020 Protocol</span>
            </span>
            <span className="flex items-center space-x-2">
              <BookMarked className="w-4 h-4 text-[#C69B48]" />
              <span>IEEE, ACM, Springer & Word</span>
            </span>
            <span className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-[#E5C477]" />
              <span>Twelve Autonomous AI Agents</span>
            </span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. HOW AURORA WORKS: "THE ART OF INTELLIGENT RESEARCH"                    */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-24 bg-[#350E18]/80 border-y border-[#75502F]/60 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-serif uppercase tracking-widest text-[#C69B48] block mb-2">
              Scholarly Knowledge Pipeline
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-wider text-[#F6EBD5] uppercase">
              THE ART OF INTELLIGENT RESEARCH
            </h2>
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#C69B48] to-transparent mx-auto my-4"></div>
            <p className="text-base font-academic text-[#C8B99F] leading-relaxed">
              An ancient academic tradition elevated by modern artificial intelligence. Every review undergoes an eight-stage disciplined synthesis.
            </p>
          </div>

          {/* 8-Stage Research Pipeline Cards with Gold Connecting Lines */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pipelineStages.map((stage, idx) => (
              <motion.div
                key={stage.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                whileHover={{ y: -6 }}
                className="academia-card p-6 border border-[#75502F] relative group"
              >
                <div className="flex items-center justify-between mb-4 border-b border-[#75502F]/50 pb-3">
                  <span className="font-serif font-bold text-xl text-[#C69B48] tracking-widest">
                    {stage.num}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#E5C477] group-hover:scale-150 transition-transform"></span>
                </div>
                <h3 className="font-serif font-bold text-sm text-[#F6EBD5] tracking-wider uppercase mb-2">
                  {stage.title}
                </h3>
                <p className="text-xs font-academic text-[#C8B99F] leading-relaxed">
                  {stage.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. THE TWELVE AI AGENTS: "TWELVE MINDS. ONE RESEARCH INTELLIGENCE."       */}
      {/* ========================================================================= */}
      <section id="agents" className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-serif uppercase tracking-widest text-[#E5C477] block mb-2">
              LangGraph Central Multi-Agent Orchestration
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-wider text-[#F6EBD5] uppercase">
              TWELVE MINDS. ONE RESEARCH INTELLIGENCE.
            </h2>
            <div className="w-28 h-[1px] bg-gradient-to-r from-transparent via-[#C69B48] to-transparent mx-auto my-4"></div>
            <p className="text-base font-academic text-[#C8B99F] leading-relaxed">
              Twelve specialized agents collaborate through a central deterministic state graph, conducting peer audits, empirical readings, and citation validations.
            </p>
          </div>

          {/* 12 Specialized Agents Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {twelveAgents.map((agent, i) => {
              const Icon = agent.icon;
              const isActive = i === activeAgentIndex;

              return (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`academia-card p-6 border transition-all duration-300 relative ${
                    isActive
                      ? 'border-[#C69B48] bg-[#401923] shadow-lg shadow-[#C69B48]/15'
                      : 'border-[#75502F]/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#350E18] border border-[#75502F] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#E5C477]" />
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-[#24090F] text-[#C8B99F] border border-[#75502F]">
                      {agent.file}
                    </span>
                  </div>

                  <span className="text-[10px] font-serif uppercase tracking-widest text-[#C69B48] block font-bold mb-1">
                    {agent.tag}
                  </span>
                  <h4 className="font-serif font-bold text-base text-[#F6EBD5] tracking-wide mb-2">
                    {agent.name}
                  </h4>
                  <p className="text-xs font-academic text-[#C8B99F] leading-relaxed">
                    {agent.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Central Orchestration Framework Banner */}
          <div className="mt-12 p-6 academia-card border border-[#75502F] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-[#350E18] border border-[#C69B48] flex items-center justify-center shrink-0">
                <Compass className="w-6 h-6 text-[#E5C477]" />
              </div>
              <div>
                <h5 className="font-serif font-bold text-sm text-[#F6EBD5] tracking-wider uppercase">
                  LangGraph Deterministic Arbiter
                </h5>
                <p className="text-xs font-academic text-[#C8B99F] mt-0.5">
                  Supervisor channels turns between agents, mediating divergent empirical claims prior to manuscript drafting.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 shrink-0">
              <span className="badge">12 Autonomous Agents Active</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. VERICITE ENGINE: "TRUTH IS THE FOUNDATION OF RESEARCH"                 */}
      {/* ========================================================================= */}
      <section id="vericite" className="py-24 bg-[#350E18]/80 border-y border-[#75502F]/60 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-serif uppercase tracking-widest text-[#C69B48] block mb-2">
              Three-Layer Verification Pipeline
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-wider text-[#F6EBD5] uppercase">
              TRUTH IS THE FOUNDATION OF RESEARCH
            </h2>
            <div className="w-28 h-[1px] bg-gradient-to-r from-transparent via-[#C69B48] to-transparent mx-auto my-4"></div>
            <p className="text-base font-academic text-[#C8B99F] leading-relaxed">
              Generic conversational models frequently hallucinate scholarly DOIs. The proprietary VeriCite™ engine anchors every citation in authenticated scholarly records.
            </p>
          </div>

          {/* The 3-Layer Golden Verification Seal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-14">
            
            {/* Layer I */}
            <motion.div
              whileHover={{ y: -6 }}
              className="academia-card p-8 border border-[#75502F] relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-xl bg-[#24090F] border border-[#C69B48] flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6 text-[#E5C477]" />
              </div>
              <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#C69B48] block mb-1">
                Layer I
              </span>
              <h3 className="font-serif font-bold text-lg text-[#F6EBD5] tracking-wide mb-3">
                Citation & DOI Validation
              </h3>
              <p className="text-xs font-academic text-[#C8B99F] leading-relaxed">
                Syntax verification of digital object identifiers, standard regex parsing, and cryptographic prefix resolution across official registrar registries.
              </p>
            </motion.div>

            {/* Layer II */}
            <motion.div
              whileHover={{ y: -6 }}
              className="academia-card p-8 border border-[#C69B48] bg-[#401923] relative overflow-hidden shadow-xl shadow-[#C69B48]/10"
            >
              <div className="w-12 h-12 rounded-xl bg-[#24090F] border border-[#E5C477] flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-[#E5C477]" />
              </div>
              <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#E5C477] block mb-1">
                Layer II
              </span>
              <h3 className="font-serif font-bold text-lg text-[#F6EBD5] tracking-wide mb-3">
                CrossRef Database Interrogation
              </h3>
              <p className="text-xs font-academic text-[#C8B99F] leading-relaxed">
                Direct live API cross-referencing querying CrossRef metadata. Confirms title, author surname arrays, journal volume, and publication year match exact scholarly records.
              </p>
            </motion.div>

            {/* Layer III */}
            <motion.div
              whileHover={{ y: -6 }}
              className="academia-card p-8 border border-[#75502F] relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-xl bg-[#24090F] border border-[#C69B48] flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-[#E5C477]" />
              </div>
              <span className="text-xs font-serif font-bold uppercase tracking-widest text-[#C69B48] block mb-1">
                Layer III
              </span>
              <h3 className="font-serif font-bold text-lg text-[#F6EBD5] tracking-wide mb-3">
                Semantic Claim Alignment
              </h3>
              <p className="text-xs font-academic text-[#C8B99F] leading-relaxed">
                SBERT embedding verification calculating semantic alignment between the claim written in the review and the original publication’s abstract and methodology.
              </p>
            </motion.div>

          </div>

          {/* Verification Shield Visual Showcase */}
          <div className="academia-card p-6 md:p-8 border border-[#75502F] bg-[#24090F]/90">
            <div className="flex flex-col md:flex-row items-center justify-between border-b border-[#75502F]/60 pb-4 mb-6 gap-3">
              <div className="flex items-center space-x-3">
                <ShieldAlert className="w-5 h-5 text-[#E5C477]" />
                <span className="font-serif font-bold text-sm tracking-wider uppercase text-[#F6EBD5]">
                  VeriCite™ Live Audit Stream
                </span>
              </div>
              <span className="badge">
                Evidence-Backed Scholarly Integrity
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-[#350E18] border border-[#C69B48]/50 flex items-center justify-between">
                <div>
                  <span className="text-[#E5C477] font-bold">✓ VERIFIED CITATION: DOI 10.1038/s41586-023-06647-8</span>
                  <p className="text-[#C8B99F] font-academic text-sm mt-0.5">
                    Vaswani et al., "Attention Is All You Need" — Confirmed via CrossRef API (99.8% Match)
                  </p>
                </div>
                <span className="text-[10px] font-serif text-[#E5C477] border border-[#C69B48] px-2 py-0.5 rounded">
                  Layer I & II Pass
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#350E18] border border-[#C69B48]/50 flex items-center justify-between">
                <div>
                  <span className="text-[#E5C477] font-bold">✓ VERIFIED CITATION: DOI 10.1145/3442188.3445922</span>
                  <p className="text-[#C8B99F] font-academic text-sm mt-0.5">
                    Bender et al., "On the Dangers of Stochastic Parrots" — Semantic Claim Grounding (98.4%)
                  </p>
                </div>
                <span className="text-[10px] font-serif text-[#E5C477] border border-[#C69B48] px-2 py-0.5 rounded">
                  Layer III Pass
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#24090F] border border-[#75502F] flex items-center justify-between text-[#C8B99F]">
                <div>
                  <span className="text-[#E5C477]/80 font-bold">✗ REJECTED CANDIDATE: Unverified DOI 10.1016/j.fake.2024.01</span>
                  <p className="text-[#C8B99F]/70 font-academic text-sm mt-0.5">
                    Failed CrossRef registry resolution. Purged prior to manuscript generation.
                  </p>
                </div>
                <span className="text-[10px] font-serif text-[#C8B99F] border border-[#75502F] px-2 py-0.5 rounded">
                  Filtered by VeriCite
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. TECHNOLOGY ARCHITECTURE: "THE INTELLIGENCE BEHIND AURORA"              */}
      {/* ========================================================================= */}
      <section id="architecture" className="py-24 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-serif uppercase tracking-widest text-[#E5C477] block mb-2">
              System Engineering & Modern Foundations
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-wider text-[#F6EBD5] uppercase">
              THE INTELLIGENCE BEHIND AURORA
            </h2>
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#C69B48] to-transparent mx-auto my-4"></div>
            <p className="text-base font-academic text-[#C8B99F] leading-relaxed">
              Rigorous academic discovery delivered through production-ready asynchronous Python architecture and LangGraph state orchestration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((tech, idx) => {
              const Icon = tech.icon;
              return (
                <div key={idx} className="academia-card p-6 border border-[#75502F] hover:border-[#C69B48] transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#350E18] border border-[#75502F] flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#C69B48]" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#F6EBD5] tracking-wide mb-1">
                    {tech.name}
                  </h4>
                  <p className="text-xs font-academic text-[#C8B99F]">
                    {tech.role}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. RESEARCH WORKSPACE PREVIEW & PUBLISHING FORMATS                        */}
      {/* ========================================================================= */}
      <section id="workspace" className="py-24 bg-[#350E18]/80 border-y border-[#75502F]/60 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-serif uppercase tracking-widest text-[#C69B48] block mb-2">
              Scholarly Workbench & Venues
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-wider text-[#F6EBD5] uppercase">
              AUTHENTIC ACADEMIC OUTPUT
            </h2>
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#C69B48] to-transparent mx-auto my-4"></div>
            <p className="text-base font-academic text-[#C8B99F] leading-relaxed">
              Pre-configured templates ready for immediate submission to top-tier university repositories and journals.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {[
              { name: 'IEEE 2-Column', type: 'LaTeX & PDF', ext: '.tex + .pdf' },
              { name: 'ACM SigConf', type: 'SigConf Template', ext: 'ACM LaTeX' },
              { name: 'Springer LNCS', type: 'Lecture Notes', ext: 'LNCS Archive' },
              { name: 'APA 7th Edition', type: 'Word Document', ext: '.docx file' },
              { name: 'BibTeX Library', type: 'Verified Citations', ext: '.bib file' },
              { name: 'PRISMA Diagram', type: 'Flowchart Graphic', ext: '.svg + .png' },
            ].map((fmt, i) => (
              <div key={i} className="academia-card p-5 border border-[#75502F] hover:border-[#C69B48] transition-colors">
                <FileCode2 className="w-7 h-7 text-[#C69B48] mx-auto mb-2.5" />
                <h5 className="font-serif font-bold text-xs sm:text-sm text-[#F6EBD5]">{fmt.name}</h5>
                <span className="text-[11px] font-academic text-[#C8B99F] block mt-1">{fmt.type}</span>
                <span className="text-[10px] font-mono text-[#E5C477] mt-2 block bg-[#24090F] py-0.5 rounded border border-[#75502F]/60">
                  {fmt.ext}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FREQUENTLY ASKED QUESTIONS (Academic Accordion)                         */}
      {/* ========================================================================= */}
      <section id="about" className="py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-serif uppercase tracking-widest text-[#E5C477] block mb-2">
              Scholarly Documentation
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-black tracking-wider text-[#F6EBD5] uppercase">
              FREQUENTLY ASKED QUESTIONS
            </h2>
            <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-[#C69B48] to-transparent mx-auto my-4"></div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="academia-card overflow-hidden transition-all duration-200 border border-[#75502F]"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-[#F6EBD5] font-serif font-bold text-sm sm:text-base hover:text-[#E5C477] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#C69B48] shrink-0 ml-4 transition-transform duration-200 ${
                      activeFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="px-5 pb-5 text-xs sm:text-sm font-academic text-[#C8B99F] leading-relaxed border-t border-[#75502F]/50 pt-3"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. INVITATION TO INSCRIBE RESEARCH (CLOSING CALL TO ACTION)                */}
      {/* ========================================================================= */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="relative rounded-3xl p-10 sm:p-16 overflow-hidden border border-[#C69B48]/50 bg-gradient-to-b from-[#350E18] via-[#24090F] to-[#24090F] shadow-2xl shadow-[#C69B48]/10">
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <span className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-serif uppercase tracking-widest bg-[#24090F] text-[#E5C477] border border-[#75502F] mb-6">
                <Feather className="w-3.5 h-3.5 text-[#C69B48]" />
                <span>Begin Your Academic Inscription</span>
              </span>

              <h3 className="text-3xl sm:text-5xl font-serif font-black tracking-wider text-[#F6EBD5] uppercase leading-tight">
                Synthesise Your Literature Review in Minutes.
              </h3>

              <p className="mt-5 text-base sm:text-lg font-academic text-[#C8B99F] leading-relaxed">
                Join university scholars and researchers coordinating twelve autonomous agents for verifiable literature synthesis.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                {isAuthenticated ? (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="btn-gold text-sm px-8 py-4 shadow-xl"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>Launch Research Workspace</span>
                  </button>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="btn-gold text-sm px-8 py-4 shadow-xl"
                    >
                      <Feather className="w-4 h-4 mr-2" />
                      <span>Begin Your Research</span>
                    </Link>
                    <Link
                      to="/login"
                      className="btn-gold-secondary text-sm px-8 py-4"
                    >
                      <span>Sign In to Repository</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. FOOTER: "Where Knowledge Meets Intelligence."                         */}
      {/* ========================================================================= */}
      <footer className="bg-[#1b060b] text-[#C8B99F] py-14 text-xs border-t border-[#75502F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#75502F]/50">
            <div className="flex items-center space-x-3.5">
              <img
                src="/aurora-logo.png"
                alt="AURORA Emblem"
                className="w-10 h-10 object-contain drop-shadow-md shrink-0"
              />
              <div>
                <span className="font-serif font-extrabold text-base tracking-widest text-[#F6EBD5]">AURORA</span>
                <p className="text-[11px] font-academic italic text-[#E5C477]">
                  "Where Knowledge Meets Intelligence."
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-serif uppercase tracking-widest text-[#C8B99F]">
              <a href="#about" className="hover:text-[#E5C477] transition-colors">About AURORA</a>
              <a href="#how-it-works" className="hover:text-[#E5C477] transition-colors">Research Framework</a>
              <a href="#vericite" className="hover:text-[#E5C477] transition-colors">VeriCite Engine</a>
              <a href="mailto:support@aurora-research.ai" className="hover:text-[#E5C477] transition-colors">Contact</a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#E5C477] transition-colors flex items-center space-x-1">
                <span>GitHub</span>
                <ExternalLink className="w-3 h-3 text-[#C69B48]" />
              </a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-serif text-[#C8B99F]/70 gap-3">
            <span>© 2026 AURORA Research Technologies. All rights reserved.</span>
            <span>PRISMA 2020 Statement Compliant • CrossRef Real-Time API</span>
          </div>

        </div>
      </footer>

    </div>
  );
}
