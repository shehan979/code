document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 Dropdown system initialized (auto-detect w--current)");

  // Hide all dropdown menus initially
  document.querySelectorAll(".custom_dropdown_navigation").forEach(menu => {
    menu.style.display = "none";
  });

  // Set initial rotation for all chevrons
  document.querySelectorAll(".custom_dropdown_close_icon").forEach(icon => {
    icon.style.transition = "transform 0.25s ease";
    icon.style.transformOrigin = "center";
    icon.style.transform = "rotate(90deg)";
  });

  // Click listener for toggle
  document.addEventListener("click", e => {
    const toggle = e.target.closest(".custom_dropdown_toggle");
    if (!toggle) return;
    if (e.target.closest("a")) return; // ignore direct link clicks
    e.preventDefault();
    e.stopPropagation();

    const dropdown = toggle.closest(".custom_dropdown");
    const menu = dropdown.querySelector(":scope > .custom_dropdown_navigation");
    const icon = dropdown.querySelector(":scope > .custom_dropdown_close_icon");
    if (!menu) return;

    const levelCls = Array.from(dropdown.classList).find(c => c.startsWith("dropdown-lv"));
    if (levelCls) {
      document.querySelectorAll(`.${levelCls}.open`).forEach(sib => {
        if (sib !== dropdown) {
          closeDropdown(sib);
          sib.querySelectorAll(".custom_dropdown.open").forEach(closeDropdown);
        }
      });
    }

    dropdown.classList.contains("open") ? closeDropdown(dropdown) : openDropdown(dropdown);
  });

  // Helpers
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

  // Open any pre-marked .open dropdowns
  function expandPreOpenedDropdowns() {
    document.querySelectorAll(".custom_dropdown.open").forEach(drop => {
      const menu = drop.querySelector(":scope > .custom_dropdown_navigation");
      const icon = drop.querySelector(":scope > .custom_dropdown_close_icon");
      if (menu) menu.style.display = "block";
      if (icon) icon.style.transform = "rotate(0deg)";
    });
  }

  expandPreOpenedDropdowns();

  // --- Auto detect .w--current, set .active, and open dropdowns ---
  function activateCurrentLink() {
    const currentLinks = document.querySelectorAll("a.w--current");
    if (currentLinks.length === 0) {
      console.log("⏳ No .w--current yet — retrying...");
      return false; // retry later if CMS not loaded
    }

    currentLinks.forEach(link => {
      // Add .active styling
      link.classList.add("active");
      link.style.color = "#007BFF";
      link.style.fontWeight = "600";

      // Open all parent dropdowns
      let parentDropdown = link.closest(".custom_dropdown");
      while (parentDropdown) {
        openDropdown(parentDropdown);
        parentDropdown = parentDropdown.parentElement?.closest(".custom_dropdown");
      }
    });

    console.log("✅ Current link activated and dropdowns opened.");
    return true;
  }

  // Retry loop (for async Finsweet CMS content)
  let attempts = 0;
  const interval = setInterval(() => {
    if (activateCurrentLink() || attempts > 10) clearInterval(interval);
    attempts++;
  }, 400);
});