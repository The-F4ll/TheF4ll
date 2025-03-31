class PlayerService {
  constructor() {
    this.player = null;
  }

  initializePlayer(name) {
    if (!name) {
      throw new Error('Le nom du joueur est requis');
    }

    const player = {
      id: 'player_' + Math.random().toString(36).substr(2, 9),
      name: name.trim()
    };

    console.log('Initialisation du joueur:', player);
    this.player = player;
    this.saveToLocalStorage();
    return player;
  }

  getPlayer() {
    if (this.player) {
      return this.player;
    }
    return this.loadFromLocalStorage();
  }

  saveToLocalStorage() {
    try {
      if (!this.player) return;
      
      localStorage.setItem('player', JSON.stringify(this.player));
      console.log('Sauvegarde du joueur dans le localStorage:', this.player);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du joueur:', error);
    }
  }

  loadFromLocalStorage() {
    try {
      const rawData = localStorage.getItem('player');
      console.log('Données brutes du localStorage:', rawData);
      
      if (!rawData) {
        return null;
      }

      this.player = JSON.parse(rawData);
      console.log('Joueur chargé depuis le localStorage:', this.player);
      return this.player;
    } catch (error) {
      console.error('Erreur lors du chargement du joueur:', error);
      return null;
    }
  }

  clearPlayer() {
    try {
      localStorage.removeItem('player');
      this.player = null;
      console.log('Joueur supprimé du localStorage');
    } catch (error) {
      console.error('Erreur lors de la suppression du joueur:', error);
    }
  }
}

export const playerService = new PlayerService(); 