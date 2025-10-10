// Game Classes
class Game2048 {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('best2048') || '0');
        this.moves = 0;
        this.gameOver = false;
    }

    init() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.moves = 0;
        this.gameOver = false;
        this.addRandomTile();
        this.addRandomTile();
        this.updateDisplay();
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({i, j});
                }
            }
        }

        if (emptyCells.length > 0) {
            const {i, j} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[i][j] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    move(direction) {
        if (this.gameOver) return false;

        let moved = false;

        switch(direction) {
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
        }

        if (moved) {
            this.moves++;
            this.addRandomTile();
            this.updateDisplay();
            
            if (this.isGameOver()) {
                this.gameOver = true;
                if (window.app && window.app.showNotification) {
                    window.app.showNotification('💔 Игра окончена! Попробуйте еще раз.');
                }
            }
            
            // Save best score
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem('best2048', this.bestScore.toString());
                if (window.app && window.app.stats) {
                    window.app.stats.bestScores['neuron-2048'] = this.bestScore;
                    window.app.saveStats();
                }
                if (window.app && window.app.showNotification) {
                    window.app.showNotification('🎉 Новый рекорд!');
                }
            }
            
            if (window.app && window.app.addXP) {
                window.app.addXP(1);
            }
        }

        return moved;
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            const row = this.grid[i].filter(cell => cell !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j + 1, 1);
                    moved = true;
                }
            }
            while (row.length < 4) row.push(0);
            if (JSON.stringify(this.grid[i]) !== JSON.stringify(row)) moved = true;
            this.grid[i] = row;
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let i = 0; i < 4; i++) {
            const row = this.grid[i].filter(cell => cell !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j - 1, 1);
                    moved = true;
                }
            }
            while (row.length < 4) row.unshift(0);
            if (JSON.stringify(this.grid[i]) !== JSON.stringify(row)) moved = true;
            this.grid[i] = row;
        }
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let j = 0; j < 4; j++) {
            let column = [];
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== 0) column.push(this.grid[i][j]);
            }
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i + 1, 1);
                    moved = true;
                }
            }
            while (column.length < 4) column.push(0);
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== column[i]) moved = true;
                this.grid[i][j] = column[i];
            }
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let j = 0; j < 4; j++) {
            let column = [];
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== 0) column.push(this.grid[i][j]);
            }
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i - 1, 1);
                    moved = true;
                }
            }
            while (column.length < 4) column.unshift(0);
            for (let i = 0; i < 4; i++) {
                if (this.grid[i][j] !== column[i]) moved = true;
                this.grid[i][j] = column[i];
            }
        }
        return moved;
    }

    isGameOver() {
        // Check for empty cells
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.grid[i][j] === 0) return false;
            }
        }

        // Check for possible merges
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const current = this.grid[i][j];
                if ((i < 3 && current === this.grid[i + 1][j]) ||
                    (j < 3 && current === this.grid[i][j + 1])) {
                    return false;
                }
            }
        }

        return true;
    }

    updateDisplay() {
        const gridElement = document.getElementById('grid2048');
        if (!gridElement) return;

        gridElement.innerHTML = '';

        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                if (this.grid[i][j] !== 0) {
                    tile.textContent = this.grid[i][j];
                    const tileClass = `tile-${this.grid[i][j]}`;
                    if (this.grid[i][j] <= 2048) {
                        tile.classList.add(tileClass);
                    } else {
                        tile.classList.add('tile-2048');
                    }
                }
                gridElement.appendChild(tile);
            }
        }

        if (document.getElementById('score2048')) {
            document.getElementById('score2048').textContent = this.score;
        }
        if (document.getElementById('moves2048')) {
            document.getElementById('moves2048').textContent = this.moves;
        }
        if (document.getElementById('best2048')) {
            document.getElementById('best2048').textContent = this.bestScore;
        }
    }
}

