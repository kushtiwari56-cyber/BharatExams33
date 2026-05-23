import { doc, collection, addDoc, getDocs, query, where, orderBy, limit, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { SmartNotification, UserProfile } from '../types';

// Multi-lingual push templates (Duolingo-style + deadline + study triggers)
export interface Template {
  title: Record<string, string>;
  body: Record<string, string>;
  category: 'study' | 'deadline' | 'motivation' | 'broadcast';
}

export const NOTIFICATION_TEMPLATES: Template[] = [
  {
    title: {
      en: "🔥 Keep Your Streak Alive!",
      hi: "🔥 अपने लगातार पढ़ाई का रिकॉर्ड बचाएं!",
      "hi-en": "🔥 Streak in Danger! Keep it alive!"
    },
    body: {
      en: "Your study streak is at risk. Commit just 2 minutes now to review today's syllabus blueprint!",
      hi: "आपका लगातार पढ़ाई का रिकॉर्ड खतरे में है। आज का सिलेबस ब्लूप्रिंट देखने के लिए अभी केवल 2 मिनट निकालें!",
      "hi-en": "Aapki daily streak complete nahi hui hai. Aaj ka schedule update karne ke liye bas 2 mins nikaalein!"
    },
    category: 'motivation'
  },
  {
    title: {
      en: "📚 Syllabus Ticker Rotation",
      hi: "📚 पाठ्यक्रम टिकर रोटेशन",
      "hi-en": "📚 Today's Critical Topic Focus"
    },
    body: {
      en: "Adarsh's AI mentor recommends dedicating 45 minutes to your weakest subtopic right now.",
      hi: "आदर्श का AI मेंटर आपको आज ही अपने सबसे कमजोर सब-टॉपिक को 45 मिनट देने की सलाह देता है।",
      "hi-en": "Adarsh's AI guide says: Apne weak subject par aaj focus karein, 45 mins dedicate kijiye!"
    },
    category: 'study'
  },
  {
    title: {
      en: "⏳ Target Exam Deadline Alert",
      hi: "⏳ लक्षित परीक्षा पंजीकरण समय-सीमा",
      "hi-en": "⏳ Action Needed: Exam Registrations"
    },
    body: {
      en: "Important registration deadlines are close. Verify your application form status now!",
      hi: "महत्वपूर्ण पंजीकरण की अंतिम तिथि निकट है। अभी अपने आवेदन पत्र की स्थिति की जांच करें!",
      "hi-en": "Govt exam list forms key release deadlines pass soon. Check official links inside!"
    },
    category: 'deadline'
  },
  {
    title: {
      en: "🎯 Score Booster Goal",
      hi: "🎯 स्कोर बूस्टर लक्ष्य",
      "hi-en": "🎯 Practice Mock Challenge!"
    },
    body: {
      en: "Aiming for that 85% readiness target score? Challenge yourself with a 10-question rapid quiz.",
      hi: "क्या आप भी 85% रेडीनेस स्कोर चाहते हैं? चलिए 10 प्रश्नों की त्वरित स्पीड टेस्ट चैलेंज करें।",
      "hi-en": "Target marks level badhana hai? Ek simple mock test solve kijiye aaj!"
    },
    category: 'study'
  },
  {
    title: {
      en: "💡 Topper's Wisdom Capsule",
      hi: "💡 टॉपर का सूत्र ज्ञान",
      "hi-en": "💡 Topper's Shortcut Key Strategy"
    },
    body: {
      en: "Consistency beats talent. Finish 3 small planner items early to build momentum.",
      hi: "शारीरिक ताकत से ज्यादा निरंतरता मायने रखती है। जल्दी शुरुआत करने के लिए 3 छोटे टास्क पूरे करें।",
      "hi-en": "Consistency is key. Aaj bas 3 questions solve karke momentum set karein!"
    },
    category: 'motivation'
  },
  {
    title: {
      en: "🔔 Live Admit Card Release Tracker",
      hi: "🔔 एडमिट कार्ड रिलीज लाइव अपडेट",
      "hi-en": "🔔 Live Updates: Admit Card Checker"
    },
    body: {
      en: "Official admit cards schedules published. Direct official check link appended in your planner.",
      hi: "आधिकारिक प्रवेश पत्र शेड्यूल जारी हो चुका है। सीधे डाउनलोड करने का लिंक प्लानर में जोड़ा गया है।",
      "hi-en": "Admit Cards links are live! Direct checking connection ready now. Details check karein!"
    },
    category: 'deadline'
  },
  {
    title: {
      en: "⚡ Rapid Revision Power Hour",
      hi: "⚡ त्वरित रिवीजन पावर ऑवर",
      "hi-en": "⚡ Quick Formula Revision!"
    },
    body: {
      en: "Do a quick 15-minute formula scan. It reinforces long-term retention by 70%.",
      hi: "15 मिनट का त्वरित फॉर्मूला रिवीजन करें। यह आपकी याद रखने की क्षमता को 70% तक बढ़ाता है।",
      "hi-en": "Bas 15 mins ka quick formula revision karein. Memorizing confidence will double!"
    },
    category: 'study'
  },
  {
    title: {
      en: "👑 National Merit Rank Vision",
      hi: "👑 राष्ट्रीय योग्यता रैंक सपना",
      "hi-en": "👑 Dream Rank Chase!"
    },
    body: {
      en: "Your potential is unlimited. Spend 10 constructive minutes now on current affairs study boards.",
      hi: "आपकी क्षमता असीमित है। आज के करंट अफेयर्स समाचार देखने के लिए सिर्फ 10 मिनट लगाएं।",
      "hi-en": "Aapka target IAS/Officer rank possible hai. 10 mins current affairs padhein real-time!"
    },
    category: 'motivation'
  },
  {
    title: {
      en: "🎯 Micro Pattern Analysis",
      hi: "🎯 माइक्रो पैटर्न विश्लेषण",
      "hi-en": "🎯 Speed-up Solving Techniques"
    },
    body: {
      en: "Unlock toppers' patterns. Check out solved PYQ booklets inside your explore section now.",
      hi: "टॉपर्स की सीक्रेट परीक्षा शैली जानें। अभी एक्सप्लोर सेक्शन में सॉल्व्ड पेपर्स डाउनलोड करें।",
      "hi-en": "Toppers solutions key access check karein! Practice PDF solved keys are ready."
    },
    category: 'study'
  },
  {
    title: {
      en: "💪 Beat the Slump",
      hi: "💪 आलस्य को हराएं",
      "hi-en": "💪 Fight procrastination now!"
    },
    body: {
      en: "Feel lazy? Just start with 1 task. Committing is 90% of the battle. You can do this!",
      hi: "आलस्य आ रहा है? सिर्फ 1 आसान टास्क से शुरू करें। पहला कदम उठाना ही सबसे बड़ा काम है।",
      "hi-en": "Boring lag raha hai? Bas 1 direct blueprint page padh lijiye. You will excel!"
    },
    category: 'motivation'
  }
];

// Local offline storage fallback
const LOCAL_NOTIF_KEY = 'bharatexams_smart_notifications';

// Helper to check quiet hours
export function isCurrentlyInQuietHours(start: string = "22:00", end: string = "07:00"): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeVal = currentHour * 60 + currentMinute;

  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  const startTimeVal = startH * 60 + startM;
  const endTimeVal = endH * 60 + endM;

  if (startTimeVal > endTimeVal) {
    // Overlap midnight (e.g. 22:00 to 07:00)
    return currentTimeVal >= startTimeVal || currentTimeVal <= endTimeVal;
  } else {
    // Normal window (e.g. 01:00 to 06:00)
    return currentTimeVal >= startTimeVal && currentTimeVal <= endTimeVal;
  }
}

