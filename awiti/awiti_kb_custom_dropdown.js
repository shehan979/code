document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 Dropdown system initialized with .active auto-open + Finsweet delay");

  // Hide all dropdown menus initially
  document.querySelectorAll(".custom_dropdown_navigation").forEach(menu => {
    menu.style.display = "none";
  });

  // Set default icon rotation
  document.querySelectorAll(".custom_dropdown_close_icon").forEach(icon => {
    icon.style.transition = "transform 0.25s ease";
    icon.style.transformOrigin = "center";
    icon.style.transform = "rotate(90deg)";
  });

  // Toggle click listener
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

  // --- Auto-open for preopened dropdowns
  function expandPreOpenedDropdowns() {
    document.querySelectorAll(".custom_dropdown.open").forEach(drop => {
      const menu = drop.querySelector(":scope > .custom_dropdown_navigation");
      const icon = drop.querySelector(":scope > .custom_dropdown_close_icon");
      if (menu) menu.style.display = "block";
      if (icon) icon.style.transform = "rotate(0deg)";
    });
  }

  expandPreOpenedDropdowns();

  // --- NEW: Detect and open dropdowns for .active links (with retry)
  function openActiveDropdowns() {
    const activeLinks = document.querySelectorAll("a.active");
    if (activeLinks.length === 0) {
      console.log("⏳ No .active link yet — retrying...");
      return false; // retry later
    }

    activeLinks.forEach(link => {
      link.style.color = "#007BFF";
      link.style.fontWeight = "600";
      let parentDropdown = link.closest(".custom_dropdown");
      while (parentDropdown) {
        openDropdown(parentDropdown);
        parentDropdown = parentDropdown.parentElement?.closest(".custom_dropdown");
      }
    });
    console.log("✅ Active link dropdowns opened.");
    return true;
  }

  // Try multiple times (CMS loads asynchronously)
  let attempts = 0;
  const interval = setInterval(() => {
    if (openActiveDropdowns() || attempts > 10) clearInterval(interval);
    attempts++;
  }, 400);
});