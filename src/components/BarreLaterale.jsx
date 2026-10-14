import React, { useState } from "react";
import { useAuth } from "../context/ContexteAuth.jsx";


export default function BarreLaterale({
  discussions,
  discussionActiveId,
  surNouvelleDiscussion,
  surSelectionnerDiscussion,
  surSupprimerDiscussion,
  surOuvrirParametres,
}) {
  const { utilisateur } = useAuth();
  const [ouverte, setOuverte] = useState(true);
  const initiale = utilisateur?.displayName?.[0]?.toUpperCase() || "É";
  const discussionsTriees = [...discussions].sort((a, b) =>
    (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0)
  );

  return (
    <aside className={`barre-laterale ${ouverte ? "barre-laterale--ouverte" : "barre-laterale--repliee"}`}>
      <div className="barre-laterale__haut">
        <div className="barre-laterale__entete">
          <div className="barre-laterale__identite">
            <div className="barre-laterale__logo" title="Émir"><span className="barre-laterale__logo-anneau" /></div>
            {ouverte && <span className="barre-laterale__nom">Émir</span>}
          </div>
          <button
            className="barre-laterale__icone"
            title={ouverte ? "Réduire la barre latérale" : "Agrandir la barre latérale"}
            aria-label={ouverte ? "Réduire la barre latérale" : "Agrandir la barre latérale"}
            aria-expanded={ouverte}
            onClick={() => setOuverte((valeur) => !valeur)}
          >
            <IconePanneau ouverte={ouverte} />
          </button>
        </div>
        <button className="barre-laterale__action" title="Nouvelle discussion" onClick={surNouvelleDiscussion}>
          <IconePlus />
          {ouverte && <span>Nouvelle discussion</span>}
        </button>
        {ouverte ? (
          <section className="barre-laterale__historique" aria-label="Historique des discussions">
            <h2>Historique</h2>
            {discussionsTriees.length === 0 ? (
              <p className="barre-laterale__vide">Vos discussions apparaîtront ici.</p>
            ) : (
              <div className="barre-laterale__liste">
                {discussionsTriees.map((discussion) => (
                  <div className="barre-laterale__ligne-discussion" key={discussion.id}>
                    <button
                      className={`barre-laterale__discussion ${discussion.id === discussionActiveId ? "barre-laterale__discussion--active" : ""}`}
                      onClick={() => surSelectionnerDiscussion(discussion.id)}
                      title={discussion.titre || "Discussion sans titre"}
                      aria-current={discussion.id === discussionActiveId ? "page" : undefined}
                    >
                      {discussion.titre || "Nouvelle discussion"}
                    </button>
                    <button
                      className="barre-laterale__supprimer-discussion"
                      onClick={() => surSupprimerDiscussion(discussion.id)}
                      title="Supprimer cette discussion"
                      aria-label={`Supprimer la discussion : ${discussion.titre || "Nouvelle discussion"}`}
                    >
                      <IconeCorbeille />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : (
          <button className="barre-laterale__icone" title="Afficher l'historique" aria-label="Afficher l'historique" onClick={() => setOuverte(true)}>
            <IconeHistorique />
          </button>
        )}
      </div>
      <div className="barre-laterale__bas">
        <button className="barre-laterale__action barre-laterale__action--secondaire" title="Paramètres" onClick={surOuvrirParametres}>
          <IconeReglages />
          {ouverte && <span>Paramètres</span>}
        </button>
        <div className="barre-laterale__avatar" title={utilisateur?.displayName || "Utilisateur"}>
          {utilisateur?.photoURL ? <img src={utilisateur.photoURL} alt="Avatar utilisateur" /> : <span>{initiale}</span>}
        </div>
      </div>
    </aside>
  );
}
function IconePlus() {
  return (<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>);
}
function IconePanneau({ ouverte }) {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d={ouverte ? "M9 4v16m4-11 3 3-3 3" : "M9 4v16m6-11-3 3 3 3"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconeHistorique() {
  return (<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12a9 9 0 1 0 3-6.7" strokeLinecap="round" /><path d="M3 4v5h5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}
function IconeCorbeille() {
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" /></svg>);
}
function IconeReglages() {
  return (<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1z" strokeLinecap="round" strokeLinejoin="round" /></svg>);
}