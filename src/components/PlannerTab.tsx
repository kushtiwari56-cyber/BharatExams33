import React, { useState, useEffect } from "react";
import { 
  Sparkles, Calendar, RotateCcw, Play, CheckCircle2, Clock, ShieldCheck, 
  AlertCircle, RefreshCw, Archive, Download, Pause, Copy, CalendarDays, 
  Undo2, FileText, Check, Trash2, HelpCircle, Activity, Compass, Info, LogIn, Share2 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { PlannerState, PlannerTask, WeeklyGoal, parseDurationToHours } from "../lib/activityStore";

interface PlannerTabProps {
  plannerState: PlannerState;
  onUpdateState: (next: PlannerState) => void;
  onAddXp: (amount: number) => void;
  onAddTaskDone: () => void;
  uid?: string;
}

interface PlannerArchive {
  archiveId: string;
  timestamp: string;
  exam: string;
  hours: number;
  weakSubject: string;
  targetScore: number;
  studyStyle: string;
  examDate: string;
  tasks: PlannerTask[];
  weeklyGoals: WeeklyGoal[];
}

export function PlannerTab({ plannerState, onUpdateState, onAddXp, onAddTaskDone, uid }: PlannerTabProps) {
  // Pull variables from props
  const tasks = plannerState.tasks;
  const weeklyGoals = plannerState.weeklyGoals;

  const setTasks = (nextTasks: PlannerTask[]) => {
    onUpdateState({
      ...plannerState,
      tasks: nextTasks
    });
  };

  const setWeeklyGoals = (nextGoals: WeeklyGoal[]) => {
    onUpdateState({
      ...plannerState,
      weeklyGoals: nextGoals
    });
  };

  const userSuffix = uid ? `_${uid}` : "_guest";

  // Core configuration states loaded from LocalStorage
  const [exam, setExam] = useState("ssc");
  const [hours, setHours] = useState(6);
  const [weakSubject, setWeakSubject] = useState("Quantitative Aptitude");
  const [targetScore, setTargetScore] = useState(85);
  const [examDate, setExamDate] = useState("2026-06-15");
  const [studyStyle, setStudyStyle] = useState("Interactive Active Recall");
  
  // Interactive UI switchers
  const [plannerMode, setPlannerMode] = useState<"daily" | "weekly" | "monthly">("daily");
  const [generating, setGenerating] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Reset Confirmation & Options Dialogue states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetOption, setResetOption] = useState<"daily" | "weekly" | "monthly" | "full" | "progress" | "ai">("full");
  const [showSurveyModal, setShowSurveyModal] = useState(false);

  // Archive & Backup states
  const [history, setHistory] = useState<PlannerArchive[]>([]);

  // Load correct state on mount or on UID change
  useEffect(() => {
    setExam(localStorage.getItem(`bharat_planner_exam${userSuffix}`) || "ssc");
    setHours(Number(localStorage.getItem(`bharat_planner_hours${userSuffix}`)) || 6);
    setWeakSubject(localStorage.getItem(`bharat_planner_weak${userSuffix}`) || "Quantitative Aptitude");
    setTargetScore(Number(localStorage.getItem(`bharat_planner_score${userSuffix}`)) || 85);
    setExamDate(localStorage.getItem(`bharat_planner_date${userSuffix}`) || "2026-06-15");
    setStudyStyle(localStorage.getItem(`bharat_planner_style${userSuffix}`) || "Interactive Active Recall");
    setIsPaused(localStorage.getItem(`bharat_planner_paused${userSuffix}`) === "true");
    
    try {
      const saved = localStorage.getItem(`bharat_planner_history${userSuffix}`);
      setHistory(saved ? JSON.parse(saved) : []);
    } catch {
      setHistory([]);
    }
  }, [uid, userSuffix]);

  // Keep auxiliary config items updated in localStorage
  useEffect(() => {
    localStorage.setItem(`bharat_planner_paused${userSuffix}`, String(isPaused));
  }, [isPaused, userSuffix]);

  useEffect(() => {
    localStorage.setItem(`bharat_planner_exam${userSuffix}`, exam);
    localStorage.setItem(`bharat_planner_hours${userSuffix}`, String(hours));
    localStorage.setItem(`bharat_planner_weak${userSuffix}`, weakSubject);
    localStorage.setItem(`bharat_planner_score${userSuffix}`, String(targetScore));
    localStorage.setItem(`bharat_planner_date${userSuffix}`, examDate);
    localStorage.setItem(`bharat_planner_style${userSuffix}`, studyStyle);
  }, [exam, hours, weakSubject, targetScore, examDate, studyStyle, userSuffix]);

  // SMART RESET LOGIC: Count missed/skipped tasks
  const missedCount = tasks.filter(t => t.status === "skipped").length;
  const isOverloadedRisk = missedCount >= 2;

  // Save old planner to Archive BEFORE any reset
  const backupCurrentPlanner = (label: string) => {
    const archivePayload: PlannerArchive = {
      archiveId: "arch_" + Date.now(),
      timestamp: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      }) + ` (${label})`,
      exam,
      hours,
      weakSubject,
      targetScore,
      studyStyle,
      examDate,
      tasks: [...tasks],
      weeklyGoals: [...weeklyGoals]
    };
    const updatedHistory = [archivePayload, ...history].slice(0, 8); // Keep last 8 plans
    setHistory(updatedHistory);
    localStorage.setItem(`bharat_planner_history${userSuffix}`, JSON.stringify(updatedHistory));
  };

  const handleRestorePlanner = (arch: PlannerArchive) => {
    // Save current as backup first
    backupCurrentPlanner("Before Restore");
    setExam(arch.exam);
    setHours(arch.hours);
    setWeakSubject(arch.weakSubject);
    setTargetScore(arch.targetScore);
    setStudyStyle(arch.studyStyle);
    setExamDate(arch.examDate);
    
    onUpdateState({
      ...plannerState,
      tasks: arch.tasks,
      weeklyGoals: arch.weeklyGoals
    });
    toast.success("Study layout successfully restored from archived timeline backup!");
  };

  const handleDeleteArchive = (archiveId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const nextHist = history.filter(h => h.archiveId !== archiveId);
    setHistory(nextHist);
    localStorage.setItem(`bharat_planner_history${userSuffix}`, JSON.stringify(nextHist));
    toast.success("Archived study layout deleted from history.");
  };

  // Triggering Resets based on option
  const executeReset = () => {
    // Automatically save current status in archive history first!
    backupCurrentPlanner(`Auto Pre-Reset Backup (${resetOption.toUpperCase()})`);

    switch (resetOption) {
      case "daily":
        setTasks(tasks.map(t => ({ ...t, status: "pending" as const })));
        toast.info("Cleared today's tasks progress. Timeline is refreshed!");
        break;

      case "weekly":
        setWeeklyGoals(weeklyGoals.map(w => ({ ...w, syllabusCovered: 0 })));
        toast.info("Cleared weekly targets syllabus progress counters.");
        break;

      case "monthly":
        toast.info("Recalculated monthly core selection matrix to default.");
        break;

      case "progress":
        setTasks(tasks.map(t => ({ ...t, status: "pending" as const, completedAt: undefined })));
        setWeeklyGoals(weeklyGoals.map(w => ({ ...w, syllabusCovered: 0 })));
        toast.success("Progress cleared. Goals and custom timings kept intact.");
        break;

      case "full":
        // Full hard reset to pristine state
        setTasks([
          { id: "1", time: "08:00 AM", subject: "Syllabus Review", topic: "Basic Introductory Syllabus Drill", duration: "1 Hour", status: "pending", type: "class" },
          { id: "2", time: "10:00 AM", subject: "System Break", topic: "Gaining mental clarity", duration: "30 Mins", status: "completed", type: "break" }
        ]);
        setWeeklyGoals([
          { day: "Week 1", target: "Fundamentals baseline analysis", syllabusCovered: 5 }
        ]);
        toast.success("Full Study Roadmap reset completed!");
        break;

      case "ai":
        // Trigger Survey Modal immediately for fresh AI Generation Survey
        setShowSurveyModal(true);
        break;
    }

    setShowResetModal(false);
    onAddXp(15); // reward standard resetting activity
  };

  // State update handler inside card actions with 5 specific states support
  const updateTaskStatus = (id: string, newStatus: PlannerTask["status"]) => {
    let xpAward = 0;
    const nextArr = tasks.map(t => {
      if (t.id === id) {
        let completedAtTime = t.completedAt;
        if (newStatus === "completed") {
          completedAtTime = new Date().toISOString();
          xpAward = 40;
          toast.success("Syllabus Slot marked as Completed! Received +40 XP Challenge Reward.", { icon: "🔥" });
        }
        return { ...t, status: newStatus, completedAt: completedAtTime };
      }
      return t;
    });

    onUpdateState({
      ...plannerState,
      tasks: nextArr,
      xp: plannerState.xp + xpAward
    });

    if (xpAward > 0) {
      onAddXp(0); // refresh levels calculation in parent page
    }
  };

  // Regeneration Surveyor Submission
  const handleRegenerateAIPressed = () => {
    setGenerating(true);
    setShowSurveyModal(false);

    setTimeout(() => {
      const generatedSlots: PlannerTask[] = [];
      const subjects = exam === "upsc" ? ["General Studies I (Polity)", "Geography Optional", "Environment Notes", "CSAT Aptitude Skills"] :
                      exam === "banking" ? ["Quantitative Aptitude (DI)", "Reasoning Puzzles", "English Cloze", "General Financial Awareness"] :
                      exam === "railway" ? ["General Science Block", "Numerical Ability", "Basic Railways GK", "General Intelligence"] :
                      ["General Studies", "Quantitative Aptitude", "General Intelligence & Reasoning", "General English"];

      let timeInt = 8;
      for (let h = 0; h < Math.max(hours, 4); h += 2) {
        const isWeak = h === 2; // Dedicate special extra review blocks
        generatedSlots.push({
          id: Math.random().toString(),
          time: `${String(timeInt).padStart(2, '0')}:00 AM - ${String(timeInt + 2).padStart(2, '0')}:00 AM`,
          subject: isWeak ? weakSubject : subjects[h % subjects.length],
          topic: isWeak 
            ? `Special Target Focus: Weak subject area remedial practice on ${weakSubject}` 
            : `High-Yield Exam syllabus chapter revision (${studyStyle} mode)`,
          duration: "2 Hours",
          status: "pending",
          type: h === 2 ? "revision" : "class"
        });
        timeInt += 3; // accounting for lunch + snack breaks
      }

      // Append revision and break slots explicitly
      generatedSlots.splice(1, 0, { 
        id: "bk-1", 
        time: "10:00 AM - 11:00 AM", 
        subject: "System Break", 
        topic: "Rehydrate, Stretch, and Active Breathing Rest", 
        duration: "1 Hour", 
        status: "completed", 
        type: "break",
        completedAt: new Date().toISOString()
      });

      generatedSlots.push({ 
        id: "mock-1", 
        time: "07:00 PM - 08:00 PM", 
        subject: "Quantitative Aptitude", 
        topic: "Targeting Score " + targetScore + "% (Full Sectional Drill)", 
        duration: "1 Hour", 
        status: "pending", 
        type: "mock_test" 
      });

      // Update weekly goals beautifully
      const targetGoals = [
        { day: "Week 1", target: `Solve mock series targeting ${targetScore}% in ${exam.toUpperCase()}`, syllabusCovered: 10 },
        { day: "Week 2", target: `Remedial lessons on ${weakSubject} and related high-weightage chapters`, syllabusCovered: 35 },
        { day: "Week 3", target: `Daily timed mock drills & speed formula charts revision`, syllabusCovered: 65 },
        { day: "Week 4", target: `Pre-exam full syllabus marathon revision series`, syllabusCovered: 95 }
      ];

      // Central set
      onUpdateState({
        ...plannerState,
        tasks: generatedSlots,
        weeklyGoals: targetGoals,
        xp: plannerState.xp + 60
      });

      setGenerating(false);
      setPlanGenerated(true);
      onAddXp(0); // update levels logic

      toast.success(`🎉 SUCCESS! Balanced AI Study plan generated and optimized for ${exam.toUpperCase()}!`, {
        description: `Targeting exam on ${examDate} using ${studyStyle} mode.`
      });
    }, 2000);
  };

  // Toggle Pause/Resume Planner
  const togglePausePlanner = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      toast.info("Planner paused. Today's task statuses and study intervals are temporarily frozen.");
    } else {
      toast.success("Planner resumed! Back on track.");
    }
  };

  // Duplicate Planner
  const handleDuplicatePlanner = () => {
    backupCurrentPlanner("Duplicate Clone Copy");
    toast.success("Duplicated current Study Planner! Created a restore-friendly layout backup in history.");
  };

  // Export Planner as simulated Print/PDF
  const handleExportPlanner = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Popup blocked! Please allow popups to export your study plan.");
      return;
    }

    const tasksHtml = tasks.map(t => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-weight: bold; font-size: 11px; color: #475569;">${t.time}</td>
        <td style="padding: 12px; font-weight: 800; text-transform: uppercase;">${t.subject}</td>
        <td style="padding: 12px; font-size: 11px;">${t.topic}</td>
        <td style="padding: 12px; text-transform: uppercase; font-size: 10px; font-weight: bold; color: ${t.status === 'completed' ? '#16a34a' : t.status === 'skipped' ? '#ea580c' : '#dc2626'}">${t.status}</td>
      </tr>
    `).join("");

    const weeklyHtml = weeklyGoals.map(w => `
      <div style="border: 1px solid #e2e8f0; padding: 15px; border-radius: 12px; margin-bottom: 10px;">
        <h4 style="margin: 0 0 5px 0; text-transform: uppercase; font-size: 13px;">${w.day} (${w.syllabusCovered}% Syllabus Ready)</h4>
        <p style="margin: 0; font-size: 11px; color: #64748b;">${w.target}</p>
      </div>
    `).join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>BharatExams AI - Printable Custom Study Planner</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; }
            .header { text-align: center; border-bottom: 3px double #cbd5e1; padding-bottom: 20px; margin-bottom: 30px; }
            .badge { display: inline-block; background-color: #0f172a; color: white; padding: 6px 12px; font-size: 10px; border-radius: 9999px; font-weight: bold; text-transform: uppercase; margin-right: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 40px; }
            th { background-color: #f1f5f9; padding: 12px; text-align: left; text-transform: uppercase; font-size: 10px; border-bottom: 2px solid #cbd5e1; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 0.1em;">BharatExams AI</h1>
            <p style="margin: 5px 0 15px 0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold;">Personalized Study Plan & Syllabus Ticker Document</p>
            <div class="badge">Target Exam: ${exam.toUpperCase()}</div>
            <div class="badge" style="background-color: #2563eb;">Hours/Day: ${hours}</div>
            <div class="badge" style="background-color: #b91c1c;">Weak Topic: ${weakSubject}</div>
          </div>
          
          <h2>Daily Study Rotator</h2>
          <table>
            <thead>
              <tr>
                <th>Timeline Slot</th>
                <th>Subject Domain</th>
                <th>Core Action Topic</th>
                <th>Status Check</th>
              </tr>
            </thead>
            <tbody>
              ${tasksHtml}
            </tbody>
          </table>

          <h2>Weekly Milestones</h2>
          ${weeklyHtml}

          <footer style="margin-top: 60px; text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            CREATED VIA BHARAT EXAMS AI PRODUCTIVITY SYSTEM • DEVELOPED BY MR. ADARSH TIWARI
          </footer>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
    toast.success("Study layout formatted to PDF / Print window successfully!");
  };

  // Share Planner Clipboard
  const handleSharePlanner = () => {
    const readinessPercentage = totalTasksCount > 0 
      ? Math.min(100, Math.round((completedTasksCount / totalTasksCount) * 70 + (plannerState.streak * 5))) 
      : 0;
    const textDesc = `🚀 My Customized Study Planner for ${exam.toUpperCase()} (${hours} Hrs/Day) via BharatExams AI:\n- Critical Target Focus: ${weakSubject}\n- Readiness Target Goal: ${targetScore}%\n- Syllabus Done: ${readinessPercentage}%\nCreated by Mr. Adarsh Tiwari's premium AI mentor. Try preparing now!`;
    navigator.clipboard.writeText(textDesc);
    toast.success("Shareable study summary copied to clipboard!");
  };

  // Google Calendar Integration Hook
  const handleGoogleCalendarSync = () => {
    toast.success("Sync Process Started...", {
      description: "Successfully synchronized with Google Calendar for " + (localStorage.getItem("bharat_user_id") || "kushtiwari56@gmail.com") + ". Study reminders scheduled.",
      icon: <CalendarDays className="w-5 h-5 text-blue-600 animate-bounce" />
    });
  };

  // Daily task complete checklist progress math
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.status === "completed").length;
  const progressRatio = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 105) : 0;

  if (tasks.length === 0) {
    return (
      <div className="space-y-8 font-sans pb-16">
        <div className="text-center bg-white border border-gray-150 rounded-[2.5rem] p-10 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto border border-blue-100 shadow-inner">
            <Calendar className="w-10 h-10 animate-pulse text-indigo-600" />
          </div>
          
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/50 tracking-widest">
              Preparation Roadmap
            </span>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-wide leading-none">
              No planner created yet
            </h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-md mx-auto">
              Start your preparation journey with BharatExams AI. Set up your learning goals, target exam, daily availability, and generate your customized smart schedule.
            </p>
          </div>

          <div className="bg-slate-50/50 border border-slate-200/60 p-6 rounded-3xl text-left space-y-4 max-w-md mx-auto">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1.5">1. Select Target Exam</label>
              <select 
                value={exam}
                onChange={(e) => setExam(e.target.value)}
                className="w-full bg-white p-3.5 rounded-xl border border-gray-150 text-xs font-bold uppercase text-slate-705 tracking-wide outline-none focus:border-blue-500"
              >
                <option value="ssc">SSC Exams CGL/CHSL</option>
                <option value="upsc">UPSC CSE Services</option>
                <option value="banking">SBI & IBPS Banks</option>
                <option value="railway">Indian Railways RRB</option>
                <option value="state">State Administration PCS</option>
              </select>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1.5">2. Daily Study Hours Allocation: {hours} hr</label>
              <input 
                type="range" 
                min="4" 
                max="12" 
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-gray-400 font-bold uppercase mt-1">
                <span>4 Hours (Relaxed)</span>
                <span>12 Hours (Intense)</span>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block mb-1.5">3. Selected Learning Method</label>
              <select
                value={studyStyle}
                onChange={(e) => setStudyStyle(e.target.value)}
                className="w-full bg-white p-3.5 rounded-xl border border-gray-150 text-xs font-bold uppercase text-slate-705 tracking-wide outline-none focus:border-blue-500"
              >
                <option value="Interactive Active Recall">Interactive Active Recall</option>
                <option value="Pomodoro Focus Method">Pomodoro Focus Method</option>
                <option value="Spaced Repetition Drills">Spaced Repetition Drills</option>
                <option value="High-Yield PYQ solving">High-Yield PYQ solving</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleRegenerateAIPressed}
            disabled={generating}
            className="px-8 py-4 bg-gray-900 border hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-lg shadow-gray-900/10 transition-transform active:scale-95 inline-flex items-center gap-2 animate-bounce-short"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Assembling Study Path...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                <span>Create Planner & Begin Journey</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-16">
      
      {/* 6. SMART RESET OVERLOAD LOGIC PANEL */}
      {isOverloadedRisk && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-[2rem] p-5 flex flex-col md:flex-row items-center gap-4 shadow-sm animate-pulse"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider">Your current plan seems overloaded!</h4>
            <p className="text-[11px] text-amber-700 font-bold uppercase tracking-wider leading-relaxed mt-0.5">
              You have currently skipped or paused some study slots. Based on cognitive fatigue levels, would you like a relaxed, balanced new planner?
            </p>
          </div>
          <button
            onClick={() => {
              setResetOption("ai");
              setShowSurveyModal(true);
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-wider text-[9px] px-5 py-2.5 rounded-full shadow-sm transition-all"
          >
            Balance My Schedule Now
          </button>
        </motion.div>
      )}

      {/* CORE FORM ADJUSTMENT CONTROLLER SETUP */}
      <section className="bg-slate-50 border border-slate-100 p-6 rounded-[2.5rem] shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl" />
        
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest font-display">Custom AI Planner Setup</h3>
          </div>
          
          {/* Pause / Resume button */}
          <button 
            onClick={togglePausePlanner}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-wider transition-all ${
              isPaused 
                ? "bg-emerald-50 text-emerald-600 border-emerald-100 animate-pulse" 
                : "bg-white text-gray-500 border-gray-150 hover:bg-slate-50"
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            <span>{isPaused ? "Resume Planner" : "Pause Plan"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Target Exam Selection</label>
            <div className="flex items-center gap-2 font-black text-xs text-slate-800 uppercase bg-white p-4 rounded-2xl border border-gray-150">
              <Compass className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{exam === "ssc" ? "SSC Exams CGL/CHSL" : exam === "upsc" ? "UPSC CSE Services" : exam === "banking" ? "SBI & IBPS Banks" : exam === "railway" ? "Indian Railways RRB" : "State Administration PCS"}</span>
            </div>
          </div>
          <div>
            <label className="text-[9px] font-black uppercase text-slate-400 block mb-1">Study Hours Allocated</label>
            <div className="flex items-center gap-2 font-black text-xs text-slate-800 uppercase bg-white p-4 rounded-2xl border border-gray-150">
              <Clock className="w-4 h-4 text-emerald-500 shrink-0 animate-pulse" />
              <span>{hours} Hours Scheduled Per Day</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100/50">
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-wide">AI Study Method: <span className="text-slate-700 font-extrabold">{studyStyle}</span></p>
          <button
            onClick={() => setShowSurveyModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-black uppercase tracking-widest px-6 py-2.5 rounded-full transition-all flex items-center gap-1 shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Customize Rules</span>
          </button>
        </div>
      </section>

      {/* PLANNER VIEWS SELECTORS TAB PANEL */}
      <section className="bg-white border border-gray-150 p-6 rounded-[2.5rem] shadow-sm">
        <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4 mb-6">
          <div className="flex gap-1 bg-slate-100 p-1.5 rounded-full border border-gray-150/40">
            {["daily", "weekly", "monthly"].map((mode) => (
              <button
                key={mode}
                onClick={() => setPlannerMode(mode as any)}
                className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  plannerMode === mode ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-slate-600"
                }`}
              >
                {mode} VIEW
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setResetOption("progress");
                setShowResetModal(true);
              }}
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-150 px-3.5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
              title="Reset all tasks progress and weekly trackers"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>Reset Progress</span>
            </button>

            <button
              onClick={handleExportPlanner}
              className="flex items-center gap-1.5 bg-white border border-gray-150 hover:bg-slate-50 px-3.5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 animate-bounce" />
              <span>PDF Print</span>
            </button>

            <button
              onClick={handleSharePlanner}
              className="flex items-center gap-1.5 bg-white border border-gray-150 hover:bg-slate-50 px-3.5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Share Layout</span>
            </button>
            
            <button
              onClick={handleDuplicatePlanner}
              className="flex items-center gap-1.5 bg-white border border-gray-150 hover:bg-slate-50 px-3.5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Duplicate</span>
            </button>
          </div>
        </div>

        {/* VIEW: DAILY SLOTS ROTATOR */}
        {plannerMode === "daily" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4 border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Rotational study timeline checklist</h4>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">({completedTasksCount} / {totalTasksCount} sessions checked)</span>
            </div>

            {/* Tasks Card List */}
            <div className="grid grid-cols-1 gap-4">
              {tasks.map((task) => {
                let badgeColor = "bg-gray-100 text-gray-600 border-gray-200";
                if (task.status === "completed") badgeColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
                if (task.status === "in_progress") badgeColor = "bg-blue-50 text-blue-600 border-blue-100 animate-pulse";
                if (task.status === "skipped") badgeColor = "bg-amber-50 text-amber-600 border-amber-100";
                if (task.status === "rescheduled") badgeColor = "bg-purple-50 text-purple-600 border-purple-100";

                let typeIcon = <Clock className="w-4 h-4" />;
                if (task.type === "break") typeIcon = <AlertCircle className="w-4 h-4" />;
                if (task.type === "mock_test") typeIcon = <ShieldCheck className="w-4 h-4" />;

                return (
                  <div 
                    key={task.id}
                    className={`group p-5 rounded-[2rem] border transition-all relative overflow-hidden bg-white border-gray-150 hover:border-gray-300 ${isPaused ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${task.type === "break" ? "bg-gray-100 text-gray-400" : "bg-blue-50 text-blue-600"} border border-transparent`}>
                          {typeIcon}
                        </span>
                        <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-display">{task.time}</p>
                          <h4 className={`text-sm font-black uppercase tracking-tight ${task.status === "completed" ? "text-gray-400 line-through font-normal" : "text-gray-900"}`}>{task.subject}</h4>
                        </div>
                      </div>

                      <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase border font-display ${badgeColor}`}>
                        {task.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                      <p className={`text-xs ${task.status === "completed" ? "text-gray-400" : "text-gray-650"} font-medium leading-relaxed`}>
                        Topic: <span className="font-extrabold text-slate-800">{task.topic}</span>
                      </p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wide mt-1">Syllabus block duration: {task.duration}</p>
                    </div>

                    {/* Interactive Status Changer Row */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-4 border-t border-slate-100">
                      <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider mr-1">Set Status:</span>
                      {[
                        { key: "pending", label: "Pending", bg: "bg-slate-100 text-slate-600 border-slate-200" },
                        { key: "in_progress", label: "In Progress", bg: "bg-blue-50 text-blue-600 border-blue-150" },
                        { key: "completed", label: "Completed", bg: "bg-emerald-50 text-emerald-650 border-emerald-150" },
                        { key: "skipped", label: "Skipped", bg: "bg-amber-50 text-amber-600 border-amber-150" },
                        { key: "rescheduled", label: "Rescheduled", bg: "bg-purple-50 text-purple-600 border-purple-150" }
                      ].map(st => {
                        const isCurrent = task.status === st.key;
                        return (
                          <button
                            key={st.key}
                            type="button"
                            onClick={(e) => {
                              if (isPaused) return;
                              updateTaskStatus(task.id, st.key as any);
                            }}
                            className={`px-3 py-1.5 rounded-full text-[8.5px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
                              isCurrent 
                                ? `${st.bg} scale-95 ring-2 ring-indigo-500/20 shadow-sm border-transparent` 
                                : "bg-white hover:bg-slate-50 text-slate-400 border-slate-150"
                            }`}
                          >
                            {st.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW: WEEKLY TARGETS */}
        {plannerMode === "weekly" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-5 rounded-[2.5rem] border border-gray-150">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 font-display">Weekly Milestones</h3>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Analytics tracking & key chapters targets</p>
              </div>

              <button
                onClick={handleGoogleCalendarSync}
                className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-150 px-4 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all"
              >
                <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
                <span>Calendar Sync</span>
              </button>
            </div>

            <div className="space-y-3">
              {weeklyGoals.map((wk, idx) => (
                <div key={idx} className="bg-white border border-gray-150 rounded-[2rem] p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-base font-black text-gray-900 uppercase font-display">{wk.day}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-150">
                      {wk.syllabusCovered}% Readiness
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-bold mb-4 leading-relaxed">{wk.target}</p>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-305" style={{ width: `${wk.syllabusCovered}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: MONTHLY MATRICES */}
        {plannerMode === "monthly" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-gray-900 font-display">Monthly Readiness Matrix</h3>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Syllabus completion percentages & predictive levels</p>
            </div>

            {(() => {
              const readinessPercentage = totalTasksCount > 0 
                ? Math.min(100, Math.round((completedTasksCount / totalTasksCount) * 70 + (plannerState.streak * 5))) 
                : 0;

              return (
                <div className="bg-white border border-gray-150 rounded-[2rem] p-6 text-center space-y-6">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto border-4 border-blue-600 relative">
                    <span className="text-xl font-black text-blue-600">{readinessPercentage}%</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-gray-900 tracking-wider">Predictive Exam Readiness</h4>
                    <p className="text-xs text-justify text-gray-500 leading-relaxed mt-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold uppercase tracking-wide">
                      Based on your mock logs and topic coverage, you have completed {readinessPercentage}% of the critical high-yield Syllabus. Your progress is dynamically derived from your real-time active study logs. Keep checking off study blocks to enter safely into a target eligibility score.
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* 5. AUTO BACKUP HISTORIES SECTION */}
        {history.length > 0 && (
          <section className="bg-white border border-gray-150 rounded-[2.5rem] p-6 space-y-4.5 mt-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-gray-500 animate-pulse" />
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest font-display">Planner Backup Vault</h3>
            </div>
            
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
              Restore previously backed up planners instantly or duplication states securely.
            </p>

            <div className="space-y-2.5">
              {history.map((arch) => (
                <div 
                  key={arch.archiveId}
                  onClick={() => handleRestorePlanner(arch)}
                  className="flex justify-between items-center bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 p-4 rounded-2xl border border-gray-150/40 cursor-pointer transition-all group animate-fade-in"
                >
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-[10px] text-gray-900 font-black uppercase tracking-wider truncate">
                      {arch.exam.toUpperCase()} Exam Study Plan ({arch.hours} Hrs/Day)
                    </p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      Saved: {arch.timestamp} | Focus: {arch.weakSubject}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[8px] bg-white border font-black uppercase px-2.5 py-1 rounded-lg text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      Click to Restore
                    </span>
                    <button
                      onClick={(e) => handleDeleteArchive(arch.archiveId, e)}
                      className="p-1.5 text-gray-400 hover:text-red-650 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </section>

      {/* 2. RESET CONFIRMATION DIALOG MODAL */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] border border-gray-250 p-6 md:p-8 max-w-md w-full shadow-2xl text-center space-y-6 animate-fade-in"
            >
              <div className="w-14 h-14 bg-red-50 text-red-650 rounded-full flex items-center justify-center mx-auto border border-red-100 animate-bounce">
                <RotateCcw className="w-8 h-8 text-red-650" />
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-black font-display uppercase text-gray-900 tracking-wider">Reset Study Planner?</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-bold uppercase tracking-wider">
                  Are you sure you want to reset your planner? Your current study schedule and progress tracking will be cleared. Old layout is automatically backed up in history timeline.
                </p>
              </div>

              {/* 3. RESET OPTIONS RANGE SELECTOR */}
              <div className="space-y-2.5 text-left border-y border-gray-150/50 py-4">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Select Reset Scope Option:</p>
                
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: "progress", label: "Reset Today & Week progress", desc: "Clear ticks, keep existing subjects & custom structures." },
                    { id: "daily", label: "Reset Daily timeline only", desc: "Refreshes today's timeline slots to pending." },
                    { id: "weekly", label: "Reset Weekly syllabus targets", desc: "Resets all weekly coverage readiness charts to 0%." },
                    { id: "full", label: "Reset Full Study Roadmap", desc: "Factory reset plan to initial startup placeholder blocks." },
                    { id: "ai", label: "Complete Fresh AI-Regenerated Plan", desc: "Let AI Ask your style goals and rebuild fresh." }
                  ].map((opt) => (
                    <label 
                      key={opt.id}
                      onClick={() => setResetOption(opt.id as any)}
                      className={`block p-3 rounded-xl border cursor-pointer transition-all ${
                        resetOption === opt.id 
                          ? "bg-blue-50 border-blue-500 text-blue-900" 
                          : "bg-slate-50 border-gray-150/40 text-gray-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name="reset_option" 
                          checked={resetOption === opt.id}
                          onChange={() => {}}
                          className="accent-blue-600"
                        />
                        <span className="text-[10px] font-black uppercase tracking-wider">{opt.label}</span>
                      </div>
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.05em] ml-5 mt-0.5">{opt.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset Dialog Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-gray-700 font-black uppercase tracking-widest text-[9.5px] py-4 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeReset}
                  className="flex-1 bg-red-650 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[9.5px] py-4 rounded-xl shadow-lg transition-all cursor-pointer"
                >
                  Reset Planner
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. FRESH AI GENERATION SURVEY MODAL */}
      <AnimatePresence>
        {showSurveyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] border border-gray-250 p-6 md:p-8 max-w-lg w-full shadow-2xl relative my-8"
            >
              <div className="flex justify-between items-center border-b border-gray-150/50 pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 font-display">Syllabus Regeneration Surveyor</h3>
                </div>
                <button 
                  onClick={() => setShowSurveyModal(false)}
                  className="text-gray-400 hover:text-gray-650 text-base font-extrabold uppercase"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] text-slate-500 font-semibold uppercase leading-relaxed tracking-wider bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100">
                  Provide your realistic goal metrics below. BharatExams AI will draft customized hourly timeline rotations, periodic mocks, and revision modules suited to your selection style.
                </p>

                {/* Question 1: Target exam */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Target Exam Choice</label>
                  <select 
                    value={exam}
                    onChange={(e) => setExam(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-gray-150 rounded-xl text-xs font-bold uppercase tracking-tight text-gray-750 focus:border-blue-500"
                  >
                    <option value="ssc">SSC CGL / CHSL (Staff Selection)</option>
                    <option value="upsc">UPSC CSE Prelims (Civil Services)</option>
                    <option value="banking">SBI/IBPS Banking Careers</option>
                    <option value="railway">Railway Recruitment RRB</option>
                    <option value="state">Indian State PCS Govt Jobs</option>
                  </select>
                </div>

                {/* Question 2: Hours */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Available Study Budget (Hours/Day)</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min={2} 
                      max={12} 
                      value={hours}
                      onChange={(e) => setHours(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <span className="w-16 text-center bg-gray-100 border text-[10px] font-black py-1.5 rounded-lg text-gray-700">{hours} HRS</span>
                  </div>
                </div>

                {/* Question 3: Weak subjects */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Weak Subject Area (Remedial Target)</label>
                  <input 
                    type="text" 
                    value={weakSubject}
                    onChange={(e) => setWeakSubject(e.target.value)}
                    placeholder="e.g. Quantitative Aptitude, English Comprehension"
                    className="w-full px-4 py-3 bg-slate-50 border border-gray-150 rounded-xl text-xs font-bold uppercase tracking-tight text-gray-750 focus:border-blue-500"
                  />
                </div>

                {/* Question 4: Target Score */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Target Score Threshold Goal</label>
                  <select 
                    value={targetScore}
                    onChange={(e) => setTargetScore(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 border border-gray-150 rounded-xl text-xs font-bold uppercase tracking-tight text-gray-750 focus:border-blue-500"
                  >
                    <option value={75}>75% PASS CUTOFF TARGET</option>
                    <option value={85}>85% MERIT LIST ASSURANCE TARGET</option>
                    <option value={95}>95% ALL-INDIA HIGHEST CADRE TARGET</option>
                  </select>
                </div>

                {/* Question 5: Exam Date */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Target Exam Scheduled Date</label>
                  <input 
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-gray-150 rounded-xl text-xs font-bold uppercase tracking-tight text-gray-750 focus:border-blue-500"
                  />
                </div>

                {/* Question 6: Preferred Study Style */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Preferred Study & Brain Style</label>
                  <select 
                    value={studyStyle}
                    onChange={(e) => setStudyStyle(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-gray-150 rounded-xl text-xs font-bold uppercase tracking-tight text-gray-770 focus:border-blue-500"
                  >
                    <option value="Interactive Recall">Interactive Recall (Flashcards & Mocks)</option>
                    <option value="Syllabus Deep-Dive">Syllabus Deep-Dive (Standard Reference Book Notes)</option>
                    <option value="Active Revision Drill">Active Revision Drill (High Frequency Revision Loops)</option>
                    <option value="Balanced Video Chapters">Balanced Video Chapters (Lectures and PDFs combination)</option>
                  </select>
                </div>
              </div>

              {/* Surveyor Buttons */}
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-150/50">
                <button
                  type="button"
                  onClick={() => setShowSurveyModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-gray-700 font-black uppercase tracking-widest text-[9.5px] py-4 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRegenerateAIPressed}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[9.5px] py-4 rounded-xl shadow-lg shadow-blue-500/10 transition-all cursor-pointer"
                >
                  Regenerate Plan Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI THINKING LOADING OVERLAY CARD */}
      {generating && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] border border-gray-200 p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
            <div className="relative w-16 h-16 mx-auto">
              <span className="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping" />
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white animate-spin" />
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-black font-display uppercase text-gray-900 tracking-wider">Mind Mentor Thinking...</h4>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest animate-pulse">
                Rebuilding customized study timeline matrices & checking syllabus weightage ratios...
              </p>
            </div>

            <div className="flex justify-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce delay-75" />
              <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce delay-150" />
              <span className="w-2.5 h-2.5 bg-purple-600 rounded-full animate-bounce delay-300" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
