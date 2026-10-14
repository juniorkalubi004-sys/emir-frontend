import React, { useEffect, useRef, useState } from "react";
import MessageAccueil from "./MessageAccueil.jsx";
import BulleMessage from "./BulleMessage.jsx";
import BarreSaisie from "./BarreSaisie.jsx";
import { useSyntheseVocale } from "../hooks/useSyntheseVocale.js";
import { useAuth } from "../context/ContexteAuth.jsx";
import { useParametres } from "../context/ContextePrametres.jsx";
import { envoyerMessageEnStream } from "../services/api.js";




export default function ZoneDiscussion({ discussionId, discussion, surEnregistrerDiscussion }) {
  const [messages, setMessages] = useState(() => discussion?.messages || []);
  const [enChargement, setEnChargement] = useState(false);
  const finDesMessagesRef = useRef(null);
  const premierRenduRef = useRef(true);
  const { utilisateur } = useAuth();
  const { parametres } = useParametres();
  const langueVocale = parametres.langue === "en" ? "en-US" : parametres.langue === "pt" ? "pt-PT" : "fr-FR";

  const { parler, enTrainDeParler } = useSyntheseVocale({ langue: langueVocale, genreVoix: parametres.voix });

  useEffect(() => { finDesMessagesRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => {
    if (premierRenduRef.current) {
      premierRenduRef.current = false;
      return;
    }
    const premierMessageUtilisateur = messages.find((message) => message.role === "utilisateur");
    if (!premierMessageUtilisateur) return;
    surEnregistrerDiscussion({
      id: discussionId,
      messages,
      titre: premierMessageUtilisateur.texte.slice(0, 60),
      updatedAt: new Date().toISOString(),
    });
  }, [discussionId, messages, surEnregistrerDiscussion]);
  
  const envoyerNouveauMessage = async (texte) => {
    const messageUtilisateur = { role: "utilisateur", texte };
    const historiquePourApi = messages.map((m) => ({ role: m.role, texte: m.texte }));
    setMessages((precedent) => [...precedent, messageUtilisateur, { role: "emir", texte: "" }]);
    setEnChargement(true);
    try {
      const jeton = await utilisateur.getIdToken();
      const reponseFinale = await envoyerMessageEnStream(texte, historiquePourApi, (texteProgressif) => {
        setMessages((precedent) => {
          const copie = [...precedent];
          copie[copie.length - 1] = { role: "emir", texte: texteProgressif };
          return copie;
        });
      }, jeton);
      if (parametres.lectureVocaleAuto && reponseFinale) parler(reponseFinale);
    } catch {
      setMessages((precedent) => {
        const copie = [...precedent];
        copie[copie.length - 1] = { role: "emir", texte: "Désolé, une erreur est survenue en contactant le serveur. Réessayez dans un instant." };
        return copie;
      });
    } finally {
      setEnChargement(false);
    }
  };
  return (
    <main className="zone-discussion">
      <div className="zone-discussion__fil">
        {messages.length === 0 ? (
          <div className="zone-discussion__accueil-conteneur"><MessageAccueil /></div>
        ) : (
          <div className="zone-discussion__messages">
            {messages.map((message, index) => (
              <BulleMessage
                key={index}
                message={message}
                surEcouter={parler}
                surAimer={() => setMessages((precedents) => precedents.map((element, position) =>
                  position === index ? { ...element, aime: !element.aime } : element
                ))}
                enTrainDeParler={enTrainDeParler && index === messages.length - 1}
              />
            ))}
            <div ref={finDesMessagesRef} />
          </div>
        )}
      </div>
      <div className="zone-discussion__bas">
        <BarreSaisie surEnvoyer={envoyerNouveauMessage} langue={parametres.langue} enChargement={enChargement} />
        <p className="zone-discussion__note">Émir peut se tromper. Vérifiez les informations importantes.</p>
      </div>
    </main>
  );
}