import React from "react";

function extraireCellules(ligne) {
  return ligne.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cellule) => cellule.trim());
}

function estSeparateurTableau(ligne) {
  const cellules = extraireCellules(ligne);
  return cellules.length > 1 && cellules.every((cellule) => /^:?-{3,}:?$/.test(cellule));
}

function rendreTexteEnrichi(texte, prefixe) {
  const motif = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\*[^*\n]+\*|_[^_\n]+_)/g;
  const elements = [];
  let curseur = 0;
  let index = 0;

  for (const resultat of texte.matchAll(motif)) {
    const [correspondance] = resultat;
    const debut = resultat.index;
    if (debut > curseur) elements.push(texte.slice(curseur, debut));

    let element;
    if (correspondance.startsWith("```") || correspondance.startsWith("`")) {
      element = <code>{correspondance.slice(1, -1)}</code>;
    } else if (correspondance.startsWith("**") || correspondance.startsWith("__")) {
      element = <strong>{correspondance.slice(2, -2)}</strong>;
    } else if (correspondance.startsWith("~~")) {
      element = <del>{correspondance.slice(2, -2)}</del>;
    } else {
      element = <em>{correspondance.slice(1, -1)}</em>;
    }
    elements.push(React.cloneElement(element, { key: `${prefixe}-${index++}` }));
    curseur = debut + correspondance.length;
  }

  if (curseur < texte.length) elements.push(texte.slice(curseur));
  return elements;
}

function rendreMarkdown(texte) {
  const lignes = texte.split(/\r?\n/);
  const blocs = [];
  let index = 0;
  let cle = 0;

  const estDebutDeBloc = (position) => {
    const ligne = lignes[position].trim();
    return /^```/.test(ligne)
      || /^#{1,6}\s/.test(ligne)
      || /^>/.test(ligne)
      || /^\s*(?:[-*+]\s|\d+[.)]\s)/.test(lignes[position])
      || /^(?:-{3,}|\*{3,}|_{3,})$/.test(ligne)
      || (position + 1 < lignes.length && ligne.includes("|") && estSeparateurTableau(lignes[position + 1]));
  };

  while (index < lignes.length) {
    const ligne = lignes[index];
    const propre = ligne.trim();
    if (!propre) {
      index++;
      continue;
    }

    if (propre.startsWith("```")) {
      const langage = propre.slice(3).trim();
      const code = [];
      index++;
      while (index < lignes.length && !lignes[index].trim().startsWith("```")) code.push(lignes[index++]);
      if (index < lignes.length) index++;
      blocs.push(<pre key={cle++}><code className={langage ? `language-${langage}` : undefined}>{code.join("\n")}</code></pre>);
      continue;
    }

    const titre = propre.match(/^(#{1,6})\s+(.*)$/);
    if (titre) {
      const NiveauTitre = `h${titre[1].length}`;
      blocs.push(<NiveauTitre key={cle++}>{rendreTexteEnrichi(titre[2], `titre-${cle}`)}</NiveauTitre>);
      index++;
      continue;
    }

    if (propre.startsWith(">")) {
      const citation = [];
      while (index < lignes.length && lignes[index].trim().startsWith(">")) {
        citation.push(lignes[index++].trim().replace(/^>\s?/, ""));
      }
      blocs.push(<blockquote key={cle++}>{rendreTexteEnrichi(citation.join(" "), `citation-${cle}`)}</blockquote>);
      continue;
    }

    if (index + 1 < lignes.length && propre.includes("|") && estSeparateurTableau(lignes[index + 1])) {
      const entetes = extraireCellules(ligne);
      index += 2;
      const rangees = [];
      while (index < lignes.length && lignes[index].trim().includes("|")) rangees.push(extraireCellules(lignes[index++]));
      blocs.push(
        <div className="bulle-message__tableau" key={cle++}>
          <table>
            <thead><tr>{entetes.map((cellule, celluleIndex) => <th key={celluleIndex}>{rendreTexteEnrichi(cellule, `th-${cle}-${celluleIndex}`)}</th>)}</tr></thead>
            <tbody>{rangees.map((rangee, rangeeIndex) => (
              <tr key={rangeeIndex}>{entetes.map((_, celluleIndex) => <td key={celluleIndex}>{rendreTexteEnrichi(rangee[celluleIndex] || "", `td-${cle}-${rangeeIndex}-${celluleIndex}`)}</td>)}</tr>
            ))}</tbody>
          </table>
        </div>
      );
      continue;
    }

    const itemListe = ligne.match(/^\s*(?:([-*+])|(\d+)[.)])\s+(.*)$/);
    if (itemListe) {
      const ordonnee = Boolean(itemListe[2]);
      const items = [];
      while (index < lignes.length) {
        const item = lignes[index].match(/^\s*(?:([-*+])|(\d+)[.)])\s+(.*)$/);
        if (!item || Boolean(item[2]) !== ordonnee) break;
        items.push(item[3]);
        index++;
      }
      const Liste = ordonnee ? "ol" : "ul";
      blocs.push(<Liste key={cle++}>{items.map((item, itemIndex) => <li key={itemIndex}>{rendreTexteEnrichi(item, `li-${cle}-${itemIndex}`)}</li>)}</Liste>);
      continue;
    }

    if (/^(?:-{3,}|\*{3,}|_{3,})$/.test(propre)) {
      blocs.push(<hr key={cle++} />);
      index++;
      continue;
    }

    const paragraphe = [propre];
    index++;
    while (index < lignes.length && lignes[index].trim() && !estDebutDeBloc(index)) paragraphe.push(lignes[index++].trim());
    blocs.push(<p key={cle++}>{rendreTexteEnrichi(paragraphe.join(" "), `p-${cle}`)}</p>);
  }

  return <div className="bulle-message__markdown">{blocs}</div>;
}

