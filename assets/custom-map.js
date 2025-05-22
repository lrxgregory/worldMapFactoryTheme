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
  if (event.target.tagName === 'path' && !event.target.classList.contains('selected')) {
    event.target.classList.add('highlighted');
  }
});

// Supprime la surbrillance lorsque la souris quitte la carte
worldMap.addEventListener('mouseout', function (event) {
  if (event.target.tagName === 'path' && !event.target.classList.contains('selected')) {
    event.target.classList.remove('highlighted');
  }
});

// Ajoute un gestionnaire d'événements au clic sur la carte
worldMap.addEventListener('click', function (event) {
  const isFlagModeEnabled = flagModeCheckbox && flagModeCheckbox.checked;
  let selectedColor = selectedColorPicker.value;

  if (event.target.tagName === 'path') {
    const path = event.target;
    const isoCode = path.id;
    const isSelected = path.classList.contains('selected');

    if (!path.dataset.countryCode) {
      console.warn('Path clicked has no country code:', path);
      return;
    }

    // Trouver l'élément li correspondant dans la liste
    const countryLiElement = document.querySelector(`li.country input[value="${isoCode}"]`)?.closest('li.country');

    if (isFlagModeEnabled) {
      const countryCode = path.dataset.countryCode.toLowerCase();
      const flagUrl = `${flagBaseUrl}/${countryCode}.png`;

      // Utiliser la nouvelle fonction toggle
      const flagAdded = toggleFlag(path, flagUrl, 'selected');

      // Synchroniser avec la liste
      if (countryLiElement) {
        if (flagAdded) {
          countryLiElement.classList.add('opacity-50');
          selectedCountries++;
        } else {
          countryLiElement.classList.remove('opacity-50');
          selectedCountries--;
        }
      }

      updateSelectedCountries();
    } else {
      // Mode de sélection de couleur normal
      if (isSelected) {
        let actualColor = path.getAttribute('data-selected-color');
        if (actualColor === selectedColor) {
          // Logique de désélection
          path.classList.remove('selected');
          path.removeAttribute('data-selected-color');
          path.style.fill = unfilledColorPicker.value;

          // Synchroniser avec la liste
          if (countryLiElement) {
            countryLiElement.classList.remove('opacity-50');
            const checkbox = countryLiElement.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = false;
          }

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

        // Synchroniser avec la liste
        if (countryLiElement) {
          countryLiElement.classList.add('opacity-50');
          const checkbox = countryLiElement.querySelector('input[type="checkbox"]');
          if (checkbox) checkbox.checked = true;
        }

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
      // Trouver l'élément li correspondant et synchroniser
      const countryLiElement = document
        .querySelector(`li.country input[value="${associatedPath.id}"]`)
        ?.closest('li.country');
      if (countryLiElement) {
        countryLiElement.classList.remove('opacity-50');
      }

      resetFill(associatedPath, 'selected');
      selectedCountries--;
      updateSelectedCountries();
    }
  }
});

// Fonction toggle pour les drapeaux (nouvelle fonction améliorée)
function toggleFlag(path, flagUrl, action) {
  if (!path || !path.dataset.countryCode) {
    console.error('Path is undefined or missing country code');
    return false;
  }

  const countryCode = path.dataset.countryCode.toLowerCase();
  const imageId = `flag-img-${countryCode}`;

  // Vérifier si le drapeau existe déjà
  const existingFlag = document.getElementById(imageId);

  if (existingFlag) {
    // Le drapeau existe, le supprimer (mode OFF)
    resetFill(path, action);
    return false; // Indique que le drapeau a été supprimé
  } else {
    // Le drapeau n'existe pas, l'ajouter (mode ON)
    fillWithFlag(path, flagUrl, action);
    return true; // Indique que le drapeau a été ajouté
  }
}

// Fonction pour vérifier si un pays a un drapeau
function hasFlag(path) {
  if (!path || !path.dataset.countryCode) {
    return false;
  }

  const countryCode = path.dataset.countryCode.toLowerCase();
  const imageId = `flag-img-${countryCode}`;
  return document.getElementById(imageId) !== null;
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
    element.style.fill = actualColor;
  });
});

unfilledColorPicker.addEventListener('change', function () {
  let unfilledColor = unfilledColorPicker.value;
  const nonSelectedElements = document.querySelectorAll('#worldMap path:not(.selected)');
  nonSelectedElements.forEach(function (element) {
    element.style.fill = unfilledColor;
  });

  document.documentElement.style.setProperty('--non-selected-color', unfilledColor);
});

borderColorPicker.addEventListener('change', function () {
  let borderColor = borderColorPicker.value;
  document.documentElement.style.setProperty('--border-color', borderColor);
});

