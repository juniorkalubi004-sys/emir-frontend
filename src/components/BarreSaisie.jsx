
import React, { useState } from "react";
import { useReconnaissanceVocale } from "../hooks/useReconnaissanceVocale.js";


export default function BarreSaisie({ surEnvoyer, langue, enChargement }) {
  const [texte, setTexte] = useState("");
  const { enEcoute, disponible, demarrerEcoute, arreterEcoute } = useReconnaissanceVocale({
    langue: langue === "en" ? "en-US" : langue === "pt" ? "pt-PT" : "fr-FR",
    surTranscription: (transcription) => setTexte(transcription),
  });
  const gererEnvoi = () => {
    const messagePropre = texte.trim();
    if (!messagePropre || enChargement) return;
    surEnvoyer(messagePropre);
    setTexte("");
  };
  const gererTouche = (evenement) => {
    if (evenement.key === "Enter" && !evenement.shiftKey) { evenement.preventDefault(); gererEnvoi(); }
  };
  return (
    <div className="barre-saisie">
      {disponible && (
        <button className={`barre-saisie__micro ${enEcoute ? "barre-saisie__micro--actif" : ""}`} onClick={enEcoute ? arreterEcoute : demarrerEcoute} title={enEcoute ? "Arrêter l'écoute" : "Dicter un message"}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="9" y="2" width="6" height="12" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0" strokeLinecap="round" />
            <path d="M12 18v4" strokeLinecap="round" />
          </svg>
        </button>
      )}
      <textarea className="barre-saisie__champ" placeholder="Que voulez-vous savoir ?" rows={1} value={texte} onChange={(e) => setTexte(e.target.value)} onKeyDown={gererTouche} />
      <button className="barre-saisie__envoyer" onClick={gererEnvoi} disabled={!texte.trim() || enChargement} title="Envoyer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 2 11 13" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 2 15 22l-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}