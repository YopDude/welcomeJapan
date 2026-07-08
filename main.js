const correctImgs = ['images/kitsune-happy-1.png', 'images/kitsune-happy-2.png'];
const wrongImgs = ['images/kitsune-sad-1.png', 'images/kitsune-sad-2.png'];
const summaryImgs = {
    low: 'images/kitsune-summary-low.png',
    mid: 'images/kitsune-summary-mid.png',
    quickPerfect: 'images/kitsune-quick-perfect.png',
    finalPerfect: 'images/kitsune-final-perfect.png'
};

// List all Kitsune images
const imagesToPreload = [
    'images/kitsune-kun.png',
    'images/kitsune-happy-1.png',
    'images/kitsune-happy-2.png',
    'images/kitsune-sad-1.png',
    'images/kitsune-sad-2.png',
    'images/kitsune-summary-low.png',
    'images/kitsune-summary-mid.png',
    'images/kitsune-quick-perfect.png',
    'images/kitsune-final-perfect.png'
];

function preloadImages(imageArray) {
    imageArray.forEach((url) => {
        const img = new Image();
        img.src = url;
    });
}

// Call the function when the page loads
window.addEventListener('load', () => {
    preloadImages(imagesToPreload);
});

let state = { currentIdx: 0, score: 0, results: [] };
let activeQuizData = [];
let quizMode = 'quick';
let currentAudio = null; // Track active audio[cite: 10]

window.addEventListener('DOMContentLoaded', () => {
    // Check storage immediately on load
    if (localStorage.getItem('hasDownloadedCheatSheet') === 'true') {
        const hintGuide = document.getElementById('hint-guide');
        if (hintGuide) {
            hintGuide.classList.add('hidden'); // Ensure class is applied
            hintGuide.style.display = 'none'; // Force hide via style for safety
        }
    }
});

function markAsDownloaded() {
    localStorage.setItem('hasDownloadedCheatSheet', 'true');
    const hintGuide = document.getElementById('hint-guide');
    if (hintGuide) {
        hintGuide.classList.add('hidden');
        hintGuide.style.display = 'none'; // Force hide immediately upon click
    }
}

function updateKitsune(type) {
    const img = document.querySelector('img[alt="Kitsune-kun"]');
    if (type === 'correct') img.src = correctImgs[Math.floor(Math.random() * correctImgs.length)];
    else if (type === 'wrong') img.src = wrongImgs[Math.floor(Math.random() * wrongImgs.length)];
}

function startQuiz(mode) {
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('counter').classList.remove('hidden');
    quizMode = mode;
    
    // Shuffle questions and then shuffle options for each question[cite: 10]
    let baseData = (mode === 'quick') ? [...quizData].sort(() => 0.5 - Math.random()).slice(0, 5) : [...quizData];
    activeQuizData = baseData.map(q => ({
        ...q,
        o: [...q.o].sort(() => 0.5 - Math.random()) // Shuffle options[cite: 10]
    }));
    
    state = { currentIdx: 0, score: 0, results: [] };
    renderQuestion();
}

function playAudio(file) { 
    if (currentAudio) {
        currentAudio.pause(); // Stop previous audio[cite: 10]
        currentAudio.currentTime = 0;
    }
    if(file) {
        currentAudio = new Audio(`audio/${file}`);
        currentAudio.play();
    }
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
                    <button onclick="playAudio('${opt.audio}')" class="bg-white text-sky-600 px-4 rounded-xl hover:bg-sky-100 shadow-sm">🔊</button>
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

function renderSummary(mode) {
    document.getElementById('counter').innerText = "Quiz Finished!";
    const percentage = (state.score / activeQuizData.length) * 100;
    const img = document.querySelector('img[alt="Kitsune-kun"]');
    img.src = (percentage < 30) ? summaryImgs.low : (percentage >= 80) ? (mode === 'quick' ? summaryImgs.quickPerfect : summaryImgs.finalPerfect) : summaryImgs.mid;
    document.getElementById('quiz-content').innerHTML = `
        <h2 class="text-2xl mb-4 text-center font-bold text-sky-900">Score: ${state.score} / ${activeQuizData.length}</h2>
        <div class="max-h-60 overflow-y-auto mb-4">${state.results.map(r => `<div class="mb-4 p-3 bg-white/40 rounded-xl"><p class="font-bold text-sky-900">${r.q}</p><p class="${r.correct ? 'text-emerald-700' : 'text-rose-700'} font-bold">${r.correct ? '✓ Correct!' : `❌ Your answer: ${r.selected} (Correct: ${r.correctAns})`}</p></div>`).join('')}</div>
        <button onclick="location.reload()" class="w-full bg-white text-sky-600 p-3 rounded-xl font-bold border-2 border-sky-600 mb-2 hover:bg-sky-50 transition">Back to Home</button>
    `;
}