// ==================== УТИЛИТЫ ====================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Красивое уведомление (без дублирования стилей)
const showMessage = (message, type = 'info') => {
    $('.result-message')?.remove();

    const toast = document.createElement('div');
    toast.className = `result-message ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Принудительный reflow для анимации
    toast.offsetHeight;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 4500);
};

// ==================== ИГРЫ ====================
const puzzles = [
    { question: "Сто одежек и все без застежек", answer: "капуста" },
    { question: "Зимой и летом одним цветом", answer: "елка" },
    { question: "Не ездок, а со шпорами, не будильник, а всех будит", answer: "петух" },
    { question: "Сижу верхом, не ведаю на ком", answer: "шапка" },
    { question: "Что можно увидеть с закрытыми глазами?", answer: "сон" }
];

// Глобальные экземпляры (будут созданы после загрузки)
let puzzlesGame, guessGame;

// ==================== ИГРА "ЗАГАДКИ" ====================
class PuzzlesGame {
    constructor() {
        this.container = $('#puzzlesContainer');
        if (!this.container) return;
        this.render();
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
            <div style="text-align: center; margin-top: 2rem;">
                <button type="button" class="btn btn-success">Проверить ответы</button>
                <button type="button" class="btn" style="margin-left: 1rem;">Сбросить</button>
            </div>
        `;

        // Навешиваем обработчики уже после вставки HTML
        this.container.querySelector('.btn-success').addEventListener('click', () => this.check());
        this.container.querySelector('.btn').addEventListener('click', () => this.reset());
        this.container.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.check();
        });
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
}

// ==================== ИГРА "УГАДАЙ ЧИСЛО" ====================
class GuessNumberGame {
    constructor() {
        this.input = $('#guessInput');
        if (!this.input) return;

        this.totalAttempts = 7;
        this.multiplayer = new URLSearchParams(location.search).get('multiplayer') === 'true';
        this.reset();

        // Навешиваем события
        $('#guessButton')?.addEventListener('click', () => this.makeGuess());
        $('#restartButton')?.addEventListener('click', () => this.reset());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.makeGuess();
        });

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
        this.input.focus();

        const info = $('#multiplayerInfo');
        if (info) info.style.display = this.multiplayer ? 'block' : 'none';

        this.updateDisplay();
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
            const used = this.totalAttempts - this.attemptsLeft;
            showMessage(
                this.multiplayer
                    ? `Игрок ${this.currentPlayer} победил за ${used} ${used === 1 ? 'попытку' : 'попыток'}!`
                    : `Угадали за ${used} ${used === 1 ? 'попытку' : 'попыток'}! Число: ${this.secret}`,
                'success'
            );
            this.endGame();
            return;
        }

        if (this.attemptsLeft === 0) {
            showMessage(`Попытки кончились! Было загадано: ${this.secret}`, 'error');
            this.endGame();
            return;
        }

        const hint = guess < this.secret ? 'мало' : 'много';
        const next = this.multiplayer ? ` → Ход игрока ${this.currentPlayer === 1 ? 2 : 1}` : '';
        showMessage(`Слишком ${hint}! Осталось попыток: ${this.attemptsLeft}${next}`, 'info');

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
}

// ==================== БЛОГ ====================
const blogPosts = [
    { id: 1, title: "Мой опыт в программировании", date: "2025-11-21", content: "Сегодня я начал изучение JavaScript. Пока всё кажется сложным, но я не сдаюсь!" },
    { id: 2, title: "Почему я выбрал веб-разработку", date: "2025-11-21", content: "Веб — это магия: написал код — и сразу видишь результат в браузере..." },
    { id: 3, title: "Сложности в изучении CSS", date: "2025-11-21", content: "Сначала Flexbox и Grid казались чёрной магией, но после 100 часов практики — всё стало на свои места!" }
];

const renderBlog = () => {
    const container = $('#blogContainer');
    if (!container) return;

    container.innerHTML = blogPosts.map(post => `
        <article class="blog-post">
            <h3>${post.title}</h3>
            <time datetime="${post.date}">${new Date(post.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
            <p>${post.content}</p>
        </article>
    `).join('');
};

// ==================== ДОБАВЬ ЭТО В CSS (важно!) ====================
const toastCSS = `
    .result-message {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        min-width: 300px;
        padding: 1rem 2rem;
        border-radius: 16px;
        font-weight: 600;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 9999;
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
        pointer-events: none;
    }
    .result-message.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
    .result-message.success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    .result-message.error   { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
    .result-message.info    { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
`;
const styleTag = document.createElement('style');
styleTag.textContent = toastCSS;
document.head.appendChild(styleTag);

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен — запускаем всё');

    puzzlesGame = new PuzzlesGame();
    guessGame = new GuessNumberGame();
    renderBlog();

    // Глобальные функции (для data-атрибутов или старых кнопок)
    window.checkAllAnswers = () => puzzlesGame?.check();
    window.resetPuzzles = () => puzzlesGame?.reset();
    window.makeGuess = () => guessGame?.makeGuess();
    window.restartGame = () => guessGame?.reset();
});
