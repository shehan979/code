document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 Multi-level dropdown system active");

  // 🔹 Basic styles for animations
  document.querySelectorAll(".custom_dropdown_navigation").forEach(m => {
    m.style.maxHeight = "0";
    m.style.overflow = "hidden";
    m.style.transition = "max-height 0.3s ease";
  });
  document.querySelectorAll(".custom_dropdown_close_icon").forEach(i => {
    i.style.transition = "transform 0.3s ease";
    i.style.transformOrigin = "center";
    i.style.transform = "rotate(0deg)";
  });

  // 🔹 Delegated click handler (covers dynamically loaded CMS items)
  document.addEventListener("click", e => {
    const toggle = e.target.closest(".custom_dropdown_toggle");
    if (!toggle || e.target.closest("a")) return; // ignore link clicks
    e.preventDefault();
    e.stopPropagation();

    const dropdown = toggle.closest(".custom_dropdown");
    if (!dropdown) return;

    const menu = dropdown.querySelector(":scope > .custom_dropdown_navigation");
    const icon = dropdown.querySelector(":scope > .custom_dropdown_close_icon");

    // find dropdown level class (dropdown-lv1, lv2, etc.)
    const levelCls = Array.from(dropdown.classList).find(c => c.startsWith("dropdown-lv"));

    // close siblings of same level
    if (levelCls) {
      document.querySelectorAll(`.${levelCls}.open`).forEach(sib => {
        if (sib !== dropdown) {
          closeDropdown(sib);
          // also close nested children inside
          sib.querySelectorAll(".custom_dropdown.open").forEach(closeDropdown);
        }
      });
    }

    // toggle current dropdown
    if (dropdown.classList.contains("open")) {
      closeDropdown(dropdown);
    } else {
      openDropdown(dropdown);
    }

    // adjust parent heights (so nested menus resize properly)
    updateParentHeights(dropdown);
  });

  // 🔹 Open dropdown function
  function openDropdown(drop) {
    const menu = drop.querySelector(":scope > .custom_dropdown_navigation");
    const icon = drop.querySelector(":scope > .custom_dropdown_close_icon");
    drop.classList.add("open");
    if (menu) menu.style.maxHeight = menu.scrollHeight + "px";
    if (icon) icon.style.transform = "rotate(-90deg)";
  }

  // 🔹 Close dropdown function
  function closeDropdown(drop) {
    const menu = drop.querySelector(":scope > .custom_dropdown_navigation");
    const icon = drop.querySelector(":scope > .custom_dropdown_close_icon");
    drop.classList.remove("open");
    if (menu) menu.style.maxHeight = "0";
    if (icon) icon.style.transform = "rotate(0deg)";
  }

  // 🔹 Recalculate heights for nested open parents
  function updateParentHeights(child) {
    let parent = child.parentElement.closest(".custom_dropdown");
    while (parent) {
      const menu = parent.querySelector(":scope > .custom_dropdown_navigation");
      if (parent.classList.contains("open") && menu) {
        menu.style.maxHeight = menu.scrollHeight + "px";
      }
      parent = parent.parentElement.closest(".custom_dropdown");
    }
  }

  // 🔹 Auto-expand any dropdowns already marked as .open (e.g., active page)
  function expandPreOpenedDropdowns() {
    document.querySelectorAll(".custom_dropdown.open").forEach(drop => {
      const menu = drop.querySelector(":scope > .custom_dropdown_navigation");
      const icon = drop.querySelector(":scope > .custom_dropdown_close_icon");
      if (menu) menu.style.maxHeight = menu.scrollHeight + "px";
      if (icon) icon.style.transform = "rotate(-90deg)";
    });
  }

  // Run immediately for static content
  expandPreOpenedDropdowns();

  // Run again after Finsweet CMS injection
  setTimeout(expandPreOpenedDropdowns, 1500);
});