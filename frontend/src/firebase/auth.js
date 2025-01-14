import { 
  getAuth,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  sendEmailVerification
} from 'firebase/auth';
import app from './config';

export const auth = getAuth(app);

export const doSignInWithEmailAndPassword = (email, password) => 
  firebaseSignInWithEmailAndPassword(auth, email, password);

export const doCreateUserWithEmailAndPassword = (email, password) =>
  firebaseCreateUserWithEmailAndPassword(auth, email, password);

export const doSignOut = () => signOut(auth);

export const doPasswordReset = (email) => 
  sendPasswordResetEmail(auth, email);

export const doPasswordChange = (password) => 
  updatePassword(auth.currentUser, password);

export const doSendEmailVerification = () => 
  sendEmailVerification(auth.currentUser, {
    url: `${window.location.origin}/`,
  });