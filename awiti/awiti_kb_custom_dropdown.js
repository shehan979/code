document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 Dropdown system initialized (page_slug-based active open)");
  // Hide all dropdown menus initially
  document.querySelectorAll(".custom_dropdown_navigation").forEach(menu => {
    menu.style.display = "none";
  });

  // Rotate all chevrons to closed position
  document.querySelectorAll(".custom_dropdown_close_icon").forEach(icon => {
    icon.style.transition = "transform 0.25s ease";
    icon.style.transformOrigin = "center";
    icon.style.transform = "rotate(90deg)";
  });

  // Helper: open dropdown
  function openDropdown(drop) {
    const menu = drop.querySelector(":scope > .custom_dropdown_navigation");
    const icon = drop.querySelector(":scope > .custom_dropdown_close_icon");
    drop.classList.add("open");
    if (menu) menu.style.display = "block";
    if (icon) icon.style.transform = "rotate(0deg)";
  }

  // Helper: close dropdown
  function closeDropdown(drop) {
    const menu = drop.querySelector(":scope > .custom_dropdown_navigation");
    const icon = drop.querySelector(":scope > .custom_dropdown_close_icon");
    drop.classList.remove("open");
    if (menu) menu.style.display = "none";
    if (icon) icon.style.transform = "rotate(90deg)";
  }

  // Get current page slug from URL
  const pathParts = window.location.pathname.split("/");
  const currentSlug = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2];
  console.log("📄 Current page slug:", currentSlug);

  function highlightActiveSlug(slug) {
    if (!slug) return false;
    const activeLink = document.querySelector(`a[page_slug="${slug}"]`);
    if (!activeLink) {
      console.log("⏳ No link found yet for slug:", slug);
      return false;
    }

    console.log("✅ Found active link for slug:", slug, activeLink);

    // Highlight the link
    activeLink.classList.add("active");
    activeLink.style.color = "#007BFF";
    activeLink.style.fontWeight = "600";

    // Open all parent dropdowns
    let parentDropdown = activeLink.closest(".custom_dropdown");
    while (parentDropdown) {
      openDropdown(parentDropdown);
      parentDropdown = parentDropdown.parentElement?.closest(".custom_dropdown");
    }
    return true;
  }

  // Retry loop (for Finsweet async rendering)
  let tries = 0;
  const interval = setInterval(() => {
    const success = highlightActiveSlug(currentSlug);
    if (success || tries > 10) clearInterval(interval);
    tries++;
  }, 500);
});