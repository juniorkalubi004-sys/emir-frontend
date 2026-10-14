import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const configurationFirebase = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const champsFirebaseManquants = Object.entries(configurationFirebase)
  .filter(([, valeur]) => !valeur?.trim())
  .map(([champ]) => champ);

if (champsFirebaseManquants.length > 0) {
  throw new Error(`Configuration Firebase manquante : ${champsFirebaseManquants.join(", ")}.`);
}

const appFirebase = initializeApp(configurationFirebase);

export const authentification = getAuth(appFirebase);
export const fournisseurGoogle = new GoogleAuthProvider();

export default appFirebase;
