import { auth, db } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { generateCode } from './constants';
import { User } from '@/types';

// ==================== HELPER FUNCTIONS ====================

function generateVirtualEmail(username: string, timestamp: number): string {
  const cleanUsername = username
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '');

  return `${cleanUsername}.${timestamp}@fobizz.local`;
}

export async function isAdmin(user: FirebaseUser): Promise<boolean> {
  const tokenResult = await user.getIdTokenResult();
  return tokenResult.claims.admin === true;
}

// ==================== PARTICIPANT AUTHENTICATION ====================

export async function registerParticipant(
  username: string
): Promise<{ code: string; email: string; uid: string }> {
  const code = generateCode();
  const timestamp = Date.now();
  const virtualEmail = generateVirtualEmail(username, timestamp);

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      virtualEmail,
      code
    );

    const uid = userCredential.user.uid;

    try {
      await setDoc(doc(db, 'fobizz_users', uid), {
        username: username.trim(),
        code: code,
        email: virtualEmail,
        createdAt: new Date().toISOString(),
        completedSubtasks: {},
        ratings: {},
        isVirtual: true
      });
    } catch (firestoreError: any) {
      console.error('Firestore write error:', firestoreError);
      // Auth user created, Firestore write failed - still return code
    }

    return { code, email: virtualEmail, uid };
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Dieser Name ist bereits vergeben');
    } else {
      throw new Error('Fehler bei der Registrierung: ' + error.message);
    }
  }
}

export async function loginParticipantWithCode(code: string): Promise<User> {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');

    const q = query(
      collection(db, 'fobizz_users'),
      where('code', '==', code.toUpperCase())
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('Code nicht gefunden');
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    await signInWithEmailAndPassword(auth, userData.email, code.toUpperCase());

    return {
      ...userData,
      userId: userDoc.id
    } as User;
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Code nicht gefunden oder ungültig');
    } else if (error.message === 'Code nicht gefunden') {
      throw error;
    } else {
      throw new Error('Fehler beim Anmelden: ' + error.message);
    }
  }
}

// ==================== ADMIN AUTHENTICATION ====================

export async function loginAdmin(
  email: string,
  password: string
): Promise<FirebaseUser> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const adminStatus = await isAdmin(user);
    if (!adminStatus) {
      await signOut(auth);
      throw new Error('Keine Admin-Berechtigung');
    }

    return user;
  } catch (error: any) {
    console.error('Admin login error:', error);
    if (error.message === 'Keine Admin-Berechtigung') {
      throw error;
    } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error('Email oder Passwort falsch');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Ungültige Email-Adresse');
    } else {
      throw new Error('Fehler beim Admin-Login: ' + error.message);
    }
  }
}

// ==================== GENERAL ====================

export async function logout(): Promise<void> {
  await signOut(auth);
}

export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserData(uid: string): Promise<User | null> {
  const docSnap = await getDoc(doc(db, 'fobizz_users', uid));
  if (docSnap.exists()) {
    return { userId: docSnap.id, ...docSnap.data() } as User;
  }
  return null;
}

export async function checkIsAdmin(): Promise<boolean> {
  const user = getCurrentUser();
  if (!user) return false;
  return isAdmin(user);
}
