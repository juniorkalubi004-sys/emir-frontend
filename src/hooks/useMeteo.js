// Récupère la météo locale (via géolocalisation navigateur + API Open-Meteo,
// gratuite et sans clé) pour personnaliser le message d'accueil.
import { useEffect, useState } from "react";
const CODES_METEO = {
  0: { texte: "un ciel dégagé", icone: "☀️" },
  1: { texte: "un temps plutôt clair", icone: "🌤️" },
  2: { texte: "un ciel partiellement nuageux", icone: "⛅" },
  3: { texte: "un ciel couvert", icone: "☁️" },
  45: { texte: "du brouillard", icone: "🌫️" },
  48: { texte: "du brouillard givrant", icone: "🌫️" },
  51: { texte: "une bruine légère", icone: "🌦️" },
  61: { texte: "de la pluie", icone: "🌧️" },
  63: { texte: "de la pluie modérée", icone: "🌧️" },
  65: { texte: "une forte pluie", icone: "🌧️" },
  80: { texte: "des averses", icone: "🌦️" },
  95: { texte: "un orage", icone: "⛈️" },
};
export function useMeteo() {
  const [meteo, setMeteo] = useState(null);
  const [chargement, setChargement] = useState(true);
  useEffect(() => {
    if (!navigator.geolocation) {
      setChargement(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`;
          const reponse = await fetch(url);
          const donnees = await reponse.json();
          const code = donnees?.current?.weather_code;
          const description = CODES_METEO[code] || { texte: "un temps changeant", icone: "🌥️" };
          setMeteo({
            temperature: Math.round(donnees?.current?.temperature_2m),
            texte: description.texte,
            icone: description.icone,
          });
        } catch {
          setMeteo(null);
        } finally {
          setChargement(false);
        }
      },
      () => setChargement(false),
      { timeout: 5000 }
    );
  }, []);
  return { meteo, chargement };
}