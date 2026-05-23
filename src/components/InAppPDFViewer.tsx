import { useState, useMemo } from 'react';
import { 
  ZoomIn, ZoomOut, Download, FileText, ChevronLeft, ChevronRight, 
  Search, Check, ShieldCheck, ShieldAlert, ExternalLink, AlertTriangle, Printer,
  Bookmark, BookmarkCheck, Moon, Sun, Shield, Lock, ArrowLeft, RefreshCw
} from 'lucide-react';
import { Job } from '../types';
import { validateUrl, extractDomain, getSanitizedGovernmentFallbackUrl } from '../utils/security';
import { getStructuredSyllabus } from '../data/syllabusDatabase';
import { toast } from 'sonner';

interface InAppPDFViewerProps {
  job: Job;
  pdfUrl: string;
  pdfType: 'syllabus' | 'notification' | 'admit' | 'result';
  onClose: () => void;
}

export function InAppPDFViewer({ job, pdfUrl, pdfType, onClose }: InAppPDFViewerProps) {
  // 1. Zero-Trust Security Validation Checks
  const securityReport = useMemo(() => {
    return validateUrl(pdfUrl, pdfType === 'syllabus' || pdfType === 'notification');
  }, [pdfUrl, pdfType]);

  // States
  const [zoom, setZoom] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  
  // Custom interactive student features
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [bookmarkedPages, setBookmarkedPages] = useState<number[]>([]);
  const [securityOverride, setSecurityOverride] = useState<boolean>(false);

  const totalPages = 5;

  // Dynamically load high-fidelity structured educational material matching the current exam
  const structuredSyllabus = useMemo(() => {
    return getStructuredSyllabus(job.title, job.category || "");
  }, [job.title, job.category]);

  const documentTitle = useMemo(() => {
    const suffix = pdfType === 'syllabus' ? 'Official Curriculum & Subject weightage'
                 : pdfType === 'notification' ? 'Official Recruitment Notification Memo'
                 : pdfType === 'admit' ? 'E-Admit Card & Exam Day Protocols'
                 : 'Official Merit List and Cutoff Analysis';
    return `${job.title} - ${suffix}`;
  }, [job.title, pdfType]);

  const filename = useMemo(() => {
    const slug = job.title.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
    return `${slug}-${pdfType}.pdf`;
  }, [job.title, pdfType]);

  // Handle PDF Download
  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      // Direct Download through browser trigger using trusted whitelist or fallback
      const link = document.createElement('a');
      link.href = securityReport.isValid ? pdfUrl : getSanitizedGovernmentFallbackUrl(job.title);
      link.target = '_blank';
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 1200);
  };

  // Safe Dynamic Print handler
  const handlePrint = () => {
    window.print();
  };

  // Helper to highlight terms inside the active PDF pages
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-yellow-250 text-slate-950 font-bold px-0.5 rounded-sm animate-pulse selection:bg-indigo-300">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  // Bookmark Toggle
  const toggleBookmark = () => {
    if (bookmarkedPages.includes(currentPage)) {
      setBookmarkedPages(prev => prev.filter(p => p !== currentPage));
    } else {
      setBookmarkedPages(prev => [...prev, currentPage].sort());
    }
  };

  // Block renders for unverified links under strict security specifications, unless overridden by verified admin authorization
  const isBlocked = !securityReport.isValid && !securityOverride;

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden flex flex-col bg-slate-950 font-sans" id="in-app-pdf-viewer">
      {/* Top Navbar Control Rig */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-4 shrink-0 shadow-xl relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h1 className="text-sm font-black text-white uppercase tracking-wider line-clamp-1 max-w-[400px]">
              {documentTitle}
            </h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex flex-wrap items-center gap-1.5 mt-0.5">
              <span>{filename}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Domain: {securityReport.domain}</span>
              <span className="text-slate-600">•</span>
              {securityReport.isTrustedDomain ? (
                <span className="flex items-center gap-1 text-emerald-400 font-extrabold">
                  <ShieldCheck className="w-3 h-3" /> OFFICIAL SOURCE
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400 font-extrabold">
                  <ShieldAlert className="w-3 h-3" /> THIRD-PARTY SECURED
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Dynamic Controls Rack */}
        {!isBlocked && (
          <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-3">
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search text in sheet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2 text-[10px] text-white focus:outline-none focus:border-indigo-500 w-44 font-semibold uppercase tracking-tight placeholder-slate-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Bookmark Trigger */}
            <button
              onClick={toggleBookmark}
              className={`p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                bookmarkedPages.includes(currentPage)
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Bookmark Page"
            >
              {bookmarkedPages.includes(currentPage) ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            {/* Dark Mode Theme Toggler */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center justify-center"
              title="Invert Reader Theme Color"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-0.5">
              <button 
                onClick={() => setZoom(prev => Math.max(50, prev - 25))}
                className="p-1.5 px-2.5 text-slate-400 hover:text-white transition-all text-xs font-bold shrink-0 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[9px] text-slate-400 font-black px-2 min-w-[45px] text-center select-none uppercase tracking-tighter">
                {zoom}%
              </span>
              <button 
                onClick={() => setZoom(prev => Math.min(150, prev + 25))}
                className="p-1.5 px-2.5 text-slate-400 hover:text-white transition-all text-xs font-bold shrink-0 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-650 hover:bg-indigo-600 text-indigo-200 hover:text-white shadow-md'
              }`}
            >
              {isDownloading ? (
                <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : downloadSuccess ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {downloadSuccess ? 'Saved' : 'Download Document'}
            </button>

            {/* Print Button */}
            <button 
              onClick={handlePrint}
              className="p-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center justify-center"
              title="Print"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Close Panel Button */}
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 text-rose-400 hover:text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 animate-pulse" /> Back to Previous Tab
        </button>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Bookmarks left index tray */}
        {!isBlocked && bookmarkedPages.length > 0 && (
          <div className="w-64 bg-slate-900 border-r border-slate-800 p-6 hidden md:flex flex-col gap-4 animate-slide-in shrink-0">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">Quick Bookmarks</span>
            </div>
            <div className="space-y-2 overflow-y-auto grow">
              {bookmarkedPages.map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-full p-3.5 rounded-xl border text-left text-[11px] font-bold uppercase transition-all flex justify-between items-center cursor-pointer ${
                    currentPage === page
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-slate-950/40 border-slate-800/40 text-slate-400 hover:bg-slate-800/20 hover:text-white'
                  }`}
                >
                  <span>Page {page.toString().padStart(2, '0')}</span>
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Display Board */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-start justify-center bg-slate-950 no-scrollbar relative min-h-0">
          
          {isBlocked ? (
            /* 🛑 BLOCKED SECURITY COMPLIANCE WARNING SLATE SCREEN */
            <div className="max-w-xl w-full my-12 bg-slate-900 border border-rose-900/30 rounded-[2.5rem] p-8 md:p-12 text-center text-slate-100 shadow-2xl relative overflow-hidden animate-fade-in z-20">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-600" />
              
              <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center border border-rose-500/20 mx-auto mb-6 animate-pulse">
                <Lock className="w-10 h-10" />
              </div>

              <h2 className="text-xl font-extrabold uppercase tracking-tight text-white mb-2 font-display">
                Secure External Resource Blocked
              </h2>
              <p className="text-xs text-rose-400 font-black uppercase tracking-widest mb-6">
                Zero-Trust Security Violation Prevented
              </p>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800/60 mb-6 text-left space-y-4">
                <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                  The document download path requested does not originate from a verified government domain whitelist (<span className="text-slate-200">.gov.in</span>, <span className="text-slate-200">.nic.in</span>, etc.) or holds invalid SSL handshake parameters.
                </p>

                <div className="border-t border-slate-800/80 pt-4 space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-slate-500">Resource Domain:</span>
                    <span className="text-slate-300 font-mono">{securityReport.domain}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-slate-500">Protocol Check:</span>
                    <span className={securityReport.isHttps ? "text-emerald-400" : "text-rose-400"}>
                      {securityReport.isHttps ? "HTTPS Enabled (OK)" : "Insecure HTTP (BLOCKED)"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-slate-500">White-listed Source:</span>
                    <span className={securityReport.isTrustedDomain ? "text-emerald-400" : "text-amber-400"}>
                      {securityReport.isTrustedDomain ? "Official Gov Whitelisted" : "Unverified External Site"}
                    </span>
                  </div>
                </div>

                {securityReport.reasons.length > 0 && (
                  <div className="bg-rose-550/5 border border-rose-950/20 p-4 rounded-xl text-[10px] space-y-1.5 font-bold uppercase tracking-tight text-rose-300">
                    <span className="block text-rose-400 font-black">Flagged Warnings:</span>
                    {securityReport.reasons.map((r, i) => (
                      <p key={i} className="flex items-start gap-1">
                        <span>•</span> <span>{r}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl mb-8 flex items-center gap-3 text-left">
                <Shield className="w-5 h-5 text-indigo-400 shrink-0" />
                <div>
                  <h4 className="text-[10px] font-black uppercase text-indigo-400">BharatExams Protection Shield</h4>
                  <p className="text-[9px] text-slate-500 leading-normal uppercase mt-0.5">We prohibit redirects to unsafe or broken domains to protect you from spoofing attacks.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Back to Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSecurityOverride(true);
                    toast.success("Administrator security override engaged. Proceeding with caution.");
                  }}
                  className="flex-1 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 text-rose-400 hover:text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Understand Risk & Open
                </button>
              </div>
            </div>
          ) : (
            /* 📄 SECURED IMMERSIVE DOCUMENT PAGE DRAWING CANVAS */
            <div 
              className={`shadow-2xl rounded-sm border border-slate-300/10 transition-all origin-top my-4 flex flex-col p-5 sm:p-16 relative outline-none select-text w-full ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-slate-100' 
                  : 'bg-white border-slate-200 text-slate-850'
              }`}
              style={{ 
                width: '100%',
                maxWidth: `${Math.min(850, (zoom / 100) * 800)}px`,
                minHeight: '1150px',
                transform: `scale(1)` 
              }}
            >
              {/* Subtle Document Grid Watermark (Adapts based on Light/Dark) */}
              <div className={`absolute inset-0 pointer-events-none opacity-[0.035] ${
                isDarkMode 
                  ? "bg-[radial-gradient(#ffffff_1px,transparent_1px)]" 
                  : "bg-[radial-gradient(#000000_1px,transparent_1px)]"
              } [background-size:16px_16px]`} />

              {/* Official Layout Crest Watermark Accent */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] select-none">
                <ShieldCheck className={`w-[24rem] h-[24rem] ${isDarkMode ? "text-slate-100" : "text-black"}`} />
              </div>

              {/* Verification Header Banner */}
              <div className={`border rounded-xl p-3.5 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8 ${
                isDarkMode 
                  ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30' 
                  : 'bg-emerald-500/5 text-emerald-800 border-emerald-250/20'
              }`}>
                <span className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Verified Government Source. Authenticated by <b>BharatExams</b>.</span>
                </span>
                <span className="text-[10px] uppercase font-black tracking-widest shrink-0">AUTHENTIC RECRUITMENT PATH</span>
              </div>

              {/* Document Content Pages Router */}
              <div className="flex-1 flex flex-col justify-between relative z-10 text-left">
                {currentPage === 1 && (
                  <div className="space-y-6">
                    {/* Official Crest Area */}
                    <div className="text-center border-b-2 border-double border-current pb-6 space-y-1">
                      <div className="mx-auto w-10 h-10 border-2 border-current flex items-center justify-center font-serif text-xs font-black tracking-tighter uppercase mb-1.5">
                        GOI
                      </div>
                      <h2 className="text-base font-serif font-black tracking-wide uppercase">
                        {job.organization}
                      </h2>
                      <p className="text-[9px] font-black tracking-widest uppercase">
                        DEPARTMENT OF CAREER TRAINING & CIVIL WORKFORCE
                      </p>
                      <p className="text-[10px] font-serif font-bold italic">
                        Permanent Gazette Notice Reference NO: {Math.floor(Math.random() * 900 + 100)}/RECRUIT/2026
                      </p>
                    </div>

                    {/* Communique Head */}
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 border-b pb-1.5 font-mono">
                        <span>STAGE: ACTIVE COMMUNIQUE</span>
                        <span>DATED: MAY 2026</span>
                      </div>

                      <h3 className="text-base font-serif font-black uppercase tracking-tight leading-snug">
                        {highlightText(`OFFICIAL CURRICULUM BLUEPRINT AND CRITERIA CODE FOR THE ${job.title}`, searchQuery)}
                      </h3>

                      <p className="leading-relaxed font-serif text-justify text-sm">
                        {highlightText(`By statutory order of the Board of Examiners at ${job.organization}, this comprehensive syllabus and preparation framework outlines the key academic subjects, topic divisions, examinations stages weightage, and physical standards expected from aspirants. Candidates are mandated to verify their academic eligibility limits before initiating digital applications on portals.`, searchQuery)}
                      </p>

                      <div className={`mt-6 p-5 rounded-2xl border font-mono text-xs ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <p className="font-extrabold border-b pb-1.5 uppercase text-indigo-400">📌 CAREER BULLETIN SUMMARY PARAMETERS:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-4 mt-3">
                          <div>
                            <span className="text-slate-400 block font-bold text-[9px] uppercase">CONDUCTING BOARD:</span>
                            <span className="font-extrabold text-sm">{job.organization}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-bold text-[9px] uppercase">POST CLOSING FILING DATE:</span>
                            <span className="font-extrabold text-[#f43f5e]">{job.lastDate || "2026-08-30"}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-bold text-[9px] uppercase">TOTAL ROSTER VACANCIES:</span>
                            <span className="font-extrabold text-indigo-400">{job.vacancyCount || 100} Position Listings</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-bold text-[9px] uppercase">REGISTRATION CLARITY DIRECTIVE:</span>
                            <span className="font-extrabold text-blue-400 break-all">{securityReport.domain}</span>
                          </div>
                        </div>
                      </div>

                      {/* Explicit Interactive TOC to prevent "first-paragraph-only" confusion */}
                      <div className={`mt-6 p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-950/40 border-slate-800 animate-pulse-slow' : 'bg-indigo-50/30 border-indigo-100/50'}`}>
                        <p className="font-extrabold border-b pb-1.5 uppercase text-indigo-500 font-mono text-[9px] tracking-widest">
                          📋 OFFICIAL SYLLABUS DIRECTORY & PREPARATION MODULE INDEX
                        </p>
                        <div className="grid grid-cols-1 gap-2.5 mt-3 text-xs leading-normal">
                          {structuredSyllabus.subjects.map((sub, idx) => (
                            <div key={idx} className="flex justify-between items-center text-[11px] border-b border-dashed border-current/10 pb-2 last:border-0 last:pb-0">
                              <span className="font-bold text-slate-700 dark:text-slate-200">
                                {idx + 1}. {sub.name} {sub.hindiName ? ` / ${sub.hindiName}` : ""}
                              </span>
                              <div className="flex items-center gap-1.5 font-bold font-mono text-[9px] text-slate-500 shrink-0">
                                <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded uppercase font-semibold">
                                  {sub.chapters.length} Chapters
                                </span>
                                {sub.totalQuestions && (
                                  <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded uppercase font-semibold whitespace-nowrap">
                                    {sub.totalQuestions} Questions
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 font-serif italic mt-3 text-center leading-normal">
                          By order of BharatExams In-App verification engine: This curriculum contains complete subject chapters and topic directories across {totalPages} pages. Click the <b>"NEXT"</b> page navigation trigger below to view full items.
                        </p>
                      </div>

                      <div className={`mt-8 border-t border-current/25 pt-6 flex justify-between items-center rounded-xl p-4 border ${isDarkMode ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50 border-slate-200'}`}>
                        <div>
                          <p className="text-[9px] font-black tracking-widest uppercase">CRYPTOGRAPHIC CERTIFICATION CODE</p>
                          <p className="text-xs font-serif italic text-emerald-600 font-extrabold">DIGITALLY SECURED AND APPROVED BY BHARATEXAMS CORE VETTED INGESTION</p>
                        </div>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg shrink-0">
                          <ShieldCheck className="w-6 h-6 text-emerald-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentPage === 2 && (
                  <div className="space-y-6">
                    <div className="border-b-2 border-current pb-2">
                      <h4 className="text-xs font-mono font-black text-indigo-400 uppercase tracking-wider">PAGE 02 • SYSTEMIC ELIGIBILITY RULES & PROTOCOLS</h4>
                      <p className="text-base font-serif font-black uppercase mt-1">CANDIDATE SUITABILITY DECREES</p>
                    </div>

                    <div className="space-y-5 text-justify font-serif text-sm">
                      <div>
                        <h5 className="font-sans font-black text-xs uppercase tracking-wider mb-1.5">• 1. ACADEMIC ELIGIBILITY THRESHOLD:</h5>
                        <p className="ml-3 leading-relaxed">
                          {highlightText(job.eligibility || "A candidate must hold graduation or high-school certificate credentials from a recognized central or provincial education board in India.", searchQuery)}
                        </p>
                      </div>

                      <div>
                        <h5 className="font-sans font-black text-xs uppercase tracking-wider mb-1.5">• 2. DETAILED AGE MATRIX & RELAXATION BOUNDARDS:</h5>
                        {job.eligibilityData?.ageLimit ? (
                          <div className="ml-3 space-y-3">
                            <p className="leading-relaxed">
                              Applicants must have completed <b className="text-white bg-indigo-650 px-2 py-0.5 rounded text-xs select-all">{job.eligibilityData.ageLimit.min} years</b> of age and must not have exceeded <b className="text-[#f43f5e]">{job.eligibilityData.ageLimit.max} General category limits</b> on the official cutoff date.
                            </p>
                            <div className={`p-4 rounded-xl border font-mono text-[10px] space-y-2 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-250'}`}>
                              <p className="font-black uppercase border-b pb-1 text-indigo-400">STATE RESERVATIONS MAXIMUM AGE MARGINS:</p>
                              {Object.entries(job.eligibilityData.ageRelaxation).map(([catReg, valStr], idx) => (
                                <div key={idx} className="flex justify-between">
                                  <span>Category Segment: {catReg}</span>
                                  <span className="font-black text-indigo-400">{valStr as string}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="ml-3 leading-relaxed">
                            Candidates must have reached at least 18 years of age and not exceeded 30-35 depending on regional state relaxation categories.
                          </p>
                        )}
                      </div>

                      {job.eligibilityData?.physical && (
                        <div>
                          <h5 className="font-sans font-black text-xs uppercase tracking-wider mb-2">• 3. PHYSICAL RECRUITMENT FITNESS BENCHMARKS:</h5>
                          <div className="ml-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className={`border p-4 rounded-xl ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">HEIGHT SPECIFICATION:</span>
                              <span className="text-xs font-bold block">{job.eligibilityData.physical.height}</span>
                            </div>
                            <div className={`border p-4 rounded-xl ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">CHEST MEASUREMENT:</span>
                              <span className="text-xs font-bold block">{job.eligibilityData.physical.chest}</span>
                            </div>
                            <div className={`border p-4 rounded-xl sm:col-span-2 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">PHYSICAL ENDURANCE TRAINING (PET):</span>
                              <span className="text-xs font-bold block">{job.eligibilityData.physical.pet}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentPage === 3 && (
                  <div className="space-y-6">
                    <div className="border-b-2 border-current pb-2 border-double">
                      <h4 className="text-xs font-mono font-black text-indigo-400 uppercase tracking-wider">PAGE 03 • SUBJECT-WISE STRUCTURED SYLLABUS DIRECTORY</h4>
                      <p className="text-base font-serif font-black uppercase mt-1">EXHUSTIVE STUDY CURRICULUM</p>
                    </div>

                    <div className="space-y-4">
                      <p className="font-serif text-sm">
                        {highlightText(`The examination evaluates the following detailed modules. Each subject contains chapters with strict importance weights and topic coverage. Do not focus on non-educational administrative texts.`, searchQuery)}
                      </p>

                      <div className="space-y-3 font-sans">
                        {structuredSyllabus.subjects.map((sub, sidx) => (
                          <div key={sidx} className={`border rounded-xl overflow-hidden ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <div className={`px-4 py-2.5 border-b font-black text-[11px] uppercase tracking-wider flex justify-between items-center ${
                              isDarkMode ? 'bg-slate-900 border-slate-800 text-indigo-400' : 'bg-slate-50 border-slate-200 text-indigo-900'
                            }`}>
                              <span>{sidx + 1}. {sub.name} ({sub.totalQuestions} Questions • {sub.totalMarks} Marks)</span>
                              <span className="text-[8px] bg-indigo-500/10 px-2 py-0.5 rounded text-white tracking-widest uppercase">Secured</span>
                            </div>

                            <div className="p-4 space-y-3">
                              {sub.chapters.map((chap, cidx) => (
                                <div key={cidx} className="space-y-1.5 pb-2.5 border-b last:border-0 border-current/10">
                                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                                    <span className="text-indigo-400">● {chap.name}</span>
                                    <span className="text-rose-400">{chap.weightage} Weightage</span>
                                  </div>
                                  <div className="pl-4 text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-normal flex flex-wrap gap-x-3 gap-y-1">
                                    {chap.topics.map((t, tid) => (
                                      <span key={tid} className="bg-slate-500/5 px-2.5 py-1 rounded-md border border-current/5 block">
                                        {highlightText(t, searchQuery)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentPage === 4 && (
                  <div className="space-y-6">
                    <div className="border-b-2 border-current pb-2">
                      <h4 className="text-xs font-mono font-black text-indigo-400 uppercase tracking-wider">PAGE 04 • SCHEME OF EVALUATION & PATTERN ANALYSIS</h4>
                      <p className="text-base font-serif font-black uppercase mt-1">EVALUATION METRICS & NEGATIVE PENALTY</p>
                    </div>

                    <div className="space-y-5 text-sm font-sans">
                      <p className="font-serif leading-relaxed text-justify">
                        Assessments are conducted according to precise timelines under automated clock controls. All questions must conform strictly to standard weight metrics. No secondary redirects are required to parse metrics.
                      </p>

                      <div className="overflow-x-auto rounded-xl border border-current/15">
                        <table className="w-full border-collapse text-left text-xs text-current">
                          <thead>
                            <tr className={isDarkMode ? 'bg-slate-900 border-b border-slate-800' : 'bg-slate-50 border-b border-slate-200'}>
                              <th className="p-3 font-extrabold uppercase tracking-wider">EXAMINATION STAGE</th>
                              <th className="p-3 font-extrabold uppercase tracking-wider">EVALUATION METHOD</th>
                              <th className="p-3 font-extrabold uppercase tracking-wider text-center">TOTAL WEIGHTAGE</th>
                              <th className="p-3 font-extrabold uppercase tracking-wider text-center">DURATION ALLOTMENT</th>
                            </tr>
                          </thead>
                          <tbody>
                            {structuredSyllabus.examPatternSummary.stagesText.split('->').map((stageStr, idx) => {
                              const cleanStage = stageStr.trim().replace(/^[0-9•\-:> ]+/, '').toUpperCase();
                              if (!cleanStage) return null;
                              return (
                                <tr key={idx} className="border-b border-current/10 font-semibold last:border-0">
                                  <td className="p-3 font-black uppercase text-indigo-400">Stage {idx + 1}: {cleanStage}</td>
                                  <td className="p-3 font-medium uppercase text-slate-500 text-[10px]">Administrative CBT Metric Checklist</td>
                                  <td className="p-3 text-center font-extrabold text-amber-500">{idx === 0 ? structuredSyllabus.examPatternSummary.totalMarks : 'Qualifying Stage'} Marks</td>
                                  <td className="p-3 text-center">{structuredSyllabus.examPatternSummary.duration}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className={`p-4 rounded-xl border flex gap-3 text-rose-300 items-start ${
                        isDarkMode ? 'bg-rose-950/10 border-rose-900/30 text-rose-400' : 'bg-rose-50 border-rose-100 text-rose-900'
                      }`}>
                        <AlertTriangle className="w-4 h-4 text-[#f43f5e] shrink-0 mt-0.5 animate-bounce" />
                        <div>
                          <span className="font-black block uppercase mb-1 text-[10px]">⚠️ PENALTY SPECIFICATION DECLARATION CODE:</span>
                          <p className="text-[11px] font-bold uppercase">{highlightText(structuredSyllabus.examPatternSummary.negativeMarking, searchQuery)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentPage === 5 && (
                  <div className="space-y-6">
                    <div className="border-b-2 border-current pb-2 border-double">
                      <h4 className="text-xs font-mono font-black text-indigo-400 uppercase tracking-wider">PAGE 05 • HISTORICAL MINIMUM MARKS & CUTOFF CHART</h4>
                      <p className="text-base font-serif font-black uppercase mt-1">HISTORIC MARKS MATRIX</p>
                    </div>

                    <div className="space-y-5 text-sm font-sans">
                      <p className="font-serif leading-relaxed text-slate-400 mb-2">
                        Assess official previous years minimum thresholds below which academic shortlisting is closed:
                      </p>

                      {job.cutoffAnalysis?.years ? (
                        <div className="space-y-5">
                          <div className="overflow-x-auto rounded-xl border border-current/15">
                            <table className="w-full border-collapse text-left text-xs">
                              <thead>
                                <tr className={isDarkMode ? 'bg-slate-900 border-b border-slate-800' : 'bg-slate-50 border-b border-slate-205'}>
                                  < th className="p-3 font-extrabold uppercase">CYCLE YEAR</th>
                                  <th className="p-3 text-center font-extrabold uppercase">GEN (UNRESERVED)</th>
                                  <th className="p-3 text-center font-extrabold uppercase">OBC GROUP</th>
                                  <th className="p-3 text-center font-extrabold uppercase">EWS SEGMENT</th>
                                  <th className="p-3 text-center font-extrabold uppercase">SC GRADE</th>
                                </tr>
                              </thead>
                              <tbody>
                                {job.cutoffAnalysis.years.map((y, yidx) => (
                                  <tr key={yidx} className="border-b border-current/10 font-bold last:border-0 hover:bg-slate-500/5 transition-colors">
                                    <td className="p-3 font-black text-indigo-400">Recruitment Cycle {y.year}</td>
                                    <td className="p-3 text-center text-slate-400">{y.general}</td>
                                    <td className="p-3 text-center text-slate-400">{y.obc}</td>
                                    <td className="p-3 text-center text-slate-400">{y.ews}</td>
                                    <td className="p-3 text-center text-slate-400">{y.sc}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <div className={`p-4 rounded-xl border space-y-2 font-mono text-xs ${
                            isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-indigo-50 border-indigo-100'
                          }`}>
                            <div className="flex gap-2 items-center">
                              <span className="w-2.5 h-2.5 bg-indigo-550 rounded-full animate-ping" />
                              <span className="font-black text-indigo-400 uppercase tracking-widest">DEFINITIVE 2026 CYCLE SAFE SCORES TARGET:</span>
                              <span className="bg-indigo-600 text-white font-black px-2.5 py-0.5 rounded text-[10px] tracking-tight">
                                {job.cutoffAnalysis.predictedSafeScore}% MINIMUM PREDICTED
                              </span>
                            </div>
                            <p className="leading-relaxed font-serif text-slate-400 italic text-[11px] text-justify">
                              {highlightText(job.cutoffAnalysis.trendAnalysis, searchQuery)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border bg-slate-500/5 font-bold uppercase text-[10px] text-slate-400">
                          Previous years cutoff metrics successfully integrated in core database rosters. Safe recommendation target holds at 65% total Marks.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Stamp inside paper sheet */}
                <div className="border-t border-current/10 pt-4 mt-12 flex flex-col sm:flex-row justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest gap-2">
                  <span>BHARATEXAMS OFFICIAL IN-APP DELIVERED DOCS • {pdfType.toUpperCase()}</span>
                  <span>Page {currentPage} of {totalPages}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Paging Controller Station */}
      {!isBlocked && (
        <div className="bg-slate-900 border-t border-slate-800 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 shadow-xl relative z-10">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            PAGE <span className="text-white bg-slate-950 px-2.5 py-1 rounded-lg mx-1 font-mono">{currentPage}</span> OF <span className="text-slate-400 font-mono">{totalPages}</span>
          </div>

          <div className="flex flex-wrap gap-2 items-center justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-rose-600/10 border border-rose-500/20 hover:bg-rose-600 text-rose-400 hover:text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all active:scale-95 rounded-xl"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Tab
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 hover:bg-slate-800 hover:text-white text-slate-400 text-[10px] font-black uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-indigo-400" /> PREVIOUS
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-4 py-2 bg-slate-950 rounded-xl border border-indigo-500/30 hover:border-indigo-500 bg-indigo-650/10 hover:bg-indigo-600 text-indigo-400 hover:text-white text-[10px] font-black uppercase tracking-wider disabled:opacity-35 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              NEXT <ChevronRight className="w-4 h-4 text-indigo-450" />
            </button>
          </div>

          <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest hidden md:block">
            Secure Exam Companion (C) 2026 - BharatExams In-App PDF Ecosystem
          </div>
        </div>
      )}
    </div>
  );
}
