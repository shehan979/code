document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 Final nested dropdown handler started");

  // --- Reset all dropdowns initially ---
  document.querySelectorAll(".custom_dropdown_navigation").forEach(menu => {
    menu.style.maxHeight = "0";
    menu.style.overflow = "hidden";
    menu.style.transition = "max-height 0.3s ease";
  });
  document.querySelectorAll(".custom_dropdown_close_icon").forEach(icon => {
    icon.style.transition = "transform 0.3s ease";
    icon.style.transform = "rotate(0deg)";
  });

  // --- Directly attach listeners (no global delegation) ---
  function initDropdown(dropdown) {
    const toggle = dropdown.querySelector(":scope > .custom_dropdown_toggle");
    const closeBtn = dropdown.querySelector(":scope > .custom_dropdown_toggle > .custom_dropdown_close");
    const menu = dropdown.querySelector(":scope > .custom_dropdown_navigation");
    const icon = dropdown.querySelector(":scope > .custom_dropdown_toggle > .custom_dropdown_close_icon");

    if (!toggle || !closeBtn || !menu) return;

    // Toggle (open/close)
    toggle.addEventListener("click", e => {
      if (e.target.closest("a")) return; // ignore link clicks
      e.stopPropagation(); // stop affecting parents

      const isOpen = dropdown.classList.contains("open");
      if (isOpen) {
        closeDropdown(dropdown, menu, icon);
      } else {
        openDropdown(dropdown, menu, icon);
      }
      updateParentHeights(dropdown);
    });

    // Close button only
    closeBtn.addEventListener("click", e => {
      e.stopPropagation();
      closeDropdown(dropdown, menu, icon);
      updateParentHeights(dropdown);
    });
  }

  // Helpers
  function openDropdown(dropdown, menu, icon) {
    dropdown.classList.add("open");
    menu.style.maxHeight = menu.scrollHeight + "px";
    if (icon) icon.style.transform = "rotate(-90deg)";
  }

  function closeDropdown(dropdown, menu, icon) {
    dropdown.classList.remove("open");
    menu.style.maxHeight = "0";
    if (icon) icon.style.transform = "rotate(0deg)";
  }

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

  // --- Initialize all dropdowns ---
  const dropdowns = document.querySelectorAll(".custom_dropdown");
  dropdowns.forEach(initDropdown);

  // --- Re-initialize after a short delay for Finsweet-injected items ---
  setTimeout(() => {
    document.querySelectorAll(".custom_dropdown").forEach(initDropdown);
    console.log("🔁 Dropdowns re-initialized after CMS load");
  }, 1500);
});