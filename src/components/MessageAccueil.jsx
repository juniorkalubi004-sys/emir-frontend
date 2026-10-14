// Salutation selon l'heure + condition météo réelle (géolocalisation navigateur).
import React, { useMemo } from "react";
import { useAuth } from "../context/ContexteAuth.jsx";
import { useMeteo } from "../hooks/useMeteo.js";


function obtenirSalutation(heure) {
  if (heure >= 5 && heure < 12) return "Bonjour";
  if (heure >= 12 && heure < 18) return "Bon après-midi";
  if (heure >= 18 && heure < 22) return "Bonsoir";
  return "Bonne nuit";
}

export default function MessageAccueil() {
  const { utilisateur } = useAuth();
  const { meteo } = useMeteo();
  const salutation = useMemo(() => obtenirSalutation(new Date().getHours()), []);
  const prenom = utilisateur?.displayName?.split(" ")[0] || "";
  return (
    <div className="message-accueil">
      <div className="message-accueil__anneau">{meteo && <span>{meteo.icone}</span>}</div>
      <h2 className="message-accueil__titre">{salutation}{prenom ? `, ${prenom}` : ""}</h2>
      <p className="message-accueil__soustitre">
        {meteo
          ? `Il fait ${meteo.temperature}°C avec ${meteo.texte} — sur quoi travaillons-nous aujourd'hui ?`
          : "Sur quoi travaillons-nous aujourd'hui ?"}
      </p>
    </div>
  );
}