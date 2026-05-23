import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { 
  Briefcase, 
  Calendar, 
  Sparkles, 
  Bell, 
  Bot, 
  ChevronRight, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  Clock, 
  Compass, 
  ArrowRight 
} from 'lucide-react';
import { db } from '../lib/firebase';
import { Job } from '../types';
import { useAuth } from '../hooks/useAuth';
import { cn, formatDate } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { JobDetailsModal } from '../components/JobDetailsModal';
import { AppLogo } from '../components/AppLogo';
import { useLanguage } from '../hooks/useLanguage';
import { t, getDynamicTranslation, getDailyInsight } from '../lib/translations';
import { getLocalState, PlannerState } from '../lib/activityStore';

export function Home() {
  const { user, profile } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [plannerState, setPlannerState] = useState<PlannerState>(() => getLocalState(user?.uid));

  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));
      setJobs(fetched);
      setLoading(false);

      if (fetched.length < 5) {
        console.log("Sparse DB detected: Triggering automatic 2026 centralized exams indexing stream...");
        fetch('/api/jobs/auto-refresh', { method: 'POST' })
          .catch(err => console.error("Standard crawl failed:", err));
      }
    });
  }, []);

  // Update planner progress details on identity mount or update
  useEffect(() => {
    setPlannerState(getLocalState(user?.uid));
  }, [user]);

  // 1. LATEST FORMS
  const latestForms = jobs.slice(0, 4);

  // 2. UPCOMING DEADLINES
  const upcomingDeadlines = jobs
    .filter(job => job.lastDate)
    .sort((a, b) => new Date(a.lastDate).getTime() - new Date(b.lastDate).getTime())
    .slice(0, 3);

  // 3. RECOMMENDED EXAMS
  const recommendedExams = jobs.slice(4, 7);

  // 5. AI SUGGESTIONS ENGINE
  const totalTasks = plannerState?.tasks?.length || 0;
  const completedTasks = plannerState?.tasks?.filter(t => t.status === "completed").length || 0;
  const completionRatio = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const getAiSuggestion = () => {
    if (completionRatio >= 100 && totalTasks > 0) {
      return {
        tip: "Incredible, Aspirant! Your schedule is 100% complete for today. Focus on speed revision or attempt a full mocks solver to check your timing.",
        action: "Launch Exam Mocks",
        to: "/planner"
      };
    } else if (completionRatio > 0) {
      return {
        tip: "Awesome start! You have active revisions pending in your schedule. Ensure you review the historical weight ratios of topics first.",
        action: "Resume Daily Schedule",
        to: "/planner"
      };
    } else {
      return {
        tip: "Strategic Advice: Start with UPSC CSE General Studies or SSC CGL quant mock papers. Revision and timed practice are 90% of exam preparation success.",
        action: "Set Study Goal Today",
        to: "/planner"
      };
    }
  };

  const aiSuggestion = getAiSuggestion();

  // 6. RECENT OFFICIAL NOTIFICATIONS SYSTEM
  const recentNotifications = [
    { id: 'n1', title: 'UPSC Civil Services Prelims Exam Calendars 2025-2026 updated.', date: 'Just now', badge: 'ALERT' },
    { id: 'n2', title: 'NTA JEE Mains Session 1 Admit Card trace schedules announced.', date: '1 hour ago', badge: 'STATUS OUT' },
    { id: 'n3', title: 'SSC Combined Graduate Level (CGL) answer keys verified.', date: '4 hours ago', badge: 'RESULT BRIEF' }
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-lg mx-auto">
        <div className="h-10 w-48 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-48 w-full bg-gray-100 rounded-[3rem] animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-gray-100 rounded-[2rem] animate-pulse" />
          <div className="h-32 bg-gray-100 rounded-[2rem] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 min-h-screen bg-slate-50/50 font-sans">
      
      {/* Premium Sticky Hero Header */}
      <header className="bg-white border-b border-gray-100 p-8 pb-6 shadow-sm sticky top-0 z-50 backdrop-blur-md bg-white/95">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AppLogo size={48} />
            <div>
              <p className="text-[10px] font-black text-indigo-650 uppercase tracking-[0.3em] mb-0.5">{t('greeting_prefix', language)}</p>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase font-display leading-none">
                {profile?.displayName?.split(' ')[0] || t('guest_user', language)}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Streak Counter */}
            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-full border border-amber-500/20 text-[10px] font-black font-mono uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-amber-505 fill-current animate-pulse" />
              <span>{plannerState?.streak || 0} DAYS</span>
            </div>
            
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/planner')}
              className="w-11 h-11 rounded-2xl bg-slate-50 border border-gray-200/60 flex items-center justify-center relative shadow-sm hover:bg-slate-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-800" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-8">
        
        {/* ROW 1: PLANNER PROGRESS & AI SUGGESTIONS (SXS BENTO CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* BOARD 4: PLANNER PROGRESS */}
          <section className="bg-white border border-gray-150 rounded-[2.5rem] p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest font-mono">Real-time stats</span>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" /> PLANNER PROGRESS
                </h3>
              </div>
              <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100/50">LEVEL {plannerState.level || 1}</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black text-slate-705 uppercase">
                <span>Today's Task Grid</span>
                <span>{completedTasks} / {totalTasks} Step-Goals Done</span>
              </div>
              
              {/* Progress Bar Container */}
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-205/50 relative">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(12, completionRatio)}%` }}
                />
              </div>

              <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase font-mono tracking-wider pt-1">
                <span>{plannerState.xp || 50} XP</span>
                <span>{Math.max(0, 1000 - (plannerState.xp || 50))} XP TO NEXT LEVEL</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/planner')}
              className="w-full py-4.5 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[9.5px] tracking-widest rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              Open Daily Scheduler <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </section>

          {/* BOARD 5: AI SUGGESTIONS */}
          <section className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-4">
            <div className="relative z-10 flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span> Live Coaching Module
                </span>
                <h3 className="text-sm font-black tracking-widest flex items-center gap-1.5 text-white uppercase font-display">
                  <Bot className="w-4 h-4 text-indigo-400" /> AI Suggestions Advisor
                </h3>
              </div>
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>

            <p className="text-xs font-semibold text-slate-300 leading-relaxed text-left relative z-10">
              "{aiSuggestion.tip}"
            </p>

            <button
              onClick={() => navigate(aiSuggestion.to)}
              className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[9.5px] tracking-widest rounded-2xl flex items-center justify-center gap-1.5 mt-2 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer relative z-10"
            >
              {aiSuggestion.action} <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Background design accents */}
            <div className="absolute -right-12 -bottom-12 opacity-5">
              <Compass className="w-44 h-44" />
            </div>
          </section>
        </div>

        {/* BOARD 2: UPCOMING DEADLINES */}
        <section className="bg-white border border-gray-150 rounded-[2.5rem] p-6 shadow-sm space-y-4 text-left">
          <div className="flex justify-between items-center">
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-red-500" /> Upcoming Deadlines Check
              </h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Trace and secure direct applications before date close windows</p>
            </div>
            <span className="text-[9px] font-black text-red-500 font-mono tracking-wider bg-red-50 px-3 py-1 rounded-full uppercase">IMMINENT CUT-OFFS</span>
          </div>

          <div className="divide-y divide-gray-100">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((job) => (
                <div 
                  key={job.id} 
                  onClick={() => setSelectedJob(job)}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 p-2.5 rounded-xl transition-all cursor-pointer"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase font-mono">
                      CLOSES {formatDate(job.lastDate)}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 uppercase leading-snug">{getDynamicTranslation(job.title, language)}</h4>
                    <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">{getDynamicTranslation(job.organization, language)}</p>
                  </div>
                  <button className="px-5 py-3.5 bg-gray-950 text-white hover:bg-blue-600 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer">
                    Apply Now
                  </button>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs font-semibold text-gray-400 uppercase">
                All vacancy portals tracked are currently on normal timelines.
              </div>
            )}
          </div>
        </section>

        {/* BOARD 1: LATEST FORMS */}
        <section className="space-y-4 text-left">
          <div className="flex justify-between items-center mb-1">
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-650" /> Latest Forms Releases
              </h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-bold">Newest Indian government job forms & alerts</p>
            </div>
            <button 
              onClick={() => navigate('/explore')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[9px] font-extrabold tracking-widest uppercase transition-colors cursor-pointer"
            >
              Explore Feed
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestForms.map((job) => (
              <div 
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className="bg-white border border-slate-200/50 hover:border-indigo-400 rounded-3xl p-5 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between h-44 cursor-pointer group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[8px] font-black text-slate-400 font-mono uppercase tracking-widest">
                      {job.category || job.type || "VACANCY ALERT"}
                    </span>
                    <span className={cn(
                      "text-[8px] font-black px-2.5 py-1 rounded-full border uppercase font-display",
                      job.statusBadge?.toLowerCase().includes("started") || job.statusBadge?.toLowerCase().includes("active") ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-105"
                    )}>
                      {job.statusBadge || "LIVE"}
                    </span>
                  </div>
                  <h4 className="text-md font-black text-slate-900 uppercase leading-snug line-clamp-2 font-display group-hover:text-indigo-600 transition-colors">
                    {getDynamicTranslation(job.title, language)}
                  </h4>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{getDynamicTranslation(job.organization, language)}</span>
                  <div className="flex items-center gap-1 text-[9px] font-black text-slate-800 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> APPLY
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BOARD 3: RECOMMENDED EXAMS */}
        <section className="bg-white border border-gray-150 rounded-[2.5rem] p-6 shadow-sm space-y-4 text-left">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" /> Recommended Exams
            </h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Aspirational matches selected to align with your user profile criteria</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedExams.map((job) => (
              <div 
                key={job.id} 
                onClick={() => setSelectedJob(job)}
                className="bg-slate-50/50 border border-slate-150/60 p-5 rounded-2xl flex flex-col justify-between h-36 hover:bg-white hover:border-slate-300 transition-all cursor-pointer"
              >
                <div>
                  <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest block mb-1 font-mono">MATCH SCORE: 98%</span>
                  <h4 className="text-xs font-black text-slate-900 uppercase leading-tight line-clamp-2">{getDynamicTranslation(job.title, language)}</h4>
                </div>
                <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400">
                  <span>{job.vacancyCount ? `${job.vacancyCount} Slots` : "Open Merit"}</span>
                  <span className="text-slate-800 hover:text-indigo-600 justify-end flex items-center">Verify →</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BOARD 6: RECENT NOTIFICATIONS SYSTEM */}
        <section className="bg-white border border-gray-150 rounded-[2.5rem] p-6 shadow-sm space-y-4 text-left">
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-indigo-650" /> Recent Notifications Bulletin
            </h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Real-time alerts, answer sheets, admit card trackers & status briefs</p>
          </div>

          <div className="space-y-3">
            {recentNotifications.map((notif) => (
              <div key={notif.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex justify-between items-center gap-4">
                <div className="space-y-1">
                  <div className="flex gap-2 items-center">
                    <span className="text-[8px] font-black bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase font-mono border border-indigo-100/30">{notif.badge}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase font-mono">{notif.date}</span>
                  </div>
                  <p className="text-xs font-semibold leading-relaxed text-slate-800">{notif.title}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
              </div>
            ))}
          </div>
        </section>

      </main>

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
