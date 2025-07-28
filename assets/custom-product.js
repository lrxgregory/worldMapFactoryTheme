const chevronUp = `<svg
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  stroke-width="1.5"
  stroke="currentColor"
  class="size-6"
>
  <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
</svg>`;

const chevronDown = `<svg
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
  stroke-width="1.5"
  stroke="currentColor"
  class="size-6"
>
  <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
</svg>`;
function toggleDropdown(contentId, iconId, searchId = null) {
  const content = document.getElementById(contentId);
  const icon = document.getElementById(iconId);
  const search = searchId ? document.getElementById(searchId) : null;

  // Désactiver le dropdown sur la description en desktop
  if (window.getComputedStyle(icon).display === "none") {
    return;
  }

  if (icon.style.display !== "none") {
    content.classList.toggle("hidden");
  }

  if (search) {
    search.classList.toggle("hidden");
  }
  icon.innerHTML = content.classList.contains("hidden")
    ? chevronDown
    : chevronUp;

  if (contentId === "country-settings-content") {
    if (content.classList.contains("hidden")) {
      document.getElementById("countryFlagList").classList.remove("mb-4");
    } else {
      document.getElementById("countryFlagList").classList.add("mb-4");
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {  
  // Variable pour éviter les boucles infinies
  let isUpdating = false;
  
  // Fonction pour sélectionner la première taille disponible
  function selectFirstAvailableSize() {
    // Si déjà en cours de mise à jour, ignorer
    if (isUpdating) return;
    
    try {
      isUpdating = true;

      // Récupérer toutes les options de taille
      const sizeRadios = document.querySelectorAll('.product-form__input--pill input[name^="Taille"]');
      
      if (sizeRadios.length === 0) {
        return;
      }
      
      // Trouver la première taille qui n'est pas désactivée
      let firstAvailable = null;
      for (const sizeRadio of sizeRadios) {
        if (!sizeRadio.classList.contains('disabled')) {
          firstAvailable = sizeRadio;
          break;
        }
      }
      
      if (firstAvailable) {
        // Utiliser un délai avant de sélectionner la taille
        setTimeout(() => {
          firstAvailable.checked = true;
          
          // Déclencher un événement change
          const event = new Event('change', { bubbles: true });
          firstAvailable.dispatchEvent(event);
        }, 100);
      }
    } catch (error) {
      console.error('Error during size selection:', error);
    } finally {
      // Réinitialiser le drapeau après un délai
      setTimeout(() => {
        isUpdating = false;
      }, 1000);
    }
  }
  
  // Surveiller les clics sur les inputs de type ou leurs labels
  document.body.addEventListener('click', function(event) {
    // Si on clique sur un label de type
    const typeLabel = event.target.closest('.product-form__input--pill [name^="Type"] + label');
    if (typeLabel) {
      console.log('Clic sur label de type détecté:', typeLabel.textContent.trim());
      setTimeout(selectFirstAvailableSize, 300);
      return;
    }
    
    // Si on clique sur un input de type
    const typeInput = event.target.closest('.product-form__input--pill [name^="Type"]');
    if (typeInput) {
      console.log('Clic sur input de type détecté:', typeInput.value);
      setTimeout(selectFirstAvailableSize, 300);
    }
  });
  
  // Ajouter des écouteurs d'événements aux inputs de type
  const typeRadios = document.querySelectorAll('.product-form__input--pill [name^="Type"]');
  typeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      console.log('Changement de type détecté:', this.value);
      setTimeout(selectFirstAvailableSize, 300);
    });
  });
});