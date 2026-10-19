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

    // AnimaciÃ³n salida
    anterior.classList.add('saliendo');
    anterior.classList.remove('activo');

    // Preparar entrada desde direcciÃ³n correcta
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
      return true; // ConsumiÃ³ el click en fragmento
    }
    return false; // No hay mÃ¡s fragmentos, avanzar slide
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
      // Ignorar clicks dentro del juego interactivo (los maneja el juego)
      if (e.target.closest('#juego-sm')) return;
      siguiente();
    });

    // Click derecho = anterior
    slide.addEventListener('contextmenu', (e) => {
      // No interferir con el juego
      if (e.target.closest('#juego-sm')) return;
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
    // Si el slide activo es el del juego, las flechas son para el juego, no para navegar
    const slideActivo = slides[indiceActual];
    const enJuego = slideActivo && slideActivo.dataset.tipo === 'juego';
    if (enJuego && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      return;
    }
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
      btnFs.textContent = 'â›¶';
      btnFs.title = 'Salir de fullscreen (Esc)';
    } else {
      document.exitFullscreen();
    }
  }

  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      btnFs.textContent = 'â›¶';
      btnFs.title = 'Pantalla completa (F)';
    }
  });

  // ===== Swipe (tÃ¡ctil) =====
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

  // ===== Ocultar hint despuÃ©s de 4 segundos =====
  setTimeout(() => hint.classList.add('oculto'), 4000);

  // ===== Init =====
  actualizarUI();

  // ===== JUEGO CANVAS: Equilibra el Bienestar =====
  initJuegoCanvas();
})();

// ===== JUEGO EN CANVAS: Equilibra el Bienestar =====
function initJuegoCanvas() {
  const canvas = document.getElementById('jc-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const BUENOS = ['💚', '😊', '🧘', '☕', '🌱'];
  const MALOS  = ['💢', '😰', '🔥', '⏰', '💸'];

  let base, items, score, tiempo, estado, ultimo, acumSpawn, raf;

  function reset() {
    base = { x: W / 2 - 55, y: H - 34, w: 110, h: 16 };
    items = []; score = 0; tiempo = 60; acumSpawn = 0;
    estado = 'jugando'; ultimo = performance.now();
  }

  function spawn() {
    const bueno = Math.random() < 0.6;
    const arr = bueno ? BUENOS : MALOS;
    items.push({
      x: 30 + Math.random() * (W - 60), y: -20,
      vy: 110 + Math.random() * 90,
      emoji: arr[(Math.random() * arr.length) | 0], bueno
    });
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - ultimo) / 1000); ultimo = now;
    if (estado === 'jugando') {
      tiempo -= dt;
      acumSpawn += dt;
      if (acumSpawn > 0.7) { acumSpawn = 0; spawn(); }
      items.forEach(it => it.y += it.vy * dt);
      // Colisiones
      items = items.filter(it => {
        if (it.y > base.y - 14 && it.y < base.y + base.h &&
            it.x > base.x - 16 && it.x < base.x + base.w + 16) {
          score += it.bueno ? 10 : -15;
          return false;
        }
        return it.y < H + 30;
      });
      if (score < 0) score = 0;
      if (tiempo <= 0) { tiempo = 0; estado = 'fin'; }
    }
    dibujar();
    raf = requestAnimationFrame(loop);
  }

  function dibujar() {
    ctx.clearRect(0, 0, W, H);
    // Fondo
    ctx.fillStyle = '#0b1714';
    ctx.fillRect(0, 0, W, H);
    // Items
    ctx.font = '28px serif'; ctx.textAlign = 'center';
    items.forEach(it => ctx.fillText(it.emoji, it.x, it.y));
    // Base
    ctx.fillStyle = '#5eead4';
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(base.x, base.y, base.w, base.h, 8); ctx.fill(); }
    else ctx.fillRect(base.x, base.y, base.w, base.h);
    // HUD
    ctx.fillStyle = '#eaf4ef'; ctx.textAlign = 'left';
    ctx.font = 'bold 20px Poppins, sans-serif';
    ctx.fillText('Bienestar: ' + score, 20, 34);
    ctx.textAlign = 'right';
    ctx.fillText('⏱ ' + Math.ceil(tiempo) + 's', W - 20, 34);

    if (estado === 'fin') {
      ctx.fillStyle = 'rgba(5,20,16,0.82)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center'; ctx.fillStyle = '#5eead4';
      ctx.font = 'bold 40px Poppins, sans-serif';
      ctx.fillText('Puntaje: ' + score, W / 2, H / 2 - 24);
      ctx.fillStyle = '#eaf4ef'; ctx.font = '18px Inter, sans-serif';
      const msg = score >= 300 ? 'Equipo saludable y equilibrado' :
                  score >= 150 ? 'Buen manejo, sigue cuidando el bienestar' :
                                 'Cuidado: el estrés le ganó al equipo';
      ctx.fillText(msg, W / 2, H / 2 + 12);
      ctx.fillStyle = '#86efac'; ctx.font = 'bold 16px Poppins, sans-serif';
      ctx.fillText('Clic para jugar de nuevo', W / 2, H / 2 + 48);
    }
  }

  // Controles
  function moverMouse(e) {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * (W / r.width);
    base.x = Math.max(0, Math.min(W - base.w, x - base.w / 2));
  }
  canvas.addEventListener('mousemove', (e) => { e.stopPropagation(); moverMouse(e); });
  canvas.addEventListener('click', (e) => {
    e.stopPropagation();
    if (estado === 'fin') { reset(); }
  });
  const slideJuego = canvas.closest('.slide');
  document.addEventListener('keydown', (e) => {
    if (!slideJuego || !slideJuego.classList.contains('activo')) return;
    if (e.key === 'ArrowLeft') base.x = Math.max(0, base.x - 40);
    if (e.key === 'ArrowRight') base.x = Math.min(W - base.w, base.x + 40);
  });

  reset();
  raf = requestAnimationFrame(loop);
}
