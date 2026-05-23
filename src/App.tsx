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
