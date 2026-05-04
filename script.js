const leftEye = document.getElementById('left-eye');
const rightEye = document.getElementById('right-eye');
const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');

// Tu API Key de Gemini
const API_KEY = "AIzaSyDQS_9xHC8Hn2Y6AkFg-8klHBcQyF0cW-8";

// 1. SEGUIMIENTO DE MIRADA: El ojo completo se mueve
document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 70; 
    const y = (e.clientY / window.innerHeight - 0.5) * 45;
    
    [leftEye, rightEye].forEach(eye => {
        if (!eye.classList.contains('blink')) {
            // Mueve y rota un poco para dar efecto 3D
            eye.style.transform = `translate(${x}px, ${y}px) rotateY(${x/3}deg) rotateX(${-y/3}deg)`;
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
    }, 5000); 
}

// 3. IA: Mirar el entorno y reaccionar
async function analyzeSense() {
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
                        { text: "Mira la cara del usuario y su entorno. Si parece enojado o insulta, responde ENOJO. Si se asusta, SUSTO. Si todo está normal, NORMAL. Responde solo una palabra." },
                        { inline_data: { mime_type: "image/jpeg", data: base64Image } }
                    ]
                }]
            })
        });
        const data = await response.json();
        const mood = data.candidates[0].content.parts[0].text.trim().toUpperCase();
        applyMood(mood);
    } catch (err) {
        console.log("Conectando con el cerebro de ByNode...");
    }
}

function applyMood(mood) {
    [leftEye, rightEye].forEach(el => el.classList.remove('angry', 'scared'));

    if (mood === 'ENOJO') {
        leftEye.classList.add('angry');
        rightEye.classList.add('angry');
    } else if (mood === 'SUSTO') {
        leftEye.classList.add('scared');
        rightEye.classList.add('scared');
    }
}

// 4. INICIAR TODO
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => { video.srcObject = stream; })
    .catch(err => alert("Patrón, acepte la cámara para que ByNode vea."));

startBlinking();
setInterval(analyzeSense, 4000); // Analiza cada 4 segundos