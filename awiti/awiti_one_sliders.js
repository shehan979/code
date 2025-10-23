document.addEventListener("DOMContentLoaded", () => {
  const sliderRoots = document.querySelectorAll('.fun_sliders');
  if (!sliderRoots.length) return;

  sliderRoots.forEach(root => {
    const viewport = root.querySelector('.fun_slider_viewport') || root;
    const track    = root.querySelector('.fun_slider_mask');
    const slides   = Array.from(root.querySelectorAll('.fun_slide'));
    const navs     = Array.from(root.querySelectorAll('.fun_slide_nav .fun_nav'));
    const prevBtn  = root.querySelector('.fun_slide_left_arow');
    const nextBtn  = root.querySelector('.fun_slide_right_arow');
    const contentBoxes = Array.from(root.querySelectorAll('.fun_slide_content_box'));

    const AUTOPLAY_MS = 6000;
    let index = 0;
    let w = 0;
    let timer = null;
    let animating = false;

    // --- sizing ---
    function sizeSlides(){
      w = viewport.clientWidth;
      slides.forEach(s => s.style.width = w + 'px');
      track.style.width = (slides.length * w) + 'px';
      jumpTo(index);
    }

    function imagesReady(){
      return Promise.all(slides.map(s=>{
        const img = s.querySelector('img');
        if(!img || img.complete) return Promise.resolve();
        return new Promise(res=>{
          img.addEventListener('load', res, {once:true});
          img.addEventListener('error', res, {once:true});
        });
      }));
    }

    function setActiveNav(i){
      navs.forEach((n, k)=>{
        n.classList.toggle('is-active', k===i);
        const line = n.querySelector('.fun_nav_active_line');
        if(line){
          line.style.transition = 'none';
          line.style.width = '0%';
          line.offsetHeight;
          if(k===i){
            line.style.transition = `width ${AUTOPLAY_MS}ms linear`;
            line.style.width = '100%';
          }
        }
      });
    }

    function setActiveContent(i){
      contentBoxes.forEach((box,k)=>{
        box.classList.toggle('is-active', k === i);
      });
    }

    function clamp(i){ const n = slides.length; return (i % n + n) % n; }

    function jumpTo(i){
      index = clamp(i);
      track.style.transition = 'none';
      track.style.transform = `translate3d(${-index * w}px,0,0)`;
      setActiveNav(index);
      setActiveContent(index);
      requestAnimationFrame(()=>{ track.style.transition = 'transform .6s ease'; });
    }

    function goTo(i){
      if(animating) return;
      index = clamp(i);
      animating = true;
      track.style.transform = `translate3d(${-index * w}px,0,0)`;
      setActiveNav(index);
      setActiveContent(index);
      setTimeout(()=>{ animating = false; }, 650);
      restartAutoplay();
    }

    function next(){ goTo(index+1); }
    function prev(){ goTo(index-1); }

    function restartAutoplay(){
      if(timer) clearTimeout(timer);
      timer = setTimeout(next, AUTOPLAY_MS);
    }

    root.addEventListener('mouseenter', ()=>{ if(timer) clearTimeout(timer); });
    root.addEventListener('mouseleave', restartAutoplay);

    document.addEventListener('visibilitychange', ()=>{
      if(document.hidden){ if(timer) clearTimeout(timer); }
      else restartAutoplay();
    });

    if(nextBtn) nextBtn.addEventListener('click', e=>{ e.preventDefault(); next(); });
    if(prevBtn) prevBtn.addEventListener('click', e=>{ e.preventDefault(); prev(); });
    navs.forEach((n,i)=> n.addEventListener('click', e=>{ e.preventDefault(); goTo(i); }));

    const ro = new ResizeObserver(sizeSlides);
    ro.observe(viewport);

    imagesReady().then(()=>{
      sizeSlides();
      jumpTo(0);
      restartAutoplay();
    });
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const sliderRoots = document.querySelectorAll('.ent_sliders');
  if (!sliderRoots.length) return;

  sliderRoots.forEach(root => {
    const activeWrap   = root.querySelector('.ent_slider_active_wrap');
    const inactiveWrap = root.querySelector('.ent_slide_inactive_wrap');
    const contentWrap  = root.querySelector('.ent_slide_content_wrap');
    const contents     = Array.from(contentWrap.querySelectorAll('.one_slide_content'));
    const dots         = Array.from(root.querySelectorAll('.slider_icon'));

    // Arrows (right arrow class is on the IMG in your markup)
    const leftArrow  = root.querySelector('.slide_arow_left');
    const rightArrow = (root.querySelector('.slide_arow_right') || {})
                        .closest ? root.querySelector('.slide_arow_right').closest('a') : null;

    let index = 0; // which .one_slide_content is active

    function updateUI() {
      contents.forEach((el, i) => {
        if (i === index) el.classList.add('is-active');
        else el.classList.remove('is-active');
        el.style.position = i === index ? 'relative' : 'absolute';
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }

    function moveRight() {
      const next = inactiveWrap.querySelector('.ent_slide');
      if (!next) return;
      const current = activeWrap.querySelector('.ent_slide');
      inactiveWrap.appendChild(current);
      activeWrap.appendChild(next);
      index = (index + 1) % contents.length;
      updateUI();
    }

    function moveLeft() {
      const next = inactiveWrap.querySelector('.ent_slide:last-child');
      if (!next) return;
      const current = activeWrap.querySelector('.ent_slide');
      inactiveWrap.insertBefore(current, inactiveWrap.firstChild);
      activeWrap.appendChild(next);
      index = (index - 1 + contents.length) % contents.length;
      updateUI();
    }

    // Arrow clicks
    if (leftArrow)  leftArrow.addEventListener('click', e => { e.preventDefault(); moveLeft(); });
    if (rightArrow) rightArrow.addEventListener('click', e => { e.preventDefault(); moveRight(); });

    // Dot clicks
    dots.forEach((dot, i) => {
      dot.addEventListener('click', e => {
        e.preventDefault();
        const diff = (i - index + contents.length) % contents.length;
        if (diff === 1) moveRight();
        else if (diff === 2) moveLeft();
      });
    });

    // First render
    updateUI();
  });
});


document.addEventListener("DOMContentLoaded", function () {
  const sliderRoots = document.querySelectorAll(".v2_slider_rotate");
  if (!sliderRoots.length) return;

  sliderRoots.forEach((root) => {
    const links = root.querySelectorAll(".v2_slider_rotate_link");
    const contents = root.querySelectorAll(".v2_slider_rotate_content-on-item");
    const leftArrow = root.querySelector(".v2_slider_rotate-arow.left");
    const rightArrow = root.querySelector(".v2_slider_rotate-arow.right");

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
    if (leftArrow) {
      leftArrow.addEventListener("click", function (e) {
        e.preventDefault();
        const newIndex = (currentIndex - 1 + links.length) % links.length;
        updateSlider(newIndex);
      });
    }

    if (rightArrow) {
      rightArrow.addEventListener("click", function (e) {
        e.preventDefault();
        const newIndex = (currentIndex + 1) % links.length;
        updateSlider(newIndex);
      });
    }
  });
});


document.addEventListener("DOMContentLoaded", function () {
  const sliderRoots = document.querySelectorAll(".v2_slider");
  if (!sliderRoots.length) return;

  sliderRoots.forEach((root) => {
    const navItems = root.querySelectorAll(".v2_slider_nav-item");
    const contentItems = root.querySelectorAll(".v2_slider_content-item");
    const leftArrow = root.querySelector(".v2_slider_arow.left");
    const rightArrow = root.querySelector(".v2_slider_arow.right");

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

        // Reset all classes
        line?.classList.remove("active");
        item.classList.remove("active", "next", "next-next", "next-next-next");
        item.setAttribute("aria-selected", i === index ? "true" : "false");

        if (i === index) {
          line?.classList.add("active");
          item.classList.add("active");
        } else if (i === normalizeIndex(index + 1, total)) {
          item.classList.add("next");
        } else if (i === normalizeIndex(index + 2, total)) {
          item.classList.add("next-next");
        } else if (i === normalizeIndex(index + 3, total)) {
          item.classList.add("next-next-next");
        }
      });

      contentItems.forEach((item, i) => {
        item.classList.toggle("active", i === index);
      });
    }

    // Click on nav items
    navItems.forEach((item, i) => {
      item.addEventListener("click", () => updateSlider(i));
    });

    // Arrows
    if (leftArrow) {
      leftArrow.addEventListener("click", (e) => {
        e.preventDefault();
        updateSlider(currentIndex - 1);
      });
    }

    if (rightArrow) {
      rightArrow.addEventListener("click", (e) => {
        e.preventDefault();
        updateSlider(currentIndex + 1);
      });
    }

    // Initialize
    updateSlider(currentIndex);
  });
});
