const leftEye = document.getElementById('left-eye');
const rightEye = document.getElementById('right-eye');
const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');

const API_KEY = "AIzaSyDQS_9xHC8Hn2Y6AkFg-8klHBcQyF0cW-8";

// 1. MOVIMIENTO REALISTA: El ojo entero se mueve
document.addEventListener('mousemove', (e) => {
    // Calculamos la posición del mouse
    const x = (e.clientX / window.innerWidth - 0.5) * 60; // Desplazamiento lateral
    const y = (e.clientY / window.innerHeight - 0.5) * 40; // Desplazamiento vertical
    
    // Aplicamos el movimiento a los ojos
    [leftEye, rightEye].forEach(eye => {
        if (!eye.classList.contains('blink')) {
            eye.style.transform = `translate(${x}px, ${y}px) rotateY(${x/2}deg) rotateX(${-y/2}deg)`;
        }
    });
});

// 2. PESTAÑEO: Cada 5 segundos exactos
function startBlinking() {
    setInterval(() => {
        leftEye.classList.add('blink');
        rightEye.classList.add('blink');
        
        setTimeout(() => {
            leftEye.classList.remove('blink');
            rightEye.classList.remove('blink');
        }, 150);
    }, 5000); // 5000ms = 5 segundos
}

// 3. IA: Detectar entorno y emociones
async function checkEmotions() {
    if (!video.videoWidth) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Analiza al usuario. Si parece molesto o insulta, responde ENOJO. Si se ve asustado, SUSTO. Si todo está bien, NORMAL. Solo una palabra." },
                        { inline_data: { mime_type: "image/jpeg", data: base64Image } }
                    ]
                }]
            })
        });
        const data = await response.json();
        const mood = data.candidates[0].content.parts[0].text.trim().toUpperCase();
        
        updateMood(mood);
    } catch (err) { console.log("Reintentando IA..."); }
}

function updateMood(mood) {
    // Limpiamos estados
    [leftEye, rightEye].forEach(el => el.classList.remove('angry', 'scared'));

    if (mood === 'ENOJO') {
        leftEye.classList.add('angry');
        rightEye.classList.add('angry');
    } else if (mood === 'SUSTO') {
        leftEye.classList.add('scared');
        rightEye.classList.add('scared');
    }
}

// Iniciar todo
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(s => { video.srcObject = s; })
    .catch(e => console.log("Activa la cámara, patrón"));

startBlinking();
setInterval(checkEmotions, 4000); // Chequea cada 4 segundos