class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameStarted = false;
        this.timer = 0;
        this.timerInterval = null;
    }

    init() {
        const symbols = ['🚀', '⭐', '🎮', '💻', '🎯', '🧩', '🎨', '🎵'];
        this.cards = [...symbols, ...symbols];
        this.shuffleCards();
        this.matchedPairs = 0;
        this.moves = 0;
        this.flippedCards = [];
        this.gameStarted = false;
        this.timer = 0;
        
        this.render();
        this.updateDisplay();
    }

    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    render() {
        const grid = document.getElementById('gridMemory');
        if (!grid) return;

        grid.innerHTML = '';
        
        this.cards.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.index = index;
            card.innerHTML = `
                <div class="front">${symbol}</div>
                <div class="back">?</div>
            `;
            card.addEventListener('click', () => this.flipCard(index));
            grid.appendChild(card);
        });
    }

    flipCard(index) {
        if (!this.gameStarted) {
            this.startGame();
        }

        const card = document.querySelector(`.memory-card[data-index="${index}"]`);
        if (!card || card.classList.contains('flipped') || this.flippedCards.length >= 2) {
            return;
        }

        card.classList.add('flipped');
        this.flippedCards.push({ index, symbol: this.cards[index] });

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.checkMatch();
        }

        this.updateDisplay();
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.symbol === card2.symbol) {
            // Match found
            this.matchedPairs++;
            this.flippedCards = [];
            
            if (this.matchedPairs === this.cards.length / 2) {
                this.endGame();
            }
            
            if (window.app && window.app.addXP) {
                window.app.addXP(2);
            }
        } else {
            // No match
            setTimeout(() => {
                const card1Element = document.querySelector(`.memory-card[data-index="${card1.index}"]`);
                const card2Element = document.querySelector(`.memory-card[data-index="${card2.index}"]`);
                if (card1Element) card1Element.classList.remove('flipped');
                if (card2Element) card2Element.classList.remove('flipped');
                this.flippedCards = [];
            }, 1000);
        }
    }

    startGame() {
        this.gameStarted = true;
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateDisplay();
        }, 1000);
    }

    endGame() {
        clearInterval(this.timerInterval);
        if (window.app && window.app.showNotification) {
            window.app.showNotification(`🎉 Поздравляем! Вы нашли все пары за ${this.timer} секунд!`);
        }
        if (window.app && window.app.addXP) {
            window.app.addXP(10);
        }
    }

    updateDisplay() {
        if (document.getElementById('pairsFound')) {
            document.getElementById('pairsFound').textContent = this.matchedPairs;
        }
        if (document.getElementById('attemptsCount')) {
            document.getElementById('attemptsCount').textContent = this.moves;
        }
        if (document.getElementById('timerMemory')) {
            document.getElementById('timerMemory').textContent = this.timer;
        }
    }
}

class TypingGame {
    constructor() {
        this.texts = [
            "Neuron Ecosystem создает инновационные проекты для образования и развлечений.",
            "Программирование это искусство создания цифровых миров и решения сложных задач.",
            "Игры развивают логическое мышление, креативность и стратегическое планирование."
        ];
        this.currentText = '';
        this.currentCharIndex = 0;
        this.startTime = 0;
        this.timerInterval = null;
        this.timeLeft = 60;
        this.isPlaying = false;
    }

    init() {
        this.currentText = this.texts[Math.floor(Math.random() * this.texts.length)];
        this.currentCharIndex = 0;
        this.timeLeft = 60;
        this.isPlaying = false;
        
        this.renderText();
        this.updateDisplay();
        
        const input = document.getElementById('typingInput');
        if (input) {
            input.value = '';
            input.disabled = false;
            input.addEventListener('input', (e) => this.handleInput(e.target.value));
            input.focus();
        }
    }

