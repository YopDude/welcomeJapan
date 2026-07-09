// Image arrays must be defined globally so functions can access them
const correctImgs = ['images/kitsune-happy-1.png', 'images/kitsune-happy-2.png', 'images/kitsune-happy-3.png'];
const wrongImgs = ['images/kitsune-sad-1.png', 'images/kitsune-sad-2.png', 'images/kitsune-sad-3.png'];
const summaryImgs = {
    low: 'images/kitsune-summary-low.png',
    mid: 'images/kitsune-summary-mid.png',
    quickPerfect: 'images/kitsune-quick-perfect.png',
    finalPerfect: 'images/kitsune-final-perfect.png',
    zero: 'images/kitsune-extra.png'
};

const imagesToPreload = [
    'images/kitsune-kun.png', 'images/kitsune-happy-1.png', 'images/kitsune-happy-2.png', 
    'images/kitsune-happy-3.png', 'images/kitsune-sad-1.png', 'images/kitsune-sad-2.png', 
    'images/kitsune-sad-3.png', 'images/kitsune-summary-low.png', 'images/kitsune-summary-mid.png', 
    'images/kitsune-quick-perfect.png', 'images/kitsune-final-perfect.png', 'images/kitsune-extra.png', 
    'images/kitsune-matsuri.png', 'images/kitsune-lazy.png'
];

function preloadImages() {
    imagesToPreload.forEach((src) => {
        const img = new Image();
        img.src = src;
    });
}

// Call it once at the start to preload all images
preloadImages();

let state = { currentIdx: 0, score: 0, results: [], firstCorrect: true };
let activeQuizData = [];
let quizMode = 'quick';
let currentAudio = null;

function updateKitsune(type) {
    const img = document.querySelector('img[alt="Kitsune-kun"]');
    
    if (type === 'correct') {
        if (state.firstCorrect) {
            img.src = 'images/kitsune-happy-2.png';
            state.firstCorrect = false; // Disable the forced first-time trigger
        } else {
            img.src = correctImgs[Math.floor(Math.random() * correctImgs.length)];
        }
    } else if (type === 'wrong') {
        img.src = wrongImgs[Math.floor(Math.random() * wrongImgs.length)];
    }
}

function startQuiz(mode) {
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('counter').classList.remove('hidden');
    quizMode = mode;
    
    let baseData = (mode === 'quick') ? [...quizData].sort(() => 0.5 - Math.random()).slice(0, 5) : [...quizData];
    activeQuizData = baseData.map(q => ({
        ...q,
        o: [...q.o].sort(() => 0.5 - Math.random())
    }));
    
    state = { currentIdx: 0, score: 0, results: [], firstCorrect: true };
    renderQuestion();
}

function backToHome() {
    document.getElementById('quiz-content').innerHTML = '';
    document.getElementById('counter').classList.add('hidden');
    document.getElementById('home-screen').classList.remove('hidden');
    document.querySelector('img[alt="Kitsune-kun"]').src = 'images/kitsune-kun.png';
    // Check if we need to apply the "extra" state (this will swap the image if unlocked)
    checkUnlockStatus();
    document.getElementById('kitsune-speech').innerText = "Konnichiwa! Ready to explore Japan?";
}

function handleBackToHome() {
    backToHome();
}

function playAudio(file) { 
    if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
    if(file) { currentAudio = new Audio(`audio/${file}`); currentAudio.play(); }
}

