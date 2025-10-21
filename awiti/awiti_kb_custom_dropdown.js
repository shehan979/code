document.addEventListener("DOMContentLoaded", function () {
  console.log("🟡 Initializing custom dropdowns (delegated mode)...");

  // --- Close all menus on start ---
  document.querySelectorAll(".custom_dropdown_navigation").forEach(menu => {
    menu.style.maxHeight = "0";
    menu.style.overflow = "hidden";
    menu.style.transition = "max-height 0.3s ease";
  });

  document.querySelectorAll(".custom_dropdown_close_icon").forEach(icon => {
    icon.style.transition = "transform 0.3s ease";
    icon.style.transform = "rotate(0deg)";
  });

  // --- Event delegation for toggles ---
  document.addEventListener("click", function (e) {
    const toggle = e.target.closest(".custom_dropdown_toggle");
    const closeBtn = e.target.closest(".custom_dropdown_close");

    // --- Open/close dropdown ---
    if (toggle && !e.target.closest("a")) {
      e.preventDefault();
      e.stopPropagation();

      const dropdown = toggle.closest(".custom_dropdown");
      const menu = dropdown.querySelector(".custom_dropdown_navigation");
      const icon = dropdown.querySelector(".custom_dropdown_close_icon");

      const isOpen = dropdown.classList.contains("open");
      if (isOpen) {
        dropdown.classList.remove("open");
        menu.style.maxHeight = "0";
        if (icon) icon.style.transform = "rotate(0deg)";
      } else {
        dropdown.classList.add("open");
        menu.style.maxHeight = menu.scrollHeight + "px";
        if (icon) icon.style.transform = "rotate(-90deg)";
      }

      updateParentHeights(dropdown);
    }

    // --- Close button only ---
    if (closeBtn) {
      e.preventDefault();
      e.stopPropagation();
      const dropdown = closeBtn.closest(".custom_dropdown");
      const menu = dropdown.querySelector(".custom_dropdown_navigation");
      const icon = dropdown.querySelector(".custom_dropdown_close_icon");
      dropdown.classList.remove("open");
      menu.style.maxHeight = "0";
      if (icon) icon.style.transform = "rotate(0deg)";
      updateParentHeights(dropdown);
    }
  });

  // --- Helper: ensure parent dropdown height adjusts when children open ---
  function updateParentHeights(childDropdown) {
    let parent = childDropdown.parentElement.closest(".custom_dropdown");
    while (parent) {
      const parentMenu = parent.querySelector(".custom_dropdown_navigation");
      if (parent.classList.contains("open") && parentMenu) {
        parentMenu.style.maxHeight = parentMenu.scrollHeight + "px";
      }
      parent = parent.parentElement.closest(".custom_dropdown");
    }
  }

  // --- Second pass after Finsweet loads ---
  setTimeout(() => {
    console.log("🔁 Rebinding dropdowns after CMS load...");
    document.querySelectorAll(".custom_dropdown_navigation").forEach(menu => {
      menu.style.maxHeight = "0";
      menu.style.overflow = "hidden";
    });
  }, 1500);
});