countryLi.forEach(function (li) {
  li.addEventListener('click', function (event) {
    event.preventDefault();
    let isChecked = li.classList.contains('opacity-50');
    const input = this.querySelector('input[type="checkbox"]');

    if (input) {
      const value = input.value;
      const path = document.getElementById(value);
      const isFlagModeEnabled = flagModeCheckbox && flagModeCheckbox.checked;

      if (isFlagModeEnabled) {
        // En mode drapeau, utiliser toggleFlag pour gérer automatiquement l'ajout/suppression
        const flagUrl = `${flagBaseUrl}/${value.toLowerCase()}.png`;
        const flagAdded = toggleFlag(path, flagUrl, 'selected');

        // Mettre à jour l'interface en fonction du résultat
        if (flagAdded) {
          // Drapeau ajouté
          li.classList.add('opacity-50');
          selectedCountries++;
        } else {
          // Drapeau supprimé
          li.classList.remove('opacity-50');
          selectedCountries--;
        }
      } else {
        // Mode couleur normal
        if (isChecked) {
          li.classList.remove('opacity-50');
          selectedCountries--;
        } else {
          li.classList.add('opacity-50');
          selectedCountries++;
        }
        changeColor(value);
      }

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

function setupColorPicker(prefix) {
  const picker = document.getElementById(`${prefix}ColorPicker`);
  const box = document.getElementById(`${prefix}ColorBox`);
  const text = document.getElementById(`${prefix}ColorText`);

  picker.addEventListener('input', (e) => {
    const color = e.target.value;
    box.style.backgroundColor = color;
    text.value = color.toUpperCase();
    picker.value = color;

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
  // Supprimer tous les drapeaux
  const allFlagImages = document.querySelectorAll('image[id^="flag-img-"]');
  const allFlagClips = document.querySelectorAll('clipPath[id^="flag-clip-"]');

  allFlagImages.forEach((img) => img.remove());
  allFlagClips.forEach((clip) => clip.remove());

  // Réinitialiser les paths
  for (let i = 0; i < paths.length; i++) {
    paths[i].style.fill = unfilledColorPicker.value;
    paths[i].classList.remove('selected', 'unfilled', 'flag');
    paths[i].removeAttribute('data-selected-color');
  }
}

// Setup each color picker
setupColorPicker('ocean');
setupColorPicker('unfilled');
setupColorPicker('selected');
setupColorPicker('border');

unfilledFlagToggle.addEventListener('change', function () {
  if (!this.checked) {
    const flaggedSelectedCountries = document.querySelectorAll('path[data-country-code]:not(.flag):not(.selected)');

    flaggedSelectedCountries.forEach((path) => {
      resetFill(path, 'unfilled');
    });

    const flagImages = document.querySelectorAll('image[id^="flag-img-"]');
    flagImages.forEach((image) => {
      const countryCode = image.id.replace('flag-img-', '');
      const associatedPath = document.querySelector(`path[data-country-code="${countryCode.toUpperCase()}"]`);

      if (associatedPath && !associatedPath.classList.contains('selected')) {
        resetFill(associatedPath, 'unfilled');
      }
    });
  } else {
    const unselectedCountries = document.querySelectorAll('path[data-country-code]:not(.selected)');

    unselectedCountries.forEach((path) => {
      const countryCode = path.dataset.countryCode.toLowerCase();
      const flagUrl = `${flagBaseUrl}/${countryCode}.png`;
      fillWithFlag(path, flagUrl, 'unfilled');
    });
  }
});

// Fonction fillWithFlag améliorée (maintenant appelée par toggleFlag)
function fillWithFlag(path, flagUrl, action) {
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

  let defs = document.getElementById('pattern-defs');
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.id = 'pattern-defs';
    svg.appendChild(defs);
  }

  // Nettoyer les éléments existants avant d'en créer de nouveaux
  const existingImages = document.querySelectorAll(`image[id^="flag-img-${countryCode}"]`);
  const existingClips = document.querySelectorAll(`clipPath[id^="flag-clip-${countryCode}"]`);

  existingImages.forEach((img) => img.remove());
  existingClips.forEach((clip) => clip.remove());

  const allCountryPaths = document.querySelectorAll(`path[data-country-code="${path.dataset.countryCode}"]`);
  const bbox = path.getBBox();

  // Créer un chemin de découpage
  const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
  clipPath.setAttribute('id', clipId);

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

  svg.appendChild(image);

  // Mettre à jour tous les chemins associés à ce pays
  allCountryPaths.forEach((countryPath) => {
    const selectedColor = countryPath.getAttribute('data-selected-color');

    if (!countryPath.classList.contains(action)) {
      countryPath.classList.add(action);
    }

    if (selectedColor) {
      countryPath.setAttribute('data-selected-color', selectedColor);
    }
  });

  return image;
}

// Fonction améliorée pour réinitialiser le remplissage
function resetFill(path, action) {
  if (!path || !path.dataset || !path.dataset.countryCode) {
    console.error('Invalid path or missing country code:', path);
    return;
  }

  const countryCode = path.dataset.countryCode.toLowerCase();

  // Supprimer tous les éléments de drapeau pour ce pays
  const existingImages = document.querySelectorAll(`image[id^="flag-img-${countryCode}"]`);
  const existingClips = document.querySelectorAll(`clipPath[id^="flag-clip-${countryCode}"]`);

  existingImages.forEach((img) => img.remove());
  existingClips.forEach((clip) => clip.remove());

  // Mettre à jour tous les chemins associés à ce pays
  const allCountryPaths = document.querySelectorAll(`path[data-country-code="${path.dataset.countryCode}"]`);

  if (allCountryPaths.length === 0) {
    console.warn(`No paths found with country code: ${path.dataset.countryCode}`);
  }

  allCountryPaths.forEach((countryPath) => {
    countryPath.style.fill = unfilledColorPicker.value;
    countryPath.classList.remove(action);
  });
}

unfilledFlagToggle.addEventListener('change', function () {
  const unfilledColorSection = document.getElementById('unfilledCountries');
  unfilledColorSection.classList.toggle('hidden', this.checked);
});

document.querySelector('#flagBackgroundToggle').addEventListener('change', function () {
  const selectedColorSection = document.getElementById('selectedCountries');
  selectedColorSection.classList.toggle('hidden', this.checked);
});