function renderQuestion() {
    document.getElementById('counter').innerText = `Question ${state.currentIdx + 1} of ${activeQuizData.length}`;
    const q = activeQuizData[state.currentIdx];
    document.getElementById('quiz-content').innerHTML = `
        <h2 class="text-xl mb-6 font-bold text-sky-900">${q.q}</h2>
        <div class="grid gap-3">
            ${q.o.map(opt => `
                <div class="flex gap-2">
                    <button onclick="handleAnswer('${opt.text}')" class="flex-grow bg-white text-sky-600 p-3 rounded-xl hover:bg-sky-100 transition shadow-sm font-bold">${opt.text}</button>
                    <button onclick="playAudio('${opt.audio}')" class="bg-white text-sky-600 px-3 py-2 rounded-xl hover:bg-sky-100 shadow-sm flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.5c-.88 0-1.6-.72-1.6-1.6V9.85c0-.88.72-1.6 1.6-1.6h2.25z" />
                    </svg>
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

function handleAnswer(selected) {
    const q = activeQuizData[state.currentIdx];
    const isCorrect = selected === q.a;
    if (isCorrect) {
        state.score++;
        updateKitsune('correct');
        document.getElementById('kitsune-speech').innerText = `Sugoi! Correct! ${q.tip}`;
    } else {
        updateKitsune('wrong');
        document.getElementById('kitsune-speech').innerHTML = `Not quite! The correct answer was: <b>${q.a}</b>. ${q.tip}`;
    }
    state.results.push({ q: q.q, selected: selected, correct: isCorrect, correctAns: q.a });
    state.currentIdx++;
    (state.currentIdx < activeQuizData.length) ? renderQuestion() : renderSummary(quizMode);
}

function checkUnlockStatus() {
    const isUnlocked = localStorage.getItem('extrasUnlocked') === 'true';
    const kitsuneImg = document.querySelector('img[alt="Kitsune-kun"]');
    if (isUnlocked) {
        // Unlock button visibility
        const extraBtn = document.getElementById('extras-btn');
        if (extraBtn) extraBtn.classList.remove('hidden');
        
        // Add star to Final Exam button
        const finalBtn = document.querySelector('button[onclick="startQuiz(\'final\')"]');
        if (finalBtn && !finalBtn.innerText.includes('★')) finalBtn.innerText += ' ★';

        // Change sprite on home screen
        kitsuneImg.src = 'images/kitsune-matsuri.png';
    }
}

function renderSummary(mode) {
    document.getElementById('counter').innerText = "Quiz Finished!";
    const percentage = (state.score / activeQuizData.length) * 100;
    
    // Check if user passed the 85% threshold in Final mode
    if (mode === 'final' && percentage >= 85) {
        // Only show the message if it wasn't already unlocked
        if (localStorage.getItem('extrasUnlocked') !== 'true') {
            document.getElementById('kitsune-speech').innerText = "Sugoi! You've unlocked the secret extras! Check the home screen!";
            localStorage.setItem('extrasUnlocked', 'true');
            checkUnlockStatus();
        }
    }
    const img = document.querySelector('img[alt="Kitsune-kun"]'); // Score config for final image
    img.src = (percentage === 0) ? summaryImgs.zero :
          (percentage < 30) ? summaryImgs.low : 
          (percentage >= 85) ? (mode === 'quick' ? summaryImgs.quickPerfect : summaryImgs.finalPerfect) : 
          summaryImgs.mid;

    document.getElementById('quiz-content').innerHTML = `
        <h2 class="text-2xl mb-4 text-center font-bold text-sky-900">Score: ${state.score} / ${activeQuizData.length}</h2>
        <div class="max-h-60 overflow-y-auto mb-4">${state.results.map(r => `<div class="mb-4 p-3 bg-white/40 rounded-xl"><p class="font-bold text-sky-900">${r.q}</p><p class="${r.correct ? 'text-emerald-700' : 'text-rose-700'} font-bold">${r.correct ? '✓ Correct!' : `❌ Your answer: ${r.selected} (Correct: ${r.correctAns})`}</p></div>`).join('')}</div>
        <button onclick="handleBackToHome()" class="w-full bg-sky-600 text-white p-4 rounded-xl font-bold hover:bg-sky-700 transition">Back to Home</button>
    `;
}

let idleTimer;
let lastSpeech = "Konnichiwa! Ready to explore Japan? Check out the Cheat-Sheet below!";
let lastImgSrc = 'images/kitsune-kun.png'; // Initialize with the default image
const IDLE_TIME = 33000;

function resetIdleTimer() {
    clearTimeout(idleTimer);
    const kitsuneImg = document.querySelector('img[alt="Kitsune-kun"]');
    const speechBubble = document.getElementById('kitsune-speech');
    
    // If we were idle, restore the previous state using innerHTML
    if (kitsuneImg.src.includes('kitsune-lazy.png')) {
        kitsuneImg.src = lastImgSrc;
        speechBubble.innerHTML = lastSpeech; // Use innerHTML to preserve bold tags
    }
    
    idleTimer = setTimeout(() => {
        // Save the current HTML (including formatting tags)
        lastSpeech = speechBubble.innerHTML;
        lastImgSrc = kitsuneImg.src;
        
        kitsuneImg.src = 'images/kitsune-lazy.png';
        speechBubble.innerText = "zzz..."; // Plain text for "zzz" is fine
    }, IDLE_TIME);
}

// Listen for user activity
['mousedown', 'keydown', 'touchstart'].forEach(evt => 
    document.addEventListener(evt, resetIdleTimer, false)
);

// Initialize timer
resetIdleTimer();

window.onload = checkUnlockStatus;