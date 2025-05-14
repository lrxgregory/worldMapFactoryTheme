// Récupère l'élément SVG
const worldMap = document.getElementById('worldMap');
const paths = worldMap.getElementsByTagName('path');
const oceanColorPicker = document.getElementById('oceanColorPicker');
const selectedColorPicker = document.getElementById('selectedColorPicker');
const unfilledColorPicker = document.getElementById('unfilledColorPicker');
const borderColorPicker = document.getElementById('borderColorPicker');
const countryFlagList = document.getElementById('countryFlagList');
const countryLi = countryFlagList.querySelectorAll('.country');
const defs = document.getElementById('pattern-defs');
const flagBaseUrl = 'https://flagcdn.com/w320';
const flagModeCheckbox = document.querySelector('#flagBackgroundToggle');
const unfilledFlagToggle = document.querySelector('#unfilledFlagToggle');
let selectedCountries = 0;

let isoCode;

// Ajoute un gestionnaire d'événements au survol de la carte
worldMap.addEventListener('mouseover', function (event) {
  // Vérifie si l'élément survolé est un <path> et s'il n'est pas déjà sélectionné
  if (event.target.tagName === 'path' && !event.target.classList.contains('selected')) {
    // Ajoute la classe "highlighted" au survol du pays
    event.target.classList.add('highlighted');
  }
});

// Supprime la surbrillance lorsque la souris quitte la carte
worldMap.addEventListener('mouseout', function (event) {
  // Vérifie si l'élément survolé est un <path> et s'il n'est pas déjà sélectionné
  if (event.target.tagName === 'path' && !event.target.classList.contains('selected')) {
    // Supprime la classe "highlighted" lorsque la souris quitte le pays
    event.target.classList.remove('highlighted');
  }
});

// Ajoute un gestionnaire d'événements au clic sur la carte
worldMap.addEventListener('click', function (event) {
  // Vérifier si le mode drapeau est activé
  const isFlagModeEnabled = flagModeCheckbox && flagModeCheckbox.checked;
  let selectedColor = selectedColorPicker.value;

  if (event.target.tagName === 'path') {
    const path = event.target;
    const isoCode = path.id;
    const isSelected = path.classList.contains('selected');

    // Vérifier si le chemin a un code de pays
    if (!path.dataset.countryCode) {
      console.warn('Path clicked has no country code:', path);
      return;
    }

    if (isFlagModeEnabled) {
      // En mode drapeau : appliquer le drapeau lorsqu'on clique sur un pays
      const countryCode = path.dataset.countryCode.toLowerCase();

      // Vérifier si un drapeau existe déjà pour ce pays
      const existingFlag = document.querySelector(`#flag-img-${countryCode}`);

      if (existingFlag) {
        // Si le drapeau existe déjà, le supprimer (basculer)
        resetFill(path);
        selectedCountries--;
      } else {
        // Sinon, appliquer le drapeau
        const flagUrl = `${flagBaseUrl}/${countryCode}.png`;
        fillWithFlag(path, flagUrl);
        selectedCountries++;
      }

      updateSelectedCountries();
    } else {
      // Mode de sélection de couleur normal
      if (isSelected) {
        let actualColor = path.getAttribute('data-selected-color');
        if (actualColor === selectedColor) {
          // Logique de désélection
          path.classList.remove('selected');
          path.style.fill = unfilledColorPicker.value;

          let countryElement = document.querySelector(`div[data-iso="${isoCode.toLowerCase()}"]`);
          if (countryElement) {
            countryElement.querySelector('input[type="checkbox"]').checked = false;
            countryElement.classList.remove('bg-blue-50', 'border-blue-200');
          }

          selectedCountries--;
          updateSelectedCountries();
        } else {
          // Changer la couleur
          path.setAttribute('data-selected-color', selectedColor);
          path.style.fill = selectedColor;
        }
      } else {
        // Logique de sélection
        path.classList.add('selected');
        path.style.fill = selectedColor;
        path.setAttribute('data-selected-color', selectedColor);
        path.classList.remove('highlighted');

        let countryElement = document.querySelector(`div[data-iso="${isoCode.toLowerCase()}"]`);
        if (countryElement) {
          countryElement.querySelector('input[type="checkbox"]').checked = true;
          countryElement.classList.add('bg-blue-50', 'border-blue-200');
        }

        selectedCountries++;
        updateSelectedCountries();
      }
    }
  } else if (event.target.tagName === 'image' && event.target.id.startsWith('flag-img-')) {
    // Gestion des clics sur les images de drapeau
    const flagId = event.target.id;
    const countryCode = flagId.replace('flag-img-', '');
    const associatedPath = document.querySelector(`path[data-country-code="${countryCode.toUpperCase()}"]`);
    if (associatedPath) {
      resetFill(associatedPath);
      selectedCountries--;
      updateSelectedCountries();
    }
  }
});

