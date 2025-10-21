document.addEventListener("DOMContentLoaded", function () {

  // ✅ Run only after Finsweet finishes loading all CMS items
  function waitForFinsweetAndInit() {
    const cmsLists = document.querySelectorAll("[fs-list-load='all']");
    const allLoaded = Array.from(cmsLists).every(list => list.querySelector(".w-dyn-item"));

    if (!cmsLists.length || !allLoaded) {
      console.log("⏳ Waiting for Finsweet to finish rendering dropdown items...");
      setTimeout(waitForFinsweetAndInit, 500);
      return;
    }

    console.log("✅ Finsweet CMS content fully loaded");
    initDropdowns();
  }

  function initDropdowns() {
    const dropdowns = document.querySelectorAll(".custom_dropdown");
    console.log("🔧 Initializing dropdowns:", dropdowns.length);

    dropdowns.forEach(dropdown => {
      const toggle = dropdown.querySelector(":scope > .custom_dropdown_toggle");
      const closeWrap = dropdown.querySelector(":scope > .custom_dropdown_toggle > .custom_dropdown_close");
      const menu = dropdown.querySelector(":scope > .custom_dropdown_navigation");
      const icon = dropdown.querySelector(":scope > .custom_dropdown_toggle > .custom_dropdown_close_icon");

      if (!toggle || !closeWrap || !menu) return;

      // Setup
      menu.style.maxHeight = "0";
      menu.style.overflow = "hidden";
      menu.style.transition = "max-height 0.3s ease";
      if (icon) icon.style.transition = "transform 0.3s ease";

      // Toggle
      toggle.addEventListener("click", e => {
        if (e.target.closest("a")) return;
        e.stopPropagation();

        const isOpen = dropdown.classList.contains("open");
        if (isOpen) closeDropdown(dropdown, menu, icon);
        else openDropdown(dropdown, menu, icon);
        updateParentHeights(dropdown);
      });

      // Close button
      closeWrap.addEventListener("click", e => {
        e.stopPropagation();
        closeDropdown(dropdown, menu, icon);
        updateParentHeights(dropdown);
      });
    });
  }

  function openDropdown(dropdown, menu, icon) {
    dropdown.classList.add("open");
    menu.style.maxHeight = menu.scrollHeight + "px";
    if (icon) icon.style.transform = "rotate(-90deg)";
  }

  function closeDropdown(dropdown, menu, icon) {
    dropdown.classList.remove("open");
    menu.style.maxHeight = "0";
    if (icon) icon.style.transform = "rotate(0deg)";
  }

  function updateParentHeights(childDropdown) {
    let parent = childDropdown.parentElement.closest(".custom_dropdown");
    while (parent) {
      const parentMenu = parent.querySelector(":scope > .custom_dropdown_navigation");
      if (parent.classList.contains("open") && parentMenu) {
        parentMenu.style.maxHeight = parentMenu.scrollHeight + "px";
      }
      parent = parent.parentElement.closest(".custom_dropdown");
    }
  }

  // Run once Finsweet emits event, or wait manually
  document.addEventListener("fs-cmsload", waitForFinsweetAndInit);
  waitForFinsweetAndInit();
});