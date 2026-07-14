import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Song } from "./types";

// User-provided Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwj5n4NnFenvf8X5cWv5NcWxonMOZuwNA",
  authDomain: "melodia-ad5ff.firebaseapp.com",
  projectId: "melodia-ad5ff",
  storageBucket: "melodia-ad5ff.firebasestorage.app",
  messagingSenderId: "648858928416",
  appId: "1:648858928416:web:fb555152331e9494244345"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

// Firestore operation types
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// Structuring Firestore error reporting as required by system standards
export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

/**
 * Handles Firestore error and throws with structured diagnostic metadata.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error Detailed Details:", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * LocalStorage Fallback Helper for History
 */
function getLocalHistory(userId: string): any[] {
  try {
    const data = localStorage.getItem(`melodia_history_${userId}`);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalHistory(userId: string, history: any[]): void {
  try {
    localStorage.setItem(`melodia_history_${userId}`, JSON.stringify(history));
  } catch (e) {
    // ignore
  }
}

/**
 * Appends a song playback record to the user's Firestore play history.
 */
export async function addSongToHistory(userId: string, song: Song): Promise<void> {
  const path = `users/${userId}/history`;
  const randomSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
  const historyId = `hist_${Date.now()}_${randomSuffix}`;
  
  const historyData: any = {
    songId: song.id,
    title: song.title,
    artist: song.artist,
    userId: userId,
    playedAt: new Date().toISOString()
  };
  
  if (song.coverUrl) {
    historyData.coverUrl = song.coverUrl;
  }

  // Always write to local storage first so we have the fallback immediately
  try {
    const local = getLocalHistory(userId);
    const updated = [ { id: historyId, ...historyData }, ...local ].slice(0, 15);
    saveLocalHistory(userId, updated);
  } catch (e) {
    console.warn("Failed to write history to localStorage:", e);
  }

  try {
    const historyDocRef = doc(db, "users", userId, "history", historyId);
    await setDoc(historyDocRef, historyData);
  } catch (error) {
    // If it fails (e.g. permission denied or missing rules), we log a warning instead of a fatal error,
    // since we already successfully stored it in localStorage as a fallback.
    console.warn("Firestore write failed. Falling back to LocalStorage:", error);
  }
}

/**
 * Fetches the user's recent play history, ordered by play time.
 */
export async function fetchUserHistory(userId: string): Promise<any[]> {
  const path = `users/${userId}/history`;
  try {
    const historyCollectionRef = collection(db, "users", userId, "history");
    const q = query(historyCollectionRef, orderBy("playedAt", "desc"), limit(15));
    const querySnapshot = await getDocs(q);
    
    const history: any[] = [];
    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return history;
  } catch (error) {
    console.warn("Firestore read failed. Falling back to LocalStorage:", error);
    // Return localStorage history as a graceful fallback
    return getLocalHistory(userId);
  }
}
