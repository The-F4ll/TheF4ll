export const challenges = {
  1: [
    {
      description:
        "La Pente Inaccessible - Créez une fonction qui calcule la suite de Fibonacci pour trouver le bon chemin d'escalade",
      validation: (code) =>
        code.includes("function") &&
        code.includes("fibonacci") &&
        code.includes("for"),
      timeLimit: 180000, // 3 minutes
    },
    {
      description:
        "Le Ravin des Ombres - Implémentez un algorithme de tri à bulles pour organiser les indices de navigation",
      validation: (code) =>
        code.includes("for") && code.includes("if") && code.includes("swap"),
      timeLimit: 180000,
    },
    {
      description:
        "Le Pont Suspendu - Vérifiez si le chemin est sûr en créant une fonction qui teste les palindromes",
      validation: (code) =>
        code.includes("split") &&
        code.includes("reverse") &&
        code.includes("join"),
      timeLimit: 180000,
    },
  ],
  2: [
    {
      description:
        "La Tempête de Glace - Implémentez une pile pour gérer les prises d'escalade",
      validation: (code) =>
        code.includes("class") && code.includes("push") && code.includes("pop"),
      timeLimit: 180000,
    },
    {
      description:
        "Le Sommet des Étoiles - Convertissez les coordonnées en chiffres romains pour déchiffrer la carte",
      validation: (code) =>
        code.includes("function") &&
        code.includes("roman") &&
        code.includes("while"),
      timeLimit: 180000,
    },
    {
      description:
        "La Crête des Vents - Utilisez la recherche binaire pour trouver le chemin le plus court",
      validation: (code) =>
        code.includes("function") &&
        code.includes("binary") &&
        code.includes("while"),
      timeLimit: 180000,
    },
  ],
  3: [
    {
      description:
        "La Pente Inaccessible - Créez une fonction qui calcule la suite de Fibonacci pour trouver le bon chemin d'escalade",
      validation: (code) =>
        code.includes("function") &&
        code.includes("fibonacci") &&
        code.includes("for"),
      timeLimit: 180000,
    },
    {
      description:
        "Le Ravin des Ombres - Implémentez un algorithme de tri à bulles pour organiser les indices de navigation",
      validation: (code) =>
        code.includes("for") && code.includes("if") && code.includes("swap"),
      timeLimit: 180000,
    },
    {
      description:
        "Le Pont Suspendu - Vérifiez si le chemin est sûr en créant une fonction qui teste les palindromes",
      validation: (code) =>
        code.includes("split") &&
        code.includes("reverse") &&
        code.includes("join"),
      timeLimit: 180000,
    },
  ],
  4: [
    {
      description:
        "La Tempête de Glace - Implémentez une pile pour gérer les prises d'escalade",
      validation: (code) =>
        code.includes("class") && code.includes("push") && code.includes("pop"),
      timeLimit: 180000,
    },
    {
      description:
        "Le Sommet des Étoiles - Convertissez les coordonnées en chiffres romains pour déchiffrer la carte",
      validation: (code) =>
        code.includes("function") &&
        code.includes("roman") &&
        code.includes("while"),
      timeLimit: 180000,
    },
    {
      description:
        "La Crête des Vents - Utilisez la recherche binaire pour trouver le chemin le plus court",
      validation: (code) =>
        code.includes("function") &&
        code.includes("binary") &&
        code.includes("while"),
      timeLimit: 180000,
    },
  ],
};
