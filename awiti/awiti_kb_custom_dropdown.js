document.addEventListener("DOMContentLoaded", function () {
  const dropdowns = document.querySelectorAll(".custom_dropdown");

  dropdowns.forEach(dropdown => {
    const toggleBtn = dropdown.querySelector(".custom_dropdown_toggle");
    const closeBtn = dropdown.querySelector(".custom_dropdown_close");
    const menu = dropdown.querySelector(".custom_dropdown_navigation");

    // Initialize collapsed
    menu.style.maxHeight = "0";
    menu.style.overflow = "hidden";
    menu.style.transition = "max-height 0.3s ease";

    // --- Toggle Open ---
    toggleBtn.addEventListener("click", e => {
      // Prevent the link click from triggering
      if (e.target.tagName.toLowerCase() === "a") return;

      e.stopPropagation();

      // Close other open dropdowns
      dropdowns.forEach(d => {
        if (d !== dropdown) {
          d.classList.remove("open");
          const m = d.querySelector(".custom_dropdown_navigation");
          m.style.maxHeight = "0";
        }
      });

      // Toggle this one
      const isOpen = dropdown.classList.toggle("open");
      menu.style.maxHeight = isOpen ? menu.scrollHeight + "px" : "0";
    });

    // --- Close Button ---
    closeBtn.addEventListener("click", e => {
      e.stopPropagation();
      dropdown.classList.remove("open");
      menu.style.maxHeight = "0";
    });

    // --- Click outside closes ---
    document.addEventListener("click", e => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("open");
        menu.style.maxHeight = "0";
      }
    });
  });
});
