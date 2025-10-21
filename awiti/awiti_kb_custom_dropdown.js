document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 Dropdown fix: prevent double trigger");

  // Start closed
  document.querySelectorAll(".custom_dropdown_navigation").forEach(m=>{
    m.style.maxHeight="0";m.style.overflow="hidden";m.style.transition="max-height .3s ease";
  });
  document.querySelectorAll(".custom_dropdown_close_icon").forEach(i=>{
    i.style.transition="transform .3s ease";i.style.transform="rotate(0deg)";
  });

  document.addEventListener("click", e => {
    const toggle = e.target.closest(".custom_dropdown_toggle");
    const closeBtn = e.target.closest(".custom_dropdown_close");

    // ---------- Toggle ----------
    if (toggle && !e.target.closest("a")) {
      e.preventDefault();
      e.stopPropagation();          // ← stops bubbling to parent toggles
      toggle.dataset.justClicked = "1";  // flag this toggle
      const dropdown = toggle.closest(".custom_dropdown");
      const menu = dropdown.querySelector(".custom_dropdown_navigation");
      const icon = dropdown.querySelector(".custom_dropdown_close_icon");

      const isOpen = dropdown.classList.contains("open");
      dropdown.classList.toggle("open", !isOpen);
      menu.style.maxHeight = isOpen ? "0" : menu.scrollHeight + "px";
      if (icon) icon.style.transform = isOpen ? "rotate(0deg)" : "rotate(-90deg)";
      updateParentHeights(dropdown);
      setTimeout(()=>delete toggle.dataset.justClicked,200);
    }

    // ---------- Close ----------
    if (closeBtn) {
      e.preventDefault();
      e.stopPropagation();
      const dropdown = closeBtn.closest(".custom_dropdown");
      const menu = dropdown.querySelector(".custom_dropdown_navigation");
      const icon = dropdown.querySelector(".custom_dropdown_close_icon");
      dropdown.classList.remove("open");
      menu.style.maxHeight = "0";
      if (icon) icon.style.transform = "rotate(0deg)";
      updateParentHeights(dropdown);
    }
  }, true); // use capture phase to intercept early

  function updateParentHeights(child){
    let parent = child.parentElement.closest(".custom_dropdown");
    while(parent){
      const m = parent.querySelector(".custom_dropdown_navigation");
      if(parent.classList.contains("open") && m){
        m.style.maxHeight = m.scrollHeight + "px";
      }
      parent = parent.parentElement.closest(".custom_dropdown");
    }
  }

  // Re-bind after CMS injection
  setTimeout(()=>console.log("🔁 CMS items bound"),1500);
});