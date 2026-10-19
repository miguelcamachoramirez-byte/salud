(() => {
  const slides      = Array.from(document.querySelectorAll('.slide'));
  const totalSlides = slides.length;
  let indiceActual  = 0;
  let transitando   = false;

  const progreso = document.getElementById('progreso');
  const hint     = document.getElementById('hint');
  const btnPrev  = document.getElementById('btn-prev');
  const btnNext  = document.getElementById('btn-next');
  const btnFs    = document.getElementById('btn-fs');

  const barra = document.createElement('div');
  barra.id = 'barra-progreso';
  document.body.appendChild(barra);

  function getFragmentos(slide) {
    return Array.from(slide.querySelectorAll('.fragmento'))
      .sort((a, b) => (parseInt(a.dataset.step) || 0) - (parseInt(b.dataset.step) || 0));
  }

  function actualizarUI() {
    progreso.textContent = `${indiceActual + 1} / ${totalSlides}`;
    barra.style.width = `${((indiceActual + 1) / totalSlides) * 100}%`;
  }

  function mostrarSlide(idx, dir = 'adelante') {
    if (transitando) return;
    transitando = true;

    const saliente  = slides[indiceActual];
    const entrante  = slides[idx];

    getFragmentos(entrante).forEach(f => f.classList.remove('visible'));

    saliente.classList.add('saliendo');
    saliente.classList.remove('activo');

    entrante.style.transform = dir === 'adelante' ? 'translateX(60px)' : 'translateX(-60px)';
    entrante.style.opacity   = '0';
    entrante.style.pointerEvents = 'none';

    requestAnimationFrame(() => requestAnimationFrame(() => {
      entrante.style.transform = '';
      entrante.style.opacity   = '';
      entrante.classList.add('activo');

      setTimeout(() => {
        saliente.classList.remove('saliendo');
        saliente.style.transform = '';
        saliente.style.opacity   = '';
        transitando = false;
      }, 380);
    }));

    indiceActual = idx;
    actualizarUI();
  }

  function avanzarFragmento() {
    const pendientes = getFragmentos(slides[indiceActual]).filter(f => !f.classList.contains('visible'));
    if (pendientes.length > 0) { pendientes[0].classList.add('visible'); return true; }
    return false;
  }

  function siguiente() {
    if (avanzarFragmento()) return;
    if (indiceActual < totalSlides - 1) mostrarSlide(indiceActual + 1, 'adelante');
  }

  function anterior() {
    if (indiceActual > 0) mostrarSlide(indiceActual - 1, 'atras');
  }

  slides.forEach(slide => {
    slide.addEventListener('click', e => { if (!e.target.closest('#controles')) siguiente(); });
    slide.addEventListener('contextmenu', e => { e.preventDefault(); anterior(); });
  });

  btnNext.addEventListener('click', e => { e.stopPropagation(); siguiente(); });
  btnPrev.addEventListener('click', e => { e.stopPropagation(); anterior(); });
  btnFs.addEventListener('click',   e => { e.stopPropagation(); toggleFs(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); siguiente(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); anterior(); }
    else if (e.key === 'f' || e.key === 'F') toggleFs();
    else if (e.key === 'Escape' && document.fullscreenElement) document.exitFullscreen();
  });

  function toggleFs() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen();
  }

  let touchX = 0;
  document.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend',   e => {
    const d = touchX - e.changedTouches[0].clientX;
    if (Math.abs(d) > 50) { if (d > 0) siguiente(); else anterior(); }
  }, { passive: true });

  setTimeout(() => hint.classList.add('oculto'), 4000);
  actualizarUI();
})();