// Mettre à jour le gestionnaire d'événements pour la case à cocher du mode drapeau
if (unfilledFlagToggle) {
  unfilledFlagToggle.addEventListener('change', function () {
    if (!this.checked) {
      // Si le mode drapeau est désactivé, supprimer tous les drapeaux
      const flagImages = document.querySelectorAll('image[id^="flag-img-"]');
      flagImages.forEach((image) => {
        const countryCode = image.id.replace('flag-img-', '');
        const associatedPath = document.querySelector(`path[data-country-code="${countryCode.toUpperCase()}"]`);
        if (associatedPath) {
          resetFill(associatedPath);
        }
      });
    }
  });
}

oceanColorPicker.addEventListener('change', function () {
  let oceanColor = oceanColorPicker.value;
  document.documentElement.style.setProperty('--ocean-color', oceanColor);
  worldMap.style.backgroundColor = oceanColor;
});

selectedColorPicker.addEventListener('change', function () {
  let selectedColor = selectedColorPicker.value;
  document.documentElement.style.setProperty('--selected-color', selectedColor);
  const selectedElements = document.querySelectorAll('.selected');
  selectedElements.forEach(function (element) {
    let actualColor = element.getAttribute('data-selected-color');
    element.style.fill = actualColor; // Nouvelle couleur de remplissage
  });
});

unfilledColorPicker.addEventListener('change', function () {
  let unfilledColor = unfilledColorPicker.value;
  const nonSelectedElements = document.querySelectorAll('#worldMap path:not(.selected)');
  nonSelectedElements.forEach(function (element) {
    element.style.fill = unfilledColor; // Nouvelle couleur de remplissage
  });

  document.documentElement.style.setProperty('--non-selected-color', unfilledColor);
});

borderColorPicker.addEventListener('change', function () {
  let borderColor = borderColorPicker.value;
  document.documentElement.style.setProperty('--border-color', borderColor);
});

countryLi.forEach(function (li) {
  li.addEventListener('click', function (event) {
    event.preventDefault(); // Annule le comportement par défaut de l'événement
    let isChecked = li.classList.contains('opacity-50');
    if (isChecked) {
      li.classList.remove('opacity-50');
      selectedCountries--;
    } else {
      li.classList.add('opacity-50');
      selectedCountries++;
    }
    const input = this.querySelector('input[type="checkbox"]');
    if (input) {
      const value = input.value;
      changeColor(value);
      updateSelectedCountries();
    }
  });
});

function changeColor(countryCode) {
  let selectedColor = selectedColorPicker.value;
  let countryPath = document.getElementById(countryCode);
  let isSelected = countryPath.classList.contains('selected');

  if (isSelected) {
    let actualColor = countryPath.getAttribute('data-selected-color');
    if (actualColor === selectedColor) {
      countryPath.classList.remove('selected');
      countryPath.style.fill = unfilledColorPicker.value;
    } else {
      countryPath.setAttribute('data-selected-color', selectedColor);
      countryPath.style.fill = selectedColor;
    }
  } else {
    countryPath.classList.add('selected');
    countryPath.style.removeProperty('fill');
    countryPath.setAttribute('data-selected-color', selectedColor);
    countryPath.classList.remove('highlighted');
  }
}

// Filtre de recherche des pays
document.addEventListener('DOMContentLoaded', function () {
  var filterInput = document.getElementById('countryFilter');
  var countries = document.querySelectorAll('#countryFlagList .country');

  filterInput.addEventListener('input', function () {
    var filterValue = this.value.toLowerCase();
    countries.forEach(function (country) {
      var countryName = country.textContent.toLowerCase();
      if (countryName.includes(filterValue)) {
        country.style.display = 'flex';
      } else {
        country.style.display = 'none';
      }
    });
  });
});

function updateSelectedCountries() {
  // Mettre à jour l'affichage en fonction de selectedCountries
  if (selectedCountries > 0) {
    document.getElementById('unselectAll').classList.remove('hidden');
    document.getElementById('unselectAll').classList.add('flex');
    document.getElementById('searchCountryFilter').classList.add('mt-2');
  } else {
    document.getElementById('unselectAll').classList.add('hidden');
    document.getElementById('unselectAll').classList.remove('flex');
    document.getElementById('searchCountryFilter').classList.remove('mt-2');
  }
}

