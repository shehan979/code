document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 Dropdown system initialized (Finsweet-safe auto-open)");

  // Hide all dropdowns initially
  document.querySelectorAll(".custom_dropdown_navigation").forEach(menu => {
    menu.style.display = "none";
  });

  // Chevron base rotation
  document.querySelectorAll(".custom_dropdown_close_icon").forEach(icon => {
    icon.style.transition = "transform 0.25s ease";
    icon.style.transformOrigin = "center";
    icon.style.transform = "rotate(90deg)";
  });

  // Click listener
  document.addEventListener("click", e => {
    const toggle = e.target.closest(".custom_dropdown_toggle");
    if (!toggle) return;
    if (e.target.closest("a")) return;
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

  // --- Core functions ---
  function openDropdown(drop) {
    const menu = drop.querySelector(":scope > .custom_dropdown_navigation");
    const icon = drop.querySelector(":scope > .custom_dropdown_close_icon");
    drop.classList.add("open");
    if (menu) {
      menu.style.display = "block";
      menu.style.removeProperty("max-height");
    }
    if (icon) icon.style.transform = "rotate(0deg)";
  }

  function closeDropdown(drop) {
    const menu = drop.querySelector(":scope > .custom_dropdown_navigation");
    const icon = drop.querySelector(":scope > .custom_dropdown_close_icon");
    drop.classList.remove("open");
    if (menu) menu.style.display = "none";
    if (icon) icon.style.transform = "rotate(90deg)";
  }

  // --- Detect & open for w--current ---
  function activateCurrentLink(force = false) {
    const current = document.querySelector("a.w--current");
    if (!current) {
      if (!force) console.log("⏳ No .w--current found yet");
      return false;
    }

    // Highlight and mark active
    current.classList.add("active");
    current.style.color = "#007BFF";
    current.style.fontWeight = "600";

    // Open all parent dropdowns
    let parentDropdown = current.closest(".custom_dropdown");
    while (parentDropdown) {
      openDropdown(parentDropdown);
      parentDropdown = parentDropdown.parentElement?.closest(".custom_dropdown");
    }
    console.log("✅ Current link dropdowns opened.");
    return true;
  }

  // Retry loop to wait for CMS items
  let tries = 0;
  const interval = setInterval(() => {
    const success = activateCurrentLink();
    if (success || tries > 12) clearInterval(interval);
    tries++;
  }, 500);

  // Final safety trigger after full page render (Finsweet finish)
  setTimeout(() => {
    activateCurrentLink(true);
  }, 3000);
});