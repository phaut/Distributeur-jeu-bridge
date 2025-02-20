export const distributeImages = () => {
  const images = [];
  for (let i = 1; i <= 52; i++) {
    images.push(`/images/${i}.gif`);
  }

  // Fonction pour mélanger un tableau aléatoirement (algorithme de Fisher-Yates)
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Échange des éléments
    }
  };

  shuffleArray(images);

  // Répartit les images en 4 groupes de 13
  const newTableaux = [];
  for (let i = 0; i < 4; i++) {
    newTableaux.push(images.slice(i * 13, (i + 1) * 13));
  }

  return newTableaux;
};
