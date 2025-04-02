const mapEffects = {
    init(mapId = 'worldMap') {
        this.map = document.getElementById(mapId);
        this.paths = this.map.querySelectorAll('path');
        this.ocean = this.map.querySelector('.ocean') || this.map;
        this.originalColors = new Map();
        this.originalBgColor = this.ocean.style.backgroundColor || window.getComputedStyle(this.ocean).backgroundColor;

        // Sauvegarde du stroke original
        const firstPath = this.paths[0];
        this.originalStroke = {
            color: firstPath.style.stroke || firstPath.getAttribute('stroke') || window.getComputedStyle(firstPath).stroke || '#000000',
            width: '0.3px'
        };

        this.isAnimating = false;
        this.saveOriginalColors();

        // Style sheet pour les strokes globaux
        this.styleElement = document.createElement('style');
        document.head.appendChild(this.styleElement);
        this.strokeRuleIndex = -1;
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
        // Couleurs vives mais pas pastel (saturation élevée, luminosité moyenne)
        const hue = Math.floor(Math.random() * 360);
        const saturation = 80 + Math.floor(Math.random() * 20); // 80-100%
        const lightness = 40 + Math.floor(Math.random() * 30);  // 40-70%
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    },

    getOceanColor() {
        // Couleurs bleues profondes pour l'océan
        const hue = 200 + Math.floor(Math.random() * 40); // Bleus-verts
        const saturation = 70 + Math.floor(Math.random() * 30); // 70-100%
        const lightness = 30 + Math.floor(Math.random() * 20); // 30-50%
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
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

        // Animation du stroke global - couleurs franches
        const animateGlobalStroke = () => {
            const hue = Math.floor(Math.random() * 360);
            // Stroke visible: saturation élevée, luminosité moyenne
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

        // Animation du fond - bleus profonds
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

        animateFills();
        animateGlobalStroke();
        animateBackground();
    },

    stopAnimation() {
        this.isAnimating = false;
        this.resetColors();
    },

    resetColors() {
        this.paths.forEach((path) => {
            path.style.transition = 'fill 2s ease-in-out';
            path.style.fill = this.originalColors.get(path);
        });

        this.updateGlobalStroke(this.originalStroke.color);
        this.ocean.style.transition = 'background-color 3s ease-in-out';
        this.ocean.style.backgroundColor = this.originalBgColor;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    mapEffects.init();
    setTimeout(() => {
        mapEffects.startAnimation();
    }, 1000);
});