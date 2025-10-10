document.addEventListener("DOMContentLoaded", function () {
  const navItems = document.querySelectorAll(".v2_slider_nav-item");
  const contentItems = document.querySelectorAll(".v2_slider_content-item");
  const leftArrow = document.querySelector(".v2_slider_arow.left");
  const rightArrow = document.querySelector(".v2_slider_arow.right");

  let currentIndex = 0;

  function normalizeIndex(index, total) {
    return (index + total) % total;
  }

  function updateSlider(index) {
    const total = contentItems.length;
    index = normalizeIndex(index, total);
    currentIndex = index;

    navItems.forEach((item, i) => {
      const line = item.querySelector(".v2_slider_move-line");

      line.classList.remove("active");
      item.classList.remove("next", "next-next");
      item.setAttribute("aria-selected", i === index ? "true" : "false");

      if (i === index) {
        line.classList.add("active");
      } else if (i === normalizeIndex(index + 1, total)) {
        item.classList.add("next");
      } else if (i === normalizeIndex(index + 2, total)) {
        item.classList.add("next-next");
      }
    });

    contentItems.forEach((item, i) => {
      item.classList.toggle("active", i === index);
    });
  }

  navItems.forEach((item, i) => {
    item.addEventListener("click", () => updateSlider(i));
  });

  leftArrow.addEventListener("click", (e) => {
    e.preventDefault();
    updateSlider(currentIndex - 1);
  });

  rightArrow.addEventListener("click", (e) => {
    e.preventDefault();
    updateSlider(currentIndex + 1);
  });

  updateSlider(currentIndex);
});
