// Récupère l'élément SVG
const worldMap = document.getElementById("worldMap");
const paths = worldMap.getElementsByTagName("path");
const oceanColorPicker = document.getElementById("oceanColorPicker");
const selectedColorPicker = document.getElementById("selectedColorPicker");
const unfilledColorPicker = document.getElementById("unfilledColorPicker");
const borderColorPicker = document.getElementById("borderColorPicker");
const countryFlagList = document.getElementById("countryFlagList");
const countryLi = countryFlagList.querySelectorAll(".country");
let selectedCountries = 0;

let isoCode;

// Ajoute un gestionnaire d'événements au survol de la carte
worldMap.addEventListener("mouseover", function (event) {
  // Vérifie si l'élément survolé est un <path> et s'il n'est pas déjà sélectionné
  if (
    event.target.tagName === "path" &&
    !event.target.classList.contains("selected")
  ) {
    // Ajoute la classe "highlighted" au survol du pays
    event.target.classList.add("highlighted");
  }
});

// Supprime la surbrillance lorsque la souris quitte la carte
worldMap.addEventListener("mouseout", function (event) {
  // Vérifie si l'élément survolé est un <path> et s'il n'est pas déjà sélectionné
  if (
    event.target.tagName === "path" &&
    !event.target.classList.contains("selected")
  ) {
    // Supprime la classe "highlighted" lorsque la souris quitte le pays
    event.target.classList.remove("highlighted");
  }
});

// Ajoute un gestionnaire d'événements au clic sur la carte
worldMap.addEventListener("click", function (event) {
  let selectedColor = selectedColorPicker.value;

  if (event.target.tagName === "path") {
    isoCode = event.target.id;
    let isSelected = event.target.classList.contains("selected");

    if (isSelected) {
      let actualColor = event.target.getAttribute("data-selected-color");
      if (actualColor === selectedColor) {
        // Désélection
        event.target.classList.remove("selected");
        event.target.style.fill = unfilledColorPicker.value;
        
        let countryElement = document.querySelector(`div[data-iso="${isoCode.toLowerCase()}"]`);
        if (countryElement) {
          countryElement.querySelector('input[type="checkbox"]').checked = false;
          countryElement.classList.remove("bg-blue-50", "border-blue-200");
        }
        
        selectedCountries--;
        updateSelectedCountries();
      } else {
        // Changement de couleur seulement
        event.target.setAttribute("data-selected-color", selectedColor);
        event.target.style.fill = selectedColor;
        selectedCountries++;
        updateSelectedCountries();
      }
    } else {
      // Sélection
      event.target.classList.add("selected");
      event.target.style.removeProperty("fill");
      event.target.setAttribute("data-selected-color", selectedColor);
      event.target.classList.remove("highlighted");

      let countryElement = document.querySelector(`div[data-iso="${isoCode.toLowerCase()}"]`);
      if (countryElement) {
        countryElement.querySelector('input[type="checkbox"]').checked = true;
        countryElement.classList.add("bg-blue-50", "border-blue-200");
      }
      
      selectedCountries++;
      updateSelectedCountries();
    }
  }
});

oceanColorPicker.addEventListener("change", function () {
  let oceanColor = oceanColorPicker.value;
  document.documentElement.style.setProperty("--ocean-color", oceanColor);
  worldMap.style.backgroundColor = oceanColor;
});

selectedColorPicker.addEventListener("change", function () {
  let selectedColor = selectedColorPicker.value;
  document.documentElement.style.setProperty("--selected-color", selectedColor);
  const selectedElements = document.querySelectorAll(".selected");
  selectedElements.forEach(function (element) {
    let actualColor = element.getAttribute("data-selected-color");
    element.style.fill = actualColor; // Nouvelle couleur de remplissage
  });
});

unfilledColorPicker.addEventListener("change", function () {
  let unfilledColor = unfilledColorPicker.value;
  const nonSelectedElements = document.querySelectorAll(
    "#worldMap path:not(.selected)"
  );
  nonSelectedElements.forEach(function (element) {
    element.style.fill = unfilledColor; // Nouvelle couleur de remplissage
  });

  document.documentElement.style.setProperty(
    "--non-selected-color",
    unfilledColor
  );
});

borderColorPicker.addEventListener("change", function () {
  let borderColor = borderColorPicker.value;
  document.documentElement.style.setProperty("--border-color", borderColor);
});

