document.addEventListener("DOMContentLoaded", function () {
  const dropdowns = document.querySelectorAll(".custom_dropdown");

  dropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector(".custom_dropdown_toggle");
    const closeBtn = dropdown.querySelector(".custom_dropdown_close");
    const menu = dropdown.querySelector(".custom_dropdown_navigation");

    // Initially hide dropdown content
    menu.style.maxHeight = "0";
    menu.style.overflow = "hidden";
    menu.style.transition = "max-height 0.3s ease";

    // Open dropdown when toggle is clicked
    toggle.addEventListener("click", e => {
      e.stopPropagation();
      dropdowns.forEach(d => {
        if (d !== dropdown) {
          d.classList.remove("open");
          const otherMenu = d.querySelector(".custom_dropdown_navigation");
          otherMenu.style.maxHeight = "0";
        }
      });
      dropdown.classList.toggle("open");
      menu.style.maxHeight = dropdown.classList.contains("open")
        ? menu.scrollHeight + "px"
        : "0";
    });

    // Close when close icon is clicked
    closeBtn.addEventListener("click", e => {
      e.stopPropagation();
      dropdown.classList.remove("open");
      menu.style.maxHeight = "0";
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", e => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("open");
        menu.style.maxHeight = "0";
      }
    });
  });
});