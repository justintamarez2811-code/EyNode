const leftEye = document.getElementById('left-eye');
const rightEye = document.getElementById('right-eye');
const video = document.getElementById('webcam');
const API_KEY = "AIzaSyDQS_9xHC8Hn2Y6AkFg-8klHBcQyF0cW-8";

const faceMesh = new FaceMesh({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
});

faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5 });

faceMesh.onResults((results) => {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        // Obtenemos el punto central de la cara
        const face = results.multiFaceLandmarks[0][1]; 
        const x = (face.x - 0.5) * -150; // Invertido para que sea espejo
        const y = (face.y - 0.5) * 100;

        [leftEye, rightEye].forEach(eye => {
            eye.style.transform = `translate(${x}px, ${y}px)`;
        });
    }
});

async function startApp() {
    document.getElementById('overlay').style.display = 'none';
    const camera = new Camera(video, {
        onFrame: async () => { await faceMesh.send({image: video}); },
        width: 640, height: 480
    });
    camera.start();
    startListening();
}

// IA que responde con voz dominicana
async function askGemini(text) {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Responde corto, inteligente y con jerga dominicana a: ${text}` }] }]
            })
        });
        const data = await res.json();
        const msg = data.candidates[0].content.parts[0].text;
        
        const voice = new SpeechSynthesisUtterance(msg);
        voice.lang = 'es-MX'; 
        window.speechSynthesis.speak(voice);
    } catch (e) { console.log("Error de conexión"); }
}

function startListening() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'es-DO';
    recognition.onresult = (e) => askGemini(e.results[0][0].transcript);
    recognition.onend = () => recognition.start();
    recognition.start();
}