countryLi.forEach(function (li) {
  li.addEventListener("click", function (event) {
    event.preventDefault(); // Annule le comportement par défaut de l'événement
    let isChecked = li.classList.contains("opacity-50");
    if (isChecked) {
      li.classList.remove("opacity-50");
      selectedCountries--;
    } else {
      li.classList.add("opacity-50");
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
  let isSelected = countryPath.classList.contains("selected");

  if (isSelected) {
    let actualColor = countryPath.getAttribute("data-selected-color");
    if (actualColor === selectedColor) {
      countryPath.classList.remove("selected");
      countryPath.style.fill = unfilledColorPicker.value;
    } else {
      countryPath.setAttribute("data-selected-color", selectedColor);
      countryPath.style.fill = selectedColor;
    }
  } else {
    countryPath.classList.add("selected");
    countryPath.style.removeProperty("fill");
    countryPath.setAttribute("data-selected-color", selectedColor);
    countryPath.classList.remove("highlighted");
  }
}

// Filtre de recherche des pays
document.addEventListener("DOMContentLoaded", function () {
  var filterInput = document.getElementById("countryFilter");
  var countries = document.querySelectorAll("#countryFlagList .country");

  filterInput.addEventListener("input", function () {
    var filterValue = this.value.toLowerCase();
    countries.forEach(function (country) {
      var countryName = country.textContent.toLowerCase();
      if (countryName.includes(filterValue)) {
        country.style.display = "flex";
      } else {
        country.style.display = "none";
      }
    });
  });
});

function updateSelectedCountries() {
  // Mettre à jour l'affichage en fonction de selectedCountries
  if (selectedCountries > 0) {
    document.getElementById("unselectAll").classList.remove("hidden");
    document.getElementById("unselectAll").classList.add("flex");
    document.getElementById("searchCountryFilter").classList.add("mt-2");
  } else {
    document.getElementById("unselectAll").classList.add("hidden");
    document.getElementById("unselectAll").classList.remove("flex");
    document.getElementById("searchCountryFilter").classList.remove("mt-2");
  }
}

document.getElementById("unselectAll").addEventListener("click", function () {
  const checkboxes = document.querySelectorAll(
    '#countryFlagList .country input[type="checkbox"]'
  );
  checkboxes.forEach(function (checkbox) {
    checkbox.checked = false;
  });
  countryLi.forEach(function (li) {
    li.classList.remove("opacity-50");
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

  picker.addEventListener("input", (e) => {
    const color = e.target.value;
    box.style.backgroundColor = color;
    text.value = color.toUpperCase();
    picker.value = color;

    // Mise à jour des couleurs dans le SVG
    switch (prefix) {
      case "ocean":
        document.documentElement.style.setProperty("--ocean-color", color);
        worldMap.style.backgroundColor = color;
        break;
      case "selected":
        document.documentElement.style.setProperty("--selected-color", color);
        const selectedElements = document.querySelectorAll(".selected");
        selectedElements.forEach(function (element) {
          let actualColor = element.getAttribute("data-selected-color");
          element.style.fill = actualColor;
        });
        break;
      case "unfilled":
        document.documentElement.style.setProperty(
          "--non-selected-color",
          color
        );
        const nonSelectedElements = document.querySelectorAll(
          "#worldMap path:not(.selected)"
        );
        nonSelectedElements.forEach(function (element) {
          element.style.fill = color;
        });
        break;
      case "border":
        document.documentElement.style.setProperty("--border-color", color);
        break;
    }
  });

  text.addEventListener("change", (e) => {
    const color = e.target.value;
    if (isValidColor(color)) {
      box.style.backgroundColor = color;
      picker.value = color;
      text.value = color.toUpperCase();

      // Mise à jour des couleurs dans le SVG
      switch (prefix) {
        case "ocean":
          document.documentElement.style.setProperty("--ocean-color", color);
          worldMap.style.backgroundColor = color;
          break;
        case "selected":
          document.documentElement.style.setProperty("--selected-color", color);
          const selectedElements = document.querySelectorAll(".selected");
          selectedElements.forEach(function (element) {
            let actualColor = element.getAttribute("data-selected-color");
            element.style.fill = actualColor;
          });
          break;
        case "unfilled":
          document.documentElement.style.setProperty(
            "--non-selected-color",
            color
          );
          const nonSelectedElements = document.querySelectorAll(
            "#worldMap path:not(.selected)"
          );
          nonSelectedElements.forEach(function (element) {
            element.style.fill = color;
          });
          break;
        case "border":
          document.documentElement.style.setProperty("--border-color", color);
          break;
      }
    }
  });
}

function isValidColor(color) {
  const s = new Option().style;
  s.color = color;
  return s.color !== "";
}

function resetAll() {
  for (let i = 0; i < paths.length; i++) {
    paths[i].style.fill = unfilledColorPicker.value;
    paths[i].classList.remove("selected");
    paths[i].removeAttribute("data-selected-color");
  }
}

// Setup each color picker
setupColorPicker("ocean");
setupColorPicker("unfilled");
setupColorPicker("selected");
setupColorPicker("border");
