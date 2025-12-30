import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, role?: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  toggleFavorite: (businessId: string) => Promise<boolean>;
  isFavorite: (businessId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupAuth = async () => {
      const auth = await getFirebaseAuth();
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        
        if (firebaseUser) {
          // Fetch user profile from Firestore
          const db = await getFirebaseDb();
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserProfile({
              ...data,
              createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
            } as User);
          }
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      });
    };

    setupAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const auth = await getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName: string, role: UserRole = 'user') => {
    const auth = await getFirebaseAuth();
    const db = await getFirebaseDb();
    
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    
    await updateProfile(newUser, { displayName });
    
    // Create user profile in Firestore
    const newUserProfile: User = {
      id: newUser.uid,
      email: email,
      displayName: displayName,
      createdAt: new Date(),
      role: role,
      favorites: []
    };
    
    await setDoc(doc(db, "users", newUser.uid), newUserProfile);
    setUserProfile(newUserProfile);
  };

  const signOut = async () => {
    const auth = await getFirebaseAuth();
    await firebaseSignOut(auth);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    const auth = await getFirebaseAuth();
    await sendPasswordResetEmail(auth, email);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user || !user.email) throw new Error("No user logged in");
    
    const auth = await getFirebaseAuth();
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) throw new Error("No user logged in");
    
    const db = await getFirebaseDb();
    await updateDoc(doc(db, "users", user.uid), data);
    
    // Update local state
    setUserProfile(prev => prev ? { ...prev, ...data } : null);
    
    // Update Firebase Auth display name if changed
    if (data.displayName) {
      await updateProfile(user, { displayName: data.displayName });
    }
  };

  const toggleFavorite = async (businessId: string): Promise<boolean> => {
    if (!user) throw new Error("No user logged in");
    
    const db = await getFirebaseDb();
    const isFav = userProfile?.favorites?.includes(businessId) || false;
    
    if (isFav) {
      await updateDoc(doc(db, "users", user.uid), {
        favorites: arrayRemove(businessId)
      });
      setUserProfile(prev => prev ? {
        ...prev,
        favorites: prev.favorites?.filter(id => id !== businessId) || []
      } : null);
      return false;
    } else {
      await updateDoc(doc(db, "users", user.uid), {
        favorites: arrayUnion(businessId)
      });
      setUserProfile(prev => prev ? {
        ...prev,
        favorites: [...(prev.favorites || []), businessId]
      } : null);
      return true;
    }
  };

  const isFavorite = (businessId: string): boolean => {
    return userProfile?.favorites?.includes(businessId) || false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      signIn, 
      signUp, 
      signOut,
      resetPassword,
      changePassword,
      updateUserProfile,
      toggleFavorite,
      isFavorite
    }}>
      {children}
    </AuthContext.Provider>
  );
};
