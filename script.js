// ==================== УТИЛИТЫ ====================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const showMessage = (message, type = 'info') => {
    // Удаляем старое сообщение, если есть
    $('.result-message')?.remove();

    const messageEl = document.createElement('div');
    messageEl.className = `result-message ${type}`;
    messageEl.textContent = message;
    messageEl.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 9999;
        padding: 1rem 2rem;
        border-radius: 12px;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        animation: slideDown 0.4s ease;
    `;

    document.body.appendChild(messageEl);

    setTimeout(() => messageEl.remove(), 5000);
};

// Анимация появления
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-100px); opacity: 0; }
        to   { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .error   { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    .info    { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
`;
document.head.appendChild(style);

// ==================== ИГРА "ЗАГАДКИ" ====================
const puzzles = [
    { question: "Сто одежек и все без застежек", answer: "капуста" },
    { question: "Зимой и летом одним цветом", answer: "елка" },
    { question: "Не ездок, а со шпорами, не будильник, а всех будит", answer: "петух" },
    { question: "Сижу верхом, не ведаю на ком", answer: "шапка" },
    { question: "Что можно увидеть с закрытыми глазами?", answer: "сон" }
];

class PuzzlesGame {
    constructor() {
        this.container = $('#puzzlesContainer');
        if (!this.container) return;
        this.render();
        this.bindEnterEvents();
    }

    render() {
        this.container.innerHTML = puzzles.map((p, i) => `
            <div class="puzzle-item">
                <h4>Загадка ${i + 1}</h4>
                <p class="question">${p.question}</p>
                <div class="form-group">
                    <input type="text" id="answer${i + 1}" class="form-control" placeholder="Ваш ответ..." autocomplete="off">
                </div>
            </div>
        `).join('') + `
            <div class="buttons" style="text-align: center; margin-top: 2rem;">
                <button class="btn btn-success" onclick="puzzlesGame.check()">Проверить ответы</button>
                <button class="btn" onclick="puzzlesGame.reset()" style="margin-left: 1rem;">Сбросить</button>
            </div>
        `;
    }

    check() {
        let correct = 0;
        puzzles.forEach((p, i) => {
            const input = $(`#answer${i + 1}`);
            const value = input.value.trim().toLowerCase();
            const isCorrect = value === p.answer.toLowerCase();

            input.style.transition = 'all 0.3s ease';
            if (isCorrect) {
                correct++;
                input.style.borderColor = '#27ae60';
                input.style.backgroundColor = '#d4edda';
            } else {
                input.style.borderColor = '#e74c3c';
                input.style.backgroundColor = '#f8d7da';
            }
        });

        const msg = correct === puzzles.length
            ? `Браво! Все ${puzzles.length} загадок отгаданы!`
            : correct > 0
                ? `Отгадано: ${correct} из ${puzzles.length}`
                : `Ни одной правильно. Попробуйте ещё!`;

        showMessage(msg, correct === puzzles.length ? 'success' : correct > 0 ? 'info' : 'error');
    }

    reset() {
        $$('#puzzlesContainer input').forEach(input => {
            input.value = '';
            input.style.borderColor = '';
            input.style.backgroundColor = '';
        });
        showMessage('Поля очищены!', 'info');
    }

    bindEnterEvents() {
        this.container.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.check();
        });
    }
}

// ==================== ИГРА "УГАДАЙ ЧИСЛО" ====================
class GuessNumberGame {
    constructor() {
        this.input = $('#guessInput');
        this.multiplayer = new URLSearchParams(location.search).get('multiplayer') === 'true';
        if (!this.input) return;

        this.totalAttempts = 7;
        this.reset();
        this.bindEvents();
        this.updateDisplay();
        showMessage(this.multiplayer
            ? `Режим на двоих! Ход игрока ${this.currentPlayer}`
            : `Загадано число от 1 до 100. У вас ${this.totalAttempts} попыток!`, 'info'
        );
    }

    reset() {
        this.secret = Math.floor(Math.random() * 100) + 1;
        this.attemptsLeft = this.totalAttempts;
        this.currentPlayer = 1;
        this.gameOver = false;
        this.input.disabled = false;
        this.input.value = '';
        this.updateDisplay();
        $('#multiplayerInfo')?.style = this.multiplayer ? 'display: block' : 'display: none';
    }

    makeGuess() {
        if (this.gameOver) return;

        const guess = parseInt(this.input.value);
        if (isNaN(guess) || guess < 1 || guess > 100) {
            showMessage('Введите число от 1 до 100!', 'error');
            return;
        }

        this.attemptsLeft--;

        if (guess === this.secret) {
            const attemptsUsed = this.totalAttempts - this.attemptsLeft;
            const msg = this.multiplayer
                ? `Игрок ${this.currentPlayer} угадал число ${this.secret} за ${attemptsUsed} попыток!`
                : `Угадали с ${attemptsUsed} попытки! Число: ${this.secret}`;
            showMessage(msg, 'success');
            this.endGame();
            return;
        }

        if (this.attemptsLeft === 0) {
            showMessage(`Попытки кончились! Было загадано: ${this.secret}`, 'error');
            this.endGame();
            return;
        }

        const hint = guess < this.secret ? 'мало' : 'много';
        const playerHint = this.multiplayer
            ? ` → Ход игрока ${this.currentPlayer === 1 ? 2 : 1}`
            : '';

        showMessage(`Слишком ${hint}! Осталось попыток: ${this.attemptsLeft}${playerHint}`, 'info');

        if (this.multiplayer) this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;

        this.updateDisplay();
        this.input.value = '';
        this.input.focus();
    }

    updateDisplay() {
        $('#attemptsCount') && ($('#attemptsCount').textContent = this.attemptsLeft);
        $('#currentPlayer') && ($('#currentPlayer').textContent = this.currentPlayer);
    }

    endGame() {
        this.gameOver = true;
        this.input.disabled = true;
    }

    bindEvents() {
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.makeGuess();
        });
    }
}

// ==================== БЛОГ ====================
const blogPosts = [
    { id: 1, title: "Мой опыт в программировании", date: "2025-11-21", content: "Сегодня я начал изучение JavaScript. Пока все кажется сложным." },
    { id: 2, title: "Почему я выбрал веб-разработку", date: "2025-11-21", content: "Я выбрал веб-разработку, потому что всегда хотел создавать что-то живое, осязаемое — то, что люди могут открыть в браузере и увидеть результат моей работы сразу же..." },
    { id: 3, title: "Сложности в изучении CSS", date: "2025-11-21", content: "Сначала казались магией, но после практики всё встало на свои места. Главное — не бояться экспериментировать!" }
];

const renderBlog = () => {
    const container = $('#blogContainer');
    if (!container) return;

    container.innerHTML = blogPosts.map(post => `
        <article class="blog-post">
            <h3>${post.title}</h3>
            <time datetime="${post.date}">${new Date(post.date).toLocaleDateString('ru-RU')}</time>
            <p>${post.content}</p>
        </article>
    `).join('');
};

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен – запускаем игры и блог');

    window.puzzlesGame = new PuzzlesGame();
    window.guessGame = new GuessNumberGame();
    renderBlog();

    // Глобальные функции для кнопок в HTML
    window.checkAllAnswers = () => puzzlesGame?.check();
    window.resetPuzzles = () => puzzlesGame?.reset();
    window.makeGuess = () => guessGame?.makeGuess();
    window.restartGame = () => guessGame?.reset();
});
