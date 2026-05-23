import React, { createContext, useContext, useState } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string;
    emailVerified: boolean;
  } | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateMockProfile: (newProfile: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_PROFILE: UserProfile = {
  uid: 'guest-aspirant-101',
  email: 'kushtiwari56@gmail.com',
  displayName: 'Bharat Aspirant',
  photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150',
  role: 'admin',
  state: 'Uttar Pradesh',
  gender: 'Male',
  dob: '2000-01-01',
  category: 'General',
  education: {
    qualification: 'Graduate',
    stream: 'Computer Science',
    passingYear: '2025',
    percentage: '8.5 CGPA',
    institution: 'Central Academy'
  },
  skills: ['Aptitude', 'General Knowledge', 'English'],
  preferredJobs: ['SSC', 'UPSC', 'Railway'],
  createdAt: new Date().toISOString()
} as any;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('bharatexams_mock_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error reading mock profile:", e);
    }
    return DEFAULT_PROFILE;
  });

  const [loading] = useState(false);

  // Computed simplified dummy user matching User type
  const user = profile ? {
    uid: profile.uid,
    email: profile.email,
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    emailVerified: true
  } : null;

  const login = async () => {
    // Already fully logged in!
  };

  const logout = async () => {
    try {
      localStorage.removeItem('bharatexams_mock_profile');
      setProfileState(DEFAULT_PROFILE);
    } catch (e) {
      console.error("Error recovering default state", e);
    }
  };

  const updateMockProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
    localStorage.setItem('bharatexams_mock_profile', JSON.stringify(newProfile));
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, updateMockProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

