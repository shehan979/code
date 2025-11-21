document.addEventListener("DOMContentLoaded", function () {
  console.log("Dropdown system initialized");

  const dropdownToggles = document.querySelectorAll(".custom_dropdown_toggle");

  // === Toggle open/close on click ===
  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const dropdown = toggle.closest(".custom_dropdown");
      const nav = dropdown.querySelector(".custom_dropdown_navigation");
      const icon = toggle.querySelector(".custom_dropdown_close_icon");

      const isOpen = dropdown.classList.contains("open");

      if (isOpen) {
        dropdown.classList.remove("open");
        nav.style.display = "none";
        icon.style.transform = "rotate(90deg)";
      } else {
        dropdown.classList.add("open");
        nav.style.display = "block";
        icon.style.transform = "rotate(0deg)";
      }
    });
  });

  // === Auto open based on current slug ===
  const currentPath = window.location.pathname.split("/").pop();
  if (!currentPath) return;

  const currentLink = Array.from(document.querySelectorAll("[page_slug]"))
    .find((link) => link.getAttribute("page_slug") === currentPath);

  if (currentLink) {
    console.log("✅ Found current link:", currentPath);

    // Highlight current link
    currentLink.classList.add("active");
    currentLink.style.color = "#007BFF";
    currentLink.style.fontWeight = "600";

    // Traverse up through parent dropdowns
    let parentDropdown = currentLink.closest(".custom_dropdown");
    while (parentDropdown) {
      const nav = parentDropdown.querySelector(".custom_dropdown_navigation");
      const icon = parentDropdown.querySelector(".custom_dropdown_close_icon");
      parentDropdown.classList.add("open");
      if (nav) nav.style.display = "block";
      if (icon) icon.style.transform = "rotate(0deg)";
      parentDropdown = parentDropdown.parentElement.closest(".custom_dropdown");
    }
  } else {
    console.warn("⚠️ No matching link for slug:", currentPath);
  }
});