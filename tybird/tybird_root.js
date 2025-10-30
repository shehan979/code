document.addEventListener("DOMContentLoaded", function () {
  console.log("✅ DOM fully loaded and script initialized.");

  const input = document.getElementById("selected_location_input");
  const listWrap = document.querySelector(".location_list");
  const closeBtnWrap = document.querySelector(".close_btn_path_wrap");
  const closeBtn = document.querySelector(".close_btn_path");

  if (!input || !listWrap) {
    console.warn("⚠️ Missing input or list wrapper — script stopped.");
    return;
  }

  // --- helper: bind logic to items ---
  function bindLocationEvents(contextLabel = "Initial") {
    console.log(`🔄 Binding location events for ${contextLabel} items...`);

    const items = listWrap.querySelectorAll(".location_item");
    const links = listWrap.querySelectorAll(".location_link");

    console.log(`➡️ Found ${items.length} items and ${links.length} links to bind.`);

    // remove previous input listener to avoid duplicates
    input.removeEventListener("input", handleFilter);
    input.addEventListener("input", handleFilter);

    // remove existing click listeners before re-adding
    links.forEach((link) => {
      link.removeEventListener("click", handleLocationClick);
      link.addEventListener("click", handleLocationClick);
    });

    console.log(`✅ Event binding complete for ${contextLabel}.`);
  }

  // --- filter logic ---
  function handleFilter() {
    const val = this.value.toLowerCase().trim();
    const items = listWrap.querySelectorAll(".location_item");
    let visibleCount = 0;

    items.forEach((item) => {
      const text =
        item.querySelector(".location_text")?.getAttribute("location_value") || "";
      const match = text.toLowerCase().includes(val);
      item.style.display = match ? "block" : "none";
      if (match) visibleCount++;
    });

    console.log(`🔍 Filter input: "${val}" → ${visibleCount} items visible.`);

    // show/hide close button
    closeBtnWrap.style.display = val ? "flex" : "none";
  }

  // --- click selection ---
  function handleLocationClick(e) {
    e.preventDefault();
    const val = this.querySelector(".location_text")?.getAttribute("location_value");
    console.log(`🖱️ Location clicked: ${val}`);

    if (val) {
      input.value = val;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // hide list after selection
    const items = listWrap.querySelectorAll(".location_item");
    items.forEach((item) => (item.style.display = "none"));
    closeBtnWrap.style.display = "flex";

    console.log("📦 All items hidden after selection.");
  }

  // --- close/reset button ---
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      console.log("❌ Close button clicked — resetting input and showing all items.");
      input.value = "";
      const items = listWrap.querySelectorAll(".location_item");
      items.forEach((item) => (item.style.display = "block"));
      closeBtnWrap.style.display = "none";
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  } else {
    console.warn("⚠️ No close button found in DOM.");
  }

  // --- bind once initially ---
  bindLocationEvents("Initial");

  // --- rebind after Finsweet loads new items ---
  document.addEventListener("fs-cmsload", function (e) {
    const listEl = e.detail?.list;
    if (listEl && listEl.matches(".location_list")) {
      console.log("♻️ Finsweet CMS Load detected — rebinding for new page...");
      bindLocationEvents("Newly Loaded");
    } else {
      console.log("ℹ️ fs-cmsload event fired, but not for .location_list");
    }
  });

  console.log("🚀 Script setup complete.");
});
