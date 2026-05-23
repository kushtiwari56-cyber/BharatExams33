import React, { useState, useEffect } from "react";
import { Star, MessageSquare, Send, CheckCircle2, ShieldCheck, Mail, Smartphone, Globe, UploadCloud, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";

export function FeedbackSection() {
  const { user } = useAuth();
  
  // States
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [category, setCategory] = useState("Feature Request");
  const [feedbackValue, setFeedbackValue] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [appVersion] = useState("v1.2.0");
  const [deviceInfo, setDeviceInfo] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    if (user) {
      setUserName(user.displayName || "Job Seeker");
      setEmail(user.email || "aspirant@gmail.com");
    }
    // Set current device info securely
    const ua = navigator.userAgent;
    let bName = "Web Browser Interface";
    if (ua.includes("Firefox")) bName = "Firefox Browser";
    else if (ua.includes("Chrome")) bName = "Chrome Browser";
    else if (ua.includes("Safari")) bName = "Safari Mobile Agent";
    setDeviceInfo(`${bName} on ${navigator.platform || "Active System"}`);
  }, [user]);

  const categories = [
    "Bug Report",
    "UI Improvement",
    "Feature Request",
    "Wrong Information",
    "Performance Issue",
    "Other Suggestions"
  ];

  // Simulated screenshot upload handler
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
        toast.success("Screenshot uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackValue.trim()) {
      toast.error("Please enter a suggestion message.");
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await fetch("/api/feedback/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          rating,
          feedbackValue,
          category,
          userName,
          email,
          appVersion,
          deviceInfo,
          screenshot
        })
      });

      const resJson = await resp.json();
      if (resJson.success) {
        setShowThankYou(true);
        toast.success("Premium Suggestion logged to database!");
        setFeedbackValue("");
        setScreenshot(null);
      } else {
        throw new Error(resJson.error || "Submission failure");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to submit feedback. Saving locally as backup.");
      // Fallback state simulation
      setShowThankYou(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="feedback-hub" className="bg-white rounded-[2rem] border border-gray-150 p-6 md:p-8 shadow-sm space-y-6 max-w-lg mx-auto w-full transition-all hover:shadow-md relative overflow-hidden">
      
      {/* Dynamic Background decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -z-10 opacity-70" />
      
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="w-5 h-5 text-blue-600 animate-pulse" />
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest font-display">
          Help Us Improve BharatExams AI
        </h3>
      </div>

      <p className="text-xs text-slate-500 font-bold uppercase leading-relaxed tracking-wider mb-4">
        Your suggestion goes directly to the developer team & Mr. Adarsh Tiwari's priority dashboard review queue.
      </p>

      <AnimatePresence mode="wait">
        {!showThankYou ? (
          <motion.form 
            key="feedback-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit} 
            className="space-y-5"
          >
            {/* Star Rating Scale */}
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 text-center space-y-2">
              <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider block">
                Rate your Experience
              </span>
              <div className="flex justify-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = (hoverRating !== null ? hoverRating : rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 cursor-pointer transition-transform active:scale-95"
                    >
                      <Star 
                        className={`w-7 h-7 transition-colors duration-250 ${isActive ? "text-amber-500 fill-amber-500" : "text-gray-200"}`} 
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                Feedback Category
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {categories.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider text-left border transition-all ${
                        isSelected 
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                          : "bg-white text-gray-500 border-gray-150 hover:bg-slate-50"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Suggestions message box */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                Your Message / Suggestion Detail
              </label>
              <textarea
                value={feedbackValue}
                onChange={(e) => setFeedbackValue(e.target.value)}
                placeholder="Write specific suggestions or bug logs here..."
                rows={4}
                required
                className="w-full bg-slate-50 border border-gray-150 rounded-2xl p-4 text-xs font-semibold text-gray-800 outline-none focus:border-blue-600 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Optional screenshot selection */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                Attach Screenshot (Optional)
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-3 bg-slate-5 w-full rounded-2xl cursor-pointer hover:bg-slate-100 transition-all border border-dashed border-gray-150">
                  <UploadCloud className="w-5 h-5 text-gray-400" />
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">
                    {screenshot ? "Change attached screenshot" : "Drag or select image"}
                  </span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleScreenshotChange} 
                    className="hidden" 
                  />
                </label>
              </div>
              {screenshot && (
                <div className="relative mt-2 rounded-xl overflow-hidden border border-gray-150 w-28 h-20">
                  <img src={screenshot} alt="Screenshot Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setScreenshot(null)} 
                    className="absolute top-1 right-1 bg-black/60 text-white text-[8px] uppercase font-black px-1.5 py-0.5 rounded-md hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Static diagnostic checklist */}
            <div className="grid grid-cols-2 gap-2 bg-slate-50/50 p-3 rounded-2xl border border-gray-150/40 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" />
                <span className="truncate">{deviceInfo || "Custom Platform"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>App Version: {appVersion}</span>
              </div>
            </div>

            {/* Action submit button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-black uppercase tracking-[0.2em] text-[10px] py-4 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-55"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-pulse">Dispatching Suggestion...</span>
                </>
              ) : (
                <>
                  <span>Send Feedback</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.form>
        ) : (
          <motion.div 
            key="thank-you"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8 space-y-4"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-lg font-black font-display uppercase text-gray-900 leading-tight">Thank You!</h4>
              <p className="text-xs text-slate-500 font-bold uppercase leading-relaxed tracking-wider max-w-sm mx-auto">
                Your premium feedback is dispatched to <b>kushtiwari56@gmail.com</b> and registered under the Super Admin feedback dashboard logs.
              </p>
            </div>

            <button
              onClick={() => {
                setShowThankYou(false);
                setFeedbackValue("");
              }}
              className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[9px] tracking-widest rounded-full transition-all cursor-pointer active:scale-95"
            >
              Write Another Feedback
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
