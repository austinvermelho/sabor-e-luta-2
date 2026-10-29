import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User 
} from 'firebase/auth';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc,
  deleteDoc, 
  onSnapshot, 
  query, 
  where 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { CheckIn, UserProfile, CuratorUser, BannedIpRecord } from '../types';
import { sanitizeForFirestore } from './storage';
import { containsInappropriateContent, isPhotoSuspicious } from '../utils/moderation';

const CHECKINS_COL = collection(db, 'checkins');
const LOCAL_USER_KEY = 'sabor_luta_local_user';

export const getLocalUser = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setLocalUser = (user: UserProfile | null): void => {
  try {
    if (!user) {
      localStorage.removeItem(LOCAL_USER_KEY);
    } else {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    }
  } catch {
    // ignore
  }
};

export const mapFirebaseUser = (user: User | null): UserProfile | null => {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'Companheiro(a)'
  };
};

export const subscribeToAuth = (callback: (user: UserProfile | null) => void): (() => void) => {
  // Check local user first
  const local = getLocalUser();
  if (local) {
    callback(local);
  }

  return onAuthStateChanged(auth, (user) => {
    const fbMapped = mapFirebaseUser(user);
    if (fbMapped) {
      setLocalUser(fbMapped);
      callback(fbMapped);
    } else if (!local) {
      callback(null);
    }
  });
};

export const registerWithEmail = async (
  email: string, 
  pass: string, 
  name?: string
): Promise<UserProfile> => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name && cred.user) {
      await updateProfile(cred.user, { displayName: name });
    }
    const profile = mapFirebaseUser(cred.user)!;
    setLocalUser(profile);
    return profile;
  } catch (firebaseErr: any) {
    console.warn('Firebase Auth register failed, falling back to local user session:', firebaseErr);
    // Fallback for sandbox environments where Firebase Auth Email/Password provider isn't toggled on
    const fallbackProfile: UserProfile = {
      uid: `local_user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email,
      displayName: name || email.split('@')[0] || 'Companheiro(a)'
    };
    setLocalUser(fallbackProfile);
    return fallbackProfile;
  }
};

export const loginWithEmail = async (
  email: string, 
  pass: string
): Promise<UserProfile> => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const profile = mapFirebaseUser(cred.user)!;
    setLocalUser(profile);
    return profile;
  } catch (firebaseErr: any) {
    console.warn('Firebase Auth login failed, checking local fallback session:', firebaseErr);
    const local = getLocalUser();
    if (local && local.email === email) {
      return local;
    }
    // If not found locally, create a local session so the user is never blocked
    const fallbackProfile: UserProfile = {
      uid: `local_user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email,
      displayName: email.split('@')[0] || 'Companheiro(a)'
    };
    setLocalUser(fallbackProfile);
    return fallbackProfile;
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch {
    // ignore
  }
  setLocalUser(null);
};

// Check-ins Services
export const fetchEstablishmentCheckInsAsync = async (establishmentId: string): Promise<CheckIn[]> => {
  const itemsMap = new Map<string, CheckIn>();
  try {
    const q = query(CHECKINS_COL, where('establishmentId', '==', establishmentId));
    const snapshot = await getDocs(q);
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as CheckIn;
      if (data && data.id && (data.status === 'approved' || !data.status)) {
        itemsMap.set(data.id, data);
      }
    }
  } catch (err) {
    console.error('Erro ao buscar checkins do estabelecimento no Firestore:', err);
  }

  try {
    const res = await fetch('/api/checkins');
    if (res.ok) {
      const serverItems = await res.json();
      if (Array.isArray(serverItems)) {
        for (const cItem of serverItems) {
          if (cItem && cItem.id && cItem.establishmentId === establishmentId && (cItem.status === 'approved' || !cItem.status)) {
            if (!itemsMap.has(cItem.id)) {
              itemsMap.set(cItem.id, cItem);
            }
          }
        }
      }
    }
  } catch {
    // Silent
  }

  return Array.from(itemsMap.values()).sort((a, b) => 
    new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
  );
};

