import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, User, MessageSquare, History } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ChatMsg } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function Chat() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to server
    socketRef.current = io(window.location.origin);

    socketRef.current.emit('join-room', 'community-v1');

    socketRef.current.on('receive-message', (msg: ChatMsg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !user || !socketRef.current) return;

    const msg: ChatMsg = {
      id: Date.now().toString(),
      text: input,
      senderId: user.uid,
      senderName: profile?.displayName || 'User',
      timestamp: new Date().toISOString(),
    };

    socketRef.current.emit('send-message', { ...msg, room: 'community-v1' });
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-gray-50 pt-10">
      <header className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-gray-900">Study Community</h2>
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600">Global Lounge</span>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-900">
          <History className="w-6 h-6" />
        </button>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-center ">
          <p className="text-xs font-semibold text-indigo-800">Welcome to BharatExams Collective! 👋</p>
          <p className="text-[10px] text-indigo-600 mt-1">Discuss exams, share strategies, and help each other.</p>
        </div>

        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: m.senderId === user?.uid ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "flex flex-col",
                m.senderId === user?.uid ? "items-end" : "items-start"
              )}
            >
              <span className="text-[10px] font-bold text-gray-400 mb-1 px-2 uppercase">
                {m.senderId === user?.uid ? "You" : m.senderName}
              </span>
              <div className={cn(
                "max-w-[85%] p-3 px-4 rounded-2xl text-sm shadow-sm",
                m.senderId === user?.uid 
                  ? "bg-indigo-600 text-white rounded-tr-sm" 
                  : "bg-white text-gray-800 rounded-tl-sm"
              )}>
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 active:scale-90 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
