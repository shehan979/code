document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 Dropdown system initialized with .active auto-open");

  // hide all menus by default
  document.querySelectorAll(".custom_dropdown_navigation").forEach(menu => {
    menu.style.display = "none";
  });

  // set base chevron rotation
  document.querySelectorAll(".custom_dropdown_close_icon").forEach(icon => {
    icon.style.transition = "transform 0.25s ease";
    icon.style.transformOrigin = "center";
    icon.style.transform = "rotate(90deg)";
  });

  // delegated click listener
  document.addEventListener("click", e => {
    const toggle = e.target.closest(".custom_dropdown_toggle");
    if (!toggle) return;
    if (e.target.closest("a")) return; // ignore link clicks

    e.preventDefault();
    e.stopPropagation();

    const dropdown = toggle.closest(".custom_dropdown");
    const menu = dropdown.querySelector(":scope > .custom_dropdown_navigation");
    const icon = dropdown.querySelector(":scope > .custom_dropdown_close_icon");
    if (!menu) return;

    const levelCls = Array.from(dropdown.classList).find(c => c.startsWith("dropdown-lv"));

    // close siblings at same level
    if (levelCls) {
      document.querySelectorAll(`.${levelCls}.open`).forEach(sib => {
        if (sib !== dropdown) {
          closeDropdown(sib);
          sib.querySelectorAll(".custom_dropdown.open").forEach(closeDropdown);
        }
      });
    }

    // toggle
    dropdown.classList.contains("open") ? closeDropdown(dropdown) : openDropdown(dropdown);
  });

  // helper functions
  function openDropdown(drop) {
    const menu = drop.querySelector(":scope > .custom_dropdown_navigation");
    const icon = drop.querySelector(":scope > .custom_dropdown_close_icon");
    drop.classList.add("open");
    if (menu) menu.style.display = "block";
    if (icon) icon.style.transform = "rotate(0deg)";
  }

  function closeDropdown(drop) {
    const menu = drop.querySelector(":scope > .custom_dropdown_navigation");
    const icon = drop.querySelector(":scope > .custom_dropdown_close_icon");
    drop.classList.remove("open");
    if (menu) menu.style.display = "none";
    if (icon) icon.style.transform = "rotate(90deg)";
  }

  // reopen any pre-marked open dropdowns
  function expandPreOpenedDropdowns() {
    document.querySelectorAll(".custom_dropdown.open").forEach(drop => {
      const menu = drop.querySelector(":scope > .custom_dropdown_navigation");
      const icon = drop.querySelector(":scope > .custom_dropdown_close_icon");
      if (menu) menu.style.display = "block";
      if (icon) icon.style.transform = "rotate(0deg)";
    });
  }

  expandPreOpenedDropdowns();
  setTimeout(expandPreOpenedDropdowns, 1500); // safety for Finsweet load

  // --- NEW: Auto-open dropdowns for .active links ---
  function openActiveDropdowns() {
    const activeLinks = document.querySelectorAll("a.active");
    activeLinks.forEach(link => {
      // highlight link text
      link.style.color = "#007BFF"; // blue color for active link
      link.style.fontWeight = "600";

      // climb up and open all parent dropdowns
      let parentDropdown = link.closest(".custom_dropdown");
      while (parentDropdown) {
        openDropdown(parentDropdown);
        parentDropdown = parentDropdown.parentElement.closest(".custom_dropdown");
      }
    });
  }

  // run after delay to allow CMS to populate
  setTimeout(openActiveDropdowns, 1000);
});