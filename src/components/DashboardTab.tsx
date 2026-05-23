import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from "recharts";
import { Trophy, Flame, Zap, CheckCircle2, Star, TrendingUp, Sparkles, BookOpen, Clock, BarChart4, ClipboardList, Target, Medal, Check, Compass } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { PlannerState, parseDurationToHours } from "../lib/activityStore";

interface DashboardTabProps {
  plannerState: PlannerState;
  onUpdateState: (next: PlannerState) => void;
}

export function DashboardTab({ plannerState, onUpdateState }: DashboardTabProps) {
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  // 1. Calculate Real Completed Tasks & Study Hours
  const totalTasksCount = plannerState.tasks.length;
  const completedCount = plannerState.tasks.filter(t => t.status === "completed").length;
  const totalHoursStudied = plannerState.tasks
    .filter(t => t.status === "completed")
    .reduce((acc, t) => acc + parseDurationToHours(t.duration), 0) +
    plannerState.studySessions.reduce((acc, s) => acc + s.hours, 0);

  // 2. Weekly Lessons Study Target Graph from True User Timestamps
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // Weekly hours studied per weekday (aggregated from real task timestamps and study sessions)
  const weeklyLessonData = days.map(dayLabel => {
    const hours = plannerState.tasks
      .filter(t => {
        if (t.status !== "completed" || !t.completedAt) return false;
        const d = new Date(t.completedAt);
        // Map getDay() where 0 is Sun, 1 is Mon etc.
        const weekdayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
        return days[weekdayIndex] === dayLabel;
      })
      .reduce((acc, t) => acc + parseDurationToHours(t.duration), 0) +
      plannerState.studySessions
        .filter(s => {
          const d = new Date(s.date);
          const weekdayIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;
          return days[weekdayIndex] === dayLabel;
        })
        .reduce((acc, s) => acc + s.hours, 0);

    return { 
      day: dayLabel, 
      hours: Math.round(hours * 10) / 10,
      color: dayLabel === "Sun" ? "#10b981" : "#3b82f6" 
    };
  });

  // Calculate high confidence active focus score & velocity metric
  const focusScore = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;
  
  // Prep Velocity is derived from the average of task completion percentage and score history
  const averageMockScore = plannerState.mockTestScores.length > 0
    ? Math.round(plannerState.mockTestScores.reduce((acc, cur) => acc + (cur.score / 5) * 100, 0) / plannerState.mockTestScores.length)
    : 0;

  const prepVelocityValue = totalTasksCount > 0
    ? Math.min(100, Math.round((completedCount / totalTasksCount) * 70 + (plannerState.streak * 5) + (averageMockScore * 0.2)))
    : 0;

  // 3. True Distribution computed by grouping tasks by subject
  const subjectDurations: Record<string, number> = {};
  const defaultCategories = ["General Studies", "Quantitative Aptitude", "Language & Vocab", "Reasoning Puzzles"];
  defaultCategories.forEach(c => subjectDurations[c] = 0);

  plannerState.tasks.forEach(t => {
    if (t.status === "completed") {
      const h = parseDurationToHours(t.duration);
      if (defaultCategories.includes(t.subject)) {
        subjectDurations[t.subject] += h;
      } else if (t.subject.toLowerCase().includes("gk") || t.subject.toLowerCase().includes("gs") || t.subject.toLowerCase().includes("study")) {
        subjectDurations["General Studies"] += h;
      } else {
        subjectDurations["Reasoning Puzzles"] += h;
      }
    }
  });

  plannerState.studySessions.forEach(s => {
    if (defaultCategories.includes(s.subject)) {
      subjectDurations[s.subject] += s.hours;
    } else {
      subjectDurations["General Studies"] += s.hours;
    }
  });

  // Ensure mock test scores contribute to Quantitative and GS distribution
  plannerState.mockTestScores.forEach(m => {
    const hrs = 0.5; // assume 30 mins study/exam weight per mock
    const sub = m.subject || "Quantitative Aptitude";
    if (defaultCategories.includes(sub)) {
      subjectDurations[sub] += hrs;
    } else {
      subjectDurations["Quantitative Aptitude"] += hrs;
    }
  });

  const aggregateHours = Object.values(subjectDurations).reduce((acc, v) => acc + v, 0);
  const subjectDiscussions = Object.entries(subjectDurations).map(([subject, hrs]) => {
    const percent = aggregateHours > 0 ? Math.round((hrs / aggregateHours) * 100) : 0;
    let color = "bg-blue-500 hover:bg-blue-600";
    if (subject === "Quantitative Aptitude") color = "bg-emerald-500 hover:bg-emerald-600";
    if (subject.includes("Language")) color = "bg-amber-500 hover:bg-amber-600";
    if (subject.includes("Reasoning")) color = "bg-purple-500 hover:bg-purple-600";

    return { subject, hours: Math.round(hrs * 10) / 10, percent, color };
  });

  const levelTitles = [
    "Panchayat Novice Aspirant",
    "SSC Cadet Officer Trainee",
    "UPSC Division Officer Master",
    "BharatExams Apex Scholar",
    "Indian Administrative Elite",
    "Cabinet Advisor General"
  ];
  const myLevelTitle = levelTitles[Math.min(plannerState.level - 1, levelTitles.length - 1)];

  // 4. Truly Dynamic Challenges derived from real user work!
  // Challenge 1: Need 1 Completed Task
  const hasTaskDone = completedCount >= 1;
  // Challenge 2: Completed at least 1 revision type task
  const hasRevisionDone = plannerState.tasks.some(t => t.type === "revision" && t.status === "completed");
  // Challenge 3: Scored high (>=4/5 score) in any mock test log
  const hasHighScoreMock = plannerState.mockTestScores.some(m => m.score >= 4);

  const challenges = [
    { 
      id: 1, 
      title: "Preparation Milestone", 
      desc: "Complete at least one master topic study slide in the Smart Planner.", 
      xp: 50, 
      done: hasTaskDone,
      progressText: hasTaskDone ? "Completed!" : "Pending action in Smart Planner"
    },
    { 
      id: 2, 
      title: "Revision Streak", 
      desc: "Finish at least one dedicated Revision module in the active task pool.", 
      xp: 75, 
      done: hasRevisionDone,
      progressText: hasRevisionDone ? "Completed!" : "Awaiting Revision review"
    },
    { 
      id: 3, 
      title: "Mock Drills Ace", 
      desc: "Attempt any mock test in the Practice Center and secure 80% accuracy or higher (4+ score).", 
      xp: 120, 
      done: hasHighScoreMock,
      progressText: hasHighScoreMock ? "Goal Achieved!" : "Awaiting quiz attempt in Practice Center"
    }
  ];

  const currentLevelXpProgress = plannerState.xp % 350;
  const xpPercent = Math.floor((currentLevelXpProgress / 350) * 100);

  // Auto-Reward user points for newly checked challenges
  const handleCheckChallengeBonus = (ch: typeof challenges[0]) => {
    if (ch.done) {
      toast.info(`Weekly challenge '${ch.title}' successfully verified. Already recorded in your profile metrics!`);
    } else {
      toast.message("Challenge is pending", {
        description: "Hop over to the 'Smart Planner' or 'Practice Center' tabs to execute these items!"
      });
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* 1. STATEFUL GAMIFICATION HEADER */}
      <section className="bg-gradient-to-tr from-[#111c3a] via-slate-900 to-[#0e3b2e] p-6 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden ring-1 ring-white/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-indigo-600 rounded-[1.8rem] flex items-center justify-center shadow-lg shrink-0">
              <Trophy className="w-8 h-8 text-yellow-300 animate-[bounce_2s_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF9933]">Aspirant Rank</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[8px] px-2.5 py-0.5 rounded-full font-black uppercase">Level {plannerState.level}</span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight leading-tight mt-0.5">{myLevelTitle}</h3>
              <p className="text-xs text-slate-300 font-bold">{plannerState.xp} Total Experience Points (XP)</p>
            </div>
          </div>

          <div className="flex gap-4 shrink-0 bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 w-full md:w-auto">
            <div className="flex-1 text-center px-2.5 border-r border-white/10">
              <div className="flex items-center justify-center gap-1.5">
                <Flame className="w-5 h-5 text-orange-500 animate-pulse fill-orange-500" />
                <span className="text-lg font-black">{plannerState.streak}d</span>
              </div>
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Active Streak</p>
            </div>
            <div className="flex-1 text-center px-2.5">
              <div className="flex items-center justify-center gap-1.5">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span className="text-lg font-black">{totalHoursStudied.toFixed(1)}h</span>
              </div>
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Focus Hours</p>
            </div>
          </div>
        </div>

        {/* Level Info Header - Progress Bar Removed */}
        <div className="mt-4 pt-4 border-t border-white/5 text-right relative z-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Rank Tier: level {plannerState.level + 1}</span>
        </div>
      </section>

      {/* 2. REAL-TIME INTERACTIVE ANALYTICS METRICS - Pure Absolute Indicators (No Progress Sliders) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            icon: Trophy, 
            value: `${plannerState.xp} XP`, 
            label: "Total Experience Points", 
            desc: "Accumulated system-wide reward points", 
            color: "bg-blue-50 text-blue-600 border-blue-100" 
          },
          { 
            icon: CheckCircle2, 
            value: `${completedCount} Tasks`, 
            label: "Planner Tasks Completed", 
            desc: "Genuine verified study blocks", 
            color: "bg-emerald-50 text-emerald-600 border-emerald-100" 
          },
          { 
            icon: Medal, 
            value: `${plannerState.mockTestScores.length} Mocks`, 
            label: "Quiz Runs Completed", 
            desc: plannerState.mockTestScores.length > 0 ? `Latest score: ${plannerState.mockTestScores[0].score}/5` : "Attempt practice exams to track", 
            color: "bg-orange-50 text-orange-600 border-orange-100" 
          },
          { 
            icon: Flame, 
            value: `${plannerState.streak} Days`, 
            label: "Active Study Streak", 
            desc: "Consecutive daily study runs", 
            color: "bg-purple-50 text-purple-600 border-purple-100" 
          }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-gray-150 rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color} border shadow-inner`}>
                <stat.icon className="w-5 h-5 flex-shrink-0" />
              </div>
              <span className="text-[9px] font-black font-display uppercase tracking-widest text-[#FF9933] bg-amber-50 px-2 py-0.5 rounded-md">LIVE</span>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
              <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mt-2">{stat.label}</h4>
              <p className="text-[9px] text-gray-400 font-semibold uppercase mt-0.5 leading-tight">{stat.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* 3. CHARTS AND SUBJECT DURATION DISTRIBUTIONS */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white border border-gray-150 p-6 rounded-[2.5rem] shadow-sm">
        {/* Dynamic Recharts Bar */}
        <div className="md:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart4 className="w-5 h-5 text-indigo-600 animate-pulse" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-display">Weekly Hours Studied (Genuine Data)</h3>
            </div>
            <span className="text-[9px] font-black text-emerald-600 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-150 tracking-widest">
              Live Tracker Active
            </span>
          </div>

          {totalHoursStudied === 0 ? (
            <div className="h-48 md:h-64 flex flex-col items-center justify-center bg-slate-50 border border-dashed border-gray-200 rounded-3xl p-6 text-center">
              <ClipboardList className="w-12 h-12 text-slate-333 stroke-1.5 mb-2 animate-bounce" />
              <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">No completed tasks recorded in graph yet!</h4>
              <p className="text-[10px] text-slate-400 uppercase font-semibold mt-1 max-w-sm">
                Head over to the <strong className="text-indigo-600 font-black">Smart Planner</strong> and change some task structures to <strong className="text-emerald-500 font-extrabold">COMPLETED</strong> to generate real-time metrics!
              </p>
            </div>
          ) : (
            <div className="h-48 md:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyLessonData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 9, fontWeight: 900, fill: "#64748b" }}
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    tick={{ fontSize: 9, fontWeight: 900, fill: "#64748b" }}
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ background: "#0f172a", border: "none", borderRadius: "1.2rem", color: "#fff", fontSize: "11px", fontWeight: "900" }} 
                    cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
                  />
                  <Bar dataKey="hours" radius={[8, 8, 0, 0]} barSize={26}>
                    {weeklyLessonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Dynamic Subject Breakdown */}
        <div className="md:col-span-4 space-y-5 flex flex-col justify-center">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#FF9933] mb-1">Time Distribution by Topic</h4>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Your focus is dynamically mapped in real-time from active study syllabus sessions.
            </p>
          </div>
          <div className="space-y-4">
            {subjectDiscussions.map((sb, i) => (
              <div 
                key={i} 
                onMouseEnter={() => setActiveSubject(sb.subject)}
                onMouseLeave={() => setActiveSubject(null)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${activeSubject === sb.subject ? "bg-slate-50 border-gray-300" : "bg-white border-transparent"}`}
              >
                <div className="flex justify-between text-xs font-black uppercase tracking-wide text-slate-900 mb-1.5">
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${sb.color.split(' ')[0]}`} />
                    {sb.subject}
                  </span>
                  <span>{sb.percent}% ({sb.hours}h)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. MOCK TEST SCORE LOGS & STUDY HISTORY */}
      {plannerState.mockTestScores.length > 0 && (
        <section className="bg-white border border-gray-150 p-6 rounded-[2.5rem] shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-emerald-500 animate-pulse" />
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest font-display">Tracked Practice Center Mock Logs</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plannerState.mockTestScores.map((score, idx) => {
              const scorePercent = Math.round((score.score / 5) * 100);
              return (
                <div key={score.id || idx} className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black uppercase text-indigo-600 tracking-wider">Attempted on {new Date(score.date).toLocaleDateString()}</span>
                    <h4 className="text-xs font-black uppercase tracking-wide text-slate-800 leading-none mt-1">{score.subject} Mini Mock</h4>
                  </div>
                  <div className="text-right">
                    <span className={`text-[11px] font-black px-3 py-1.5 rounded-full border ${scorePercent >= 80 ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-orange-50 text-orange-600 border-orange-200"}`}>
                      {score.score}/5 Correct ({scorePercent}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. DYNAMIC XP CHALLENGES CHALLENGES */}
      <section className="bg-white border border-gray-150 p-6 rounded-[2.5rem] shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest font-display">Daily Challenges & XP Bounty</h3>
        </div>

        <div className="space-y-3">
          {challenges.map((ch) => (
            <div 
              key={ch.id} 
              onClick={() => handleCheckChallengeBonus(ch)}
              className={`p-4 border rounded-[2rem] flex items-center justify-between gap-4 cursor-pointer transition-all ${
                ch.done 
                  ? "bg-slate-50 border-gray-200 text-gray-400 hover:bg-slate-100" 
                  : "bg-white border-gray-150 hover:border-gray-300 shadow-sm hover:shadow-md"
              }`}
            >
              <div className="flex gap-3 items-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ch.done ? "bg-emerald-100/70 text-emerald-650" : "bg-amber-50 text-amber-600"} border border-transparent`}>
                  {ch.done ? <Check className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className={`text-xs font-black uppercase tracking-wide leading-tight ${ch.done ? "text-gray-400 line-through font-normal" : "text-gray-900"}`}>{ch.title}</h4>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-1 leading-normal">{ch.desc}</p>
                  <p className={`text-[8px] font-black uppercase mt-1.5 tracking-wider ${ch.done ? "text-emerald-500" : "text-indigo-500"}`}>{ch.progressText}</p>
                </div>
              </div>
              <div className="text-right whitespace-nowrap shrink-0">
                <span className={`text-[10px] font-black uppercase px-2.5 py-1.5 rounded-full ${ch.done ? "bg-gray-100 text-gray-400" : "bg-emerald-50 text-emerald-650 font-black border border-emerald-100 animate-pulse"}`}>
                  +{ch.xp} XP
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
