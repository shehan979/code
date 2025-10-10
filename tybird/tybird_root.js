document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("selected_location_input");
    const items = document.querySelectorAll(".location_item");
    const links = document.querySelectorAll(".location_link");
  
    // --- exit early if no input found (prevents null errors) ---
    if (!input) return;
  
    // --- live filtering (shows only matching .location_item) ---
    input.addEventListener("input", function () {
      const val = this.value.toLowerCase().trim();
      items.forEach((item) => {
        const text =
          item.querySelector(".location_text")?.getAttribute("location_value") || "";
        item.style.display = text.toLowerCase().includes(val) ? "block" : "none";
      });
    });
  
    // --- click selection (set value + trigger Finsweet search) ---
    links.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const val =
          this.querySelector(".location_text")?.getAttribute("location_value");
        if (val) {
          input.value = val;
          // trigger Finsweet CMS Search update
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
        // hide items after selection
        items.forEach((item) => (item.style.display = "none"));
      });
    });
  });
  