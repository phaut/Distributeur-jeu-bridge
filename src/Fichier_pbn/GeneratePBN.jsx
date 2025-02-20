import { useState, useEffect } from "react";
const carteMap = [
  "A",
  "K",
  "Q",
  "J",
  "T",
  "9",
  "8",
  "7",
  "6",
  "5",
  "4",
  "3",
  "2",
];
const couleurs = ["S", "H", "D", "C"]; // Piques, Cœurs, Carreaux, Trèfles

// Convertit un numéro de carte (1-52) en valeur et couleur
const convertirCarte = (numero) => {
  const indexCarte = (numero - 1) % 13; // 0-12 pour la valeur
  const indexCouleur = Math.floor((numero - 1) / 13); // 0-3 pour la couleur
  return { valeur: carteMap[indexCarte], couleur: couleurs[indexCouleur] };
};

// Trie et formate les cartes par couleur
const organiserJeu = (cartes) => {
  const mainTriee = { S: "", H: "", D: "", C: "" };
  cartes.forEach((numero) => {
    const { valeur, couleur } = convertirCarte(numero);
    mainTriee[couleur] += valeur;
  });
  return `${mainTriee.S}.${mainTriee.H}.${mainTriee.D}.${mainTriee.C}`;
};

const GeneratePBN = ({
  nordChiffres,
  sudChiffres,
  ouestChiffres,
  estChiffres,
  boolPBN,
}) => {
  const [dealer, setDealer] = useState("N");
  const [vulnerable, setVulnerable] = useState("None");
  const [pbnContent, setPbnContent] = useState("");
  const [hands, setHands] = useState({
    N: "",
    /* E: organiserJeu([1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 34, 41, 48]),
    S: organiserJeu([3, 8, 9, 12, 15, 18, 24, 27, 33, 36, 39, 44, 50]),
    W: organiserJeu([11, 17, 20, 23, 26, 29, 35, 38, 43, 45, 47, 49, 52]),*/
    E: "",
    S: "",
    W: "",
  });

  // Étape 1 : Débogage - Afficher les props
  /* useEffect(() => {
    console.log("🔍 nordChiffres reçu :", nordChiffres);
  }, [nordChiffres]);*/

  // Étape 2 : Mettre à jour hands uniquement si nordChiffres est disponible
  useEffect(() => {
    if (Array.isArray(nordChiffres) && nordChiffres.length > 0) {
      //const cartesAplaties = nordChiffres.flat(); // 🔥 Aplatir le tableau Modif
      // const cartesAplaties = nordChiffres; //
      setHands((prev) => ({
        ...prev,
        // N: organiserJeu(cartesAplaties),
        N: organiserJeu(nordChiffres),
        E: organiserJeu(estChiffres),
        S: organiserJeu(sudChiffres),
        W: organiserJeu(ouestChiffres),
      }));
    }
  }, [nordChiffres, estChiffres, sudChiffres, ouestChiffres]);

  // Étape 3 : Débogage - Afficher l'état hands mis à jour
  useEffect(() => {
    console.log("🟢 hands mis à jour :", hands);
  }, [hands]);

  // Organise les mains selon le déclarant
  const getFormattedHands = (dealer) => {
    switch (dealer) {
      case "N":
        return `${hands.N} ${hands.E} ${hands.S} ${hands.W}`;
      case "E":
        return `${hands.E} ${hands.S} ${hands.W} ${hands.N}`;
      case "S":
        return `${hands.S} ${hands.W} ${hands.N} ${hands.E}`;
      case "W":
        return `${hands.W} ${hands.N} ${hands.E} ${hands.S}`;
      default:
        return "";
    }
  };

  const generatePBN = () => {
    const pbnData = `[
Dealer "${dealer}"]
[Vulnerable "${vulnerable}"]
[Deal "${dealer}:${getFormattedHands(dealer)}"]`;
    setPbnContent(pbnData);
  };

  const downloadPBN = () => {
    const blob = new Blob([pbnContent], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "bridge-game.pbn";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h2>Générateur de fichier PBN</h2>
      <label>Déclarant : </label>
      <select value={dealer} onChange={(e) => setDealer(e.target.value)}>
        <option value="N">Nord</option>
        <option value="E">Est</option>
        <option value="S">Sud</option>
        <option value="W">Ouest</option>
      </select>
      <br />
      <label>Vulnérabilité : </label>
      <select
        value={vulnerable}
        onChange={(e) => setVulnerable(e.target.value)}
      >
        <option value="None">Aucune</option>
        <option value="NS">NS</option>
        <option value="EW">EW</option>
        <option value="ALL">Tous</option>
      </select>
      <br />
      <button
        style={{
          width: "200px",
          backgroundColor: "rgb(69, 199, 228)",
          marginRight: "10px",
        }}
        onClick={generatePBN}
        disabled={!boolPBN}
      >
        Générer le fichier
      </button>
      <button
        style={{
          width: "200px",
          backgroundColor: "rgb(69, 158, 214)",
          marginRight: "10px",
        }}
        onClick={downloadPBN}
        disabled={!pbnContent}
      >
        Télécharger
      </button>
      <pre>{pbnContent}</pre>
    </div>
  );
};

export default GeneratePBN;
