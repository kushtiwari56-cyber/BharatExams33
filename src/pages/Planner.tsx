import React, { useState, useEffect } from "react";
import { DashboardTab } from "../components/DashboardTab";
import { PlannerTab } from "../components/PlannerTab";
import { TestsQuizzesTab } from "../components/TestsQuizzesTab";
import { AICoachTab } from "../components/AICoachTab";
import { SavedNotesTab } from "../components/SavedNotesTab";
import { BarChart3, Calendar, ShieldCheck, Bot, NotebookPen, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import {
  getLocalState,
  saveLocalState,
  syncStateToFirebase,
  loadStateFromFirebase,
  PlannerState,
  parseDurationToHours
} from "../lib/activityStore";

export default function Planner() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "planner" | "quizzes" | "coach" | "notes">("dashboard");
  const [plannerState, setPlannerState] = useState<PlannerState>(() => getLocalState(user?.uid));

  // Cloud & offline bi-directional sync listener on user authentication mount
  useEffect(() => {
    async function initCloudSync() {
      if (user?.uid) {
        toast.info("Syncing study plan with secure cloud...");
        const cloudState = await loadStateFromFirebase(user.uid);
        const local = getLocalState(user.uid);
        if (cloudState) {
          const localTime = new Date(local.updatedAt || 0).getTime();
          const cloudTime = new Date(cloudState.updatedAt || 0).getTime();
          if (cloudTime > localTime) {
            setPlannerState(cloudState);
            saveLocalState(cloudState, user.uid);
            toast.success("Cloud progress synced successfully! Core analytics updated.");
          } else {
            setPlannerState(local);
            await syncStateToFirebase(user.uid, local);
            toast.success("Offline-first planner changes uploaded to cloud.");
          }
        } else {
          setPlannerState(local);
          await syncStateToFirebase(user.uid, local);
        }
      } else {
        const local = getLocalState();
        setPlannerState(local);
      }
    }
    initCloudSync();
  }, [user]);

  // Central state update function
  const updatePlannerState = (nextState: PlannerState) => {
    const updated = {
      ...nextState,
      updatedAt: new Date().toISOString()
    };
    setPlannerState(updated);
    saveLocalState(updated, user?.uid);

    if (user?.uid) {
      syncStateToFirebase(user.uid, updated);
    }
  };

  const handleAddFieldXp = (amount: number) => {
    const nextXp = plannerState.xp + amount;
    const nextLevel = Math.floor(nextXp / 350) + 1;
    const leveledUp = nextLevel > plannerState.level;

    const nextState = {
      ...plannerState,
      xp: nextXp,
      level: nextLevel
    };

    updatePlannerState(nextState);

    if (leveledUp) {
      toast.success(`🎉 LEVEL UP! You reached Level ${nextLevel}!`, {
        description: "New study guides, high-yield practice modules, and AI mentor coaching options unlocked."
      });
    }
  };

  const handleTaskDone = () => {
    // Progress increment is handled internally by directly updating the specific task status
  };

  // Derived properties from genuine user activities
  const completedTasksCount = plannerState.tasks.filter(t => t.status === "completed").length;
  
  // Calculate total study hours sum
  const totalHoursStudied = plannerState.tasks
    .filter(t => t.status === "completed")
    .reduce((acc, t) => acc + parseDurationToHours(t.duration), 0) +
    plannerState.studySessions.reduce((acc, s) => acc + s.hours, 0);

  const streak = plannerState.streak;
  const xp = plannerState.xp;
  const level = plannerState.level;

  const tabOptions = [
    { id: "dashboard", label: "Dashboard", Icon: BarChart3 },
    { id: "planner", label: "Smart Planner", Icon: Calendar },
    { id: "quizzes", label: "Practice Center", Icon: ShieldCheck },
    { id: "coach", label: "Mind Mentor", Icon: Bot },
    { id: "notes", label: "Study Vault", Icon: NotebookPen }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 font-sans max-w-7xl mx-auto px-4 md:px-8 pt-4">
      {/* Visual Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pt-4">
        <div>
          <h1 className="text-xl font-display font-black uppercase text-gray-900 leading-tight flex items-center gap-2">
            <span>Career Super Console</span>
            <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">AI-Powered Exam Preparation & Productivity Hub</p>
        </div>

        {/* Global Streak Indicator */}
        <div className="flex gap-4 mb-2 bg-white px-5 py-3.5 rounded-full border border-gray-150 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-slate-705 font-extrabold uppercase tracking-wider">
            <span>🔥 {streak} Day Streak active</span>
          </div>
        </div>
      </div>

      {/* Modern Console Navigation Buttons */}
      <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none pb-4 mb-8">
        {tabOptions.map((tb) => {
          const isActive = activeTab === tb.id;
          return (
            <button
              key={tb.id}
              onClick={() => setActiveTab(tb.id as any)}
              className={`flex items-center gap-2 px-6 py-4 rounded-full text-[10px] font-black uppercase tracking-widest cursor-pointer border transition-all ${isActive ? "bg-gray-900 text-white border-gray-950 shadow-md shadow-gray-950/10 scale-95" : "bg-white text-gray-500 border-gray-150 hover:bg-slate-50"}`}
            >
              <tb.Icon className="w-4.5 h-4.5" />
              <span>{tb.label}</span>
            </button>
          );
        })}
      </div>

      {/* RENDER ACTIVE TABS CONTROLLER */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {activeTab === "dashboard" && (
          <DashboardTab
            plannerState={plannerState}
            onUpdateState={updatePlannerState}
          />
        )}

        {activeTab === "planner" && (
          <PlannerTab
            plannerState={plannerState}
            onUpdateState={updatePlannerState}
            onAddXp={handleAddFieldXp}
            onAddTaskDone={handleTaskDone}
            uid={user?.uid}
          />
        )}

        {activeTab === "quizzes" && (
          <TestsQuizzesTab
            plannerState={plannerState}
            onUpdateState={updatePlannerState}
            onAddXp={handleAddFieldXp}
          />
        )}

        {activeTab === "coach" && (
          <AICoachTab
            onAddXp={handleAddFieldXp}
          />
        )}

        {activeTab === "notes" && (
          <SavedNotesTab
            onAddXp={handleAddFieldXp}
          />
        )}
      </motion.div>
    </div>
  );
}
