import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase";
import { User } from "@/types";

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
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
            setUserProfile(userDoc.data() as User);
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

  const signUp = async (email: string, password: string, displayName: string) => {
    const auth = await getFirebaseAuth();
    const db = await getFirebaseDb();
    
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password);
    
    await updateProfile(newUser, { displayName });
    
    // Create user profile in Firestore
    const userProfile: User = {
      id: newUser.uid,
      email: email,
      displayName: displayName,
      createdAt: new Date(),
      role: 'user'
    };
    
    await setDoc(doc(db, "users", newUser.uid), userProfile);
    setUserProfile(userProfile);
  };

  const signOut = async () => {
    const auth = await getFirebaseAuth();
    await firebaseSignOut(auth);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
