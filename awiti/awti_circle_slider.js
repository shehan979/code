document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll(".v2_slider_rotate_link");
  const contents = document.querySelectorAll(".v2_slider_rotate_content-on-item");
  const leftArrow = document.querySelector(".v2_slider_rotate-arow.left");
  const rightArrow = document.querySelector(".v2_slider_rotate-arow.right");

  let currentIndex = 0;

  function updateSlider(index) {
    links.forEach((link, i) => {
      const iconWrap = link.querySelector(".v2_slider_rotate_link-icon");
      const activeIcon = link.querySelector(".v2_slider_rotate_link-active-icon");
      const text = link.querySelector(".v2_slider_rotate_link-text");

      if (i === index) {
        // Active styles
        iconWrap.style.backgroundColor = "#006acf";
        iconWrap.style.boxShadow = "none";
        activeIcon.style.opacity = "1";
        text.style.color = "#006acf";
        link.classList.add("active");
      } else {
        // Inactive styles
        iconWrap.style.backgroundColor = "transparent";
        iconWrap.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
        activeIcon.style.opacity = "0";
        text.style.color = "#757575";
        link.classList.remove("active");
      }
    });

    contents.forEach((content, i) => {
      if (i === index) {
        content.style.opacity = "1";
        content.style.position = "static";
        content.style.zIndex = "2";
      } else {
        content.style.opacity = "0";
        content.style.position = "absolute";
        content.style.zIndex = "1";
      }
    });

    currentIndex = index;
  }

  // Initial setup
  updateSlider(currentIndex);

  // Link click behavior
  links.forEach((link, i) => {
    link.addEventListener("click", function () {
      updateSlider(i);
    });
  });

  // Arrow navigation
  leftArrow.addEventListener("click", function (e) {
    e.preventDefault();
    const newIndex = (currentIndex - 1 + links.length) % links.length;
    updateSlider(newIndex);
  });

  rightArrow.addEventListener("click", function (e) {
    e.preventDefault();
    const newIndex = (currentIndex + 1) % links.length;
    updateSlider(newIndex);
  });
});