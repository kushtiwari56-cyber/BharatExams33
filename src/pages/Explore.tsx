import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { Search, ChevronRight, Briefcase, GraduationCap, Building2, Gavel, Shield, Map, HeartPulse, Cpu, MonitorPlay, Users } from 'lucide-react';
import { db } from '../lib/firebase';
import { Job } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../lib/utils';
import { JobDetailsModal } from '../components/JobDetailsModal';
import { getLocalState, saveLocalState, syncStateToFirebase, PlannerState } from '../lib/activityStore';
import { useAuth } from '../hooks/useAuth';
import { Sparkles } from 'lucide-react';

const CATEGORIES = [
  { id: 'ssc', name: 'SSC', icon: Building2, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'upsc', name: 'UPSC', icon: Gavel, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'railway', name: 'Railways', icon: MonitorPlay, color: 'text-red-600', bg: 'bg-red-50' },
  { id: 'banking', name: 'Banking', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'police', name: 'Police', icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'teaching', name: 'Teaching', icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'defense', name: 'Defense', icon: Shield, color: 'text-slate-600', bg: 'bg-slate-50' },
  { id: 'state', name: 'State PSC', icon: Map, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'engineering', name: 'Engineering', icon: Cpu, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  { id: 'medical', name: 'Medical', icon: HeartPulse, color: 'text-pink-600', bg: 'bg-pink-50' },
];

export function Explore() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [liveSearchError, setLiveSearchError] = useState<string | null>(null);
  const [plannerState, setPlannerState] = useState<PlannerState>(() => getLocalState());

  const updatePlannerState = (nextState: PlannerState) => {
    const updated = {
      ...nextState,
      updatedAt: new Date().toISOString()
    };
    setPlannerState(updated);
    saveLocalState(updated);

    if (user?.uid) {
      syncStateToFirebase(user.uid, updated);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(q, (snapshot) => {
      setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)));
      setLoading(false);
    });
  }, []);

  const handleLiveSearch = async (queryStr: string) => {
    if (!queryStr || queryStr.trim().length === 0) return;
    setIsSearchingLive(true);
    setLiveSearchError(null);
    try {
      const response = await fetch('/api/jobs/live-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchQuery: queryStr })
      });
      const data = await response.json();
      if (data.success && data.job) {
        setSelectedJob(data.job);
      } else {
        setLiveSearchError(data.error || "Could not track active registrations or releases for this query.");
      }
    } catch (e: any) {
      console.error(e);
      setLiveSearchError("Real-time network unreachable. Please check your connection and try again.");
    } finally {
      setIsSearchingLive(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) || 
                          job.organization.toLowerCase().includes(search.toLowerCase()) ||
                          (job.tags && job.tags.some(t => t.toLowerCase().includes(search.toLowerCase())));
    const matchesCat = !selectedCat || job.tags?.some(t => t.toLowerCase() === selectedCat.toLowerCase()) || 
                      job.type.toLowerCase() === selectedCat.toLowerCase() ||
                      (job.category && job.category.toLowerCase() === selectedCat.toLowerCase());
    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-6 pb-32 max-w-4xl mx-auto space-y-8 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase font-display flex items-center gap-2">
            <span>Explore Careers</span>
          </h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
            Track daily vacancies, results & application updates
          </p>
        </div>
      </header>

      <div className="space-y-4">
        <div className="relative flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input 
                  type="text"
                  placeholder="Search NDA form, NEET apply, IIT JEE, UPSC 2026..."
                  className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm font-bold uppercase tracking-tight"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleLiveSearch(search);
                  }}
                />
              </div>
              <button 
                type="button"
                onClick={() => handleLiveSearch(search)}
                disabled={!search || isSearchingLive}
                className="px-8 py-5 bg-blue-600 hover:bg-blue-700 font-display font-black text-white rounded-[2rem] text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-500/15 cursor-pointer disabled:opacity-40 disabled:hover:bg-blue-600 flex items-center justify-center gap-2"
              >
                {isSearchingLive ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Search Web'}
              </button>
            </div>

            {isSearchingLive && (
              <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-[2rem] flex items-center gap-4 animate-pulse">
                <div className="w-8 h-8 rounded-full border-4 border-blue-500/30 border-t-blue-600 animate-spin" />
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Grounded AI Crawling Active</p>
                  <p className="text-[9px] font-bold text-blue-500 uppercase">Consulting official Indian portal indexes (UPSC, NTA, SSC, Railways) for 2026 dates...</p>
                </div>
              </div>
            )}

            {liveSearchError && (
              <div className="p-6 bg-red-50 border border-red-100 rounded-[2rem]">
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Notice</p>
                <p className="text-[9px] font-bold text-red-500 uppercase">{liveSearchError}</p>
              </div>
            )}

          {selectedCat && (
            <div className="p-5 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-[2rem] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-2xl shadow-sm text-lg">💡</div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Active Search Guidance Filtered</p>
                  <p className="text-[9px] font-bold text-gray-550 uppercase mt-0.5 mt-1">Refined to target specific Indian commission benchmarks</p>
                </div>
              </div>
            </div>
          )}

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Popular Categories</h2>
              {selectedCat && (
                <button 
                  onClick={() => setSelectedCat(null)}
                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest"
                >
                  Clear Filter
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id === selectedCat ? null : cat.id)}
                  className={cn(
                    "p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-3 group",
                    selectedCat === cat.id 
                      ? "bg-gray-900 border-gray-900 shadow-xl shadow-gray-200" 
                      : "bg-white border-gray-50 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-50"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                    selectedCat === cat.id ? "bg-white/10" : cat.bg
                  )}>
                    <cat.icon className={cn("w-6 h-6", selectedCat === cat.id ? "text-white" : cat.color)} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    selectedCat === cat.id ? "text-white" : "text-gray-900"
                  )}>
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Results ({filteredJobs.length})</h2>
            <div className="grid grid-cols-1 gap-4">
              {filteredJobs.map((job) => (
                <motion.div
                  layout
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className="bg-white border border-gray-100 rounded-[2.5rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shrink-0">
                      <Briefcase className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                      <div className="flex flex-wrap gap-2 items-center mb-1.5 font-display text-[9px] font-black uppercase tracking-widest">
                        {job.statusBadge && (
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full border",
                            (job.statusBadge.toLowerCase().includes("started") || job.statusBadge.toLowerCase().includes("active")) ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            (job.statusBadge.toLowerCase().includes("extend")) ? "bg-amber-50 text-amber-600 border-amber-100" :
                            (job.statusBadge.toLowerCase().includes("result")) ? "bg-rose-50 text-rose-600 border-rose-100" :
                            (job.statusBadge.toLowerCase().includes("out")) ? "bg-purple-50 text-purple-600 border-purple-100 animate-pulse" :
                            "bg-blue-50 text-blue-600 border-blue-100"
                          )}>
                            {job.statusBadge}
                          </span>
                        )}
                        <span className="text-gray-400">
                          {job.category || job.type || "Career"}
                        </span>
                        {job.vacancyCount && (
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200 text-[8px] font-black">
                            {job.vacancyCount} VACANCIES
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-gray-900 uppercase font-display leading-tight">{job.title}</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">{job.organization}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-display">Deadline</p>
                      <p className="text-xs font-black text-gray-900">{formatDate(job.lastDate)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJob(job);
                      }}
                      className="w-full md:w-auto px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-blue-50 cursor-pointer"
                    >
                      Details <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
      </div>

      <AnimatePresence>
        {selectedJob && (
          <JobDetailsModal 
            job={selectedJob} 
            onClose={() => setSelectedJob(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
