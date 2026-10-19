(() => {
  // ===== Estado =====
  const slides       = Array.from(document.querySelectorAll('.slide'));
  const totalSlides  = slides.length;
  let   indiceActual = 0;
  let   stepActual   = 0;
  let   transitando  = false;

  // ===== Elementos UI =====
  const progreso     = document.getElementById('progreso');
  const hint         = document.getElementById('hint');
  const btnPrev      = document.getElementById('btn-prev');
  const btnNext      = document.getElementById('btn-next');
  const btnFs        = document.getElementById('btn-fs');

  // Barra de progreso superior
  const barra = document.createElement('div');
  barra.id = 'barra-progreso';
  document.body.appendChild(barra);

  // ===== Helpers =====
  function getFragmentos(slide) {
    return Array.from(slide.querySelectorAll('.fragmento'))
      .sort((a, b) => (parseInt(a.dataset.step) || 0) - (parseInt(b.dataset.step) || 0));
  }

  function actualizarUI() {
    progreso.textContent = `${indiceActual + 1} / ${totalSlides}`;
    barra.style.width    = `${((indiceActual + 1) / totalSlides) * 100}%`;
  }

  function mostrarSlide(idx, direccion = 'adelante') {
    if (transitando) return;
    transitando = true;

    const anterior = slides[indiceActual];
    const siguiente = slides[idx];

    // Resetear fragmentos del nuevo slide
    getFragmentos(siguiente).forEach(f => f.classList.remove('visible'));
    stepActual = 0;

    // Animación salida
    anterior.classList.add('saliendo');
    anterior.classList.remove('activo');

    // Preparar entrada desde dirección correcta
    if (direccion === 'adelante') {
      siguiente.style.transform = 'translateX(60px)';
    } else {
      siguiente.style.transform = 'translateX(-60px)';
    }
    siguiente.style.opacity = '0';
    siguiente.style.pointerEvents = 'none';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        siguiente.style.transform = '';
        siguiente.style.opacity   = '';
        siguiente.classList.add('activo');

        setTimeout(() => {
          anterior.classList.remove('saliendo');
          anterior.style.transform = '';
          anterior.style.opacity   = '';
          transitando = false;
        }, 380);
      });
    });

    indiceActual = idx;
    actualizarUI();
  }

  function avanzarFragmento() {
    const fragmentos = getFragmentos(slides[indiceActual]);
    const siguientes = fragmentos.filter(f => !f.classList.contains('visible'));

    if (siguientes.length > 0) {
      // Mostrar el siguiente fragmento en orden
      const proximo = siguientes[0];
      proximo.classList.add('visible');
      stepActual++;
      return true; // Consumió el click en fragmento
    }
    return false; // No hay más fragmentos, avanzar slide
  }

  function siguiente() {
    // Primero intenta mostrar fragmento
    if (avanzarFragmento()) return;
    // Si ya no hay fragmentos, va al siguiente slide
    if (indiceActual < totalSlides - 1) {
      mostrarSlide(indiceActual + 1, 'adelante');
    }
  }

  function anterior() {
    if (indiceActual > 0) {
      mostrarSlide(indiceActual - 1, 'atras');
    }
  }

  // ===== Eventos: Click en slide =====
  slides.forEach(slide => {
    slide.addEventListener('click', (e) => {
      // Ignorar clicks en botones de control
      if (e.target.closest('#controles')) return;
      siguiente();
    });

    // Click derecho = anterior
    slide.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      anterior();
    });
  });

  // ===== Botones de control =====
  btnNext.addEventListener('click', (e) => { e.stopPropagation(); siguiente(); });
  btnPrev.addEventListener('click', (e) => { e.stopPropagation(); anterior(); });

  btnFs.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFullscreen();
  });

  // ===== Teclado =====
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
        e.preventDefault();
        siguiente();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        anterior();
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
      case 'Escape':
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        break;
    }
  });

  // ===== Fullscreen =====
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      btnFs.textContent = '⛶';
      btnFs.title = 'Salir de fullscreen (Esc)';
    } else {
      document.exitFullscreen();
    }
  }

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      btnFs.textContent = '⛶';
      btnFs.title = 'Pantalla completa (F)';
    }
  });

  // ===== Swipe (táctil) =====
  let touchStartX = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) siguiente();
      else anterior();
    }
  }, { passive: true });

  // ===== Ocultar hint después de 4 segundos =====
  setTimeout(() => hint.classList.add('oculto'), 4000);

  // ===== Init =====
  actualizarUI();
})();
