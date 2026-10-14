import React, { createContext, useContext, useEffect, useState } from "react";
const ContexteParametres = createContext(null);
const PARAMETRES_PAR_DEFAUT = {
  theme: "sombre",
  accent: "bleu-nuit",
  langue: "fr",
  voix: "homme",
  lectureVocaleAuto: true,
};
const CLE_STOCKAGE = "emir_parametres";
export function FournisseurParametres({ children }) {
  const [parametres, setParametres] = useState(() => {
    try {
      const sauvegarde = localStorage.getItem(CLE_STOCKAGE);
      return sauvegarde ? { ...PARAMETRES_PAR_DEFAUT, ...JSON.parse(sauvegarde) } : PARAMETRES_PAR_DEFAUT;
    } catch {
      return PARAMETRES_PAR_DEFAUT;
    }
  });
  useEffect(() => {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(parametres));
    document.documentElement.setAttribute("data-theme", parametres.theme === "clair" ? "clair" : "sombre");
  }, [parametres]);
  const mettreAJourParametre = (cle, valeur) => {
    setParametres((precedent) => ({ ...precedent, [cle]: valeur }));
  };
  return (
    <ContexteParametres.Provider value={{ parametres, mettreAJourParametre }}>
      {children}
    </ContexteParametres.Provider>
  );
}
export function useParametres() {
  const contexte = useContext(ContexteParametres);
  if (!contexte) throw new Error("useParametres doit être utilisé dans un FournisseurParametres");
  return contexte;
}