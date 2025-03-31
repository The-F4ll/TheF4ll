import React from 'react';

const PublicPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">The F4ll</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Bienvenue sur The F4ll</h2>
          <p className="text-gray-600 mb-4">
            Découvrez notre jeu interactif qui combine stratégie et divertissement.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Comment jouer</h3>
              <p className="text-gray-600">
                Rejoignez une partie et commencez votre aventure dans The F4ll.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Statistiques</h3>
              <p className="text-gray-600">
                Suivez les performances et les classements des joueurs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicPage; 