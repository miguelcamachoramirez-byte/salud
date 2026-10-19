# Steering: Presentaciones HTML Interactivas

Este workspace está dedicado a crear **presentaciones en HTML** con slides navegables, animaciones y clicks interactivos — sin depender de PowerPoint ni herramientas externas.

---

## Stack y Convenciones

- **HTML5 + CSS3 + Vanilla JS** por defecto. Sin frameworks externos a menos que el usuario lo pida explícitamente.
- Cada presentación vive en su propia carpeta: `presentaciones/<nombre>/index.html`
- Un archivo `styles.css` y un `slides.js` separados dentro de cada carpeta.
- Usar **Reveal.js** si la presentación requiere features avanzadas (fragmentos, temas, notas del presentador). En ese caso cargarla desde CDN.

---

## Estructura de una Presentación Básica

```
presentaciones/
  mi-presentacion/
    index.html      ← punto de entrada
    styles.css      ← estilos de slides
    slides.js       ← lógica de navegación y clicks
    assets/         ← imágenes, videos, íconos
```

---

## Comportamiento de Navegación por Click

- Click izquierdo / tecla `→` / `Space` → siguiente slide
- Click derecho / tecla `←` → slide anterior
- Tecla `F` → fullscreen
- Tecla `Escape` → salir de fullscreen
- Mostrar siempre un indicador de progreso (ej: `3 / 10`) en la esquina inferior derecha.
- El cursor debe cambiar a `pointer` sobre el área clickeable.

---

## Diseño Visual por Defecto

- Fondo oscuro (`#0f0f1a`) con texto claro para buena legibilidad en pantalla.
- Fuentes: usar Google Fonts `Inter` para cuerpo y `Poppins` para títulos, cargadas desde CDN.
- Slides con `width: 100vw; height: 100vh` para ocupar toda la pantalla.
- Transición suave entre slides: fade o slide horizontal con CSS transitions (300ms).
- El primer slide siempre es la portada con título, subtítulo y autor.

---

## Tipos de Slide Disponibles

Al crear slides, usar estos layouts según el contenido:

| Tipo          | Descripción                                      |
|---------------|--------------------------------------------------|
| `portada`     | Título grande, subtítulo, nombre del autor       |
| `titulo`      | Solo un título de sección                        |
| `contenido`   | Título + lista de bullets                        |
| `dos-columnas`| Título + dos bloques de texto o imagen+texto     |
| `imagen`      | Imagen a full con caption opcional               |
| `codigo`      | Bloque de código con syntax highlighting         |
| `cierre`      | Slide final con mensaje y contacto               |

---

## Animaciones y Clicks Dentro de un Slide

- Los bullets pueden aparecer uno a la vez con cada click (clase `.fragmento`).
- Usar `data-step` para controlar el orden de aparición de elementos.
- Las animaciones deben ser sutiles: fade-in o slide-up, nunca distractoras.

---

## Accesibilidad Mínima

- Incluir `lang="es"` en el `<html>`.
- Cada slide tiene un `<section>` con `aria-label`.
- Imágenes siempre con `alt` descriptivo.
- Contraste de colores mínimo WCAG AA.

---

## Comandos del Proyecto

Para visualizar la presentación, abrir el archivo `index.html` directamente en el navegador o usar un servidor local:

```bash
# Con Python
python -m http.server 8080

# Con Node (si tiene live-server)
npx live-server
```

---

## Notas para Kiro

- Cuando el usuario pida una presentación nueva, preguntar: **tema, número de slides aprox. y si quiere bullets animados**.
- Siempre generar el HTML completo y funcional, listo para abrir en el navegador.
- Si el usuario pide "hacerlo más bonito", mejorar colores, gradientes y tipografía sin cambiar el contenido.
- Si pide Reveal.js, scaffoldear con la CDN oficial: `https://cdn.jsdelivr.net/npm/reveal.js`
