const transcriptText = document.getElementById('transcriptText');
const responseText = document.getElementById('responseText');
const responseBubble = document.getElementById('responseBubble');
const installButton = document.getElementById('installButton');
const pupils = document.querySelectorAll('.pupil');
const cameraFeed = document.getElementById('cameraFeed');
const eyes = document.querySelectorAll('.eye');
let deferredPrompt = null;

function setText(element, message) {
  if (element) {
    element.textContent = message;
  }
}

function setResponse(message) {
  setText(responseText, message);
  setText(responseBubble, message);
}

function speakMessage(message) {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'es-ES';
  utterance.rate = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function blinkEyes() {
  eyes.forEach(eye => eye.classList.add('blink'));
  setTimeout(() => eyes.forEach(eye => eye.classList.remove('blink')), 180);
}

function startAutoBlink() {
  setInterval(() => {
    blinkEyes();
  }, 5000);
}
  eyes.forEach(eye => eye.classList.add('react'));
  setTimeout(() => eyes.forEach(eye => eye.classList.remove('react')), 900);
}

function getAiResponse(prompt) {
  const message = prompt.toLowerCase();
  if (message.includes('hola') || message.includes('buenos') || message.includes('buenas')) {
    return 'Hola, aquí Narbis. ¿Qué necesitas hoy?';
  }
  if (message.includes('cómo estás') || message.includes('como estas') || message.includes('qué tal')) {
    return 'Estoy bien, escuchando todo lo que dices mientras esta página esté abierta.';
  }
  if (message.includes('qué puedes hacer') || message.includes('puedes hacer')) {
    return 'Puedo responderte, parpadear mis ojos y reaccionar cuando digas Narbis antes de tu mensaje.';
  }
  if (message.includes('gracias')) {
    return 'De nada, listo para más comandos cuando quieras.';
  }
  return `Entendido: ${prompt}. Estoy trabajando en tu petición.`;
}

function handleNarbisCommand(text) {
  const prompt = text.trim();
  if (!prompt) {
    setResponse('Dime algo después de Narbis para que pueda responder.');
    speakMessage('Dime algo después de Narbis para que pueda responder.');
    blinkEyes();
    return;
  }

  const aiAnswer = getAiResponse(prompt);
  setResponse(aiAnswer);
  speakMessage(aiAnswer);
  reactEyes();
}

function updatePupilPosition(x, y) {
  const maxOffset = 18;
  const offsetX = Math.max(-1, Math.min(1, x)) * maxOffset;
  const offsetY = Math.max(-1, Math.min(1, y)) * maxOffset;
  pupils.forEach(pupil => {
    pupil.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
  });
}

function mapFaceToPupils(face) {
  if (!cameraFeed || cameraFeed.videoWidth === 0 || cameraFeed.videoHeight === 0) return;
  const centerX = face.left + face.width / 2;
  const centerY = face.top + face.height / 2;
  const normalizedX = (centerX / cameraFeed.videoWidth - 0.5) * 2;
  const normalizedY = (centerY / cameraFeed.videoHeight - 0.5) * 2;
  updatePupilPosition(normalizedX, normalizedY);
}

async function trackFace() {
  if (!cameraFeed || !('FaceDetector' in window)) return;
  const detector = new FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
  const loop = async () => {
    if (cameraFeed.readyState >= 2) {
      try {
        const faces = await detector.detect(cameraFeed);
        if (faces.length) {
          mapFaceToPupils(faces[0].boundingBox);
        }
      } catch (error) {
        console.warn('FaceDetector falló:', error);
      }
    }
    requestAnimationFrame(loop);
  };
  loop();
}

function parseTranscript(transcript) {
  const normalized = transcript.toLowerCase();
  const trigger = 'narbis';
  const index = normalized.indexOf(trigger);
  if (index !== -1) {
    const command = transcript.slice(index + trigger.length).trim();
    handleNarbisCommand(command);
  }
}

function startRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    setText(transcriptText, 'Tu navegador no soporta reconocimiento de voz.');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onresult = event => {
    const results = Array.from(event.results).map(r => r[0].transcript).join(' ');
    setText(transcriptText, results);
    if (event.results[event.results.length - 1].isFinal) {
      parseTranscript(results);
    }
  };

  recognition.onerror = event => {
    console.error('Speech recognition error:', event.error);
    setText(transcriptText, `Error de voz: ${event.error}`);
    blinkEyes();
  };

  recognition.onend = () => {
    setTimeout(() => {
      try {
        recognition.start();
      } catch (error) {
        console.error(error);
      }
    }, 300);
  };

  try {
    recognition.start();
  } catch (error) {
    console.error('No se pudo iniciar el reconocimiento:', error);
  }
}

window.addEventListener('load', () => {
  document.documentElement.style.background = '#000';
  document.body.style.background = '#000';
  startRecognition();
  startCameraTracking();
  startAutoBlink();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW falló', err));
  }
});

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredPrompt = event;
  if (installButton) {
    installButton.style.display = 'block';
  }
});

if (installButton) {
  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    deferredPrompt = null;
    installButton.style.display = 'none';
    if (result.outcome === 'accepted') {
      console.log('App instalada');
    }
  });
}

window.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    setText(responseBubble, 'Vuelve cuando quieras; sigo listo.');
  }
});
