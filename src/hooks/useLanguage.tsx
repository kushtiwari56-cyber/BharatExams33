import React, { createContext, useContext, useState, useEffect } from 'react';

export const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'hi-en', name: 'Hinglish' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'ur', name: 'اردو (Urdu)' },
];

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  detectedLocale: string;
  recommendedLanguageName: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState(() => {
    const cached = localStorage.getItem('app-language');
    if (cached) return cached;

    // Smart device language detection (Requirement 7)
    const browserLang = (navigator.language || 'en').toLowerCase();
    if (browserLang.startsWith('hi')) return 'hi';
    if (browserLang.startsWith('bn')) return 'bn';
    if (browserLang.startsWith('ta')) return 'ta';
    if (browserLang.startsWith('te')) return 'te';
    if (browserLang.startsWith('mr')) return 'mr';
    if (browserLang.startsWith('gu')) return 'gu';
    if (browserLang.startsWith('kn')) return 'kn';
    if (browserLang.startsWith('ml')) return 'ml';
    if (browserLang.startsWith('pa')) return 'pa';
    if (browserLang.startsWith('ur')) return 'ur';
    
    return 'en';
  });

  const [detectedLocale, setDetectedLocale] = useState('en');
  const [recommendedLanguageName, setRecommendedLanguageName] = useState('English');

  useEffect(() => {
    const browserLang = (navigator.language || 'en').toLowerCase();
    setDetectedLocale(browserLang);
    
    // Find recommendation
    let code = 'en';
    if (browserLang.startsWith('hi')) code = 'hi';
    else if (browserLang.startsWith('bn')) code = 'bn';
    else if (browserLang.startsWith('ta')) code = 'ta';
    else if (browserLang.startsWith('te')) code = 'te';
    else if (browserLang.startsWith('mr')) code = 'mr';
    else if (browserLang.startsWith('gu')) code = 'gu';
    else if (browserLang.startsWith('kn')) code = 'kn';
    else if (browserLang.startsWith('ml')) code = 'ml';
    else if (browserLang.startsWith('pa')) code = 'pa';
    else if (browserLang.startsWith('ur')) code = 'ur';

    const matchName = languages.find(l => l.code === code)?.name || 'English';
    setRecommendedLanguageName(matchName);
  }, []);

  const setLanguage = (lang: string) => {
    localStorage.setItem('app-language', lang);
    setLanguageState(lang);
    // Dispatch instant standard window event to notify other sub-elements across tabs if running
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, detectedLocale, recommendedLanguageName }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
