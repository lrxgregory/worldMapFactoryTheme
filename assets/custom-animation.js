const mapEffects = {
  init(mapId = 'worldMap') {
    this.map = document.getElementById(mapId);
    this.paths = this.map.querySelectorAll('path');
    this.ocean = this.map.querySelector('.ocean') || this.map;
    this.originalColors = new Map();
    this.originalBgColor = this.ocean.style.backgroundColor || window.getComputedStyle(this.ocean).backgroundColor;
    this.flagBaseUrl = 'https://flagcdn.com/w320';
    this.activeFlags = new Set(); // Pour suivre les drapeaux actifs

    this.ocean.style.transition = 'background-color 1.2s ease-out';
    this.paths.forEach((path) => {
      path.style.transition = 'fill 0.8s ease-out, stroke 0.8s ease-out';
    });

    // Créer ou récupérer l'élément defs pour les drapeaux
    this.setupDefs();

    setTimeout(() => {
      // Animation de l'océan (bleu foncé)
      this.ocean.style.transition = 'background-color 800ms ease-out';
      setTimeout(() => {
        this.ocean.style.backgroundColor = '#091c2a';
      }, 300);

      // Animation des pays (or clair) avec un délai aléatoire
      setTimeout(() => {
        this.paths.forEach((path, i) => {
          setTimeout(() => {
            path.style.fill = '#e1b26a';
          }, Math.random() * 500);
        });
      }, 700);

      setTimeout(() => {
        this.saveOriginalColors();
        setTimeout(() => {
          this.startAnimation();
        }, 200);
      }, 2000);
    }, 500);

    // Sauvegarde du stroke original
    const firstPath = this.paths[0];
    this.originalStroke = {
      color:
        firstPath.style.stroke ||
        firstPath.getAttribute('stroke') ||
        window.getComputedStyle(firstPath).stroke ||
        '#000000',
      width: '0.3px',
    };

    this.isAnimating = false;
    this.saveOriginalColors();

    // Style sheet pour les strokes globaux
    this.styleElement = document.createElement('style');
    document.head.appendChild(this.styleElement);
    this.strokeRuleIndex = -1;
  },

  setupDefs() {
    this.defs = this.map.querySelector('defs');
    if (!this.defs) {
      this.defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      this.defs.id = 'animation-defs';
      this.map.appendChild(this.defs);
    }
  },

  saveOriginalColors() {
    this.paths.forEach((path) => {
      this.originalColors.set(
        path,
        path.style.fill || path.getAttribute('fill') || window.getComputedStyle(path).fill || '#CCCCCC'
      );
    });
  },

  getVibrantColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 80 + Math.floor(Math.random() * 20);
    const lightness = 40 + Math.floor(Math.random() * 30);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  },

  getOceanColor() {
    const hue = 200 + Math.floor(Math.random() * 40);
    const saturation = 70 + Math.floor(Math.random() * 30);
    const lightness = 30 + Math.floor(Math.random() * 20);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  },

  getCountryCodeFromPath(path) {
    // Essayer d'abord avec l'attribut data-country-code
    if (path.dataset && path.dataset.countryCode) {
      return path.dataset.countryCode.toLowerCase();
    }

    // Sinon utiliser l'ID du path (si c'est un code de pays)
    if (path.id && path.id.length === 2) {
      return path.id.toLowerCase();
    }

    // Mapping manuel pour certains pays si nécessaire
    const countryMapping = {
      usa: 'us',
      france: 'fr',
      germany: 'de',
      italy: 'it',
      spain: 'es',
      unitedkingdom: 'gb',
      uk: 'gb',
      russia: 'ru',
      china: 'cn',
      japan: 'jp',
      brazil: 'br',
      canada: 'ca',
      australia: 'au',
      india: 'in',
      // Ajoutez d'autres mappings si nécessaire
    };

    const pathId = path.id.toLowerCase();
    return countryMapping[pathId] || null;
  },

  createCountryFlag(path) {
    if (!path.id) return null;

    const countryCode = this.getCountryCodeFromPath(path);
    if (!countryCode) {
      console.warn(`Impossible de déterminer le code pays pour: ${path.id}`);
      return null;
    }
    const flagUrl = `${this.flagBaseUrl}/${countryCode}.png`;
    const imageId = `flag-anim-${path.id}-${Date.now()}`;
    const clipId = `clip-anim-${path.id}-${Date.now()}`;

    try {
      const bbox = path.getBBox();

      // Créer le chemin de découpage
      const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
      clipPath.setAttribute('id', clipId);

      const useElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');
      useElement.setAttribute('href', `#${path.id}`);
      clipPath.appendChild(useElement);
      this.defs.appendChild(clipPath);

      // Créer l'image du drapeau
      const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      image.setAttribute('id', imageId);
      image.setAttribute('href', flagUrl);
      image.setAttribute('x', bbox.x);
      image.setAttribute('y', bbox.y);
      image.setAttribute('width', bbox.width);
      image.setAttribute('height', bbox.height);
      image.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      image.setAttribute('clip-path', `url(#${clipId})`);
      image.setAttribute('opacity', '0');

      // Animation d'apparition
      image.style.transition = 'opacity 1s ease-in-out';

      this.map.appendChild(image);

      // Faire apparaître le drapeau
      setTimeout(() => {
        image.setAttribute('opacity', '0.8');
      }, 100);

      // Stocker les références pour le nettoyage
      const flagData = {
        image,
        clipPath,
        imageId,
        clipId,
        pathId: path.id,
      };

      this.activeFlags.add(flagData);
      return flagData;
    } catch (error) {
      console.warn('Erreur lors de la création du drapeau:', error);
      return null;
    }
  },

  removeFlag(flagData) {
    if (!flagData) return;

    try {
      // Animation de disparition
      flagData.image.style.transition = 'opacity 0.8s ease-in-out';
      flagData.image.setAttribute('opacity', '0');

      setTimeout(() => {
        // Supprimer les éléments du DOM
        if (flagData.image.parentNode) {
          flagData.image.parentNode.removeChild(flagData.image);
        }
        if (flagData.clipPath.parentNode) {
          flagData.clipPath.parentNode.removeChild(flagData.clipPath);
        }

        // Retirer de la liste active
        this.activeFlags.delete(flagData);
      }, 800);
    } catch (error) {
      console.warn('Erreur lors de la suppression du drapeau:', error);
    }
  },

  updateGlobalStroke(color) {
    if (this.strokeRuleIndex !== -1) {
      this.styleElement.sheet.deleteRule(this.strokeRuleIndex);
    }

    const rule = `#worldMap path { 
          stroke: ${color} !important; 
          stroke-width: ${this.originalStroke.width} !important;
          transition: stroke 4s ease-in-out;
        }`;
    this.strokeRuleIndex = this.styleElement.sheet.insertRule(rule, 0);
  },

  startAnimation() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    // Animation des remplissages (couleurs vives)
    const animateFills = () => {
      this.paths.forEach((path) => {
        if (Math.random() < 0.2) {
          path.style.transition = `fill ${2 + Math.random() * 2}s ease-in-out`;
          path.style.fill = this.getVibrantColor();

          setTimeout(() => {
            path.style.fill = this.originalColors.get(path);
          }, 2000 + Math.random() * 3000);
        }
      });

      if (this.isAnimating) {
        setTimeout(animateFills, 2000);
      }
    };

    // Animation des drapeaux des vrais pays
    const animateFlags = () => {
      // Créer de nouveaux drapeaux pour les vrais pays
      this.paths.forEach((path) => {
        if (Math.random() < 0.15) {
          // 15% de chance par path
          const flagData = this.createCountryFlag(path);

          if (flagData) {
            // Programmer la suppression du drapeau
            const duration = 3000 + Math.random() * 4000; // 3-7 secondes
            setTimeout(() => {
              this.removeFlag(flagData);
            }, duration);
          }
        }
      });

      if (this.isAnimating) {
        setTimeout(animateFlags, 2500 + Math.random() * 2000); // 2.5-4.5 secondes
      }
    };

    // Animation du stroke global
    const animateGlobalStroke = () => {
      const hue = Math.floor(Math.random() * 360);
      const strokeColor = `hsl(${hue}, 90%, 50%)`;

      this.updateGlobalStroke(strokeColor);

      const totalStrokeDuration = 8000 + Math.random() * 4000;
      setTimeout(() => {
        this.updateGlobalStroke(this.originalStroke.color);
      }, totalStrokeDuration);

      if (this.isAnimating) {
        setTimeout(animateGlobalStroke, totalStrokeDuration + 3000);
      }
    };

    // Animation du fond
    const animateBackground = () => {
      const oceanColor = this.getOceanColor();
      this.ocean.style.transition = `background-color 6s ease-in-out`;
      this.ocean.style.backgroundColor = oceanColor;

      const totalBgDuration = 12000 + Math.random() * 6000;
      setTimeout(() => {
        this.ocean.style.backgroundColor = this.originalBgColor;
      }, totalBgDuration);

      if (this.isAnimating) {
        setTimeout(animateBackground, totalBgDuration + 3000);
      }
    };

    // Démarrer toutes les animations
    animateFills();
    animateFlags();
    animateGlobalStroke();
    animateBackground();
  },

  stopAnimation() {
    this.isAnimating = false;
    this.resetColors();
    this.clearAllFlags();
  },

  clearAllFlags() {
    // Supprimer tous les drapeaux actifs
    this.activeFlags.forEach((flagData) => {
      this.removeFlag(flagData);
    });
    this.activeFlags.clear();
  },

  resetColors() {
    this.paths.forEach((path) => {
      path.style.transition = 'fill 2s ease-in-out';
      path.style.fill = this.originalColors.get(path);
    });

    this.updateGlobalStroke(this.originalStroke.color);
    this.ocean.style.transition = 'background-color 3s ease-in-out';
    this.ocean.style.backgroundColor = this.originalBgColor;

    // Nettoyer les drapeaux après un délai
    setTimeout(() => {
      this.clearAllFlags();
    }, 2000);
  },
};

document.addEventListener('DOMContentLoaded', () => {
  mapEffects.init();
});
