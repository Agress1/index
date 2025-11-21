// ==================== ОБЩИЕ ФУНКЦИИ ====================

function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `result-message ${type === 'success' ? 'success' : type === 'error' ? 'error' : ''}`;
    messageDiv.textContent = message;
    
    // Добавляем сообщение в начало body
    document.body.insertBefore(messageDiv, document.body.firstChild);
    
    // Автоматически удаляем через 5 секунд
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// ==================== ИГРА "ЗАГАДКИ" ====================

const puzzles = [
    { question: "Сто одежек и все без застежек", answer: "капуста" },
    { question: "Зимой и летом одним цветом", answer: "елка" },
    { question: "Не ездок, а со шпорами, не будильник, а всех будит", answer: "петух" },
    { question: "Сижу верхом, не ведаю на ком", answer: "шапка" },
    { question: "Что можно увидеть с закрытыми глазами?", answer: "сон" }
];

function checkAnswer(inputId, correctAnswer) {
    const inputElement = document.getElementById(inputId);
    if (!inputElement) return false;
    
    const userAnswer = inputElement.value.trim().toLowerCase();
    return userAnswer === correctAnswer.toLowerCase();
}

function checkAllAnswers() {
    let correctCount = 0;
    const totalPuzzles = puzzles.length;
    
    for (let i = 0; i < totalPuzzles; i++) {
        const inputId = `answer${i + 1}`;  // Исправлено: шаблонная строка
        const inputElement = document.getElementById(inputId);
        
        if (inputElement) {
            if (checkAnswer(inputId, puzzles[i].answer)) {
                correctCount++;
                inputElement.style.borderColor = '#27ae60';
                inputElement.style.backgroundColor = '#d4edda';
            } else {
                inputElement.style.borderColor = '#e74c3c';
                inputElement.style.backgroundColor = '#f8d7da';
            }
        }
    }
    
    let message = '';
    if (correctCount === totalPuzzles) {
        message = `Поздравляем! Вы отгадали все ${totalPuzzles} загадок!`;
        showMessage(message, 'success');
    } else if (correctCount > 0) {
        message = `Вы отгадали ${correctCount} из ${totalPuzzles} загадок`;
        showMessage(message, 'info');
    } else {
        message = 'Вы не отгадали ни одной загадки. Попробуйте еще раз!';
        showMessage(message, 'error');
    }
}

function generatePuzzlesPage() {
    const puzzlesContainer = document.getElementById('puzzlesContainer');
    if (!puzzlesContainer) return;
    
    let puzzlesHTML = '';
    
    puzzles.forEach((puzzle, index) => {
        puzzlesHTML += `
            <div class="puzzle-item">
                <h4>Загадка ${index + 1}</h4>
                <p>${puzzle.question}</p>
                <div class="form-group">
                    <input type="text" 
                           id="answer${index + 1}" 
                           class="form-control" 
                           placeholder="Введите ваш ответ...">
                </div>
            </div>
        `;
    });
    
    puzzlesHTML += `
        <div style="margin-top: 20px;">
            <button onclick="checkAllAnswers()" class="btn btn-success">
                Проверить ответы
            </button>
            <button onclick="resetPuzzles()" class="btn" style="margin-left: 10px;">
                Начать заново
            </button>
        </div>
    `;
    
    puzzlesContainer.innerHTML = puzzlesHTML;
}

function resetPuzzles() {
    for (let i = 1; i <= puzzles.length; i++) {
        const input = document.getElementById(`answer${i}`);  // Исправлено
        if (input) {
            input.value = '';
            input.style.borderColor = '#bdc3c7';
            input.style.backgroundColor = '';
        }
    }
    showMessage('Ответы очищены!', 'info');
}

// ==================== ИГРА "УГАДАЙ ЧИСЛО" ====================

let secretNumber;
let attemptsLeft;
const totalAttempts = 7;
let isMultiplayer = false;
let currentPlayer = 1;

function initializeGame() {
    if (!document.getElementById('guessInput')) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    isMultiplayer = urlParams.get('multiplayer') === 'true';
    
    secretNumber = Math.floor(Math.random() * 100) + 1;
    attemptsLeft = totalAttempts;
    currentPlayer = 1;
    
    updateGameDisplay();
    
    if (isMultiplayer) {
        showMessage(`Режим для двух игроков! Игрок ${currentPlayer}, ваша очередь!`, 'info');
        const multiplayerInfo = document.getElementById('multiplayerInfo');
        if (multiplayerInfo) multiplayerInfo.style.display = 'block';
    } else {
        showMessage(`Я загадал число от 1 до 100. У вас ${attemptsLeft} попыток!`, 'info');
        const multiplayerInfo = document.getElementById('multiplayerInfo');
        if (multiplayerInfo) multiplayerInfo.style.display = 'none';
    }
}