export default function BulleMessage({ message, surEcouter, surAimer, enTrainDeParler }) {
  const estUtilisateur = message.role === "utilisateur";
  return (
    <div className={`bulle-message ${estUtilisateur ? "bulle-message--utilisateur" : "bulle-message--emir"}`}>
      {!estUtilisateur && <div className={`bulle-message__avatar ${enTrainDeParler ? "bulle-message__avatar--parle" : ""}`} />}
      <div className="bulle-message__contenu">
        {estUtilisateur ? <p>{message.texte}</p> : rendreMarkdown(message.texte)}
        {!estUtilisateur && message.texte && (
          <div className="bulle-message__actions">
            <button
              className="bulle-message__bouton-action"
              onClick={() => copierTexte(message.texte)}
              title="Copier la réponse"
              aria-label="Copier la réponse"
            >
              <IconeCopier />
            </button>
            <button
              className={`bulle-message__bouton-action ${message.aime ? "bulle-message__bouton-action--actif" : ""}`}
              onClick={surAimer}
              title={message.aime ? "Retirer le j'aime" : "Aimer la réponse"}
              aria-label={message.aime ? "Retirer le j'aime" : "Aimer la réponse"}
              aria-pressed={Boolean(message.aime)}
            >
              <IconePouce />
            </button>
            <button className="bulle-message__bouton-action" onClick={() => surEcouter(message.texte)} title="Écouter cette réponse" aria-label="Écouter cette réponse">
              <IconeSon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

async function copierTexte(texte) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error("L'accès au presse-papiers n'est pas disponible.");
    await navigator.clipboard.writeText(texte);
  } catch (erreur) {
    console.error("Impossible de copier la réponse.", erreur);
  }
}

function IconeCopier() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="8" y="8" width="13" height="13" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" strokeLinecap="round" /></svg>;
}

function IconePouce() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12M15 5l-1 5h6a2 2 0 0 1 2 2l-2 8a2 2 0 0 1-2 2H7V10l5-8a2 2 0 0 1 3 3z" /></svg>;
}

function IconeSon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 5 6 9H2v6h4l5 4V5z" strokeLinejoin="round" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" strokeLinecap="round" /></svg>;
}