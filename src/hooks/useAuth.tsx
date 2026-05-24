import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  browserLocalPersistence,
  setPersistence,
  GoogleAuthProvider,
  signOut,
  User 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

export const ADMIN_EMAILS = [
  "kushtiwari56@gmail.com"
];

const MOCK_GUEST_PROFILE: UserProfile = {
  uid: 'guest-aspirant-hub',
  email: 'guest@bharatexams.in',
  displayName: 'Guest Aspirant',
  photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150',
  role: 'user',
  state: 'Delhi',
  gender: 'Male',
  dob: '2001-01-01',
  category: 'General',
  education: {
    qualification: 'Graduate',
    stream: 'Science',
    passingYear: '2025',
    percentage: '82%',
    institution: 'Delhi University'
  },
  skills: ['Aptitude', 'Reasoning', 'General Awareness'],
  preferredJobs: ['SSC', 'Railways'],
  createdAt: new Date().toISOString()
} as any;

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  updateProfile: (newData: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for local guest session first (extremely stable for sandboxed deployments)
    const isGuestActive = localStorage.getItem('bharat_guest_session') === 'true';
    if (isGuestActive) {
      setProfile(MOCK_GUEST_PROFILE);
      setUser({
        uid: MOCK_GUEST_PROFILE.uid,
        email: MOCK_GUEST_PROFILE.email,
        displayName: MOCK_GUEST_PROFILE.displayName,
        photoURL: MOCK_GUEST_PROFILE.photoURL,
        emailVerified: false,
      } as any);
      setLoading(false);
      return;
    }

    // 2. Force Local Session Persistence so logins survive reloads / transitions
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn("Firebase Local persistence initialization warning:", err);
    });

    // 3. Handle Google Redirect authentication outcome (critical for mobile browsers / non-popup sessions)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("Logged in successfully via redirect auth flow:", result.user);
        }
      })
      .catch((error) => {
        console.error("Firebase auth redirect parsing error:", error);
      });

    // 4. Setup dynamic auth change subscriber
    return onAuthStateChanged(auth, async (u) => {
      // Avoid overriding active guest sessions
      if (localStorage.getItem('bharat_guest_session') === 'true') {
        return;
      }
      setUser(u);
      setLoading(true);
      if (u) {
        try {
          const docRef = doc(db, 'users', u.uid);
          const docSnap = await getDoc(docRef);
          
          // STRICT EMAIL GATE FOR ADMIN AUTHORITY
          const isApprovedAdmin = u.email ? ADMIN_EMAILS.includes(u.email) : false;
          const assignedRole: 'admin' | 'user' = isApprovedAdmin ? 'admin' : 'user';

          if (isApprovedAdmin) {
            // Write to secured admins collection as requested in requirement 9
            const adminDocRef = doc(db, 'admins', u.uid);
            await setDoc(adminDocRef, {
              email: u.email,
              role: 'admin',
              createdAt: serverTimestamp(),
              permissions: ['all']
            }, { merge: true });
          }

          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            
            // Sync role based on verified email-lock
            if (data.role !== assignedRole) {
              const updatedData: UserProfile = { ...data, role: assignedRole };
              await setDoc(docRef, updatedData, { merge: true });
              setProfile(updatedData);
            } else {
              setProfile(data);
            }
          } else {
            const newProfile: UserProfile = {
              uid: u.uid,
              email: u.email || '',
              displayName: u.displayName || 'Aspirant',
              photoURL: u.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150',
              role: assignedRole,
              createdAt: new Date().toISOString()
            } as any;
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          console.error("Error loading user security profile:", err);
          // Fallback local Profile in case db connection fails
          const fallbackProfile: UserProfile = {
            uid: u.uid,
            email: u.email || '',
            displayName: u.displayName || 'Aspirant',
            photoURL: u.photoURL || '',
            role: u.email && ADMIN_EMAILS.includes(u.email) ? 'admin' : 'user',
            createdAt: new Date().toISOString()
          } as any;
          setProfile(fallbackProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const loginAsGuest = () => {
    setLoading(true);
    try {
      localStorage.setItem('bharat_guest_session', 'true');
      setProfile(MOCK_GUEST_PROFILE);
      setUser({
        uid: MOCK_GUEST_PROFILE.uid,
        email: MOCK_GUEST_PROFILE.email,
        displayName: MOCK_GUEST_PROFILE.displayName,
        photoURL: MOCK_GUEST_PROFILE.photoURL,
        emailVerified: false,
      } as any);
    } catch (e) {
      console.error("Error configuring guest session:", e);
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // Determine if the device is a mobile browser OR embedded inside an iframe (e.g. preview pane)
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isIframe = window.self !== window.top;

      if (isMobile || isIframe) {
        console.log("Executing redirect login flow (Mobile/Iframe detected)");
        await signInWithRedirect(auth, provider);
      } else {
        try {
          console.log("Attempting popup login flow");
          await signInWithPopup(auth, provider);
        } catch (popupErr: any) {
          console.warn("Popup authentication failed, switching automatically to redirect:", popupErr);
          // If popup is blocked by settings or closed manually by the visitor, fallback smoothly
          if (
            popupErr.code === 'auth/popup-blocked' || 
            popupErr.code === 'auth/popup-closed-by-user' ||
            popupErr.code === 'auth/cancelled-popup-request'
          ) {
            await signInWithRedirect(auth, provider);
          } else {
            throw popupErr;
          }
        }
      }
    } catch (err) {
      console.error("Authentication trigger failure:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      try {
        localStorage.clear();
      } catch (e) {
        console.warn("Storage purge warning:", e);
      }
      await signOut(auth).catch(() => {});
      setProfile(null);
      setUser(null);
    } catch (err) {
      console.error("Sign-out failure:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (newData: Partial<UserProfile>) => {
    if (!user) return;
    
    // Check if we are in mock guest session
    if (localStorage.getItem('bharat_guest_session') === 'true') {
      const updatedProfile = {
        ...profile,
        ...newData,
        updatedAt: new Date().toISOString()
      } as UserProfile;
      updatedProfile.role = 'user'; // absolute safety
      setProfile(updatedProfile);
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const updatedProfile = {
        ...profile,
        ...newData,
        updatedAt: new Date().toISOString()
      } as UserProfile;

      // Force-lock roles - never let a client escalate their own or other users' roles
      const isApprovedAdmin = user.email ? ADMIN_EMAILS.includes(user.email) : false;
      updatedProfile.role = isApprovedAdmin ? 'admin' : 'user';

      await setDoc(userRef, updatedProfile, { merge: true });
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Error setting custom candidate profile details:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, loginAsGuest, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

