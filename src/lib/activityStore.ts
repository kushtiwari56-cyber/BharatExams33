import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface PlannerTask {
  id: string;
  time: string;
  subject: string;
  topic: string;
  duration: string;
  status: "pending" | "in_progress" | "completed" | "skipped" | "rescheduled";
  type: "class" | "break" | "revision" | "mock_test";
  completedAt?: string; // ISO String
}

export interface WeeklyGoal {
  day: string;
  target: string;
  syllabusCovered: number; // 0 to 100
}

export interface StudySessionLog {
  id: string;
  date: string; // YYYY-MM-DD
  hours: number;
  subject: string;
  topic: string;
  type: string;
}

export interface MockTestLog {
  id: string;
  date: string;
  score: number; // Correct answers count (out of 5)
  subject: string;
}

export interface PlannerState {
  tasks: PlannerTask[];
  weeklyGoals: WeeklyGoal[];
  studySessions: StudySessionLog[];
  mockTestScores: MockTestLog[];
  xp: number;
  streak: number;
  level: number;
  updatedAt: string;
}

// Default initial tasks - empty to prevent cross-account leak and enforce setup onboarding
const DEFAULT_TASKS: PlannerTask[] = [];

const DEFAULT_WEEKLY_GOALS: WeeklyGoal[] = [];

// Parse duration to numeric hours
export function parseDurationToHours(dur: string): number {
  const normalized = dur.toLowerCase();
  if (normalized.includes("hour")) {
    const val = parseFloat(normalized);
    return isNaN(val) ? 1 : val;
  }
  if (normalized.includes("min")) {
    const val = parseFloat(normalized);
    return isNaN(val) ? 0.5 : val / 60;
  }
  return 1;
}

// Load static state if local storage is blank, isolated by user UID
export function getLocalState(uid?: string): PlannerState {
  const userKey = uid ? `_${uid}` : "_guest";
  try {
    const saved = localStorage.getItem(`bharat_jobs_planner_state${userKey}`);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error parsing local planner state", e);
  }

  const initial: PlannerState = {
    tasks: [],
    weeklyGoals: [],
    studySessions: [],
    mockTestScores: [],
    xp: 0,
    streak: 0,
    level: 1,
    updatedAt: new Date().toISOString()
  };
  return initial;
}

export function saveLocalState(state: PlannerState, uid?: string) {
  const userKey = uid ? `_${uid}` : "_guest";
  try {
    localStorage.setItem(`bharat_jobs_planner_state${userKey}`, JSON.stringify(state));
    // Preserve backward compatibility for high-level loose parameters
    localStorage.setItem(`bharat_jobs_xp${userKey}`, String(state.xp));
    localStorage.setItem(`bharat_jobs_streak${userKey}`, String(state.streak));
    localStorage.setItem(`bharat_jobs_level${userKey}`, String(state.level));
    
    // Also store some computed counters for backward compatible states
    const completedTasks = state.tasks.filter(t => t.status === "completed").length;
    localStorage.setItem(`bharat_jobs_completed_tasks_count${userKey}`, String(completedTasks));

    const totalHours = state.tasks
      .filter(t => t.status === "completed")
      .reduce((acc, t) => acc + parseDurationToHours(t.duration), 0);
    localStorage.setItem(`bharat_jobs_total_hours_studied${userKey}`, String(totalHours));
  } catch (e) {
    console.error("Failed to write state in local storage", e);
  }
}

// Async sync to Firebase Firestore for the user
export async function syncStateToFirebase(uid: string, state: PlannerState) {
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, { plannerState: state }, { merge: true });
  } catch (err) {
    console.error("Firebase Sync Error (Offline mode keeps local copy):", err);
  }
}

// Async load from Firebase Firestore for the user
export async function loadStateFromFirebase(uid: string): Promise<PlannerState | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && data.plannerState) {
        return data.plannerState as PlannerState;
      }
    }
  } catch (e) {
    console.error("Error loading secure planner state from cloud database:", e);
  }
  return null;
}
