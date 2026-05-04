const leftEye = document.getElementById('left-eye');
const rightEye = document.getElementById('right-eye');
const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const API_KEY = "AIzaSyDQS_9xHC8Hn2Y6AkFg-8klHBcQyF0cW-8";

let isAppStarted = false;

async function startApp() {
    document.getElementById('overlay').style.display = 'none';
    isAppStarted = true;
    
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    video.srcObject = stream;
    
    startBlinking();
    startListening();
    setInterval(thinkAndSee, 5000); // Analiza cada 5 segundos
}

// 1. Pestañeo cada 5 segundos
function startBlinking() {
    setInterval(() => {
        leftEye.classList.add('blink');
        rightEye.classList.add('blink');
        setTimeout(() => {
            leftEye.classList.remove('blink');
            rightEye.classList.remove('blink');
        }, 150);
    }, 5000);
}

// 2. Escuchar voz y convertir a texto
function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-DO';
    recognition.continuous = true;

    recognition.onresult = (event) => {
        const text = event.results[event.results.length - 1][0].transcript;
        askGemini(text);
    };
    recognition.start();
}

// 3. Hablar con Gemini
async function askGemini(prompt) {
    canvas.width = 300; canvas.height = 300;
    canvas.getContext('2d').drawImage(video, 0, 0, 300, 300);
    const image = canvas.toDataURL('image/jpeg').split(',')[1];

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: `Eres ByNode. Mira esta imagen y responde a: "${prompt}". Responde corto y dominicano.` },
                        { inline_data: { mime_type: "image/jpeg", data: image } }
                    ]
                }]
            })
        });
        const data = await response.json();
        const reply = data.candidates[0].content.parts[0].text;
        speak(reply);
    } catch (e) { console.error(e); }
}

// 4. Voz de la App
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    utterance.onstart = () => {
        leftEye.classList.add('talking');
        rightEye.classList.add('talking');
    };
    utterance.onend = () => {
        leftEye.classList.remove('talking');
        rightEye.classList.remove('talking');
    };
    window.speechSynthesis.speak(utterance);
}

// 5. Mirar alrededor (Personas u Objetos)
async function thinkAndSee() {
    if (!isAppStarted) return;
    
    // Aquí simulamos que los ojos se mueven buscando cosas
    const randomX = (Math.random() - 0.5) * 100;
    const randomY = (Math.random() - 0.5) * 60;
    
    [leftEye, rightEye].forEach(eye => {
        eye.style.transform = `translate(${randomX}px, ${randomY}px)`;
    });
}