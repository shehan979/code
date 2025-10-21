document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 Multi-level dropdown system initialized");

  // Initialize dropdown
  function initDropdown(levelClass) {
    const dropdowns = document.querySelectorAll(levelClass);

    dropdowns.forEach(dropdown => {
      const toggle = dropdown.querySelector(":scope > .custom_dropdown_toggle");
      const menu = dropdown.querySelector(":scope > .custom_dropdown_navigation");
      const icon = dropdown.querySelector(":scope > .custom_dropdown_toggle .custom_dropdown_close_icon");

      if (!toggle || !menu) return;

      // Start closed
      menu.style.maxHeight = "0";
      menu.style.overflow = "hidden";
      menu.style.transition = "max-height 0.3s ease";
      if (icon) icon.style.transition = "transform 0.3s ease";

      toggle.addEventListener("click", e => {
        if (e.target.closest("a")) return;
        e.preventDefault();
        e.stopPropagation();

        const isOpen = dropdown.classList.contains("open");

        // Close all siblings of same level
        dropdowns.forEach(sibling => {
          if (sibling !== dropdown) {
            sibling.classList.remove("open");
            const siblingMenu = sibling.querySelector(":scope > .custom_dropdown_navigation");
            const siblingIcon = sibling.querySelector(":scope > .custom_dropdown_toggle .custom_dropdown_close_icon");
            if (siblingMenu) siblingMenu.style.maxHeight = "0";
            if (siblingIcon) siblingIcon.style.transform = "rotate(0deg)";
            // also close all nested dropdowns
            sibling.querySelectorAll(".open").forEach(inner => {
              inner.classList.remove("open");
              const innerMenu = inner.querySelector(":scope > .custom_dropdown_navigation");
              const innerIcon = inner.querySelector(":scope > .custom_dropdown_toggle .custom_dropdown_close_icon");
              if (innerMenu) innerMenu.style.maxHeight = "0";
              if (innerIcon) innerIcon.style.transform = "rotate(0deg)";
            });
          }
        });

        // Toggle current dropdown
        if (isOpen) {
          dropdown.classList.remove("open");
          menu.style.maxHeight = "0";
          if (icon) icon.style.transform = "rotate(0deg)";
        } else {
          dropdown.classList.add("open");
          menu.style.maxHeight = menu.scrollHeight + "px";
          if (icon) icon.style.transform = "rotate(-90deg)";
        }

        // Update parent heights
        updateParentHeights(dropdown);
      });
    });
  }

  // Update parent container height to fit visible submenus
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

  // Initialize all levels
  initDropdown(".dropdown-lv1");
  initDropdown(".dropdown-lv2");
  initDropdown(".dropdown-lv3");

  // Re-init for delayed CMS content (Finsweet)
  setTimeout(() => {
    initDropdown(".dropdown-lv1");
    initDropdown(".dropdown-lv2");
    initDropdown(".dropdown-lv3");
    console.log("🔁 Reinitialized dropdowns after CMS load");
  }, 1500);
});