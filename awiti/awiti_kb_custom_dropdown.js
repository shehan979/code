document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 Multi-level dropdowns initialized (flicker-free)");

  // --- Setup base styles ---
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

  // --- Delegated click handler ---
  document.addEventListener("click", e => {
    const toggle = e.target.closest(".custom_dropdown_toggle");
    if (!toggle) return;

    // ❌ Skip link clicks
    if (e.target.closest("a")) return;

    // ✅ Stop event bubbling to parent dropdowns
    e.stopPropagation();
    e.preventDefault();

    const dropdown = toggle.closest(".custom_dropdown");
    const menu = dropdown.querySelector(":scope > .custom_dropdown_navigation");
    const icon = dropdown.querySelector(":scope > .custom_dropdown_close_icon");
    if (!menu) return;

    const levelCls = Array.from(dropdown.classList).find(c => c.startsWith("dropdown-lv"));

    // Close siblings of same level
    if (levelCls) {
      document.querySelectorAll(`.${levelCls}.open`).forEach(sibling => {
        if (sibling !== dropdown) {
          closeDropdown(sibling);
          sibling.querySelectorAll(".custom_dropdown.open").forEach(closeDropdown);
        }
      });
    }

    // Toggle clicked dropdown
    dropdown.classList.contains("open") ? closeDropdown(dropdown) : openDropdown(dropdown);

    // Update parent heights so nested menus expand smoothly
    updateParentHeights(dropdown);
  });

  // --- Helper functions ---
  function openDropdown(drop) {
    const menu = drop.querySelector(":scope > .custom_dropdown_navigation");
    const icon = drop.querySelector(":scope > .custom_dropdown_close_icon");
    drop.classList.add("open");
    if (menu) menu.style.maxHeight = menu.scrollHeight + "px";
    if (icon) icon.style.transform = "rotate(-90deg)";
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
        menu.style.maxHeight = menu.scrollHeight + "px";
      }
      parent = parent.parentElement.closest(".custom_dropdown");
    }
  }

  // --- Auto-expand any pre-opened dropdowns ---
  function expandPreOpenedDropdowns() {
    document.querySelectorAll(".custom_dropdown.open").forEach(drop => {
      const menu = drop.querySelector(":scope > .custom_dropdown_navigation");
      const icon = drop.querySelector(":scope > .custom_dropdown_close_icon");
      if (menu) menu.style.maxHeight = menu.scrollHeight + "px";
      if (icon) icon.style.transform = "rotate(-90deg)";
    });
  }

  expandPreOpenedDropdowns();
  setTimeout(expandPreOpenedDropdowns, 1500); // Re-run after Finsweet CMS load
});