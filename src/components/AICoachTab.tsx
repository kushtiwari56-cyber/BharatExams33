import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Send, Bot, User, Volume, Volume1, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface AICoachTabProps {
  onAddXp: (amount: number) => void;
}

interface CoachMessage {
  id: string;
  sender: "coach" | "user";
  text: string;
  timestamp: string;
  voiceUrl?: string;
}

export function AICoachTab({ onAddXp }: AICoachTabProps) {
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: "1",
      sender: "coach",
      text: "Namaste Aspirant! I am your BharatExams AI Study Coach. I am here to help you structure syllabus strategies, books recommendations, mental focus techniques, and quick shortcut equations. Select your dialect to speak or type now!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("Hinglish");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSynthesisEnabled, setVoiceSynthesisEnabled] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scrolling chat history
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, sending]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputText;
    if (!messageText.trim()) return;

    const userMsg: CoachMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setSending(true);

    try {
      const resp = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          language: selectedLanguage,
          history: messages.map(m => ({
            role: m.sender === "coach" ? "model" : "user",
            parts: [{ text: m.text }]
          }))
        })
      });

      const data = await resp.json();
      if (data.text) {
        const coachMsg: CoachMessage = {
          id: Math.random().toString(),
          sender: "coach",
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, coachMsg]);
        onAddXp(20);

        // Auto trigger Text-To-Speech if activated
        if (voiceSynthesisEnabled) {
          speakWithSpeechSynthesis(data.text);
        }
      } else {
        triggerLocalCoachFallback(messageText);
      }
    } catch (e) {
      triggerLocalCoachFallback(messageText);
    } finally {
      setSending(false);
    }
  };

  const triggerLocalCoachFallback = (query: string) => {
    const q = query.toLowerCase();
    let responseText = `That's an important preparation question! Daily systematic topic review is key. Focus first on high-yield sections. Try practicing with at least 5 previous year question papers. Let me know if you would like me to detail a specific syllabus schedule for this!`;

    if (q.includes("revision") || q.includes("revise")) {
      responseText = `For high efficiency, adopt the **Spaced Repetition Method**. Revise what you studied today in exactly 24 hours, then again in 7 days, and finally at the 30-day mark. This moves formulas directly into your long-term memory buffer!`;
    } else if (q.includes("book") || q.includes("read")) {
      responseText = `For standard state examinations, we recommend anchoring preparation around:
- **General Studies**: Lucent's General Knowledge guide & NCERT Class 6-10 books.
- **Quantitative**: R.S. Aggarwal's Quantitative Aptitude.
- **Hindi Grammar**: Samanya Hindi by Hardev Bahri.
- **English**: Plinth to Paramount by Neetu Singh.`;
    } else if (q.includes("math") || q.includes("quant")) {
      responseText = `To double your Maths speed:
1. Memorize Tables up to 25, Squares up to 30, and Cubes up to 20.
2. Master fraction-to-percentage conversions (e.g., 1/8 = 12.5%).
3. Work at least 25 sectional equations daily under strict 15-minute time limits.`;
    }

    const coachMsg: CoachMessage = {
      id: Math.random().toString(),
      sender: "coach",
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, coachMsg]);
    onAddXp(15);

    if (voiceSynthesisEnabled) {
      speakWithSpeechSynthesis(responseText);
    }
  };

  // Browser Text to speech API
  const speakWithSpeechSynthesis = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // stop preceding speech
    
    // Strips markdown from synthesized text for cleaner audio
    const sanitizedText = text.replace(/[*#_\-`]/g, "").substring(0, 250);
    const utter = new SpeechSynthesisUtterance(sanitizedText);
    
    // Choose appropriate sounding voice if possible
    const voices = window.speechSynthesis.getVoices();
    const indVoice = voices.find(v => v.lang.includes("en-IN") || v.lang.includes("hi-IN"));
    if (indVoice) utter.voice = indVoice;
    
    utter.rate = 1.0;
    window.speechSynthesis.speak(utter);
  };

  // Voice Recording Simulator
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate input voice transcription after stopping
      const transcriptMock = selectedLanguage === "Hinglish" ? "Maths syllabus me speed kaise badhaye, tips dijiye" :
                             selectedLanguage === "Hindi" ? "सामान्य ज्ञान की तैयारी के लिए सबसे अच्छी किताबें कौन सी हैं?" :
                             "Provide a detailed three month revision checklist please";
      setInputText(transcriptMock);
      toast.success("Voice transcribed successfully!", {
        description: `“${transcriptMock}”`
      });
    } else {
      setIsRecording(true);
      toast.info("AI Study Coach listening... Speak clearly regarding your prep hurdles!");
    }
  };

  // Quick prompt templates
  const presets = [
    { text: "Suggest a math revision strategy", label: "Math Shortcuts" },
    { text: "Suggest best study books for GS", label: "Standard Booklist" },
    { text: "How to handle exam stress physically?", label: "Mindfulness & Focus" }
  ];

  return (
    <div className="space-y-6 font-sans flex flex-col h-[650px] bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm overflow-hidden">
      {/* 1. TOP UTILITY HEADER */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-150 shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-600 animate-pulse" />
          <div>
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest font-display">BharatExams AI Coach & Mentor</h3>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Interactive mental helper</p>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-gray-200 text-[9px] font-black uppercase tracking-wider rounded-lg outline-none cursor-pointer focus:border-blue-500"
          >
            <option value="Hinglish">Hinglish dialect</option>
            <option value="English">English classic</option>
            <option value="Hindi">हिन्दी (Hindi)</option>
            <option value="Marathi">मराठी (Marathi)</option>
            <option value="Telugu">తెలుగు (Telugu)</option>
          </select>

          <button
            onClick={() => {
              setVoiceSynthesisEnabled(!voiceSynthesisEnabled);
              if (voiceSynthesisEnabled) {
                if (window.speechSynthesis) window.speechSynthesis.cancel();
              }
              toast.success(voiceSynthesisEnabled ? "Voice response muted" : "Spoken voice responses activated!");
            }}
            className={`p-2 rounded-lg border transition-all ${voiceSynthesisEnabled ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-gray-400 border-gray-200"}`}
            title="Toggle Voice Synthesis"
          >
            {voiceSynthesisEnabled ? <Volume2 className="w-4 h-4 animate-bounce" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. CHAT SCROLLER PANEL */}
      <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-4">
        {messages.map((msg) => {
          const isCoach = msg.sender === "coach";
          return (
            <div 
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${isCoach ? "mr-auto" : "ml-auto flex-row-reverse"}`}
            >
              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border font-display ${isCoach ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-gray-100 text-gray-600 border-gray-150"}`}>
                {isCoach ? <Bot className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
              </div>
              <div className="space-y-1">
                <div className={`p-4 rounded-3xl text-xs leading-relaxed font-sans ${isCoach ? "bg-slate-50 text-gray-800 border border-slate-100 font-medium" : "bg-blue-600 text-white shadow-md shadow-blue-500/5 font-bold"}`}>
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
                <span className="text-[8px] text-gray-400 uppercase font-bold px-2 block">{msg.timestamp}</span>
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-3xl text-xs text-gray-400 font-black tracking-widest uppercase">
              Formulating optimal coaching roadmap...
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* 3. VISUAL WAVE MIC INTERFACE ON RECON */}
      {isRecording && (
        <div className="bg-slate-900 text-white py-3 px-5 rounded-2xl flex items-center justify-between gap-4 border border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Recording active...</span>
          </div>

          {/* Glowing Equalizer Bars */}
          <div className="flex items-end gap-1 h-6">
            {[2, 4, 6, 3, 5, 2, 7, 4, 3, 6, 2].map((h, i) => (
              <span 
                key={i} 
                style={{ height: `${h * 4}px` }} 
                className="w-0.5 bg-blue-500 rounded-full animate-pulse" 
              />
            ))}
          </div>

          <button
            onClick={toggleRecording}
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[8px] font-black uppercase tracking-widest px-3 py-1.5 cursor-pointer"
          >
            Stop
          </button>
        </div>
      )}

      {/* 4. PRESETS BUTTON PANEL */}
      {!isRecording && messages.length <= 2 && (
        <div className="flex gap-2 py-2 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0 border-t border-gray-100 pt-3">
          {presets.map((ps, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(ps.text)}
              className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-150 text-[9px] font-black uppercase tracking-wider rounded-full cursor-pointer transition-colors"
            >
              {ps.label}
            </button>
          ))}
        </div>
      )}

      {/* 5. BOTTOM TEXT / MIC CONTROL INPUT */}
      <div className="flex gap-3 items-center border-t border-gray-100 pt-4 shrink-0">
        <button
          onClick={toggleRecording}
          type="button"
          className={`w-12 h-12 rounded-2xl border flex items-center justify-center cursor-pointer transition-all shrink-0 ${isRecording ? "bg-rose-600 border-rose-500 text-white shadow-lg animate-pulse" : "bg-slate-50 border-gray-200 text-gray-500"}`}
        >
          {isRecording ? <MicOff className="w-5.5 h-5.5" /> : <Mic className="w-5.5 h-5.5" />}
        </button>

        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
          className="flex-1 flex gap-2 relative bg-slate-50 border border-gray-200 p-1.5 rounded-2xl focus-within:border-blue-500 focus-within:bg-white"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isRecording}
            placeholder={isRecording ? "Speak into device microphone..." : `Ask any question in ${selectedLanguage}...`}
            className="flex-1 px-4 py-3 bg-transparent text-xs font-bold text-gray-800 outline-none placeholder:text-gray-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isRecording || sending}
            className="w-10 h-10 bg-gray-900 hover:bg-black text-white rounded-xl flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
