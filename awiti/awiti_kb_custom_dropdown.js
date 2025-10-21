document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 Dropdown system initialized (active-page auto-open)");

  // hide all menus by default
  document.querySelectorAll(".custom_dropdown_navigation").forEach(menu => {
    menu.style.display = "none";
  });

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

    // close siblings of same level
    if (levelCls) {
      document.querySelectorAll(`.${levelCls}.open`).forEach(sib => {
        if (sib !== dropdown) {
          closeDropdown(sib);
          sib.querySelectorAll(".custom_dropdown.open").forEach(closeDropdown);
        }
      });
    }

    // toggle this dropdown
    dropdown.classList.contains("open") ? closeDropdown(dropdown) : openDropdown(dropdown);
  });

  // open / close helpers
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

  // expand all pre-opened dropdowns
  function expandPreOpenedDropdowns() {
    document.querySelectorAll(".custom_dropdown.open").forEach(drop => {
      const menu = drop.querySelector(":scope > .custom_dropdown_navigation");
      const icon = drop.querySelector(":scope > .custom_dropdown_close_icon");
      if (menu) menu.style.display = "block";
      if (icon) icon.style.transform = "rotate(0deg)";
    });
  }

  expandPreOpenedDropdowns();
  setTimeout(expandPreOpenedDropdowns, 1500); // run again after CMS inject

  // --- NEW: Auto-open dropdowns for the active page link ---
  function openActivePathDropdowns() {
    const currentPath = window.location.pathname;
    // find active link: either Webflow .w--current OR matching pathname
    const activeLink = document.querySelector(
      `a.w--current, a[href='${currentPath}']`
    );

    if (!activeLink) return;

    console.log("📂 Active page detected:", currentPath);

    // climb up and open all parent dropdowns
    let parentDropdown = activeLink.closest(".custom_dropdown");
    while (parentDropdown) {
      openDropdown(parentDropdown);
      parentDropdown = parentDropdown.parentElement.closest(".custom_dropdown");
    }
  }

  // run after a short delay (to allow Finsweet items to load)
  setTimeout(openActivePathDropdowns, 1000);
});