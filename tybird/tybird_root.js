//tybird location filters
document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("selected_location_input");
  const listWrap = document.querySelector(".location_list");

  if (!input || !listWrap) return;

  // === Function to bind events to all current location items ===
  function bindLocationEvents() {
    const items = listWrap.querySelectorAll(".location_item");
    const links = listWrap.querySelectorAll(".location_link");

    // --- live filtering ---
    input.addEventListener("input", function () {
      const val = this.value.toLowerCase().trim();
      items.forEach((item) => {
        const text =
          item.querySelector(".location_text")?.getAttribute("location_value") || "";
        item.style.display = text.toLowerCase().includes(val) ? "block" : "none";
      });
    });

    // --- click selection ---
    links.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const val =
          this.querySelector(".location_text")?.getAttribute("location_value");
        if (val) {
          input.value = val;
          input.dispatchEvent(new Event("input", { bubbles: true })); // trigger Finsweet filter
        }
        items.forEach((item) => (item.style.display = "none"));
      });
    });
  }

  // === Run once initially ===
  bindLocationEvents();

  // === Re-bind after Finsweet loads new items ===
  document.addEventListener("fs-cmsload", function (e) {
    if (e.detail?.list?.matches?.(".location_list")) {
      bindLocationEvents();
    }
  });
});