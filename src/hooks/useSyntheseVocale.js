import { useCallback, useEffect, useRef, useState } from "react";

export function useSyntheseVocale({ langue = "fr-FR", genreVoix = "homme" }) {
  const [enTrainDeParler, setEnTrainDeParler] = useState(false);
  const voixDisponiblesRef = useRef([]);
  useEffect(() => {
    const chargerVoix = () => { voixDisponiblesRef.current = window.speechSynthesis.getVoices(); };
    chargerVoix();
    window.speechSynthesis.onvoiceschanged = chargerVoix;
  }, []);

  const choisirVoix = useCallback(() => {
    const voix = voixDisponiblesRef.current.filter((v) => v.lang.startsWith(langue.slice(0, 2)));
    if (voix.length === 0) return null;
    const motsClesFeminin = ["female", "femme", "amelie", "audrey", "marie"];
    const correspondance = voix.find((v) => motsClesFeminin.some((mot) => v.name.toLowerCase().includes(mot)));
    if (genreVoix === "femme") return correspondance || voix[0];
    return voix.find((v) => v !== correspondance) || voix[0];
  }, [langue, genreVoix]);

  const parler = useCallback((texte) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const enonce = new SpeechSynthesisUtterance(texte);
    enonce.lang = langue;
    
    const voixChoisie = choisirVoix();
    if (voixChoisie) enonce.voice = voixChoisie;
    enonce.rate = 1;
    enonce.pitch = genreVoix === "femme" ? 1.1 : 0.95;
    enonce.onstart = () => setEnTrainDeParler(true);
    enonce.onend = () => setEnTrainDeParler(false);
    enonce.onerror = () => setEnTrainDeParler(false);
    window.speechSynthesis.speak(enonce);
  }, [langue, genreVoix, choisirVoix]);

  const arreterLecture = useCallback(() => {
    window.speechSynthesis.cancel();
    setEnTrainDeParler(false);
  }, []);
  return { parler, arreterLecture, enTrainDeParler };
}