    renderText() {
        const textElement = document.getElementById('typingText');
        if (!textElement) return;

        textElement.innerHTML = '';
        this.currentText.split('').forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char;
            if (index === this.currentCharIndex) {
                span.className = 'current-char';
            }
            textElement.appendChild(span);
        });
    }

    startGame() {
        this.isPlaying = true;
        this.startTime = Date.now();
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    handleInput(inputText) {
        if (!this.isPlaying) {
            this.startGame();
        }

        if (this.currentCharIndex < this.currentText.length) {
            const currentChar = this.currentText[this.currentCharIndex];
            const inputChar = inputText[this.currentCharIndex];
            
            const spans = document.getElementById('typingText').children;
            
            if (this.currentCharIndex > 0 && spans[this.currentCharIndex - 1]) {
                spans[this.currentCharIndex - 1].className = 'correct-char';
            }
            
            if (spans[this.currentCharIndex]) {
                spans[this.currentCharIndex].className = inputChar === currentChar ? 'current-char' : 'current-char incorrect-char';
            }
            
            this.currentCharIndex++;
            
            if (this.currentCharIndex === this.currentText.length) {
                this.completeText();
            }
            
            this.updateDisplay();
        }
    }

    completeText() {
        const timeTaken = (Date.now() - this.startTime) / 1000;
        const wpm = Math.round((this.currentText.split(' ').length / timeTaken) * 60);
        
        if (window.app && window.app.showNotification) {
            window.app.showNotification(`🎯 Скорость: ${wpm} слов/мин!`);
        }
        if (window.app && window.app.addXP) {
            window.app.addXP(5);
        }
        
        // Start new text
        setTimeout(() => {
            this.init();
            this.startGame();
        }, 2000);
    }

    endGame() {
        clearInterval(this.timerInterval);
        this.isPlaying = false;
        
        const input = document.getElementById('typingInput');
        if (input) {
            input.disabled = true;
        }
        
        if (window.app && window.app.showNotification) {
            window.app.showNotification('🏁 Игра окончена!');
        }
        if (window.app && window.app.addXP) {
            window.app.addXP(10);
        }
    }

    updateDisplay() {
        if (document.getElementById('wpm')) {
            const timeElapsed = (60 - this.timeLeft);
            const wpm = timeElapsed > 0 ? Math.round((this.currentCharIndex / 5) / (timeElapsed / 60)) : 0;
            document.getElementById('wpm').textContent = wpm;
        }
        if (document.getElementById('timerTyping')) {
            document.getElementById('timerTyping').textContent = this.timeLeft;
        }
    }
}

class MathGame {
    constructor() {
        this.score = 0;
        this.currentProblem = null;
        this.timeLeft = 30;
        this.timerInterval = null;
        this.isPlaying = false;
    }

    init() {
        this.score = 0;
        this.timeLeft = 30;
        this.isPlaying = false;
        
        this.generateProblem();
        this.updateDisplay();
        this.startGame();
    }

