document.addEventListener("DOMContentLoaded", function () {
  function initDropdowns() {
    const dropdowns = document.querySelectorAll(".custom_dropdown");

    if (!dropdowns.length) {
      console.log("⏳ Waiting for dropdown items...");
      setTimeout(initDropdowns, 500);
      return;
    }

    console.log("✅ Dropdowns ready:", dropdowns.length);

    dropdowns.forEach(dropdown => {
      const toggleBtn = dropdown.querySelector(":scope > .custom_dropdown_toggle");
      const closeBtn = dropdown.querySelector(":scope > .custom_dropdown_toggle > .custom_dropdown_close");
      const menu = dropdown.querySelector(":scope > .custom_dropdown_navigation");
      const icon = dropdown.querySelector(":scope > .custom_dropdown_toggle > .custom_dropdown_close_icon");

      if (!toggleBtn || !closeBtn || !menu) return;

      // Initialize closed
      menu.style.maxHeight = "0";
      menu.style.overflow = "hidden";
      menu.style.transition = "max-height 0.3s ease";
      if (icon) icon.style.transition = "transform 0.3s ease";

      // --- Toggle open for current level only ---
      toggleBtn.addEventListener("click", e => {
        if (e.target.closest("a")) return; // ignore link clicks
        e.stopPropagation();

        const isOpen = dropdown.classList.toggle("open");
        menu.style.maxHeight = isOpen ? menu.scrollHeight + "px" : "0";
        if (icon) icon.style.transform = isOpen ? "rotate(-90deg)" : "rotate(0deg)";
      });

      // --- Close current dropdown only ---
      closeBtn.addEventListener("click", e => {
        e.stopPropagation();
        dropdown.classList.remove("open");
        menu.style.maxHeight = "0";
        if (icon) icon.style.transform = "rotate(0deg)";
      });

      // --- Click outside closes only top-level dropdowns ---
      document.addEventListener("click", e => {
        const isInside = dropdown.contains(e.target);
        const isChild = dropdown.querySelector(".custom_dropdown")?.contains(e.target);
        if (!isInside && !isChild) {
          dropdown.classList.remove("open");
          menu.style.maxHeight = "0";
          if (icon) icon.style.transform = "rotate(0deg)";
        }
      });
    });
  }

  // Wait for Finsweet CMS load
  document.addEventListener("fs-cmsload", initDropdowns);
  setTimeout(initDropdowns, 1000);
});