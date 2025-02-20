import { useEffect, useReducer } from "react";
//import "./App.css";
import { useState } from "react";

import ImgDepose from "./imageUtils/DeposeImg";
import { distributeImages } from "./imageUtils/distributeImages";
import PBNReader from "./Fichier_pbn/PBNreader";

//import { useEffect } from "React";
import GeneratePBN from "./Fichier_pbn/GeneratePBN";

const App = () => {
  const imagesInit = [];
  // const [tableaux, setTableaux] = useState([]);
  const [clickedImageUrl, setClickedImageUrl] = useState(null);
  for (let i = 1; i < 53; i++) {
    imagesInit.push(`/images/${i}.gif`);
  }
  const [nordChiffres, setNordChiffres] = useState([]);
  const [sudChiffres, setSudChiffres] = useState([]);
  const [estChiffres, setEstChiffres] = useState([]);
  const [ouestChiffres, setOuestChiffres] = useState([]);

  const [boolPBN, setBoolPBN] = useState(false);

  const tableInit = {
    // center: [...imagesInit, ...Array(49).fill(null)], // 52 slots pour le centre (3 images + 49 vides)
    center: [...imagesInit], // Seulement 52 images, pas de slots vides en plus
    north: Array(13).fill(null), // 13 slots pour le nord
    south: Array(13).fill(null), // 13 slots pour le sud
    east: Array(13).fill(null), // 13 slots pour l'est
    west: Array(13).fill(null), // 13 slots pour l'ouest
  };
  const handleUpdateSlots = (newSlots) => {
    // console.log(newSlots);
    setSlots(newSlots);
  };
  const valeurs = [
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

  const chiffreCarte = Object.fromEntries(
    Array.from({ length: 52 }, (_, i) => [i + 1, valeurs[i % 13]])
  );

  // console.log(chiffreCarte);
  const [slots, setSlots] = useState(tableInit);
  const [cursorImage, setCursorImage] = useState(null);
  const resizeImageForCursor = (imageUrl, width, height) => {
    //Modif 13 février 25
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageUrl;
      img.crossOrigin = "Anonymous"; // Évite les erreurs CORS
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/png"); // Convertir en Data URL
        // console.log("URL de l'image redimensionnée :", dataUrl); // Vérifier l'URL
        resolve(dataUrl);
      };
    });
  };

  const handleImageClick = async (imageUrl) => {
    //Modif 13 février 25
    // console.log("Image cliquée :", imageUrl); // Vérifier l'URL récupérée
    setClickedImageUrl(imageUrl); // Conserver l'URL de l'image cliqué
    // Redimensionner l'image pour le curseur
    const resizedCursorImage = await resizeImageForCursor(imageUrl, 40, 60);
    // Appliquer l'image redimensionnée pour le curseur
    setCursorImage(resizedCursorImage);
  };

  const handleSlotClick = (area, index) => {
    const currentSlots = slots[area];

    // Si le slot est vide et une image est active dans le curseur => dépose
    //  console.log("Image déposée " + clickedImageUrl);
    if (!currentSlots[index] && cursorImage) {
      currentSlots[index] = clickedImageUrl;

      setSlots((prevSlots) => {
        const updatedSlots = {
          ...prevSlots,
          [area]: [...currentSlots].sort((a, b) => {
            if (!a && b) return 1;
            if (a && !b) return -1;
            if (!a && !b) return 0;
            return extractNumber(a) - extractNumber(b);
          }),
        };

        // console.log("🟢 slots.north mis à jour :", updatedSlots.north);

        // 🔍 Vérifier si toutes les zones sont pleines
        const allZonesFilled = ["north", "south", "east", "west"].every(
          (zone) => updatedSlots[zone].every((slot) => slot !== null)
        );

        if (allZonesFilled) {
          console.log("✅ Toutes les zones sont bien pleines !" + slots.north);
          setBoolPBN(true);
          // setNordChiffres(chiffres(slots.north));
          ["north", "south", "east", "west"].forEach((zone) => {
            const zoneChiffres = chiffres(slots[zone]);

            switch (zone) {
              case "north":
                setNordChiffres(zoneChiffres);
                break;
              case "south":
                setSudChiffres(zoneChiffres);
                break;
              case "east":
                setEstChiffres(zoneChiffres);
                break;
              case "west":
                setOuestChiffres(zoneChiffres);
                break;
              default:
                break;
            }
          });
        } else {
          setBoolPBN(false);
        }

        return updatedSlots;
      });

      // ✅ Réinitialiser l'image du curseur après la mise à jour
      setCursorImage(null);
    }
    // Si le slot est occupé et aucun curseur actif => récupération
    else if (currentSlots[index] && !cursorImage) {
      // setCursorImage(currentSlots[index]);
      handleImageClick(currentSlots[index]);
      currentSlots[index] = null;
      setSlots((prevSlots) => ({
        ...prevSlots,
        [area]: [...currentSlots].sort((a, b) => {
          if (!a && b) return 1;
          if (a && !b) return -1;
          if (!a && !b) return 0;
          return extractNumber(a) - extractNumber(b);
        }),
      }));

      if (slots.center.every((slot) => slot === null)) {
        console.log("✅ center est bien vide !");
      }
    }
  };

  // Fonction pour extraire le numéro de la carte à partir de son chemin
  const extractNumber = (imagePath) => {
    const match = imagePath.match(/(\d+)\.gif$/);
    return match ? parseInt(match[1], 10) : 0;
  };
  const handleInitClick = () => {
    setSlots(tableInit);
    setCursorImage(null);
    setBoolPBN(false);
    // console.log("slots.center " + slots.center);
  };
  /**Renvoie le chiffre de chaque image-carte ex: As->1 ,Roi->2 etc*/
  const chiffres = (images) => {
    return images.map((img) => {
      const match = img.match(/\/(\d+)\.gif/);
      return match ? parseInt(match[1], 10) : null;
    });
  };

  /**Distribution des cartes aléatoirement*/
  const handleDistributeClick = () => {
    const newTableaux = distributeImages(); // Distribue les cartes
    // setTableaux(newTableaux);
    // Stocke 13 cartes pour chaque joueur et les trie
    setBoolPBN(true);
    const newNord = [...newTableaux[0]].sort(
      (a, b) => extractNumber(a) - extractNumber(b)
    );
    // const newNordChiffres = chiffres(newNord);
    setNordChiffres(chiffres(newNord));

    const newSud = [...newTableaux[1]].sort(
      (a, b) => extractNumber(a) - extractNumber(b)
    );
    setSudChiffres(chiffres(newSud));

    const newOuest = [...newTableaux[2]].sort(
      (a, b) => extractNumber(a) - extractNumber(b)
    );
    setOuestChiffres(chiffres(newOuest));

    const newEst = [...newTableaux[3]].sort(
      (a, b) => extractNumber(a) - extractNumber(b)
    );
    setEstChiffres(chiffres(newEst));

    // Assurer que les slots sont mis à jour après les états
    setSlots((prevSlots) => {
      const newSlots = {
        center: Array(52).fill(null), // Centre vide
        north: newNord,
        south: newSud,
        east: newEst,
        west: newOuest,
      };

      // Ici, newSlots.center est déjà mis à jour
      console.log("🟢 Nouvelle valeur de slots.center : ", newSlots.center);

      // Utilise newSlots.center directement ici
      if (newSlots.center.every((slot) => slot === null)) {
        console.log("✅ center est bien vide !");
      }

      return newSlots; // Retourne le nouvel état
    });
  };

  return (
    <div
      style={{
        cursor: cursorImage ? `url(${cursorImage}) 10 10, auto` : "default",
        backgroundColor: "rgb(162, 232, 130)",
        textAlign: "center",
        width: "100vw", // Largeur totale de l'écran
        height: "140vh", // Hauteur totale de l'écran
        // display: "grid",
        justifyItems: "center", // Centre les contenus horizontalement
      }}
    >
      <h3>Distributeur cartes</h3>

      {/* Conteneur global avec grid pour organiser les zones */}
      <div
        style={{
          display: "flex",
          gap: "20px", // Espace entre les deux blocs
        }}
      >
        <ImgDepose
          area="north"
          slots={slots.north}
          onSlotClick={handleSlotClick}
          title="Nord"
          // style={{ gridColumn: "1 / span 13" }} // Place le Nord sur toute la largeur
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          alignItems: "center",
          // pointerEvents: "all",
        }}
      >
        {/* Zone Centre (au milieu de la table) */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "5px",
            alignItems: "center",
            // pointerEvents: "all",
          }}
        >
          <ImgDepose
            area="west"
            slots={slots.west}
            onSlotClick={handleSlotClick}
            title="Ouest"
            cursorImage={cursorImage}
            style={{
              // gridRow: "2 / 3", // Positionne la zone Ouest sur la ligne du milieu
              // gridColumn: "1 / span 13", // Place la zone Ouest à gauche
              //pointerEvents: "all",
              gridTemplateColumns: "repeat(7, 1fr)",
            }}
          />
          <ImgDepose
            area="center"
            slots={slots.center}
            onSlotClick={handleSlotClick}
            // title="C"
            style={{ marginBottom: "10px" }}
          />
          <ImgDepose
            area="east"
            slots={slots.east}
            onSlotClick={handleSlotClick}
            title="Est"
            style={
              {
                // gridRow: "2 /3", // Positionne la zone Est sur la ligne du milieu
                // gridColumn: "1 / span 13", // Place la zone Est à droite
                // pointerEvents: "all",
              }
            }
          />
        </div>
        <ImgDepose
          area="south"
          slots={slots.south}
          onSlotClick={handleSlotClick}
          title="Sud"
          // style={{ gridColumn: "1 / span 13" }} // Place le Sud sur toute la largeur
        />
        <div style={{}}>
          <button
            style={{
              width: "165px",
              backgroundColor: "rgb(69, 199, 228)",
              marginRight: "10px",
            }}
            onClick={handleInitClick}
          >
            Init Table
          </button>
          <button
            style={{
              width: "165px",
              backgroundColor: "rgb(240, 128, 225)",
            }}
            onClick={handleDistributeClick}
          >
            Aléatoire
          </button>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: "20px", // Espace entre les deux blocs
        }}
      >
        {boolPBN && (
          <GeneratePBN
            nordChiffres={nordChiffres}
            sudChiffres={sudChiffres}
            ouestChiffres={ouestChiffres}
            estChiffres={estChiffres}
            boolPBN={boolPBN}
          />
        )}
        <PBNReader onUpdateSlots={handleUpdateSlots} />
      </div>
    </div>
  );
};

export default App;
