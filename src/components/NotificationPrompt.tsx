import React, { useState, useEffect } from 'react';
import { Bell, ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function NotificationPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasPrompted = localStorage.getItem('notification-prompted');
    if (!hasPrompted) {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleRequest = () => {
    // In a real environment, this would call Notification.requestPermission()
    // For this preview, we'll simulate it
    console.log('Requesting notification permission...');
    localStorage.setItem('notification-prompted', 'true');
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('notification-prompted', 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-[100] bg-gray-900 text-white p-5 rounded-[2rem] shadow-2xl border border-white/10"
        >
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse">
              <Bell className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-black uppercase tracking-widest mb-1">Stay Updated!</h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Get instant alerts for new SSC, Banking, and State jobs before the deadline.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleRequest}
                  className="flex-1 bg-white text-gray-900 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-colors"
                >
                  Enable Alerts
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-3 bg-gray-800 text-gray-400 rounded-xl hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
