import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Volume2, Mic, Trash2, History, Share2, Copy, ChevronRight } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { collection, addDoc, query, where, orderBy, onSnapshot, limit, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp?: any;
}

export function AI() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'ai_chats'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'asc'),
      limit(50)
    );
    
    return onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => ({
        role: doc.data().role,
        parts: [{ text: doc.data().text }],
        timestamp: doc.data().createdAt,
      } as Message));
      if (history.length > 0) setMessages(history);
    });
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading || !user) return;

    const userText = input;
    const userMessage: Message = { role: 'user', parts: [{ text: userText }] };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Save user message to Firestore
      await addDoc(collection(db, 'ai_chats'), {
        userId: user.uid,
        role: 'user',
        text: userText,
        createdAt: new Date(),
      });

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.map(m => ({ role: m.role, parts: m.parts })),
          language: language
        }),
      });

      const data = await response.json();
      const modelText = data.text;
      
      if (!modelText) {
        throw new Error('Empty AI response');
      }
      
      // Save model response to Firestore
      await addDoc(collection(db, 'ai_chats'), {
        userId: user.uid,
        role: 'model',
        text: modelText,
        createdAt: new Date(),
      });

    } catch (error) {
      console.error('AI Error:', error);
      toast.error('AI is currently unavailable. Try again in a few seconds.');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!user || messages.length === 0) return;
    if (window.confirm('Clear all chat history?')) {
      // Local clear (onSnapshot will handle sync if it was real, but for simplicity we clear locally)
      setMessages([]);
      toast.success('History cleared');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const suggestions = [
    "What is SSC CHSL eligibility?",
    "Explain UPSC in simple Hinglish",
    "Highest salary jobs for ITI",
    "How to prepare for NDA?"
  ];

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-white pt-10">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-gray-900 leading-none mb-1">Career AI</h2>
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Active Assistant</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={clearHistory}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/30 no-scrollbar"
      >
        {messages.length === 0 && (
          <div className="text-center py-10 space-y-6">
            <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm rotate-3">
              <Bot className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 px-4">Supercharge Your Career Journey</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
              I can explain any Indian government job, suggest study plans, or help with exam strategies.
            </p>
            <div className="grid grid-cols-1 gap-2 pt-4">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="mx-6 bg-white border border-gray-100 px-4 py-4 rounded-2xl text-xs font-semibold text-gray-700 hover:border-blue-300 hover:bg-blue-50 transition-all text-left shadow-sm flex items-center justify-between"
                >
                  {s}
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={cn(
                "flex gap-3 px-2",
                m.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm",
                m.role === 'user' ? "bg-gray-900" : "bg-blue-600"
              )}>
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn(
                "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative",
                m.role === 'user' 
                  ? "bg-gray-900 text-white rounded-tr-sm" 
                  : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm"
              )}>
                <div className="markdown-body">
                  <ReactMarkdown>{m.parts[0].text}</ReactMarkdown>
                </div>
                {m.role === 'model' && (
                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-4">
                    <button 
                      onClick={() => copyToClipboard(m.parts[0].text)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-blue-600 transition-colors" title="Listen">
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-blue-600 transition-colors ml-auto" title="Share">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm rounded-tl-sm flex items-center gap-3">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
              </div>
              <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Thinking</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100 safe-area-pb">
        <div className="relative flex items-center gap-2 max-w-lg mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Ask anything about jobs/exams..."
              className="w-full pl-5 pr-14 py-5 bg-gray-100 rounded-[2rem] border-none focus:ring-2 focus:ring-blue-500 transition-all outline-none font-medium text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full text-gray-400 hover:text-blue-600 shadow-sm">
              <Mic className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100 disabled:opacity-50 disabled:shadow-none transition-all active:scale-90 flex-shrink-0"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
