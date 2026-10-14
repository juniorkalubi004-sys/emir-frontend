import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { authentification, fournisseurGoogle } from "../firebase/config.js";

const ContexteAuth = createContext(null);

export function FournisseurAuth({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);
  useEffect(() => {
    const desabonner = onAuthStateChanged(authentification, (utilisateurFirebase) => {
      setUtilisateur(utilisateurFirebase);
      setChargement(false);
    });
    return () => desabonner();
  }, []);

 const seConnecter = async () => {
  const resultat = await signInWithPopup(authentification, fournisseurGoogle);
  console.log(await resultat.user.getIdToken());
};
  const seDeconnecter = async () => { await signOut(authentification); };
  return (
    <ContexteAuth.Provider value={{ utilisateur, chargement, seConnecter, seDeconnecter }}>
      {children}
    </ContexteAuth.Provider>
  );
}

//LE CONTEXTE QUI DISTRIBUE LES ELEMENTS DE LA CONNEXION
export function useAuth() {
  const contexte = useContext(ContexteAuth);
  if (!contexte) throw new Error("useAuth doit être utilisé dans un FournisseurAuth");
  return contexte;
}