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
      const toggleBtn = dropdown.querySelector(".custom_dropdown_toggle");
      const closeBtn = dropdown.querySelector(".custom_dropdown_close");
      const menu = dropdown.querySelector(".custom_dropdown_navigation");
      const icon = dropdown.querySelector(".custom_dropdown_close_icon");

      if (!toggleBtn || !closeBtn || !menu) return;

      // initialize
      menu.style.maxHeight = "0";
      menu.style.overflow = "hidden";
      menu.style.transition = "max-height 0.3s ease";

      // --- Toggle open ---
      toggleBtn.addEventListener("click", e => {
        if (e.target.closest("a")) return;
        e.stopPropagation();

        dropdowns.forEach(d => {
          if (d !== dropdown) {
            d.classList.remove("open");
            const m = d.querySelector(".custom_dropdown_navigation");
            const i = d.querySelector(".custom_dropdown_close_icon");
            if (m) m.style.maxHeight = "0";
            if (i) i.style.transform = "rotate(0deg)";
          }
        });

        const isOpen = dropdown.classList.toggle("open");
        menu.style.maxHeight = isOpen ? menu.scrollHeight + "px" : "0";
        if (icon) icon.style.transform = isOpen ? "rotate(-90deg)" : "rotate(0deg)";
      });

      // --- Close icon ---
      closeBtn.addEventListener("click", e => {
        e.stopPropagation();
        dropdown.classList.remove("open");
        menu.style.maxHeight = "0";
        if (icon) icon.style.transform = "rotate(0deg)";
      });

      // --- Outside click ---
      document.addEventListener("click", e => {
        if (!dropdown.contains(e.target)) {
          dropdown.classList.remove("open");
          menu.style.maxHeight = "0";
          if (icon) icon.style.transform = "rotate(0deg)";
        }
      });
    });
  }

  document.addEventListener("fs-cmsload", initDropdowns);
  setTimeout(initDropdowns, 1000);
});