function makeGuess() {
    const guessInput = document.getElementById('guessInput');
    if (!guessInput) return;
    
    const userGuess = parseInt(guessInput.value);
    
    if (isNaN(userGuess) || userGuess < 1 || userGuess > 100) {
        showMessage('Пожалуйста, введите число от 1 до 100!', 'error');
        return;
    }
    
    attemptsLeft--;
    
    let message = '';
    if (userGuess === secretNumber) {
        if (isMultiplayer) {
            message = `Игрок ${currentPlayer} победил! Загаданное число: ${secretNumber}`;
        } else {
            message = `Поздравляем! Вы угадали число ${secretNumber} за ${totalAttempts - attemptsLeft} попыток!`;
        }
        showMessage(message, 'success');
        endGame();
    } else if (attemptsLeft === 0) {
        message = `Игра окончена! Загаданное число было: ${secretNumber}`;
        showMessage(message, 'error');
        endGame();
    } else {
        if (userGuess < secretNumber) {
            message = 'Слишком маленькое число! Попробуйте больше.';
        } else {
            message = 'Слишком большое число! Попробуйте меньше.';
        }
        
        if (isMultiplayer) {
            message += ` Осталось попыток: ${attemptsLeft} | Ход игрока ${currentPlayer === 1 ? 2 : 1}`;
            currentPlayer = currentPlayer === 1 ? 2 : 1;
        } else {
            message += ` Осталось попыток: ${attemptsLeft}`;
        }
        
        showMessage(message, 'info');
    }
    
    guessInput.value = '';
    updateGameDisplay();
}

function updateGameDisplay() {
    const attemptsElement = document.getElementById('attemptsCount');
    const playerElement = document.getElementById('currentPlayer');
    
    if (attemptsElement) attemptsElement.textContent = attemptsLeft;
    if (playerElement) playerElement.textContent = currentPlayer;
}

function endGame() {
    const guessInput = document.getElementById('guessInput');
    const guessButton = document.querySelector('button[onclick="makeGuess()"]');
    
    if (guessInput) guessInput.disabled = true;
    if (guessButton) guessButton.disabled = true;
}

function restartGame() {
    const guessInput = document.getElementById('guessInput');
    const guessButton = document.querySelector('button[onclick="makeGuess()"]');
    
    if (guessInput) {
        guessInput.disabled = false;
        guessInput.value = '';
        guessInput.focus();
    }
    if (guessButton) guessButton.disabled = false;
    
    initializeGame();
}

// ==================== БЛОГ ====================

const blogPosts = [
    {
        id: 1,
        title: "Мой опыт в программировании",
        date: "2025-11-21",
        content: "Сегодня я начал изучение JavaScript. Пока все кажется сложным."
    },
    {
        id: 2,
        title: "Почему я пошел как веб-разработку",
        date: "2025-11-21",
        content: "Я выбрал веб-разработку, потому что всегда хотел создавать что-то живое, осязаемое — то, что люди могут открыть в браузере и увидеть результат моей работы сразу же. Веб даёт именно эту магию: написал несколько строк кода — и уже появляется страница, кнопка, анимация, целое приложение. Мне нравится, что веб — это сочетание творчества и логики. С одной стороны, можно экспериментировать с дизайном, типографикой, интерфейсами. С другой — есть чёткая структура, правила, архитектура, которые нужно продумывать. Это идеальный баланс для человека, которому важны и красота, и порядок.Веб-разработка также привлекает своей динамичностью. Технологии постоянно развиваются, появляются новые фреймворки, подходы, инструменты. Здесь невозможно заскучать: всегда есть что изучать, чем улучшить себя и свои проекты. Это место, где рост — не побочный эффект, а естественная часть пути.Кроме того, веб — это свобода. Можно работать удалённо, создавать собственные проекты, участвовать в стартапах, разрабатывать сервисы, которые помогают людям. Веб открывает множество дверей — нужно лишь выбрать, через какую пойти.И, пожалуй, главное: мне нравится ощущение, что я создаю что-то полезное. Сайты, сервисы, интерфейсы — всё это становится частью чьей-то повседневной жизни. И знать, что твой код кому-то помогает — это отличная мотивация двигаться дальше."
    },
    {
        id: 3,
        title: "Сложности в изучении CSS",
        date: "2025-11-21",
        content: "Cначала казались магией, но после практики все встало на свои места. Главное - не бояться экспериментировать и постоянно практиковаться"
    }
];

function loadBlogPosts() {
    const blogContainer = document.getElementById('blogContainer');
    if (!blogContainer) return;
    
    let blogHTML = '';
    
    blogPosts.forEach(post => {
        blogHTML += `
            <div class="blog-post" style="margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
                <h3 style="color: #2c3e50; margin-bottom: 10px;">${post.title}</h3>
                <em style="color: #7f8c8d;">Опубликовано: ${post.date}</em>
                <p style="margin-top: 15px; line-height: 1.6;">${post.content}</p>
            </div>
        `;
    });
    
    blogContainer.innerHTML = blogHTML;
}

// ==================== ИНИЦИАЛИЗАЦИЯ ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализируем приложение...');
    
    generatePuzzlesPage();
    
    if (document.getElementById('guessInput')) {
        console.log('Инициализируем игру "Угадай число"');
        initializeGame();
    }
    
    loadBlogPosts();
    
    // Enter в поле угадайки
    const guessInput = document.getElementById('guessInput');
    if (guessInput) {
        guessInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') makeGuess();
        });
    }
    
    // Enter в полях загадок
    for (let i = 1; i <= puzzles.length; i++) {
        const input = document.getElementById(`answer${i}`);
        if (input) {
            input.addEventListener('keypress', function(e)
            {
                if (e.key === 'Enter') checkAllAnswers();
            });
        }
    }
});

// Экспортируем функции в глобальную область
window.showMessage = showMessage;
window.checkAllAnswers = checkAllAnswers;
window.resetPuzzles = resetPuzzles;
window.makeGuess = makeGuess;
window.restartGame = restartGame;