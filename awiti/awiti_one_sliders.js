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