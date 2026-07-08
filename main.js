// Image variants
const correctImgs = ['images/kitsune-happy-1.png', 'images/kitsune-happy-2.png'];
const wrongImgs = ['images/kitsune-sad-1.png', 'images/kitsune-sad-2.png'];
const summaryImgs = {
    low: 'images/kitsune-summary-low.png',
    mid: 'images/kitsune-summary-mid.png',
    quickPerfect: 'images/kitsune-quick-perfect.png',
    finalPerfect: 'images/kitsune-final-perfect.png'
};

let state = { currentIdx: 0, score: 0, results: [] };
let activeQuizData = [];
let quizMode = 'quick'; // Keeps track of current mode

function updateKitsune(type) {
    const img = document.querySelector('img[alt="Kitsune-kun"]');
    if (type === 'correct') {
        img.src = correctImgs[Math.floor(Math.random() * correctImgs.length)];
    } else if (type === 'wrong') {
        img.src = wrongImgs[Math.floor(Math.random() * wrongImgs.length)];
    }
}

function startQuiz(mode) {
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('counter').classList.remove('hidden');
    quizMode = mode;
    
    if (mode === 'quick') {
        let shuffled = [...quizData].sort(() => 0.5 - Math.random());
        activeQuizData = shuffled.slice(0, Math.min(5, shuffled.length));
    } else {
        activeQuizData = [...quizData];
    }
    
    state = { currentIdx: 0, score: 0, results: [] };
    renderQuestion();
}

function updateCounter() {
    document.getElementById('counter').innerText = `Question ${state.currentIdx + 1} of ${activeQuizData.length}`;
}

// New function to play audio
function playAudio(file) {
    const audio = new Audio(file);
    audio.play();
}

function renderQuestion() {
    updateCounter();
    const q = activeQuizData[state.currentIdx];
    const content = document.getElementById('quiz-content');
    
    content.innerHTML = `
        <h2 class="text-xl mb-6 font-bold text-sky-900">${q.q}</h2>
        <div class="grid gap-3">
            ${q.o.map(opt => `
                <div class="flex gap-2">
                    <button onclick="handleAnswer('${opt}')" class="flex-grow bg-white text-sky-600 p-3 rounded-xl hover:bg-sky-100 transition shadow-sm font-bold">${opt}</button>
                    ${q.audio ? `<button onclick="playAudio('${q.audio}')" class="bg-white text-sky-600 px-4 rounded-xl hover:bg-sky-100 shadow-sm">🔊</button>` : ''}
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

    if (state.currentIdx < activeQuizData.length) {
        renderQuestion();
    } else {
        renderSummary(quizMode);
    }
    updateSpeech(text);
}

function updateSpeech(text) {
    const bubble = document.getElementById('kitsune-speech');
    bubble.innerText = text;
}

function renderSummary(mode) {
    document.getElementById('counter').innerText = "Quiz Finished!";
    const percentage = (state.score / activeQuizData.length) * 100;
    const img = document.querySelector('img[alt="Kitsune-kun"]');
    
    // Summary Image Logic
    if (percentage < 30) {
        img.src = summaryImgs.low;
    } else if (percentage >= 80) {
        img.src = (mode === 'quick') ? summaryImgs.quickPerfect : summaryImgs.finalPerfect;
    } else {
        img.src = summaryImgs.mid;
    }

    const content = document.getElementById('quiz-content');
    const reviewItems = state.results.map(r => `
        <div class="mb-4 p-3 bg-white/40 rounded-xl">
            <p class="font-bold text-sky-900">${r.q}</p>
            <p class="${r.correct ? 'text-emerald-700' : 'text-rose-700'} font-bold">
                ${r.correct ? '✓ Correct!' : `❌ Your answer: ${r.selected} (Correct: ${r.correctAns})`}
            </p>
        </div>
    `).join('');

    content.innerHTML = `
        <h2 class="text-2xl mb-4 text-center font-bold text-sky-900">Score: ${state.score} / ${activeQuizData.length}</h2>
        <div class="max-h-60 overflow-y-auto mb-4">${reviewItems}</div>
        <button onclick="location.reload()" class="w-full bg-white text-sky-600 p-3 rounded-xl font-bold border-2 border-sky-600 mb-2 hover:bg-sky-50 transition">Back to Home</button>
        <a href="Japan_Survival_Cheat_Sheet.pdf" download class="block text-center w-full bg-sky-600 text-white p-3 rounded-xl font-bold hover:bg-sky-700 transition">Download Cheat-Sheet</a>
    `;
}