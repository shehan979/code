document.addEventListener("DOMContentLoaded", () => {
  console.log("🟢 Delegated multi-level dropdown fix");

  // all menus start closed
  document.querySelectorAll(".custom_dropdown_navigation").forEach(m=>{
    m.style.maxHeight="0";
    m.style.overflow="hidden";
    m.style.transition="max-height .3s ease";
  });
  document.querySelectorAll(".custom_dropdown_close_icon").forEach(i=>{
    i.style.transition="transform .3s ease";
    i.style.transform="rotate(0deg)";
  });

  // one delegated click handler works for everything, including CMS-loaded nodes
  document.addEventListener("click", e=>{
    const toggle = e.target.closest(".custom_dropdown_toggle");
    if (!toggle || e.target.closest("a")) return;   // skip link clicks
    e.preventDefault(); e.stopPropagation();

    const dropdown = toggle.closest(".custom_dropdown");
    const menu     = dropdown.querySelector(":scope > .custom_dropdown_navigation");
    const icon     = dropdown.querySelector(":scope > .custom_dropdown_close_icon");
    const levelCls = Array.from(dropdown.classList).find(c=>c.startsWith("dropdown-lv"));

    // close siblings of same level
    if (levelCls) {
      document.querySelectorAll(`.${levelCls}.open`).forEach(sib=>{
        if (sib!==dropdown){
          closeDropdown(sib);
          sib.querySelectorAll(".custom_dropdown.open").forEach(closeDropdown); // also close children
        }
      });
    }

    // toggle current
    if (dropdown.classList.contains("open")) closeDropdown(dropdown);
    else openDropdown(dropdown);

    adjustParents(dropdown);
  });

  function openDropdown(d){
    const m=d.querySelector(":scope > .custom_dropdown_navigation");
    const i=d.querySelector(":scope > .custom_dropdown_close_icon");
    d.classList.add("open");
    if(m)m.style.maxHeight=m.scrollHeight+"px";
    if(i)i.style.transform="rotate(-90deg)";
  }

  function closeDropdown(d){
    const m=d.querySelector(":scope > .custom_dropdown_navigation");
    const i=d.querySelector(":scope > .custom_dropdown_close_icon");
    d.classList.remove("open");
    if(m)m.style.maxHeight="0";
    if(i)i.style.transform="rotate(0deg)";
  }

  function adjustParents(child){
    let parent=child.parentElement.closest(".custom_dropdown");
    while(parent){
      const menu=parent.querySelector(":scope > .custom_dropdown_navigation");
      if(parent.classList.contains("open") && menu){
        menu.style.maxHeight=menu.scrollHeight+"px";
      }
      parent=parent.parentElement.closest(".custom_dropdown");
    }
  }
});