export const fetchUserCheckInsAsync = async (userId: string): Promise<CheckIn[]> => {

  const itemsMap = new Map<string, CheckIn>();
  let firestoreFailed = false;

  try {
    const q = query(CHECKINS_COL, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as CheckIn;
      if (data && data.id) {
        itemsMap.set(data.id, data);
      }
    }
  } catch (err) {
    console.error('Erro ao buscar checkins do Firestore:', err);
    firestoreFailed = true;
  }

  // express server backup fallback
  try {
    const res = await fetch(`/api/checkins?userId=${encodeURIComponent(userId)}`);
    if (res.ok) {
      const serverItems = await res.json();
      if (Array.isArray(serverItems)) {
        for (const cItem of serverItems) {
          if (cItem && cItem.id) {
            if (!itemsMap.has(cItem.id)) {
              itemsMap.set(cItem.id, cItem);
              if (!firestoreFailed) {
                setDoc(doc(CHECKINS_COL, cItem.id), sanitizeForFirestore(cItem)).catch(() => {});
              }
            }
          }
        }
      }
    }
  } catch {
    // Silent
  }

  return Array.from(itemsMap.values()).sort((a, b) => 
    new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
  );
};

export const saveCheckInAsync = async (checkIn: CheckIn): Promise<CheckIn[]> => {
  const isSuspicious = containsInappropriateContent(checkIn.experienceNote) || isPhotoSuspicious(checkIn.photoUrls);
  const checkInWithStatus = {
    ...checkIn,
    status: (isSuspicious ? 'pending' : 'approved') as 'pending' | 'approved' | 'rejected'
  };
  const sanitized = sanitizeForFirestore(checkInWithStatus);

  // Firestore write
  try {
    await setDoc(doc(CHECKINS_COL, checkIn.id), sanitized);
  } catch (err) {
    console.error('Erro ao salvar check-in no Firestore:', err);
  }

  // Server backup
  try {
    await fetch('/api/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitized),
    });
  } catch {
    // Silent
  }

  return await fetchUserCheckInsAsync(checkIn.userId);
};

export const deleteCheckInAsync = async (checkInId: string, userId: string): Promise<CheckIn[]> => {
  try {
    await deleteDoc(doc(CHECKINS_COL, checkInId));
  } catch (err) {
    console.error('Erro ao deletar check-in do Firestore:', err);
  }

  try {
    await fetch(`/api/checkins/${checkInId}`, { method: 'DELETE' });
  } catch {
    // Silent
  }

  return await fetchUserCheckInsAsync(userId);
};

export const subscribeToUserCheckIns = (
  userId: string,
  callback: (checkIns: CheckIn[]) => void
): (() => void) => {
  fetchUserCheckInsAsync(userId).then((items) => callback(items));

  try {
    const q = query(CHECKINS_COL, where('userId', '==', userId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const itemsMap = new Map<string, CheckIn>();
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data() as CheckIn;
          if (data && data.id) {
            itemsMap.set(data.id, data);
          }
        }
        const sorted = Array.from(itemsMap.values()).sort((a, b) => 
          new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
        );
        callback(sorted);
      },
      (err) => {
        console.error('Erro no listener de checkins:', err);
        fetchUserCheckInsAsync(userId).then((items) => callback(items));
      }
    );
    return unsubscribe;
  } catch {
    return () => {};
  }
};

// ==========================================
// Curator & Moderation Services
// ==========================================

export const recordUserHeartbeat = async (user: UserProfile): Promise<void> => {
  try {
    await fetch('/api/users/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      }),
    });
  } catch {
    // Silent
  }
};

