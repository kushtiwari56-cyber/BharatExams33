import React, { useState } from "react";
import { ArrowRight, ChevronRight, CheckCircle2, Star, Target, Award, Sparkles, Navigation, Globe, BellRing, Smartphone, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AppLogo } from "./AppLogo";
import { getLocalState } from "../lib/activityStore";

interface OnboardingCoverProps {
  onComplete: () => void;
}

export function OnboardingCover({ onComplete }: OnboardingCoverProps) {
  const [slide, setSlide] = useState(0);

  const localState = getLocalState();
  const totalTasksCount = localState.tasks.length;
  const completedTasksCount = localState.tasks.filter(t => t.status === "completed").length;
  const readinessPercentage = totalTasksCount > 0 
    ? Math.min(100, Math.round((completedTasksCount / totalTasksCount) * 70 + (localState.streak * 5))) 
    : 0;
  const streak = localState.streak;

  const slides = [
    {
      title: "Never Miss Any Exam or Career Opportunity",
      gradient: "from-blue-600 via-indigo-600 to-slate-900",
      contentList: [
        "Real-time government and private exam alerts",
        "Instant official apply links & schedules",
        "UPSC, SSC, Railway, Police, NEET, JEE, State PCS",
        "Smart mobile notifications before deadlines",
        "Live admit card and result released trackers"
      ],
      illustrations: (
        <div className="relative w-full h-44 flex items-center justify-center overflow-hidden">
          <div className="absolute w-36 h-36 bg-blue-500/10 rounded-full blur-2xl" />
          <div className="relative z-10 space-y-3.5 w-full max-w-xs px-4">
            {/* Live Notification Card */}
            <motion.div 
              initial={{ x: -25, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-xl flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
                <BellRing className="w-4.5 h-4.5 text-white animate-bounce" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none">Last Date ALERT</p>
                <p className="text-xs font-black text-white truncate">SSC CGL Portal closing tomorrow!</p>
              </div>
            </motion.div>

            {/* Countdown Badge */}
            <motion.div 
              initial={{ x: 25, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">UPSC PRELIMS</span>
              </div>
              <span className="bg-amber-500 text-black text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider animate-bounce">2 Days Left</span>
            </motion.div>
          </div>
        </div>
      )
    },
    {
      title: "Your Personal AI Career Mentor",
      gradient: "from-slate-900 via-indigo-950 to-blue-950",
      contentList: [
        "AI explains every exam in simple human language",
        "Syllabus & dynamic preparation planning roadmap",
        "Instant smart student Eligibility check rules",
        "Interactive customized daily study planners",
        "Full support for Hinglish & regional languages"
      ],
      illustrations: (
        <div className="relative w-full h-44 flex items-center justify-center overflow-hidden">
          <div className="absolute w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
          <div className="relative z-10 space-y-3 w-full max-w-xs px-4">
            {/* Interactive Bot Voice Circle */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/30 mb-2">
                <Sparkles className="w-8 h-8 text-white animate-spin" />
              </div>
              <div className="inline-flex gap-1.5 items-center justify-center bg-white/5 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[9px] text-white font-black uppercase tracking-widest">Hinglish Coach Listening...</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Study Smarter, Not Harder",
      gradient: "from-indigo-900 via-purple-900 to-slate-900",
      contentList: [
        "Daily, weekly, and monthly goal organizers",
        "Syllabus completion percentage visual trackers",
        "Real-time mock tests & predictive All-India ranks",
        "Instant AI-powered weekly analytics diagnostic report",
        "Consistent daily study streaks & bonus XP achievements"
      ],
      illustrations: (
        <div className="relative w-full h-44 flex items-center justify-center overflow-hidden">
          <div className="absolute w-32 h-32 bg-purple-500/15 rounded-full blur-2xl animate-pulse" />
          <div className="relative z-10 w-full max-w-xs px-4 flex justify-center gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-3xl text-center w-28">
              <span className="text-2xl font-black text-white">{streak || 4} 🔥</span>
              <p className="text-[8px] font-black uppercase text-purple-300 tracking-widest mt-1">Study Streak</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-3xl text-center w-28">
              <span className="text-2xl font-black text-white">{readinessPercentage || 45}%</span>
              <p className="text-[8px] font-black uppercase text-purple-300 tracking-widest mt-1">Syllabus Covered</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Built for India’s Future Achievers 🇮🇳",
      gradient: "from-slate-950 via-gray-900 to-black",
      contentList: [
        "One supreme career platform with premium layout guidelines",
        "Designed and optimized directly for active Indian students",
        "Humble, highly reliable, offline safe persistence data blocks",
        "Instant notification bell alerts configuration profile"
      ],
      illustrations: (
        <div className="relative w-full h-44 flex flex-col items-center justify-center pb-4 text-center">
          <div className="bg-slate-900/60 p-4 rounded-full justify-center shadow-xl ring-2 ring-white/10">
            <AppLogo size={110} />
          </div>
          <div className="mt-4">
            <span className="text-[10px] bg-white/5 border border-white/10 rounded-full px-3 py-1 text-slate-300 uppercase font-black tracking-widest">
              State-of-the-art Super App
            </span>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (slide < slides.length - 1) {
      setSlide(slide + 1);
    } else {
      localStorage.setItem("bharat_onboarded", "true");
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem("bharat_onboarded", "true");
    onComplete();
  };

  const activeSlide = slides[slide];

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col justify-between bg-gradient-to-tr ${activeSlide.gradient} text-white font-sans overflow-y-auto`}>
      {/* Dynamic Header */}
      <header className="p-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2">
          <AppLogo size={32} />
          <span className="text-xs font-black tracking-widest uppercase">BharatExams AI</span>
        </div>
        
        {slide < slides.length - 1 && (
          <button 
            onClick={handleSkip}
            className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Skip
          </button>
        )}
      </header>

      {/* Slide Illustration + Details Block */}
      <main className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full px-6 py-4 relative z-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Slide Graphic */}
            {activeSlide.illustrations}

            {/* Slide Title */}
            <h2 className="text-2xl font-black text-center uppercase tracking-tight font-display leading-tight max-w-sm mx-auto">
              {activeSlide.title}
            </h2>

            {/* Bullet list facts */}
            <div className="space-y-2.5 max-w-xs mx-auto text-left">
              {activeSlide.contentList.map((fact, idx) => (
                <div key={idx} className="flex gap-2.5 items-start">
                  <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-blue-400" />
                  </span>
                  <p className="text-xs text-slate-200 font-bold leading-normal">{fact}</p>
                </div>
              ))}
            </div>

            {/* Premium Signature-style signature credit block on final slide */}
            {slide === slides.length - 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-6 border-t border-white/10 text-center space-y-1.5"
              >
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em]">Created & Developed By</p>
                <p className="text-lg font-bold font-serif italic tracking-wide text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] bg-gradient-to-r from-orange-400 via-white to-emerald-400 bg-clip-text text-transparent">
                  Mr. Adarsh Tiwari
                </p>
                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">National Careers Hackathon Honors Recipient</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom controls panel */}
      <footer className="p-8 max-w-lg mx-auto w-full space-y-6 relative z-10">
        {/* Progress trackers dots */}
        <div className="flex justify-center gap-1.5">
          {slides.map((_, idx) => (
            <span 
              key={idx} 
              onClick={() => setSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === slide ? "w-8 bg-blue-500" : "w-1.5 bg-white/20"}`} 
            />
          ))}
        </div>

        {/* Action button */}
        <button
          onClick={handleNext}
          className="w-full bg-white text-gray-900 font-black uppercase tracking-[0.2em] text-[11px] py-4.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-100 cursor-pointer transition-transform active:scale-95 shadow-xl shadow-white/5"
        >
          {slide === slides.length - 1 ? (
            <>
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Next Feature</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Humbler footer declaration */}
        <p className="text-[8px] text-center text-slate-500 font-extrabold uppercase tracking-widest">
          MADE IN INDIA 🇮🇳 • DATA PRIVACY ASSURED
        </p>
      </footer>
    </div>
  );
}
