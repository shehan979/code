document.addEventListener("DOMContentLoaded", function () {
  console.log("🟡 Initializing custom dropdowns...");

  // Main init function
  function initDropdowns() {
    const dropdowns = document.querySelectorAll(".custom_dropdown");
    console.log("✅ Dropdowns found:", dropdowns.length);

    dropdowns.forEach(dropdown => {
      const toggle = dropdown.querySelector(":scope > .custom_dropdown_toggle");
      const closeBtn = dropdown.querySelector(":scope > .custom_dropdown_toggle > .custom_dropdown_close");
      const menu = dropdown.querySelector(":scope > .custom_dropdown_navigation");
      const icon = dropdown.querySelector(":scope > .custom_dropdown_toggle > .custom_dropdown_close_icon");

      if (!toggle || !closeBtn || !menu) return;

      // --- Initialize all closed ---
      dropdown.classList.remove("open");
      menu.style.maxHeight = "0";
      menu.style.overflow = "hidden";
      menu.style.transition = "max-height 0.3s ease";
      if (icon) {
        icon.style.transition = "transform 0.3s ease";
        icon.style.transform = "rotate(0deg)";
      }

      // --- Toggle dropdown ---
      toggle.addEventListener("click", e => {
        if (e.target.closest("a")) return; // ignore links
        e.stopPropagation();

        const isOpen = dropdown.classList.contains("open");
        if (isOpen) {
          closeDropdown(dropdown, menu, icon);
        } else {
          openDropdown(dropdown, menu, icon);
        }

        updateParentHeights(dropdown);
      });

      // --- Close button ---
      closeBtn.addEventListener("click", e => {
        e.stopPropagation();
        closeDropdown(dropdown, menu, icon);
        updateParentHeights(dropdown);
      });
    });
  }

  // --- Helper: open dropdown ---
  function openDropdown(dropdown, menu, icon) {
    dropdown.classList.add("open");
    menu.style.maxHeight = menu.scrollHeight + "px";
    if (icon) icon.style.transform = "rotate(-90deg)";
  }

  // --- Helper: close dropdown ---
  function closeDropdown(dropdown, menu, icon) {
    dropdown.classList.remove("open");
    menu.style.maxHeight = "0";
    if (icon) icon.style.transform = "rotate(0deg)";
  }

  // --- Helper: expand parent containers to fit visible submenus ---
  function updateParentHeights(childDropdown) {
    let parent = childDropdown.parentElement.closest(".custom_dropdown");
    while (parent) {
      const parentMenu = parent.querySelector(":scope > .custom_dropdown_navigation");
      if (parent.classList.contains("open") && parentMenu) {
        parentMenu.style.maxHeight = parentMenu.scrollHeight + "px";
      }
      parent = parent.parentElement.closest(".custom_dropdown");
    }
  }

  // Run once immediately (initial state all closed)
  initDropdowns();

  // Run again after CMS finishes loading (simple delay)
  setTimeout(initDropdowns, 1500);
});