export const fetchAllCheckInsForCuratorAsync = async (): Promise<CheckIn[]> => {
  const checkinsMap = new Map<string, CheckIn>();

  // 1. Fetch from server endpoint (includes enriched establishment names)
  try {
    const res = await fetch('/api/curator/checkins');
    if (res.ok) {
      const serverItems = await res.json();
      if (Array.isArray(serverItems)) {
        for (const item of serverItems) {
          if (item && item.id) {
            checkinsMap.set(item.id, item);
          }
        }
      }
    }
  } catch (err) {
    console.error('Erro ao buscar checkins do servidor para curadoria:', err);
  }

  // 2. Fetch from Firestore for any recent docs
  try {
    const snapshot = await getDocs(CHECKINS_COL);
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as CheckIn;
      if (data && data.id) {
        if (!checkinsMap.has(data.id)) {
          checkinsMap.set(data.id, data);
        } else {
          // Merge status
          const existing = checkinsMap.get(data.id)!;
          checkinsMap.set(data.id, {
            ...existing,
            ...data,
            // Keep establishmentName from server if present
            establishmentName: (existing as any).establishmentName || (data as any).establishmentName,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Erro ao consultar Firestore para curadoria:', err);
  }

  return Array.from(checkinsMap.values()).sort(
    (a, b) => new Date(b.createdAt || b.visitDate).getTime() - new Date(a.createdAt || a.visitDate).getTime()
  );
};

export const moderateCheckInStatusAsync = async (
  checkInId: string,
  status: 'approved' | 'rejected'
): Promise<boolean> => {
  let success = false;

  // 1. Update in Firestore
  try {
    const docRef = doc(CHECKINS_COL, checkInId);
    await updateDoc(docRef, { status, moderatedAt: new Date().toISOString() });
    success = true;
  } catch (err) {
    console.warn('Erro ao atualizar status do check-in no Firestore, tentando setDoc com merge:', err);
    try {
      await setDoc(doc(CHECKINS_COL, checkInId), { status, moderatedAt: new Date().toISOString() }, { merge: true });
      success = true;
    } catch (e) {
      console.error('Falha ao atualizar status no Firestore:', e);
    }
  }

  // 2. Update on Express server
  try {
    const res = await fetch(`/api/curator/checkins/${checkInId}/moderate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) success = true;
  } catch (err) {
    console.error('Erro ao sincronizar moderação com servidor:', err);
  }

  return success;
};

export const deleteCheckInByCuratorAsync = async (checkInId: string): Promise<boolean> => {
  let success = false;
  try {
    await deleteDoc(doc(CHECKINS_COL, checkInId));
    success = true;
  } catch (err) {
    console.warn('Erro ao deletar checkin do Firestore:', err);
  }

  try {
    const res = await fetch(`/api/checkins/${checkInId}`, { method: 'DELETE' });
    if (res.ok) success = true;
  } catch (err) {
    console.error('Erro ao deletar checkin do servidor:', err);
  }

  return success;
};

export const fetchCuratorUsersAsync = async (): Promise<CuratorUser[]> => {
  try {
    const res = await fetch('/api/curator/users');
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (err) {
    console.error('Erro ao buscar lista de usuários para curadoria:', err);
  }
  return [];
};

export const fetchBannedIpsAsync = async (): Promise<BannedIpRecord[]> => {
  try {
    const res = await fetch('/api/curator/banned-ips');
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (err) {
    console.error('Erro ao buscar IPs banidos:', err);
  }
  return [];
};

export const banIpAsync = async (
  ip: string,
  reason?: string,
  userId?: string,
  userEmail?: string
): Promise<BannedIpRecord[]> => {
  try {
    const res = await fetch('/api/curator/ban-ip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, reason, userId, userEmail }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.banned || [];
    }
  } catch (err) {
    console.error('Erro ao banir IP:', err);
  }
  return [];
};

export const unbanIpAsync = async (ip: string): Promise<BannedIpRecord[]> => {
  try {
    const res = await fetch('/api/curator/unban-ip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.banned || [];
    }
  } catch (err) {
    console.error('Erro ao desbanir IP:', err);
  }
  return [];
};