// Save active notification in Firestore for isolations, or local storage as fallback
export async function saveDeliveredNotification(notif: Omit<SmartNotification, 'id'>, uid: string) {
  try {
    if (uid) {
      const colRef = collection(db, 'users', uid, 'notifications');
      await addDoc(colRef, {
        ...notif,
        sentTimestamp: Date.now()
      });
    } else {
      // Offline fallback
      const current = getLocalNotifications();
      const newNotif = {
        ...notif,
        id: 'offline-' + Date.now() + Math.random().toString(36).substr(2, 5),
        sentTimestamp: Date.now()
      };
      localStorage.setItem(LOCAL_NOTIF_KEY, JSON.stringify([newNotif, ...current].slice(0, 50)));
    }
  } catch (error) {
    console.warn("Could not save notification to database:", error);
  }
}

export function getLocalNotifications(): SmartNotification[] {
  const raw = localStorage.getItem(LOCAL_NOTIF_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function fetchUserNotifications(uid: string): Promise<SmartNotification[]> {
  if (!uid) {
    return getLocalNotifications();
  }
  try {
    const colRef = collection(db, 'users', uid, 'notifications');
    const q = query(colRef, orderBy('sentTimestamp', 'desc'), limit(50));
    const snap = await getDocs(q);
    const list: SmartNotification[] = [];
    snap.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      } as SmartNotification);
    });
    return list;
  } catch (error) {
    console.error("Firestore user notifications failed:", error);
    return getLocalNotifications();
  }
}

