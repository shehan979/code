document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 Multi-level dropdown logic active");

  // Start all closed
  document.querySelectorAll(".custom_dropdown_navigation").forEach(menu=>{
    menu.style.maxHeight="0";
    menu.style.overflow="hidden";
    menu.style.transition="max-height .3s ease";
  });
  document.querySelectorAll(".custom_dropdown_close_icon").forEach(i=>{
    i.style.transition="transform .3s ease"; i.style.transform="rotate(0deg)";
  });

  // Delegated click listener
  document.addEventListener("click", e=>{
    const toggle = e.target.closest(".custom_dropdown_toggle");
    if (!toggle || e.target.closest("a")) return;

    e.preventDefault(); e.stopPropagation();

    const dropdown = toggle.closest(".custom_dropdown");
    if (!dropdown) return;

    const menu = dropdown.querySelector(":scope > .custom_dropdown_navigation");
    const icon = dropdown.querySelector(":scope > .custom_dropdown_toggle .custom_dropdown_close_icon");

    const isOpen = dropdown.classList.contains("open");

    // Close siblings at same level
    const siblings = getSiblings(dropdown);
    siblings.forEach(sib=>{
      sib.classList.remove("open");
      const sibMenu = sib.querySelector(":scope > .custom_dropdown_navigation");
      const sibIcon = sib.querySelector(":scope > .custom_dropdown_toggle .custom_dropdown_close_icon");
      if (sibMenu) sibMenu.style.maxHeight="0";
      if (sibIcon) sibIcon.style.transform="rotate(0deg)";
      // also close all nested children
      sib.querySelectorAll(".custom_dropdown.open").forEach(c=>{
        c.classList.remove("open");
        const m=c.querySelector(":scope > .custom_dropdown_navigation");
        const i=c.querySelector(":scope > .custom_dropdown_toggle .custom_dropdown_close_icon");
        if(m)m.style.maxHeight="0";
        if(i)i.style.transform="rotate(0deg)";
      });
    });

    // Toggle current dropdown
    if (isOpen) {
      dropdown.classList.remove("open");
      if (menu) menu.style.maxHeight="0";
      if (icon) icon.style.transform="rotate(0deg)";
    } else {
      dropdown.classList.add("open");
      if (menu) menu.style.maxHeight = menu.scrollHeight + "px";
      if (icon) icon.style.transform="rotate(-90deg)";
    }

    // Expand parent heights so nothing is clipped
    updateParentHeights(dropdown);
  });

  // Helper: siblings at same nesting level
  function getSiblings(el){
    if(!el.parentElement) return [];
    return [...el.parentElement.children].filter(c=>c!==el && c.classList.contains("custom_dropdown"));
  }

  // Helper: recompute parent container height when child opens
  function updateParentHeights(child){
    let parent=child.parentElement.closest(".custom_dropdown");
    while(parent){
      const menu=parent.querySelector(":scope > .custom_dropdown_navigation");
      if(parent.classList.contains("open") && menu){
        menu.style.maxHeight=menu.scrollHeight+"px";
      }
      parent=parent.parentElement.closest(".custom_dropdown");
    }
  }

  // Second pass for Finsweet-loaded content
  setTimeout(()=>document.querySelectorAll(".custom_dropdown_navigation").forEach(m=>{m.style.maxHeight="0";}),1500);
});