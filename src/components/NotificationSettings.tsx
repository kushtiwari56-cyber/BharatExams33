import React, { useState, useEffect } from 'react';
import { Bell, ShieldCheck, Play, Trash2, Moon, Sparkles, Languages, Check, Gauge, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  fetchUserNotifications, 
  markNotificationAsRead, 
  runNotificationIntelligenceLoop, 
  saveDeliveredNotification 
} from '../lib/notificationEngine';
import { SmartNotification, UserProfile } from '../types';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';

interface NotificationSettingsProps {
  userProfile: UserProfile | null;
  plannerState: any;
  onClose: () => void;
  onRefreshProfile: () => void;
}

export function NotificationSettings({ 
  userProfile, 
  plannerState, 
  onClose, 
  onRefreshProfile 
}: NotificationSettingsProps) {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [loading, setLoading] = useState(false);

  // Read config from profile, falling back to logical defaults
  const originalPrefs = userProfile?.notificationPreferences || {
    all: true,
    exams: true,
    results: true,
    studyAlerts: true,
    coachingTriggers: true,
    intensity: 'medium' as const,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    language: 'hi-en' as const,
    motivationalAlerts: true,
    engagementScore: 5
  };

  const [prefs, setPrefs] = useState(originalPrefs);

  // Load delivered history which is isolated per user
  useEffect(() => {
    loadDeliveredHistory();
  }, [userProfile]);

  const loadDeliveredHistory = async () => {
    if (userProfile?.uid) {
      setLoading(true);
      const list = await fetchUserNotifications(userProfile.uid);
      setNotifications(list);
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof typeof prefs, value: any) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);

    if (userProfile?.uid) {
      try {
        const userRef = doc(db, 'users', userProfile.uid);
        await updateDoc(userRef, {
          notificationPreferences: updated
        });
        onRefreshProfile();
      } catch (err) {
        console.error("Failed to save preference:", err);
      }
    }
  };

  const handleRequestNativePermission = async () => {
    if (!('Notification' in window)) {
      toast.error("Standard operating system notifications are not supported in your browser.");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      toast.success("Push Alerts Authorized!", {
        description: "You will now receive Duolingo-style exam and streak counters in your taskbar!"
      });
    } else {
      toast.error("Permission denied. Modify your browser configuration to hear from Adarsh's coach.");
    }
  };

  // Test trigger the engine
  const handleTestTrigger = async () => {
    try {
      if (userProfile) {
        // Enforce browser permission check first as feedback helper
        if ('Notification' in window && Notification.permission !== 'granted') {
          await handleRequestNativePermission();
        }

        await runNotificationIntelligenceLoop(
          userProfile,
          plannerState,
          (title, body, category) => {
            toast.success(title, {
              description: body,
              duration: 6000
            });
          }
        );
        // Reload list
        setTimeout(() => loadDeliveredHistory(), 800);
      }
    } catch (err: any) {
      toast.error("Engine failed: " + err.message);
    }
  };

  const handleRead = async (id: string) => {
    if (userProfile?.uid) {
      await markNotificationAsRead(userProfile.uid, id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl h-[90vh] bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl flex flex-col overflow-hidden font-sans"
      >
        {/* Banner header */}
        <header className="p-6 md:p-8 bg-gradient-to-tr from-slate-900 to-black text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center border border-white/15 shadow-inner">
              <Bell className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wider font-display shrink-0">Notification Center</h2>
              <p className="text-[10px] text-indigo-300 font-extrabold uppercase tracking-wide">Duolingo-Style Adaptive Ticker Engine</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Scrollable controls */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          
          {/* SECTION 1: GLOBAL CONTROL */}
          <section className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Enable Push Notifications Dispatch</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Main master toggle for study guidelines and deadline broadcasts</p>
            </div>
            <button
              onClick={() => updatePreference('all', !prefs.all)}
              className={`w-14 h-8 rounded-full transition-colors relative flex items-center p-1 ${prefs.all ? 'bg-indigo-601 bg-indigo-600' : 'bg-slate-300'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${prefs.all ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </section>

          {/* MASTER PREFS CONTAINER */}
          <AnPresenceOrNormal show={prefs.all}>
            <div className="space-y-6">
              
              {/* CATEGORIES SETTING */}
              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Configure Target Alert Channels</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  {/* Category 1: study-alerts */}
                  <div className="bg-white border border-gray-150 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-inner">
                    <div className="space-y-0.5">
                      <p className="text-xs font-black uppercase text-gray-900">Study Blueprints Alerts</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Syllabus tracking & weakest subtopic focus</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={prefs.studyAlerts !== false}
                      onChange={(e) => updatePreference('studyAlerts', e.target.checked)}
                      className="w-5 h-5 accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {/* Category 2: deadlines */}
                  <div className="bg-white border border-gray-150 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-inner">
                    <div className="space-y-0.5">
                      <p className="text-xs font-black uppercase text-gray-900">Exam Deadlines & Results</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Circular notices & registrations closures</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={prefs.exams !== false}
                      onChange={(e) => updatePreference('exams', e.target.checked)}
                      className="w-5 h-5 accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {/* Category 3: motivation */}
                  <div className="bg-white border border-gray-150 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-inner">
                    <div className="space-y-0.5">
                      <p className="text-xs font-black uppercase text-gray-900">Motivational Coaching Triggers</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Daily Duolingo streak savers & inspirations</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={prefs.motivationalAlerts !== false}
                      onChange={(e) => updatePreference('motivationalAlerts', e.target.checked)}
                      className="w-5 h-5 accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  {/* Category 4: intensity rate */}
                  <div className="bg-white border border-gray-150 p-4 rounded-2xl flex flex-col gap-2 shadow-inner justify-between">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-black uppercase text-gray-900 flex items-center gap-1"><Gauge className="w-3.5 h-3.5 text-orange-500" /> Reminder Intensity</p>
                      <select
                        value={prefs.intensity || 'medium'}
                        onChange={(e) => updatePreference('intensity', e.target.value)}
                        className="px-2 py-1 bg-slate-50 border border-gray-200 text-[10px] font-extrabold uppercase rounded outline-none cursor-pointer"
                      >
                        <option value="low">Low (Gentle)</option>
                        <option value="medium">Medium (Adaptive)</option>
                        <option value="high">High (Duolingo Style)</option>
                      </select>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">High scale sends over 10 smart motivation triggers daily.</p>
                  </div>

                </div>
              </div>

              {/* INTEL CONFIG: QUIET HOURS & LANGUAGE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Quiet Hours */}
                <div className="bg-slate-50/50 border border-slate-200 p-5 rounded-3xl space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-indigo-500 animate-pulse" />
                    Interactive Quiet Hours
                  </h4>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Quiet hours suppress all client-side taskbar pushes perfectly</p>
                  
                  <div className="flex gap-4 items-center">
                    <div className="flex-1 space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase">Sleep Start</label>
                      <input 
                        type="time" 
                        value={prefs.quietHoursStart || '22:00'}
                        onChange={(e) => updatePreference('quietHoursStart', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none cursor-pointer"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[8px] font-black text-slate-400 uppercase">Wake End</label>
                      <input 
                        type="time" 
                        value={prefs.quietHoursEnd || '07:00'}
                        onChange={(e) => updatePreference('quietHoursEnd', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Notifications language preference */}
                <div className="bg-slate-50/50 border border-slate-200 p-5 rounded-3xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-1.5">
                      <Languages className="w-4 h-4 text-emerald-500" />
                      Alert Dialect
                    </h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Select separate script purely for mobile & system alert delivery</p>
                  </div>

                  <div className="flex gap-2">
                    {['en', 'hi', 'hi-en'].map((langKey) => (
                      <button
                        key={langKey}
                        onClick={() => updatePreference('language', langKey)}
                        className={`flex-1 py-3 border rounded-2xl text-[10px] font-black uppercase tracking-wider relative cursor-pointer ${prefs.language === langKey ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
                      >
                        {langKey === 'en' ? 'English' : langKey === 'hi' ? 'Hindi' : 'Hinglish'}
                        {prefs.language === langKey && <span className="absolute right-1.5 top-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* DEMO TOOL: RUN IMMEDIATE TEST TRIGGER */}
              <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-3xl flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase text-indigo-900 flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    Test Trigger Coach Intelligence Loop
                  </h4>
                  <p className="text-[9px] text-indigo-700 font-bold uppercase tracking-tighter">Evaluate parameters & deliver 1 test alert instantly</p>
                </div>
                <button
                  onClick={handleTestTrigger}
                  className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-100"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Fire Alert Test
                </button>
              </div>

              {/* IN-APP ACTIVITY LOGS OR DELIVERED BULLETINS */}
              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Delivered Smart Notifications Log ({notifications.length})</span>
                
                {loading ? (
                  <div className="p-6 text-center text-xs font-bold text-slate-400 uppercase uppercase">Querying user alert ledger...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-gray-150 rounded-2xl text-center space-y-2">
                    <p className="text-xs font-black text-gray-450 uppercase uppercase">Ledger details empty</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed max-w-sm mx-auto">No study triggers have been generated recently. Change settings or hit "Fire Alert Test" above to populate immediately!</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 border border-gray-150 p-2 rounded-2xl bg-slate-50/20">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-3.5 rounded-xl border flex justify-between gap-4 justify-between items-center transition-all ${notif.read ? 'bg-white border-slate-100 opacity-60' : 'bg-blue-50/35 border-blue-100/50 shadow-sm'}`}
                      >
                        <div className="space-y-1 text-left min-w-0 flex-1">
                          <div className="flex gap-2 items-center flex-wrap">
                            <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${notif.category === 'motivation' ? 'bg-orange-100 text-orange-700' : notif.category === 'deadline' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{notif.category}</span>
                            <span className="text-[8px] font-bold text-slate-405 text-slate-400 uppercase tracking-widest">{notif.timestamp}</span>
                          </div>
                          <p className="text-xs font-black text-gray-800 uppercase tracking-tight">{notif.title}</p>
                          <p className="text-[10px] text-gray-500 font-bold leading-normal">{notif.body}</p>
                        </div>

                        {!notif.read && (
                          <button
                            onClick={() => handleRead(notif.id)}
                            className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all cursor-pointer shrink-0"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </AnPresenceOrNormal>

        </main>
      </motion.div>
    </div>
  );
}

// Simple wrapper wrapper to prevent error in motion module triggers
function AnPresenceOrNormal({ show, children }: { show: boolean, children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
