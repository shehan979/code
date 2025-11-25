document.addEventListener("DOMContentLoaded", function () {

  // 1) Prevent parent dropdown from closing when clicking inner dropdown toggle
  const innerToggles = document.querySelectorAll(
    ".w-dropdown .w-dropdown .w-dropdown-toggle"
  );

  innerToggles.forEach(toggle => {
    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  });


  // 2) Prevent parent dropdown from closing when clicking inside inner list
  const innerLists = document.querySelectorAll(
    ".w-dropdown .w-dropdown .w-dropdown-list"
  );

  innerLists.forEach(list => {
    list.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  });


  // 3) Force Webflow to re-initialize dropdowns created dynamically (Webflow bug fix)
  const dropdowns = document.querySelectorAll(".w-dropdown");
  dropdowns.forEach(drop => {
    drop.addEventListener("click", function (e) {
      e.stopImmediatePropagation(); // remove conflict
    });
  });

});
