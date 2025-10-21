document.addEventListener("DOMContentLoaded", function () {

  function initDropdowns() {
    const dropdowns = document.querySelectorAll(".custom_dropdown");

    if (!dropdowns.length) {
      console.log("⏳ Waiting for CMS items...");
      setTimeout(initDropdowns, 600);
      return;
    }

    console.log("✅ Dropdown system ready:", dropdowns.length);

    dropdowns.forEach(dropdown => {
      const toggle = dropdown.querySelector(":scope > .custom_dropdown_toggle");
      const closeIconWrap = dropdown.querySelector(":scope > .custom_dropdown_toggle > .custom_dropdown_close");
      const menu = dropdown.querySelector(":scope > .custom_dropdown_navigation");
      const icon = dropdown.querySelector(":scope > .custom_dropdown_toggle > .custom_dropdown_close_icon");

      if (!toggle || !closeIconWrap || !menu) return;

      // Initial setup
      menu.style.maxHeight = "0";
      menu.style.overflow = "hidden";
      menu.style.transition = "max-height 0.3s ease";
      if (icon) icon.style.transition = "transform 0.3s ease";

      // --- Open / Close Current Dropdown ---
      toggle.addEventListener("click", e => {
        // ignore clicks on <a> inside toggle
        if (e.target.closest("a")) return;
        e.stopPropagation();

        const isOpen = dropdown.classList.contains("open");

        if (isOpen) {
          closeDropdown(dropdown, menu, icon);
        } else {
          openDropdown(dropdown, menu, icon);
        }

        // Recalculate all parent heights when a child opens
        updateParentHeights(dropdown);
      });

      // --- Close via Chevron ---
      closeIconWrap.addEventListener("click", e => {
        e.stopPropagation();
        closeDropdown(dropdown, menu, icon);
        updateParentHeights(dropdown);
      });
    });
  }

  // Helper: open dropdown
  function openDropdown(dropdown, menu, icon) {
    dropdown.classList.add("open");
    menu.style.maxHeight = menu.scrollHeight + "px";
    if (icon) icon.style.transform = "rotate(-90deg)";
  }

  // Helper: close dropdown
  function closeDropdown(dropdown, menu, icon) {
    dropdown.classList.remove("open");
    menu.style.maxHeight = "0";
    if (icon) icon.style.transform = "rotate(0deg)";
  }

  // Helper: expand parent containers to fit visible submenus
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

  // Re-init after Finsweet loads
  document.addEventListener("fs-cmsload", initDropdowns);
  // Fallback delay
  setTimeout(initDropdowns, 1200);
});
