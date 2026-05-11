# Narbis - PWA de ojos interactivos

Una aplicación web progresiva que mantiene unos ojos animados escuchando tu voz mientras la página está abierta.

## Cómo funciona

- Usa reconocimiento de voz (`SpeechRecognition`) para escuchar mientras la página está abierta.
- Debes decir `Narbis` y luego tu mensaje para que la app responda.
- La app responde con una IA simulada y los ojos parpadean/reaccionan.
- También incluye un `service worker` para funcionar como PWA.

## Archivos principales

- `index.html` - Interfaz visual y estructura.
- `styles.css` - Estilos del diseño y los ojos.
- `app.js` - Lógica de voz, respuesta y animaciones.
- `manifest.json` - Configuración de la PWA.
- `sw.js` - Service worker para cacheo.
- `icon.svg` - Icono de la aplicación.

## Probarlo

1. Abre un servidor local (por ejemplo con Live Server o `npx serve`).
2. Abre la página en Chrome o Edge.
3. Permite el micrófono cuando el navegador lo pida.
4. Di `Narbis` y luego tu pregunta o comando.

> Nota: el reconocimiento de voz funciona mejor en Chrome/Edge y necesita `https` o `localhost`.
