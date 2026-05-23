import { useState } from 'react';
import { LogOut, Globe, Shield, User, GraduationCap, MapIcon, ChevronRight, Settings, Bell, HelpCircle, Heart, Share2, Info, Mail, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage, languages } from '../hooks/useLanguage';
import { cn } from '../lib/utils';
import { ProfileForm } from '../components/ProfileForm';
import { motion, AnimatePresence } from 'motion/react';
import { OnboardingCover } from '../components/OnboardingCover';
import { FeedbackSection } from '../components/FeedbackSection';
import { t } from '../lib/translations';
import { NotificationSettings } from '../components/NotificationSettings';

export function Profile() {
  const { user, profile, logout } = useAuth();
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const { language, setLanguage, detectedLocale, recommendedLanguageName } = useLanguage();
  const [showLanguages, setShowLanguages] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [forceShowOnboarding, setForceShowOnboarding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50 pt-10">
      <AnimatePresence>
        {forceShowOnboarding && (
          <OnboardingCover onComplete={() => setForceShowOnboarding(false)} />
        )}
      </AnimatePresence>
      <header className="px-6 py-8 bg-white border-b border-gray-100 flex flex-col items-center text-center">
        <div className="relative group">
          <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden mb-4 shadow-2xl border-[6px] border-white ring-1 ring-gray-100 group-hover:scale-105 transition-transform duration-500">
            <img 
              src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 bottom-4 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white border-4 border-white shadow-lg"
          >
            <Settings className="w-4 h-4" />
          </motion.div>
        </div>
        
        <h2 className="text-2xl font-black tracking-tight text-gray-900 font-display">{profile?.displayName || 'Job Seeker'}</h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{user?.email}</p>
        
        <div className="mt-6 flex flex-wrap gap-2 items-center justify-center">
          <span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-100">
            {profile?.role === 'admin' ? 'Super Admin' : 'Verified Aspirant'}
          </span>
          <button 
            onClick={() => setEditingProfile(true)}
            className="px-4 py-1.5 bg-white text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
          >
            Edit Profile
          </button>
          {profile?.role === 'admin' && (
            <Link 
              to="/admin"
              className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-gray-900 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-yellow-100/50 flex items-center gap-1.5 transition-all"
            >
              <Shield className="w-3.5 h-3.5" /> Admin Dashboard
            </Link>
          )}
        </div>
      </header>

      <main className="p-6 space-y-8 max-w-lg mx-auto w-full flex-1">
        
        <AnimatePresence>
          {editingProfile && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4"
            >
              <div className="relative w-full max-w-md">
                <ProfileForm onComplete={() => setEditingProfile(false)} />
                <button 
                  onClick={() => setEditingProfile(false)}
                  className="absolute -top-12 right-0 text-white font-bold text-sm uppercase tracking-widest hover:text-blue-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <Settings className="w-4 h-4 text-blue-600" />
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t("preferences", language)}</h3>
          </div>
          
          <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
            <button 
              onClick={() => setShowLanguages(!showLanguages)}
              className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100">
                  <Globe className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 uppercase font-display">{t("app_language", language)}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">
                    {languages.find(l => l.code === language)?.name}
                  </p>
                </div>
              </div>
              <ChevronRight className={cn("w-5 h-5 text-gray-300 transition-transform duration-300", showLanguages && "rotate-90")} />
            </button>
            
            <AnimatePresence>
              {showLanguages && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-gray-100 bg-gray-50/50"
                >
                  <div className="p-4 space-y-4">
                    {/* Auto-Detection & Recommendation Ribbon */}
                    <div className="p-4 bg-blue-50/80 border border-blue-100/50 rounded-2xl flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-blue-950 tracking-wider">Device Signal Detected</p>
                        <p className="text-xs text-blue-800 leading-normal mt-1">
                          Your system is configured to <strong className="font-extrabold">{detectedLocale}</strong>. We recommend using <strong className="font-extrabold">{recommendedLanguageName}</strong>.
                        </p>
                      </div>
                    </div>

                    {/* Integrated Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                      <input 
                        type="text"
                        placeholder="Search dynamic language scripts (e.g. Hindi, English)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-400"
                      />
                    </div>

                    {/* Highly Polished Interactive Target Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {languages
                        .filter(langObj => 
                          langObj.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          langObj.code.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map((l) => (
                          <button
                            key={l.code}
                            onClick={() => {
                              setLanguage(l.code);
                              setShowLanguages(false);
                            }}
                            className={cn(
                              "p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between h-20 relative cursor-pointer overflow-hidden",
                              language === l.code 
                                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-50" 
                                : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                            )}
                          >
                            <span className="text-[10px] font-black uppercase tracking-wider block">
                              {l.name}
                            </span>
                            <span className={cn(
                              "text-[8px] font-semibold block uppercase tracking-tight",
                              language === l.code ? "text-blue-100" : "text-gray-400"
                            )}>
                              {l.code === 'hi-en' 
                                ? 'Mix representation' 
                                : l.code === 'en' 
                                ? 'Global master index' 
                                : 'Offline Cache Active'}
                            </span>
                            
                            {language === l.code && (
                              <span className="absolute right-3 bottom-3 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                            )}
                          </button>
                        ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={() => setShowNotificationSettings(true)}
              className="w-full p-5 flex items-center justify-between border-t border-gray-50 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 border border-orange-100">
                  <Bell className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 uppercase font-display">{t("notifications", language)}</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Duolingo Alerts • Intensity: {profile?.notificationPreferences?.intensity?.toUpperCase() || 'MEDIUM'}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Support & Legals</h3>
          </div>
          <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm divide-y divide-gray-50">
            {/* Replay Onboarding Guide */}
            <button 
              onClick={() => setForceShowOnboarding(true)}
              className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 uppercase font-display">App Introduction</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter font-display">Replay Onboarding Slideshow</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>

            {/* Privacy Policy */}
            <button 
              onClick={() => alert("Privacy Policy:\n\nYour data is fully encrypted with industry-standard TLS protocols. BharatExams AI does not sell, rent, or trade your personal information with third parties. All mock papers, streak counts, and syllabus logs are stored locally using robust browser client containers or Firebase verified authentication rules.")}
              className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 uppercase font-display">Privacy Policy</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">v1.2.0 • Data is fully TLS Protected</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>

            {/* Terms & Conditions */}
            <button 
              onClick={() => alert("Terms & Conditions:\n\nBy accessing BharatExams AI, you agree to prepare with dedication and stay updated with live recruitment notices. The exam guidelines, study tools, syllabus analysis, and mock tests are to assist and cannot override current Indian Government notices.")}
              className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 border border-pink-100">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 uppercase font-display">Terms & Conditions</p>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Usage guidelines and protocols</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </section>

        {/* FEEDBACK & SUGGESTIONS CONTAINER */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <Heart className="w-4 h-4 text-rose-500" />
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Suggestions Desk</h3>
          </div>
          <FeedbackSection />
        </section>

        {/* Support contact info */}
        <div className="bg-gradient-to-tr from-slate-900 to-black text-white p-6 rounded-[2rem] border border-gray-800 space-y-4 shadow-xl">
          <p className="text-[10px] font-black uppercase text-amber-500 tracking-[0.25em]">Direct Developer Support</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-300">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>kushtiwari56@gmail.com</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-300">
              <Share2 className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Share BharatExams AI with other aspirants</span>
            </div>
          </div>
        </div>

        {/* Sign out button */}
        <button 
          onClick={logout}
          className="w-full bg-red-50 text-red-600 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-red-100 transition-all active:scale-95 border border-red-100 shadow-sm"
        >
          <LogOut className="w-4 h-4" /> Sign Out from BharatExams
        </button>

        {/* PREMIUM SIGNATURE VISUAL FOOTER FOR MR ADARSH TIWARI & MADE IN INDIA */}
        <div className="pt-8 border-t border-gray-150 text-center space-y-4 font-sans">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Created & Developed By</p>
            <p className="text-xl font-black font-serif italic text-gray-900 select-none drop-shadow-sm bg-gradient-to-r from-orange-600 via-slate-900 to-emerald-600 bg-clip-text text-transparent">
              Mr. Adarsh Tiwari
            </p>
            <p className="text-[8px] font-extrabold text-blue-500 uppercase tracking-widest">Master Engineer & National Honors Graduate</p>
          </div>

          <p className="text-[9px] text-gray-300 uppercase font-black tracking-[0.3em] flex items-center justify-center gap-2">
            <span>Powered by Generative AI • v1.2.0</span>
          </p>

          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-5 py-2.5 rounded-full shadow-sm">
            <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
              Made in India 🇮🇳 With Pride
            </span>
          </div>
        </div>
        <AnimatePresence>
          {showNotificationSettings && (
            <NotificationSettings 
              userProfile={profile} 
              plannerState={{
                exam: localStorage.getItem(`bharat_planner_exam_${user?.uid || "global"}`) || "ssc",
                weakSubject: localStorage.getItem(`bharat_planner_weak_${user?.uid || "global"}`) || "Quantitative Aptitude",
                streak: Number(localStorage.getItem(`bharat_planner_streak_${user?.uid || "global"}`)) || 0,
              }}
              onClose={() => setShowNotificationSettings(false)}
              onRefreshProfile={() => {
                // Instantly update the page as needed
              }}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
