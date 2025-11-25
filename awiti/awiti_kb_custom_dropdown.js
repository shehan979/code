document.addEventListener("DOMContentLoaded", function () {
  // Target only inner dropdowns (dropdown inside another dropdown)
  const innerDropdowns = document.querySelectorAll(".w-dropdown .w-dropdown .w-dropdown-toggle");

  innerDropdowns.forEach((toggle) => {
    toggle.addEventListener("click", function (event) {
      event.stopPropagation(); // stops parent dropdown from closing
    });
  });
});
