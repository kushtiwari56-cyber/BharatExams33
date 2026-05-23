import { NavLink } from 'react-router-dom';
import { Home, Compass, Bot, User, ShieldCheck, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';
import { t } from '../lib/translations';

export function Navigation() {
  const { profile } = useAuth();
  const { language } = useLanguage();

  const navItems = [
    { to: '/', icon: Home, label: t('nav_home', language) },
    { to: '/explore', icon: Compass, label: t('nav_explore', language) },
    { to: '/planner', icon: Calendar, label: t('nav_planner', language) },
    { to: '/ai', icon: Bot, label: t('nav_ai_coach', language) },
    { to: '/profile', icon: User, label: t('nav_settings', language) },
  ];

  if (profile?.role === 'admin') {
    navItems.push({ to: '/admin', icon: ShieldCheck, label: 'Admin' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-2xl border-t border-gray-100 safe-area-pb">
      <div className="flex justify-around items-center h-20 max-w-lg mx-auto px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-300 relative px-4",
                isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              )
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  className={cn(
                    "p-1 rounded-xl transition-colors",
                    isActive ? "bg-blue-50" : "bg-transparent"
                  )}
                >
                  <item.icon className={cn("w-6 h-6", isActive ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
                </motion.div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest",
                  isActive ? "opacity-100" : "opacity-60"
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div 
                    layoutId="nav-pill"
                    className="absolute -top-1 w-1 h-1 bg-blue-600 rounded-full"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
