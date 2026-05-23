import React, { useState } from "react";
import { Award, CheckCircle2, XCircle, ArrowRight, ShieldCheck, Info, Loader2, Sparkles, AlertCircle, BarChart2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { PlannerState } from "../lib/activityStore";

interface TestsQuizzesTabProps {
  plannerState?: PlannerState;
  onUpdateState?: (next: PlannerState) => void;
  onAddXp: (amount: number) => void;
}

interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

export function TestsQuizzesTab({ plannerState, onUpdateState, onAddXp }: TestsQuizzesTabProps) {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // 1. Interactive 5 Questions Daily Series
  const questions: Question[] = [
    {
      id: 1,
      text: "Who was the first Indian woman to climb Mount Everest, representing peak determination in Indian exploration?",
      options: ["Bachendri Pal", "Santosh Yadav", "Arunima Sinha", "Premlata Agarwal"],
      correct: 0,
      explanation: "Bachendri Pal became the first Indian woman to reach the summit of Mount Everest in 1984."
    },
    {
      id: 2,
      text: "Under which Indian Constitutional Article are emergency provisions regarding State Breakdown (President's Rule) declared?",
      options: ["Article 352", "Article 356", "Article 360", "Article 370"],
      correct: 1,
      explanation: "Article 356 allows the President of India to suspend state administration if normal operations break down."
    },
    {
      id: 3,
      text: "A Train travels a distance of 360 km at a constant uniform speed. If speed was 5 km/h more, it takes 1 hour less. Find its original speed (in km/h).",
      options: ["30 km/h", "35 km/h", "40 km/h", "45 km/h"],
      correct: 2,
      explanation: "Let speed be x. (360/x) - (360/(x+5)) = 1. Solving gives x = 40 km/h. Formulated by standard distance equations."
    },
    {
      id: 4,
      text: "Which major river of Southern India is traditionally hailed with the title of 'Dakshin Ganga'?",
      options: ["Krishna River", "Narmada River", "Mahanadi River", "Godavari River"],
      correct: 3,
      explanation: "The Godavari River is the second longest river system in India and is called Dakshin Ganga due to its massive size."
    },
    {
      id: 5,
      text: "Find the odd word out: (A) Parliament (B) Judiciary (C) Cabinet (D) Constitution. Select based on legislative components.",
      options: ["Parliament", "Judiciary", "Cabinet", "Constitution"],
      correct: 3,
      explanation: "Parliament, Judiciary, and Cabinet represent active structural organs of governance, whereas the Constitution is the foundational legal document itself."
    }
  ];

  const handleSelectOption = (idx: number) => {
    if (answerSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setAnswerSubmitted(true);
    if (selectedOption === questions[currentQuestionIndex].correct) {
      setScore(score + 1);
      onAddXp(30);
      toast.success("Correct Answer! Received +30 XP Reward.");
    } else {
      toast.error("Incorrect Answer. Let's read the explanation block.");
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setAnswerSubmitted(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizFinished(true);
      
      // Save quiz score to standard study ecosystem database
      if (plannerState && onUpdateState) {
        const nextScoreLog = {
          id: Math.random().toString(),
          date: new Date().toISOString(),
          subject: "Quantitative Aptitude",
          score: score
        };
        const updatedScores = [nextScoreLog, ...plannerState.mockTestScores];
        onUpdateState({
          ...plannerState,
          mockTestScores: updatedScores,
          xp: plannerState.xp + 100
        });
      }

      onAddXp(100); // completion bonus!
      toast.success("Congratulations! Completed Daily Challenge Set +100 Base XP credited!");
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setAnswerSubmitted(false);
    setScore(0);
    setQuizFinished(false);
    setQuizStarted(true);
  };

  // Rank calculation mock variables
  const computedRank = Math.max(12, Math.floor(14500 - score * 2800));

  // Visual weak areas
  const weakTopics = [
    { title: "Trigonometrical Heights (Maths)", progress: 35, remark: "Critical Study Recommended" },
    { title: "Mughal Treaties & Reforms (History)", progress: 48, remark: "Slight Review Needed" },
    { title: "English Tenses Concord (Verbal)", progress: 85, remark: "Strong Readiness" }
  ];

  // Leaderboard statistics
  const leaderboard = [
    { rank: 1, name: "Aarav Sharma", score: "98%", status: "Level 8", avatar: "AS" },
    { rank: 2, name: "Priya Patel", score: "94%", status: "Level 6", avatar: "PP" },
    { rank: 3, name: "Meera Deshmukh", score: "91%", status: "Level 5", avatar: "MD" },
    { rank: 4, name: "You (Aspirant)", score: `${Math.floor((score / 5) * 100)}%`, status: "Level 4", avatar: "UA", active: true },
    { rank: 5, name: "Vikram Singh", score: "84%", status: "Level 4", avatar: "VS" }
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* 1. QUIZ CARD CONTAINER */}
      <section className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm">
        {!quizStarted && !quizFinished ? (
          <div className="text-center py-8 space-y-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto border border-blue-100">
              <Award className="w-8 h-8 animate-bounce" />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 tracking-widest">Interactive Daily Challenge</span>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Active Quiz of the Day</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-tight leading-normal">Solve 5 high-yield multiple choice questions to claim +250 total XP.</p>
            </div>
            <button
              onClick={() => setQuizStarted(true)}
              className="px-8 py-4 bg-gray-900 border hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-lg shadow-gray-900/10 transition-transform active:scale-95 mx-auto block"
            >
              Start Practice Quiz
            </button>
          </div>
        ) : quizFinished ? (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full">Challenge Scorecard</span>
              <h3 className="text-xl font-black text-gray-900 leading-tight">You Scored {score}/5 Correct Actions!</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wide leading-normal">Your All-India rank prediction was refreshed successfully.</p>
            </div>

            {/* Simulated Rank Engine */}
            <div className="p-5 bg-gradient-to-br from-gray-900 to-slate-900 text-white rounded-[2rem] text-left mx-auto max-w-sm border border-white/5 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Predicted Rank Range</span>
                <span className="bg-blue-600 text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wide">AIR</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-black"># {computedRank === 12 ? "12" : computedRank.toLocaleString()}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Out of 3,42,000 Candidates</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                Note: Rank calculations depend on response speeds + relative historical cutoff margins. Consistent scores of 4/5 elevate candidates inside the top 1% bracket.
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={restartQuiz}
                className="px-6 py-4 border border-gray-200 hover:bg-slate-50 text-gray-700 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer"
              >
                Retake Quiz
              </button>
              <button
                onClick={() => { setQuizFinished(false); setQuizStarted(false); }}
                className="px-6 py-4 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer shadow-md"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-150">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest font-display">Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span className="bg-amber-50 text-amber-600 border border-amber-100 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Solve & Claim</span>
            </div>

            <h4 className="text-sm font-black text-gray-900 leading-snug">
              {questions[currentQuestionIndex].text}
            </h4>

            {/* Options layout */}
            <div className="grid grid-cols-1 gap-2.5">
              {questions[currentQuestionIndex].options.map((opt, oIdx) => {
                let optionStyle = "bg-white hover:bg-slate-50 border-gray-150";
                
                if (selectedOption === oIdx) {
                  optionStyle = "bg-blue-50/70 border-blue-500 text-blue-900 font-bold";
                }
                
                if (answerSubmitted) {
                  if (oIdx === questions[currentQuestionIndex].correct) {
                    optionStyle = "bg-emerald-50 border-emerald-500 text-emerald-900 font-black";
                  } else if (selectedOption === oIdx) {
                    optionStyle = "bg-rose-50 border-rose-500 text-rose-900 font-medium";
                  } else {
                    optionStyle = "opacity-40 bg-white border-gray-150";
                  }
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    disabled={answerSubmitted}
                    className={`w-full text-left p-4 rounded-xl border flex items-center justify-between text-xs transition-colors cursor-pointer ${optionStyle}`}
                  >
                    <span>{opt}</span>
                    <span className="text-[10px] font-mono text-gray-400">Option {["A", "B", "C", "D"][oIdx]}</span>
                  </button>
                );
              })}
            </div>

            {/* Answer feedback explanation */}
            {answerSubmitted && (
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
                <div className="flex gap-2 items-center text-xs font-black uppercase tracking-wider text-gray-900">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Syllabus Explanation</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {questions[currentQuestionIndex].explanation}
                </p>
              </div>
            )}

            {/* Submissions flow */}
            <div className="flex justify-end pt-4 border-t border-gray-150">
              {!answerSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedOption === null}
                  className="px-6 py-4 bg-gray-900 hover:bg-black text-white disabled:opacity-50 text-[9px] font-black uppercase tracking-widest cursor-pointer rounded-xl flex items-center gap-2"
                >
                  <span>Submit Answer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-4 bg-blue-600 text-white hover:bg-blue-700 text-[9px] font-black uppercase tracking-widest cursor-pointer rounded-xl flex items-center gap-2"
                >
                  <span>{currentQuestionIndex === questions.length - 1 ? "Finish Series" : "Next Question"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 2. WEAK TOPIC ANALYTICS COMPILATION */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 className="w-5 h-5 text-rose-500" />
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest font-display">Weak Syllabus Areas & Revisions</h3>
          </div>

          <div className="space-y-4">
            {weakTopics.map((topic, index) => (
              <div key={index} className="space-y-1.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-wide text-gray-900">
                  <span className="truncate max-w-[180px]">{topic.title}</span>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${topic.progress < 40 ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}>
                    {topic.remark}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${topic.progress < 45 ? "bg-rose-500" : "bg-amber-500"}`} 
                      style={{ width: `${topic.progress}%` }} 
                    />
                  </div>
                  <span className="text-[10px] font-black text-gray-500">{topic.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. GAMIFIED CANDIDATE LEADERBOARD */}
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest font-display">Aspirants Live Competitors</h3>
          </div>

          <div className="space-y-3">
            {leaderboard.map((item, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-3.5 rounded-2xl border ${item.active ? "bg-blue-50/50 border-blue-200" : "bg-white border-gray-100"}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-gray-400 w-4">#{item.rank}</span>
                  <div className={`w-8 h-8 rounded-full ${item.active ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"} flex items-center justify-center text-[10px] font-bold`}>
                    {item.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-gray-900 tracking-tight leading-none">{item.name}</h4>
                    <span className="text-[8px] font-bold uppercase text-gray-400 mt-1 block">{item.status}</span>
                  </div>
                </div>
                <span className="text-xs font-black text-gray-900">{item.score}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
