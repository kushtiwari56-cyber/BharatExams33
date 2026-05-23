/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LanguageProvider } from './hooks/useLanguage';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { AI } from './pages/AI';
import { Admin } from './pages/Admin';
import { Profile } from './pages/Profile';
import Planner from './pages/Planner';
import { Loader2, Briefcase, Bot, Sparkles, TrendingUp, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationPrompt } from './components/NotificationPrompt';

import { ProfileForm } from './components/ProfileForm';
import { OnboardingCover } from './components/OnboardingCover';
import { AppLogo } from './components/AppLogo';

function AppContent() {
  const { user, loading, profile } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(() => localStorage.getItem("bharat_onboarded") === "true");

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Periodic background study triggers & streak motivator checks (like Duolingo)
  useEffect(() => {
    if (user && profile) {
      // Set last active timestamp
      localStorage.setItem('bharatexams_last_activity_time', Date.now().toString());

      const triggerIntervalCheck = async () => {
        const uid = user.uid;
        const userSuffix = uid ? `_${uid}` : "_guest";
        const plannerConfig = {
          exam: localStorage.getItem(`bharat_planner_exam${userSuffix}`) || "ssc",
          weakSubject: localStorage.getItem(`bharat_planner_weak${userSuffix}`) || "Quantitative Aptitude",
          streak: Number(localStorage.getItem(`bharat_planner_streak${userSuffix}`)) || 0,
        };

        const { runNotificationIntelligenceLoop } = await import('./lib/notificationEngine');
        const { toast } = await import('sonner');
        
        await runNotificationIntelligenceLoop(profile, plannerConfig, (title, body, category) => {
          toast.success(title, {
            description: body,
            duration: 6000
          });
        });
      };

      // Run immediately on app load (delayed slightly for smooth animation)
      const delayedInitialTick = setTimeout(() => {
        triggerIntervalCheck();
      }, 5000);

      // Run every 60 seconds of active user navigation
      const interval = setInterval(() => {
        triggerIntervalCheck();
      }, 60000);

      return () => {
        clearTimeout(delayedInitialTick);
        clearInterval(interval);
      };
    }
  }, [user, profile]);

  if (loading || showSplash) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 overflow-hidden relative">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center"
        >
          <div className="mb-8">
            <AppLogo size={150} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-widest font-display mb-2">BHARAT EXAMS</h1>
          <p className="text-[10px] font-black text-[#FF9933] uppercase tracking-[0.4em] animate-pulse">AI Career Super App 🇮🇳</p>
        </motion.div>
        
        <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1.5">
           {[0, 1, 2].map(i => (
             <motion.div 
              key={i}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.2, repeat: Infinity, repeatType: "reverse", duration: 1 }}
              className="w-1.5 h-1.5 bg-blue-500 rounded-full" 
             />
           ))}
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>
    );
  }

  if (!isOnboarded) {
    return <OnboardingCover onComplete={() => setIsOnboarded(true)} />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  const isProfileIncomplete = !profile?.state || !profile?.education?.qualification;

  if (isProfileIncomplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white">
        <ProfileForm onComplete={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-0 md:pl-64">
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/ai" element={<AI />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
      <Navigation />
      <NotificationPrompt />
    </div>
  );
}

function LoginScreen() {
  const { login } = useAuth();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Real-time Job Alerts",
      desc: "Get instant notifications for SSC, Banking, Railways & State PSC jobs.",
      icon: TrendingUp,
      color: "bg-orange-500"
    },
    {
      title: "AI Career Coach",
      desc: "Smart guidance for UPSC planning and exam strategy personalized for you.",
      icon: Bot,
      color: "bg-blue-600"
    },
    {
      title: "Direct Form Links",
      desc: "One-tap access to official application forms and notification PDFs.",
      icon: ShieldCheck,
      color: "bg-green-600"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden">
      {/* Premium Fixed Logo Header */}
      <div className="pt-8 flex flex-col items-center">
        <AppLogo size={90} withText={true} textColor="text-gray-900" />
      </div>

      <div className="flex-1 relative flex flex-col items-center justify-center p-8 pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="text-center"
          >
            <div className={`w-24 h-24 ${steps[step].color} rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl transition-colors duration-500`}>
              {React.createElement(steps[step].icon, { className: "w-12 h-12 text-white" })}
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4 uppercase font-display">{steps[step].title}</h2>
            <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
              {steps[step].desc}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col gap-4 w-full max-w-xs absolute bottom-12">
          <div className="flex justify-center gap-1.5 mb-6">
            {steps.map((_, i) => (
              <div 
                key={i} 
                onClick={() => setStep(i)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === step ? "w-8 bg-blue-600" : "w-1.5 bg-gray-200"}`} 
              />
            ))}
          </div>

          <button
            onClick={login}
            className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 hover:bg-gray-800 transition-all active:scale-95 shadow-xl shadow-gray-200"
          >
            Get Started <ChevronRight className="w-4 h-4" />
          </button>
          
          <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest text-center">
            Secured by Google Authentication
          </p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}
