import React, { useCallback, useEffect, useState } from "react";
import { FournisseurAuth, useAuth } from "./context/ContexteAuth.jsx";
import { FournisseurParametres } from "./context/ContextePrametres.jsx";
import PageConnexion from "./components/PageConnexion.jsx";
import BarreLaterale from "./components/BarreLaterale.jsx";
import ZoneDiscussion from "./components/ZoneDiscussion.jsx";
import ModalParametres from "./components/ModalParametres.jsx";
import "./styles/global.css";

const CLE_HISTORIQUE_DISCUSSIONS = "emir-discussions";

function creerIdentifiantDiscussion() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function chargerDiscussions() {
  try {
    const discussions = JSON.parse(localStorage.getItem(CLE_HISTORIQUE_DISCUSSIONS) || "[]");
    if (!Array.isArray(discussions)) return [];
    return discussions.filter((discussion) =>
      discussion
      && typeof discussion.id === "string"
      && Array.isArray(discussion.messages)
    );
  } catch (erreur) {
    console.error("Impossible de charger l'historique des discussions.", erreur);
    return [];
  }
}

function ContenuApp() {
  const { utilisateur, chargement } = useAuth();
  const [parametresOuverts, setParametresOuverts] = useState(false);
  const [discussions, setDiscussions] = useState(chargerDiscussions);
  const [discussionActiveId, setDiscussionActiveId] = useState(creerIdentifiantDiscussion);
  const discussionActive = discussions.find((discussion) => discussion.id === discussionActiveId);

  useEffect(() => {
    try {
      localStorage.setItem(CLE_HISTORIQUE_DISCUSSIONS, JSON.stringify(discussions));
    } catch (erreur) {
      console.error("Impossible d'enregistrer l'historique des discussions.", erreur);
    }
  }, [discussions]);

  const enregistrerDiscussion = useCallback((discussionMiseAJour) => {
    setDiscussions((precedentes) => {
      const existe = precedentes.some((discussion) => discussion.id === discussionMiseAJour.id);
      return existe
        ? precedentes.map((discussion) => discussion.id === discussionMiseAJour.id ? discussionMiseAJour : discussion)
        : [...precedentes, discussionMiseAJour];
    });
  }, []);

  const supprimerDiscussion = useCallback((id) => {
    setDiscussions((precedentes) => precedentes.filter((discussion) => discussion.id !== id));
    if (discussionActiveId === id) setDiscussionActiveId(creerIdentifiantDiscussion());
  }, [discussionActiveId]);

  if (chargement) return <div className="app-chargement">Chargement…</div>;
  if (!utilisateur) return <PageConnexion />;
  
  return (
    <div className="app-disposition">
      <BarreLaterale
        discussions={discussions}
        discussionActiveId={discussionActiveId}
        surNouvelleDiscussion={() => setDiscussionActiveId(creerIdentifiantDiscussion())}
        surSelectionnerDiscussion={setDiscussionActiveId}
        surSupprimerDiscussion={supprimerDiscussion}
        surOuvrirParametres={() => setParametresOuverts(true)}
      />
      <ZoneDiscussion
        key={discussionActiveId}
        discussionId={discussionActiveId}
        discussion={discussionActive}
        surEnregistrerDiscussion={enregistrerDiscussion}
      />
      {parametresOuverts && <ModalParametres surFermer={() => setParametresOuverts(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <FournisseurAuth>
      <FournisseurParametres>
        <ContenuApp />
      </FournisseurParametres>
    </FournisseurAuth>
  );
}