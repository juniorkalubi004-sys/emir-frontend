import React, { useState } from "react";
import { useParametres } from "../context/ContextePrametres.jsx";
import { useAuth } from "../context/ContexteAuth.jsx";


export default function ModalParametres({ surFermer }) {
  const { parametres, mettreAJourParametre } = useParametres();
  const { utilisateur, seDeconnecter } = useAuth();
  const [copieTokenStatut, setCopieTokenStatut] = useState("");

  const copierIdToken = async () => {
    try {
      const token = await utilisateur.getIdToken(true);
      await navigator.clipboard.writeText(token);
      setCopieTokenStatut("ID token copié.");
    } catch {
      setCopieTokenStatut("Impossible de copier le token. Vérifiez l'autorisation du presse-papiers.");
    }
  };

  return (
    <div className="modal-parametres__fond" onClick={surFermer}>
      <div className="modal-parametres" onClick={(e) => e.stopPropagation()}>
        <div className="modal-parametres__entete">
          <h3>Paramètres</h3>
          <button onClick={surFermer} className="modal-parametres__fermer">✕</button>
        </div>
        <div className="modal-parametres__profil">
          {utilisateur?.photoURL && <img src={utilisateur.photoURL} alt="Avatar" />}
          <div>
            <p className="modal-parametres__nom">{utilisateur?.displayName}</p>
            <p className="modal-parametres__email">{utilisateur?.email}</p>
          </div>
        </div>
        <section className="modal-parametres__section">
          <p className="modal-parametres__label">Thème</p>
          <div className="modal-parametres__options">
            <button className={parametres.theme === "sombre" ? "actif" : ""} onClick={() => mettreAJourParametre("theme", "sombre")}>Sombre</button>
            <button className={parametres.theme === "clair" ? "actif" : ""} onClick={() => mettreAJourParametre("theme", "clair")}>Clair</button>
          </div>
        </section>
        <section className="modal-parametres__section">
          <p className="modal-parametres__label">Langue d'Émir</p>
          <div className="modal-parametres__options">
            <button className={parametres.langue === "fr" ? "actif" : ""} onClick={() => mettreAJourParametre("langue", "fr")}>Français</button>
            <button className={parametres.langue === "en" ? "actif" : ""} onClick={() => mettreAJourParametre("langue", "en")}>English</button>
            <button className={parametres.langue === "pt" ? "actif" : ""} onClick={() => mettreAJourParametre("langue", "pt")}>Português</button>
          </div>
        </section>
        <section className="modal-parametres__section">
          <p className="modal-parametres__label">Voix d'Émir</p>
          <div className="modal-parametres__options">
            <button className={parametres.voix === "homme" ? "actif" : ""} onClick={() => mettreAJourParametre("voix", "homme")}>Voix homme</button>
            <button className={parametres.voix === "femme" ? "actif" : ""} onClick={() => mettreAJourParametre("voix", "femme")}>Voix femme</button>
          </div>
        </section>
        <section className="modal-parametres__section modal-parametres__ligne">
          <p className="modal-parametres__label">Lire les réponses à voix haute</p>
          <button className={`modal-parametres__interrupteur ${parametres.lectureVocaleAuto ? "actif" : ""}`} onClick={() => mettreAJourParametre("lectureVocaleAuto", !parametres.lectureVocaleAuto)}>
            <span />
          </button>
        </section>
        <section className="modal-parametres__section">
          <button className="modal-parametres__copier-token" onClick={copierIdToken} disabled={!utilisateur}>
            Copier l'ID token
          </button>
          {copieTokenStatut && <p className="modal-parametres__token-statut" role="status">{copieTokenStatut}</p>}
        </section>
        <button className="modal-parametres__deconnexion" onClick={seDeconnecter}>Se déconnecter</button>
      </div>
    </div>
  );
}