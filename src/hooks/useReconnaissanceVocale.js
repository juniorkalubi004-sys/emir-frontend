import { useEffect, useRef, useState } from "react";

export function useReconnaissanceVocale({ langue = "fr-FR", surTranscription }) {
  const [enEcoute, setEnEcoute] = useState(false);
  const [disponible, setDisponible] = useState(true);
  const reconnaissanceRef = useRef(null);

  useEffect(() => {
    const ApiReconnaissance = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!ApiReconnaissance) { setDisponible(false); return; }

    const instance = new ApiReconnaissance();
    instance.lang = langue;
    instance.continuous = false;
    instance.interimResults = true;
    instance.onresult = (evenement) => {
      const texte = Array.from(evenement.results).map((r) => r[0].transcript).join(" ");
      surTranscription(texte);
    };
    instance.onend = () => setEnEcoute(false);
    instance.onerror = () => setEnEcoute(false);
    reconnaissanceRef.current = instance;
  }, [langue]);
  
  const demarrerEcoute = () => { reconnaissanceRef.current?.start(); setEnEcoute(true); };
  const arreterEcoute = () => { reconnaissanceRef.current?.stop(); setEnEcoute(false); };
  return { enEcoute, disponible, demarrerEcoute, arreterEcoute };
}