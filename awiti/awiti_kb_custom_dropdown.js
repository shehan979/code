document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 Dropdown system initialized (with async height fix)");

  // --- Setup base transitions ---
  document.querySelectorAll(".custom_dropdown_navigation").forEach(menu => {
    menu.style.maxHeight = "0";
    menu.style.overflow = "hidden";
    menu.style.transition = "max-height 0.3s ease";
  });
  document.querySelectorAll(".custom_dropdown_close_icon").forEach(icon => {
    icon.style.transition = "transform 0.3s ease";
    icon.style.transformOrigin = "center";
    icon.style.transform = "rotate(0deg)";
  });

  // --- Delegated click listener ---
  document.addEventListener("click", e => {
    const toggle = e.target.closest(".custom_dropdown_toggle");
    if (!toggle) return;
    if (e.target.closest("a")) return; // skip link clicks

    e.stopPropagation();
    e.preventDefault();

    const dropdown = toggle.closest(".custom_dropdown");
    const menu = dropdown.querySelector(":scope > .custom_dropdown_navigation");
    const icon = dropdown.querySelector(":scope > .custom_dropdown_close_icon");
    if (!menu) return;

    const levelCls = Array.from(dropdown.classList).find(c => c.startsWith("dropdown-lv"));

    // Close siblings of same level
    if (levelCls) {
      document.querySelectorAll(`.${levelCls}.open`).forEach(sib => {
        if (sib !== dropdown) {
          closeDropdown(sib);
          sib.querySelectorAll(".custom_dropdown.open").forEach(closeDropdown);
        }
      });
    }

    // Toggle
    if (dropdown.classList.contains("open")) {
      closeDropdown(dropdown);
    } else {
      openDropdown(dropdown);
    }

    updateParentHeights(dropdown);
  });

  // --- Functions ---
  function openDropdown(drop) {
    const menu = drop.querySelector(":scope > .custom_dropdown_navigation");
    const icon = drop.querySelector(":scope > .custom_dropdown_close_icon");
    drop.classList.add("open");
    if (icon) icon.style.transform = "rotate(-90deg)";

    // 🕒 Delay measuring height to ensure CMS children fully rendered
    requestAnimationFrame(() => {
      setTimeout(() => {
        const fullHeight = menu.scrollHeight;
        menu.style.maxHeight = fullHeight + "px";
      }, 100); // 100ms delay fixes 21px bug
    });
  }

  function closeDropdown(drop) {
    const menu = drop.querySelector(":scope > .custom_dropdown_navigation");
    const icon = drop.querySelector(":scope > .custom_dropdown_close_icon");
    drop.classList.remove("open");
    if (menu) menu.style.maxHeight = "0";
    if (icon) icon.style.transform = "rotate(0deg)";
  }

  function updateParentHeights(child) {
    let parent = child.parentElement.closest(".custom_dropdown");
    while (parent) {
      const menu = parent.querySelector(":scope > .custom_dropdown_navigation");
      if (parent.classList.contains("open") && menu) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            menu.style.maxHeight = menu.scrollHeight + "px";
          }, 100);
        });
      }
      parent = parent.parentElement.closest(".custom_dropdown");
    }
  }

  // --- Auto-expand pre-opened dropdowns ---
  function expandPreOpenedDropdowns() {
    document.querySelectorAll(".custom_dropdown.open").forEach(drop => {
      const menu = drop.querySelector(":scope > .custom_dropdown_navigation");
      const icon = drop.querySelector(":scope > .custom_dropdown_close_icon");
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (menu) menu.style.maxHeight = menu.scrollHeight + "px";
          if (icon) icon.style.transform = "rotate(-90deg)";
        }, 100);
      });
    });
  }

  expandPreOpenedDropdowns();
  setTimeout(expandPreOpenedDropdowns, 1500); // run again after Finsweet render
});