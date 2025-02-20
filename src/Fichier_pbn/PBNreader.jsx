/*import { useState } from "react";
const PBNReader = ({ onUpdateSlots }) => {
  const [fileContent, setFileContent] = useState("");

  // Tableau des images du Roi de Pique (1.gif) au 2 de Trèfle (52.gif)
  const images = Array.from({ length: 52 }, (_, i) => `/images/${i + 1}.gif`);
  // console.log(images);

  // Conversion carte PBN → Index dans "images"
  const cardToImageIndex = (card) => {
    const suits = { S: 0, H: 13, D: 26, C: 39 };
    const values = {
      A: 1,
      K: 2,
      Q: 3,
      J: 4,
      T: 5,
      9: 6,
      8: 7,
      7: 8,
      6: 9,
      5: 10,
      4: 11,
      3: 12,
      2: 13,
    };

    const suit = card.slice(-1); // Dernier caractère : "S", "H", "D", "C"
    const value = card.slice(0, -1); // Reste : "A", "K", etc.

    return suits[suit] + values[value];
  };

  // Fonction pour convertir une main complète (ex: J98.T843.K854A.T)
  const parseHand = (hand) => {
    // Décalages pour les couleurs : Pique=0, Cœur=13, Carreau=26, Trèfle=39
    const suitOffsets = [0, 13, 26, 39];

    // Divise la main en 4 parties pour chaque couleur
    return hand
      .split(".")
      .flatMap((group, suitIndex) =>
        group
          .split("")
          .map((card) => cardToImageIndex(card, suitOffsets[suitIndex]))
      );
  };
  // Traiter le fichier PBN
  const parsePBN = (content) => {
    const dealLine = content.match(/\[Deal "N:(.*?)"\]/);
    if (!dealLine) return;

    const hands = dealLine[1].split(" ");
    console.log("Hands: ", hands);

    const [north, east, south, west] = hands.map(
      (hand) =>
        hand
          .split(".") // Sépare les cartes par couleur
          .flatMap((group, index) => {
            const suit = ["S", "H", "D", "C"][index]; // Associe la couleur
            return group
              .match(/./g)
              .map((value) => cardToImageIndex(value + suit));
          })
          .sort((a, b) => a - b) // Trie les cartes dans l'ordre croissant
    );

    // Construire l'objet des mains avec les bonnes images
    const slots = {
      north: north.map((index) => `/images/${index}.gif`),
      east: east.map((index) => `/images/${index}.gif`),
      south: south.map((index) => `/images/${index}.gif`),
      west: west.map((index) => `/images/${index}.gif`),
      center: Array(52).fill(null),
    };

    onUpdateSlots(slots);

    // Vérifier les résultats
    console.log("North: ", slots.north);
    console.log("East: ", slots.east);
    console.log("South: ", slots.south);
    console.log("West: ", slots.west);
  };

  // Gérer l'upload du fichier
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        setFileContent(content);
        parsePBN(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <h2>Lecture du fichier PBN</h2>
      <input type="file" accept=".pbn" onChange={handleFileUpload} />
      {fileContent && <pre>{fileContent}</pre>}
    </div>
  );
};

export default PBNReader;*/
import { useState } from "react";

const PBNReader = ({ onUpdateSlots }) => {
  const [fileContent, setFileContent] = useState("");

  // Tableau des images du Roi de Pique (1.gif) au 2 de Trèfle (52.gif)
  const images = Array.from({ length: 52 }, (_, i) => `/images/${i + 1}.gif`);

  // Fonction pour convertir une carte PBN en index d'image (0-51)
  const cardToImageIndex = (card) => {
    // Associer les couleurs : Pique (S) = 0, Cœur (H) = 13, Carreau (D) = 26, Trèfle (C) = 39
    const suits = { S: 0, H: 13, D: 26, C: 39 };

    // Valeurs : As (A) = 1, Roi (K) = 2, ... 2 = 13
    const values = {
      A: 0, // As
      K: 1, // Roi
      Q: 2, // Dame
      J: 3, // Valet
      T: 4, // Dix
      9: 5,
      8: 6,
      7: 7,
      6: 8,
      5: 9,
      4: 10,
      3: 11,
      2: 12, // Deux
    };

    // Vérifier la validité de la carte
    if (card.length < 2) return undefined;

    const value = card[0]; // Exemple : "A", "K", etc.
    const suit = card[1]; // Exemple : "S", "H", "D", "C"

    // Calculer l'index : couleur + valeur
    return suits[suit] + values[value];
  };

  // Adapter l'ordre des mains selon le donneur
  const getDealOrder = (dealer) => {
    const order = {
      N: [0, 1, 2, 3], // Nord, Est, Sud, Ouest
      E: [3, 0, 1, 2], // Est, Sud, Ouest, Nord
      S: [2, 3, 0, 1], // Sud, Ouest, Nord, Est
      W: [1, 2, 3, 0], // Ouest, Nord, Est, Sud
    };
    return order[dealer] || order.N; // Par défaut : Nord
  };

  // Traiter le contenu du fichier PBN
  const parsePBN = (content) => {
    const dealMatch = content.match(/\[Deal "(N|E|S|W):(.*?)"\]/);
    if (!dealMatch) {
      console.error("Erreur : Donneur ou distribution introuvable.");
      return;
    }

    const dealer = dealMatch[1]; // Exemple : "N"
    const hands = dealMatch[2].split(" "); // Exemple : ['J98.T843.K854A.T', ...]

    console.log("Donneur : ", dealer);
    console.log("Mains brutes : ", hands);

    // Réorganiser les mains selon le donneur
    const dealOrder = getDealOrder(dealer);
    const orderedHands = dealOrder.map((i) => hands[i]);
    console.log("Ordre ajusté : ", orderedHands);

    // Convertir chaque main en indices d'images
    const parsedHands = orderedHands.map(
      (hand) =>
        hand
          .split(".") // Divise les cartes en groupes par couleur
          .flatMap((group, index) => {
            const suit = ["S", "H", "D", "C"][index]; // Associer la couleur
            return group
              .split("")
              .map((value) => cardToImageIndex(value + suit));
          })
          .filter((index) => index !== undefined) // Filtrer les cartes invalides
          .sort((a, b) => a - b) // Trier les cartes pour un affichage ordonné
    );

    const [north, east, south, west] = parsedHands;

    // Création des slots avec les images correspondantes
    const slots = {
      north: north.map((index) => images[index]),
      east: east.map((index) => images[index]),
      south: south.map((index) => images[index]),
      west: west.map((index) => images[index]),
      center: Array(52).fill(null),
    };

    // Mise à jour du composant parent avec les nouvelles données
    onUpdateSlots(slots);

    // Logs pour vérification
    console.log("North: ", slots.north);
    console.log("East: ", slots.east);
    console.log("South: ", slots.south);
    console.log("West: ", slots.west);
  };

  // Gestion de l'upload du fichier PBN
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        setFileContent(content);
        parsePBN(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <h2>Télécharger un fichier PBN</h2>
      <input type="file" accept=".pbn" onChange={handleFileUpload} />
      {fileContent && <pre>{fileContent}</pre>}
    </div>
  );
};

export default PBNReader;
