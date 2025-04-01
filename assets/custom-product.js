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
