document.addEventListener("DOMContentLoaded", function () {
  function initDropdowns() {
    const dropdowns = document.querySelectorAll(".custom_dropdown");

    if (!dropdowns.length) {
      console.log("⏳ Waiting for dropdown items...");
      setTimeout(initDropdowns, 500); // retry until Finsweet loads
      return;
    }

    console.log("✅ Dropdowns ready:", dropdowns.length);

    dropdowns.forEach(dropdown => {
      const toggleBtn = dropdown.querySelector(".custom_dropdown_toggle");
      const closeBtn = dropdown.querySelector(".custom_dropdown_close");
      const menu = dropdown.querySelector(".custom_dropdown_navigation");

      if (!toggleBtn || !closeBtn || !menu) return;

      // Collapse initially
      menu.style.maxHeight = "0";
      menu.style.overflow = "hidden";
      menu.style.transition = "max-height 0.3s ease";

      // --- Open (toggle button only) ---
      toggleBtn.addEventListener("click", e => {
        if (e.target.closest("a")) return; // ignore links
        e.stopPropagation();

        // Close others
        dropdowns.forEach(d => {
          if (d !== dropdown) {
            d.classList.remove("open");
            const m = d.querySelector(".custom_dropdown_navigation");
            if (m) m.style.maxHeight = "0";
          }
        });

        // Toggle current
        const isOpen = dropdown.classList.toggle("open");
        menu.style.maxHeight = isOpen ? menu.scrollHeight + "px" : "0";
      });

      // --- Close icon ---
      closeBtn.addEventListener("click", e => {
        e.stopPropagation();
        dropdown.classList.remove("open");
        menu.style.maxHeight = "0";
      });

      // --- Click outside closes all ---
      document.addEventListener("click", e => {
        if (!dropdown.contains(e.target)) {
          dropdown.classList.remove("open");
          menu.style.maxHeight = "0";
        }
      });
    });
  }

  // Wait for Finsweet v2 load event
  document.addEventListener("fs-cmsload", initDropdowns);
  // Also run fallback in case event doesn’t fire
  setTimeout(initDropdowns, 1000);
});