document.getElementById('unselectAll').addEventListener('click', function () {
  const checkboxes = document.querySelectorAll('#countryFlagList .country input[type="checkbox"]');
  checkboxes.forEach(function (checkbox) {
    checkbox.checked = false;
  });
  countryLi.forEach(function (li) {
    li.classList.remove('opacity-50');
  });
  selectedCountries = 0;
  updateSelectedCountries();
  resetAll();
});

// Function to setup color picker functionality
function setupColorPicker(prefix) {
  const picker = document.getElementById(`${prefix}ColorPicker`);
  const box = document.getElementById(`${prefix}ColorBox`);
  const text = document.getElementById(`${prefix}ColorText`);

  picker.addEventListener('input', (e) => {
    const color = e.target.value;
    box.style.backgroundColor = color;
    text.value = color.toUpperCase();
    picker.value = color;

    // Mise à jour des couleurs dans le SVG
    switch (prefix) {
      case 'ocean':
        document.documentElement.style.setProperty('--ocean-color', color);
        worldMap.style.backgroundColor = color;
        break;
      case 'selected':
        document.documentElement.style.setProperty('--selected-color', color);
        const selectedElements = document.querySelectorAll('.selected');
        selectedElements.forEach(function (element) {
          let actualColor = element.getAttribute('data-selected-color');
          element.style.fill = actualColor;
        });
        break;
      case 'unfilled':
        document.documentElement.style.setProperty('--non-selected-color', color);
        const nonSelectedElements = document.querySelectorAll('#worldMap path:not(.selected)');
        nonSelectedElements.forEach(function (element) {
          element.style.fill = color;
        });
        break;
      case 'border':
        document.documentElement.style.setProperty('--border-color', color);
        break;
    }
  });

  text.addEventListener('change', (e) => {
    const color = e.target.value;
    if (isValidColor(color)) {
      box.style.backgroundColor = color;
      picker.value = color;
      text.value = color.toUpperCase();

      // Mise à jour des couleurs dans le SVG
      switch (prefix) {
        case 'ocean':
          document.documentElement.style.setProperty('--ocean-color', color);
          worldMap.style.backgroundColor = color;
          break;
        case 'selected':
          document.documentElement.style.setProperty('--selected-color', color);
          const selectedElements = document.querySelectorAll('.selected');
          selectedElements.forEach(function (element) {
            let actualColor = element.getAttribute('data-selected-color');
            element.style.fill = actualColor;
          });
          break;
        case 'unfilled':
          document.documentElement.style.setProperty('--non-selected-color', color);
          const nonSelectedElements = document.querySelectorAll('#worldMap path:not(.selected)');
          nonSelectedElements.forEach(function (element) {
            element.style.fill = color;
          });
          break;
        case 'border':
          document.documentElement.style.setProperty('--border-color', color);
          break;
      }
    }
  });
}

function isValidColor(color) {
  const s = new Option().style;
  s.color = color;
  return s.color !== '';
}

function resetAll() {
  for (let i = 0; i < paths.length; i++) {
    paths[i].style.fill = unfilledColorPicker.value;
    paths[i].classList.remove('selected');
    paths[i].removeAttribute('data-selected-color');
  }
}

// Setup each color picker
setupColorPicker('ocean');
setupColorPicker('unfilled');
setupColorPicker('selected');
setupColorPicker('border');

document.querySelector('#unfilledFlagToggle').addEventListener('click', function () {
  const checkbox = this;
  const unselectedCountries = document.querySelectorAll('path[data-country-code]:not(.selected)');

  if (checkbox.checked) {
    // Apply flags to unselected countries
    unselectedCountries.forEach((path) => {
      const countryCode = path.dataset.countryCode.toLowerCase();
      const flagUrl = `${flagBaseUrl}/${countryCode}.png`;
      fillWithFlag(path, flagUrl);
    });
  } else {
    // Reset flags for countries that were just flagged
    unselectedCountries.forEach((path) => {
      if (path.classList.contains('flag')) {
        resetFill(path);
      }
    });
  }
});