export async function markNotificationAsRead(uid: string, notifId: string) {
  if (!uid) {
    const current = getLocalNotifications();
    const updated = current.map(n => n.id === notifId ? { ...n, read: true } : n);
    localStorage.setItem(LOCAL_NOTIF_KEY, JSON.stringify(updated));
    return;
  }
  try {
    const docRef = doc(db, 'users', uid, 'notifications', notifId);
    await updateDoc(docRef, { read: true });
  } catch (error) {
    console.error("Mark notification as read error:", error);
  }
}

// Primary intelligence loop: Runs periodically inside the user's browser runtime.
export async function runNotificationIntelligenceLoop(
  userProfile: UserProfile | null,
  plannerState: any,
  showOnScreenToast: (title: string, body: string, category: string) => void
) {
  if (!userProfile) return;

  const prefs = userProfile.notificationPreferences || {
    all: true,
    exams: true,
    results: true,
    studyAlerts: true,
    coachingTriggers: true,
    intensity: 'medium',
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
    language: 'hi-en',
    motivationalAlerts: true,
    engagementScore: 5
  };

  if (prefs.all === false) return;

  // 1. Check Quiet Hour rules
  const quietStart = prefs.quietHoursStart || '22:00';
  const quietEnd = prefs.quietHoursEnd || '07:00';
  if (isCurrentlyInQuietHours(quietStart, quietEnd)) {
    console.log("Suppressing notification loop: Currently in Quiet Hours window (" + quietStart + " to " + quietEnd + ")");
    return;
  }

  // 2. Adaptive Inactivity scoring
  const lastActiveTimestamp = localStorage.getItem('bharatexams_last_activity_time') || Date.now().toString();
  const diffHours = (Date.now() - Number(lastActiveTimestamp)) / (1000 * 60 * 60);

  let triggerProbability = 0.5; // Medium intensity base
  let inactivityMultiplier = 1.0;

  if (diffHours > 48) {
    // Inactive > 2 days -> Increase push rate immensely for re-engagement!
    inactivityMultiplier = 1.8;
  } else if (diffHours < 3) {
    // Highly active recently -> Reduce spam rate to respect space!
    inactivityMultiplier = 0.4;
  }

  const intensity = prefs.intensity || 'medium';
  if (intensity === 'low') triggerProbability = 0.2 * inactivityMultiplier;
  else if (intensity === 'high') triggerProbability = 0.8 * inactivityMultiplier;
  else triggerProbability = 0.45 * inactivityMultiplier;

  // Rolling roll to determine if we deliver an alert
  if (Math.random() > triggerProbability) {
    console.log("Intelligence roll skipped alert delivery. Intensity rate: " + intensity + ", multiplier: " + inactivityMultiplier.toFixed(2));
    return;
  }

  // 3. Select appropriate template category
  const activeCategories: string[] = [];
  if (prefs.exams !== false) activeCategories.push('deadline');
  if (prefs.studyAlerts !== false) activeCategories.push('study');
  if (prefs.coachingTriggers !== false || prefs.motivationalAlerts !== false) activeCategories.push('motivation');

  if (activeCategories.length === 0) return;

  const chosenCategory = activeCategories[Math.floor(Math.random() * activeCategories.length)];
  const eligibleTemplates = NOTIFICATION_TEMPLATES.filter(t => t.category === chosenCategory);
  if (eligibleTemplates.length === 0) return;

  const template = eligibleTemplates[Math.floor(Math.random() * eligibleTemplates.length)];

  // Determine Language
  const chosenLang = prefs.language || 'en';

  // Customize copy variables based on real profile & planner state!
  let title = template.title[chosenLang] || template.title['en'];
  let body = template.body[chosenLang] || template.body['en'];

  if (plannerState) {
    const examName = plannerState.exam || 'UPSC';
    const weakTopic = plannerState.weakSubject || 'General Studies';
    const streakCount = plannerState.streak || 0;

    body = body
      .replace(/\bupsc\b/gi, examName.toUpperCase())
      .replace(/your weakest subtopic/gi, `"${weakTopic}"`)
      .replace(/सबसे कमजोर सब-टॉपिक/gi, `"${weakTopic}"`)
      .replace(/weak subject/gi, `"${weakTopic}"`)
      .replace(/streak/gi, `${streakCount}-day streak`);
  }

  // 4. Save to DB for user's isolated history
  const payload: Omit<SmartNotification, 'id'> = {
    userId: userProfile.uid,
    title,
    body,
    category: template.category,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " • Today",
    read: false,
    language: chosenLang,
    sentTimestamp: Date.now()
  };

  await saveDeliveredNotification(payload, userProfile.uid);

  // 5. Fire OS Level Browser Notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/badge-icon.png'
    });
  }

  // 6. Trigger React toast
  showOnScreenToast(title, body, template.category);
}
