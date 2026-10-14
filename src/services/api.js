const BASE_URL = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "") || "";

function obtenirUrlApi(route) {
  if (!BASE_URL && import.meta.env.PROD) {
    throw new Error("La variable VITE_API_URL doit être configurée pour contacter le serveur.");
  }
  return `${BASE_URL}/api/chat${route}`;
}

export async function envoyerMessageEnStream(message, historique = [], surMorceau, jeton) {

  const reponse = await fetch(obtenirUrlApi("/stream"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jeton}`,
    },
    body: JSON.stringify({ message, historique }),
  });
  
  //LECTURE DE REPONSE EN STREAM 
  
  if (!reponse.ok || !reponse.body) throw new Error(`Erreur serveur Émir (stream) : ${reponse.status}`);
  const lecteur = reponse.body.getReader();
  const decodeur = new TextDecoder("utf-8");
  let tampon = "";
  let texteComplet = "";

  const traiterEvenement = (evenement) => {
    const donnees = evenement
      .split(/\r?\n/)
      .filter((ligne) => ligne.startsWith("data:"))
      .map((ligne) => ligne.slice(5).replace(/^ /, ""))
      .join("\n");

    if (!donnees) return false;

    const contenu = JSON.parse(donnees);
    if (contenu.error) throw new Error(contenu.error);
    if (typeof contenu.token === "string") {
      texteComplet += contenu.token;
      surMorceau(texteComplet);
    }
    return contenu.done === true;
  };

  while (true) {
    const { done, value } = await lecteur.read();
    tampon += decodeur.decode(value, { stream: !done });

    let debutEvenement;
    while ((debutEvenement = tampon.search(/\r?\n\r?\n/)) !== -1) {
      const evenement = tampon.slice(0, debutEvenement);
      const separateur = tampon.startsWith("\r\n\r\n", debutEvenement) ? 4 : 2;
      tampon = tampon.slice(debutEvenement + separateur);
      if (traiterEvenement(evenement)) {
        await lecteur.cancel();
        return texteComplet;
      }
    }

    if (done) {
      if (tampon.trim()) traiterEvenement(tampon);
      return texteComplet;
    }
  }
}

export async function envoyerMessage(message, historique = [], jeton) {
  const reponse = await fetch(obtenirUrlApi(""), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jeton}`,
    },
    body: JSON.stringify({ message, historique }),
  });
  if (!reponse.ok) throw new Error(`Erreur serveur Émir : ${reponse.status}`);
  return reponse.json();
}