    generateProblem() {
        const operations = ['+', '-', '*'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        let a, b, answer;

        switch(operation) {
            case '+':
                a = Math.floor(Math.random() * 50) + 1;
                b = Math.floor(Math.random() * 50) + 1;
                answer = a + b;
                break;
            case '-':
                a = Math.floor(Math.random() * 50) + 1;
                b = Math.floor(Math.random() * a) + 1;
                answer = a - b;
                break;
            case '*':
                a = Math.floor(Math.random() * 12) + 1;
                b = Math.floor(Math.random() * 12) + 1;
                answer = a * b;
                break;
        }

        this.currentProblem = { a, b, operation, answer };
        this.renderProblem();
    }

    renderProblem() {
        const problemElement = document.getElementById('mathProblem');
        if (problemElement) {
            problemElement.textContent = `${this.currentProblem.a} ${this.currentProblem.operation} ${this.currentProblem.b} = ?`;
        }
        
        const input = document.getElementById('mathAnswer');
        if (input) {
            input.value = '';
            input.focus();
        }
    }

    startGame() {
        this.isPlaying = true;
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    checkAnswer(userAnswer) {
        if (!this.isPlaying) return;

        if (parseInt(userAnswer) === this.currentProblem.answer) {
            this.score += 10;
            if (window.app && window.app.showNotification) {
                window.app.showNotification('✅ Правильно! +10 очков');
            }
            if (window.app && window.app.addXP) {
                window.app.addXP(2);
            }
        } else {
            if (window.app && window.app.showNotification) {
                window.app.showNotification('❌ Неправильно! Попробуйте еще раз.');
            }
        }

        this.generateProblem();
        this.updateDisplay();
    }

    endGame() {
        clearInterval(this.timerInterval);
        this.isPlaying = false;
        if (window.app && window.app.showNotification) {
            window.app.showNotification(`🏁 Игра окончена! Ваш счет: ${this.score}`);
        }
        if (window.app && window.app.addXP) {
            window.app.addXP(5);
        }
    }

    updateDisplay() {
        if (document.getElementById('mathScore')) {
            document.getElementById('mathScore').textContent = this.score;
        }
        if (document.getElementById('mathTime')) {
            document.getElementById('mathTime').textContent = this.timeLeft;
        }
    }
}

class AimTrainer {
    constructor() {
        this.score = 0;
        this.targetsClicked = 0;
        this.timeLeft = 30;
        this.timerInterval = null;
        this.isPlaying = false;
    }

    init() {
        this.score = 0;
        this.targetsClicked = 0;
        this.timeLeft = 30;
        this.isPlaying = false;
        
        this.renderGame();
        this.updateDisplay();
        this.startGame();
    }

    renderGame() {
        const container = document.getElementById('aimArea');
        if (!container) return;

        container.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--text-secondary);">
                Кликайте по появляющимся целям!
            </div>
        `;

        container.addEventListener('click', (e) => {
            if (e.target === container && this.isPlaying) {
                this.score = Math.max(0, this.score - 5);
                this.updateDisplay();
            }
        });
    }

    createTarget() {
        if (!this.isPlaying) return;

        const aimArea = document.getElementById('aimArea');
        const target = document.createElement('div');
        target.className = 'aim-target';
        target.style.cssText = `
            position: absolute;
            width: 40px;
            height: 40px;
            background: var(--danger-color);
            border-radius: 50%;
            cursor: pointer;
        `;

        const x = Math.random() * (aimArea.offsetWidth - 80) + 40;
        const y = Math.random() * (aimArea.offsetHeight - 80) + 40;
        
        target.style.left = x + 'px';
        target.style.top = y + 'px';

        target.addEventListener('click', (e) => {
            e.stopPropagation();
            this.score += 10;
            this.targetsClicked++;
            target.remove();
            this.createTarget();
            this.updateDisplay();
        });

        aimArea.appendChild(target);

        // Remove target after 1.5 seconds
        setTimeout(() => {
            if (target.parentNode) {
                target.remove();
                this.createTarget();
            }
        }, 1500);
    }

    startGame() {
        this.isPlaying = true;
        this.createTarget();
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    endGame() {
        clearInterval(this.timerInterval);
        this.isPlaying = false;
        
        if (window.app && window.app.showNotification) {
            window.app.showNotification(`🏁 Игра окончена! Счет: ${this.score}`);
        }
        if (window.app && window.app.addXP) {
            window.app.addXP(8);
        }
    }

    updateDisplay() {
        if (document.getElementById('aimScore')) {
            document.getElementById('aimScore').textContent = this.score;
        }
        if (document.getElementById('aimTargets')) {
            document.getElementById('aimTargets').textContent = this.targetsClicked;
        }
        if (document.getElementById('aimTime')) {
            document.getElementById('aimTime').textContent = this.timeLeft;
        }
    }
}

// Games Data
const games = [
    {
        id: 'neuron-2048',
        title: 'Neuron 2048',
        icon: '🧩',
        description: 'Классическая головоломка с числами. Собирайте плитки и достигните заветной плитки 2048!',
        difficulty: 2,
        category: 'Головоломка',
        playTime: '5-15 мин',
        featured: true
    },
    {
        id: 'memory-cards',
        title: 'Memory Cards',
        icon: '🃏',
        description: 'Тренируйте память, находя пары одинаковых карточек. Развивайте концентрацию и внимание!',
        difficulty: 1,
        category: 'Память',
        playTime: '3-10 мин',
        featured: true
    },
    {
        id: 'typing-master',
        title: 'Typing Master',
        icon: '⌨️',
        description: 'Улучшайте скорость и точность печати. Станьте настоящим мастером клавиатуры!',
        difficulty: 2,
        category: 'Обучение',
        playTime: '2-5 мин',
        featured: false
    },
    {
        id: 'math-challenge',
        title: 'Math Challenge',
        icon: '🧮',
        description: 'Проверьте свои математические навыки. Решайте примеры на время и ставьте рекорды!',
        difficulty: 3,
        category: 'Обучение',
        playTime: '1-3 мин',
        featured: false
    },
    {
        id: 'code-puzzle',
        title: 'Code Puzzle',
        icon: '💻',
        description: 'Основы программирования в игровой форме. Решайте логические задачи и изучайте код!',
        difficulty: 4,
        category: 'Программирование',
        playTime: '5-20 мин',
        featured: true
    },
    {
        id: 'aim-trainer',
        title: 'Aim Trainer',
        icon: '🎯',
        description: 'Тренируйте реакцию и точность. Кликайте по целям и улучшайте свои навыки!',
        difficulty: 2,
        category: 'Реакция',
        playTime: '1-5 мин',
        featured: false
    }
];

const achievements = [
    {
        id: 'first-game',
        title: 'Первая игра',
        description: 'Сыграйте в свою первую игру',
        icon: '🎮',
        unlocked: false
    },
    {
        id: 'puzzle-master',
        title: 'Мастер головоломок',
        description: 'Пройдите 3 различные головоломки',
        icon: '🧩',
        unlocked: false
    },
    {
        id: 'speed-typer',
        title: 'Скоростная печать',
        description: 'Достигните 50 слов в минуту',
        icon: '⚡',
        unlocked: false
    },
    {
        id: 'math-genius',
        title: 'Математический гений',
        description: 'Решите 100 примеров без ошибок',
        icon: '🎓',
        unlocked: false
    },
    {
        id: 'memory-champ',
        title: 'Чемпион памяти',
        description: 'Найдите все пары за 30 секунд',
        icon: '🏆',
        unlocked: false
    }
];

// Game Templates
const gameTemplates = {
    'neuron-2048': `
        <div class="game-container">
            <div class="game-stats">
                <div class="game-stat">
                    <div class="game-stat-value" id="score2048">0</div>
                    <div class="game-stat-label">Счёт</div>
                </div>
                <div class="game-stat">
                    <div class="game-stat-value" id="best2048">0</div>
                    <div class="game-stat-label">Лучший</div>
                </div>
                <div class="game-stat">
                    <div class="game-stat-value" id="moves2048">0</div>
                    <div class="game-stat-label">Ходы</div>
                </div>
            </div>
            
            <div class="game-board">
                <div class="grid-2048" id="grid2048"></div>
            </div>
            
            <div class="game-controls">
                <button class="btn btn-primary" onclick="start2048()">Новая игра</button>
                <button class="btn btn-secondary" onclick="showInstructions2048()">Инструкция</button>
            </div>
            
            <div id="instructions2048" style="display: none; margin-top: 20px; padding: 15px; background: var(--surface-light); border-radius: 8px;">
                <h4>🎮 Как играть в 2048:</h4>
                <p>• Используйте <strong>стрелки клавиатуры</strong> для перемещения плиток</p>
                <p>• Когда две плитки с одинаковым числом соприкасаются, они сливаются в одну!</p>
                <p>• Цель: получить плитку <strong>2048</strong></p>
                <p>• Объединяйте плитки стратегически, чтобы не заполнить всё поле</p>
            </div>
        </div>
    `,
    
    'memory-cards': `
        <div class="game-container">
            <div class="game-stats">
                <div class="game-stat">
                    <div class="game-stat-value" id="pairsFound">0</div>
                    <div class="game-stat-label">Найдено пар</div>
                </div>
                <div class="game-stat">
                    <div class="game-stat-value" id="attemptsCount">0</div>
                    <div class="game-stat-label">Попытки</div>
                </div>
                <div class="game-stat">
                    <div class="game-stat-value" id="timerMemory">0</div>
                    <div class="game-stat-label">Время</div>
                </div>
            </div>
            
            <div class="game-board">
                <div class="grid-memory" id="gridMemory"></div>
            </div>
            
            <div class="game-controls">
                <button class="btn btn-primary" onclick="startMemoryGame()">Новая игра</button>
                <button class="btn btn-secondary" onclick="showInstructionsMemory()">Инструкция</button>
            </div>
            
            <div id="instructionsMemory" style="display: none; margin-top: 20px; padding: 15px; background: var(--surface-light); border-radius: 8px;">
                <h4>🎮 Как играть в Memory:</h4>
                <p>• Кликайте на карточки, чтобы перевернуть их</p>
                <p>• Найдите <strong>пары одинаковых символов</strong></p>
                <p>• Запоминайте расположение карточек</p>
                <p>• Цель: найти все пары за минимальное время</p>
            </div>
        </div>
    `,
    
    'typing-master': `
        <div class="game-container">
            <div class="game-stats">
                <div class="game-stat">
                    <div class="game-stat-value" id="wpm">0</div>
                    <div class="game-stat-label">Слов/мин</div>
                </div>
                <div class="game-stat">
                    <div class="game-stat-value" id="accuracy">100%</div>
                    <div class="game-stat-label">Точность</div>
                </div>
                <div class="game-stat">
                    <div class="game-stat-value" id="timerTyping">60</div>
                    <div class="game-stat-label">Секунды</div>
                </div>
            </div>
            
            <div class="typing-container">
                <div class="typing-text" id="typingText"></div>
                <input type="text" class="typing-input" id="typingInput" placeholder="Начните печатать здесь...">
            </div>
            
            <div class="game-controls">
                <button class="btn btn-primary" onclick="startTypingGame()">Новая игра</button>
                <button class="btn btn-secondary" onclick="showInstructionsTyping()">Инструкция</button>
            </div>
            
            <div id="instructionsTyping" style="display: none; margin-top: 20px; padding: 15px; background: var(--surface-light); border-radius: 8px;">
                <h4>🎮 Как играть в Typing Master:</h4>
                <p>• Печатайте текст, который видите на экране</p>
                <p>• Следите за <strong>скоростью (WPM)</strong> и <strong>точностью</strong></p>
                <p>• Игра длится 60 секунд</p>
                <p>• Цель: набрать максимальную скорость с высокой точностью</p>
            </div>
        </div>
    `,

    'math-challenge': `
        <div class="game-container">
            <div class="game-stats">
                <div class="game-stat">
                    <div class="game-stat-value" id="mathScore">0</div>
                    <div class="game-stat-label">Счёт</div>
                </div>
                <div class="game-stat">
                    <div class="game-stat-value" id="mathTime">30</div>
                    <div class="game-stat-label">Время</div>
                </div>
                <div class="game-stat">
                    <div class="game-stat-value" id="mathBest">0</div>
                    <div class="game-stat-label">Лучший</div>
                </div>
            </div>
            
            <div class="math-container">
                <div class="math-problem" id="mathProblem">5 + 3 = ?</div>
                <div style="display: flex; justify-content: center; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <input type="number" class="math-input" id="mathAnswer" placeholder="Ответ">
                    <button class="btn btn-primary" onclick="checkMathAnswer()">Проверить</button>
                </div>
            </div>
            
            <div class="game-controls">
                <button class="btn btn-primary" onclick="startMathGame()">Новая игра</button>
                <button class="btn btn-secondary" onclick="showInstructionsMath()">Инструкция</button>
            </div>
            
            <div id="instructionsMath" style="display: none; margin-top: 20px; padding: 15px; background: var(--surface-light); border-radius: 8px;">
                <h4>🎮 Как играть в Math Challenge:</h4>
                <p>• Решайте математические примеры</p>
                <p>• Вводите ответ в поле и нажимайте "Проверить"</p>
                <p>• За правильный ответ: <strong>+10 очков</strong></p>
                <p>• Цель: набрать максимум очков за 30 секунд</p>
            </div>
        </div>
    `,

    'aim-trainer': `
        <div class="game-container">
            <div class="game-stats">
                <div class="game-stat">
                    <div class="game-stat-value" id="aimScore">0</div>
                    <div class="game-stat-label">Счёт</div>
                </div>
                <div class="game-stat">
                    <div class="game-stat-value" id="aimTargets">0</div>
                    <div class="game-stat-label">Цели</div>
                </div>
                <div class="game-stat">
                    <div class="game-stat-value" id="aimTime">30</div>
                    <div class="game-stat-label">Время</div>
                </div>
            </div>
            
            <div class="aim-container" id="aimArea">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--text-secondary);">
                    Кликайте по появляющимся целям!
                </div>
            </div>
            
            <div class="game-controls">
                <button class="btn btn-primary" onclick="startAimTrainer()">Новая игра</button>
                <button class="btn btn-secondary" onclick="showInstructionsAim()">Инструкция</button>
            </div>
            
            <div id="instructionsAim" style="display: none; margin-top: 20px; padding: 15px; background: var(--surface-light); border-radius: 8px;">
                <h4>🎮 Как играть в Aim Trainer:</h4>
                <p>• Кликайте по <strong>красным целям</strong>, которые появляются на экране</p>
                <p>• За каждую цель: <strong>+10 очков</strong></p>
                <p>• Промах: <strong>-5 очков</strong></p>
                <p>• Цель: набрать максимум очков за 30 секунд</p>
            </div>
        </div>
    `,

    'code-puzzle': `
        <div class="game-container">
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 4rem; margin-bottom: 20px;">💻</div>
                <h3>Code Puzzle</h3>
                <p>Скоро будет доступно!</p>
                <p style="color: var(--text-secondary); margin-top: 20px;">Мы работаем над созданием увлекательных программистских головоломок.</p>
                <button class="btn btn-primary" onclick="closeGameModal()" style="margin-top: 20px;">Вернуться к играм</button>
            </div>
        </div>
    `
};