function fillWithFlag(path, flagUrl) {
  // Vérifier si le chemin existe
  if (!path) {
    console.error('Path is undefined or null');
    return;
  }

  const countryCode = path.dataset.countryCode.toLowerCase();
  if (!countryCode) {
    console.error('Country code is missing for path:', path);
    return;
  }

  const imageId = `flag-img-${countryCode}`;
  const clipId = `flag-clip-${countryCode}`;
  const svg = document.querySelector('#worldMap');

  // S'assurer que defs existe
  let defs = document.getElementById('pattern-defs');
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.id = 'pattern-defs';
    svg.appendChild(defs);
  }

  // Supprimer TOUS les éléments de drapeau existants pour ce pays
  const existingImages = document.querySelectorAll(`image[id^="flag-img-${countryCode}"]`);
  const existingClips = document.querySelectorAll(`clipPath[id^="flag-clip-${countryCode}"]`);

  existingImages.forEach((img) => img.remove());
  existingClips.forEach((clip) => clip.remove());

  // Marquer tous les chemins avec ce code de pays comme sélectionnés
  const allCountryPaths = document.querySelectorAll(`path[data-country-code="${path.dataset.countryCode}"]`);

  // Obtenir la boîte englobante pour positionner le drapeau
  // Utiliser la boîte englobante du chemin cliqué spécifique
  const bbox = path.getBBox();

  // Créer un chemin de découpage
  const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
  clipPath.setAttribute('id', clipId);

  // Au lieu de cloner, nous utilisons le chemin d'origine comme référence
  const useElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  useElement.setAttribute('href', `#${path.id}`);
  clipPath.appendChild(useElement);
  defs.appendChild(clipPath);

  // Créer l'image
  const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
  image.setAttribute('id', imageId);
  image.setAttribute('href', flagUrl);
  image.setAttribute('x', bbox.x);
  image.setAttribute('y', bbox.y);
  image.setAttribute('width', bbox.width);
  image.setAttribute('height', bbox.height);
  image.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  image.setAttribute('clip-path', `url(#${clipId})`);
  image.setAttribute('data-country-code', countryCode.toUpperCase());

  // Ajouter l'image au SVG
  svg.appendChild(image);

  // Mettre à jour tous les chemins associés à ce pays
  allCountryPaths.forEach((countryPath) => {
    // Préserver la couleur sélectionnée si elle existe
    const selectedColor = countryPath.getAttribute('data-selected-color');

    // Rendre le chemin semi-transparent pour le drapeau
    countryPath.style.opacity = '0.15'; // Rendre semi-transparent
    countryPath.style.stroke = borderColorPicker.value; // Maintenir la bordure

    // Marquer comme ayant un drapeau
    countryPath.classList.add('flag');
    // countryPath.classList.add('selected');

    // Si une couleur était sélectionnée, la stocker
    if (selectedColor) {
      countryPath.setAttribute('data-selected-color', selectedColor);
    }
  });

  return image; // Renvoie l'image créée
}

// Fonction améliorée pour réinitialiser le remplissage
function resetFill(path) {
  if (!path || !path.dataset || !path.dataset.countryCode) {
    console.error('Invalid path or missing country code:', path);
    return;
  }

  const countryCode = path.dataset.countryCode.toLowerCase();

  // Supprimer TOUS les éléments de drapeau pour ce pays
  const existingImages = document.querySelectorAll(`image[id^="flag-img-${countryCode}"]`);
  const existingClips = document.querySelectorAll(`clipPath[id^="flag-clip-${countryCode}"]`);

  existingImages.forEach((img) => img.remove());
  existingClips.forEach((clip) => clip.remove());

  // Mettre à jour tous les chemins associés à ce pays
  const allCountryPaths = document.querySelectorAll(`path[data-country-code="${path.dataset.countryCode}"]`);

  allCountryPaths.forEach((countryPath) => {
    // Restaurer la couleur d'origine si elle existe
    const originalColor = countryPath.getAttribute('data-selected-color');

    countryPath.style.opacity = '1'; // Restaurer l'opacité complète

    if (originalColor) {
      countryPath.style.fill = originalColor;
      countryPath.classList.add('selected');
    } else {
      countryPath.style.fill = unfilledColorPicker.value;
      countryPath.classList.remove('selected');
    }

    countryPath.classList.remove('flag');
  });
}

document.querySelector('#unfilledFlagToggle').addEventListener('change', function () {
  const unfilledColorSection = document.getElementById('unfilledCountries');
  unfilledColorSection.classList.toggle('hidden', this.checked);
});

document.querySelector('#flagBackgroundToggle').addEventListener('change', function () {
  const selectedColorSection = document.getElementById('selectedCountries');
  selectedColorSection.classList.toggle('hidden', this.checked);
});
