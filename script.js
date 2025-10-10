// Main Application Logic
class NeuronGameHub {
    constructor() {
        this.games = games;
        this.achievements = achievements;
        this.stats = this.loadStats();
        this.init();
    }

    init() {
        this.displayGames();
        this.displayAchievements();
        this.setupEventListeners();
        this.updateStatsDisplay();
        this.loadAchievements();
    }

    loadStats() {
        const saved = localStorage.getItem('neuronGameHubStats');
        return saved ? JSON.parse(saved) : {
            totalGamesPlayed: 0,
            bestScores: {},
            timePlayed: {},
            achievementsUnlocked: 0,
            playerLevel: 1,
            playerXP: 0,
            gamesPlayed: {}
        };
    }

    saveStats() {
        localStorage.setItem('neuronGameHubStats', JSON.stringify(this.stats));
    }

    loadAchievements() {
        const saved = localStorage.getItem('neuronGameAchievements');
        if (saved) {
            this.achievements = JSON.parse(saved);
        }
    }

    saveAchievements() {
        localStorage.setItem('neuronGameAchievements', JSON.stringify(this.achievements));
    }

    displayGames() {
        const container = document.getElementById('gamesContainer');
        container.innerHTML = this.games.map(game => `
            <div class="game-card" onclick="app.openGame('${game.id}')">
                <div class="game-icon">${game.icon}</div>
                <div class="game-title">${game.title}</div>
                <div class="game-description">${game.description}</div>
                <div class="game-meta">
                    <span>${game.category}</span>
                    <div class="game-difficulty">
                        ${[1,2,3,4,5].map(i => `
                            <div class="difficulty-dot ${i <= game.difficulty ? 'active' : ''}"></div>
                        `).join('')}
                    </div>
                </div>
                ${game.featured ? '<div style="position: absolute; top: 10px; right: 10px; background: var(--accent-color); color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem;">Featured</div>' : ''}
            </div>
        `).join('');
    }

    displayAchievements() {
        const container = document.getElementById('achievementsContainer');
        container.innerHTML = this.achievements.map(achievement => `
            <div class="achievement-card ${achievement.unlocked ? '' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                    ${achievement.unlocked ? '<small style="color: var(--secondary-color);">✔️ Получено</small>' : ''}
                </div>
            </div>
        `).join('');
    }

    openGame(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;

        // Update stats
        this.stats.totalGamesPlayed++;
        if (!this.stats.gamesPlayed[gameId]) {
            this.stats.gamesPlayed[gameId] = 0;
        }
        this.stats.gamesPlayed[gameId]++;
        this.saveStats();
        this.updateStatsDisplay();

        // Unlock first game achievement
        this.unlockAchievement('first-game');

        // Show game modal
        document.getElementById('modalGameTitle').textContent = game.title;
        
        // Load game template
        if (gameTemplates[gameId]) {
            document.getElementById('gameContent').innerHTML = gameTemplates[gameId];
            
            // Initialize specific game
            setTimeout(() => {
                switch(gameId) {
                    case 'neuron-2048':
                        init2048();
                        break;
                    case 'memory-cards':
                        initMemoryGame();
                        break;
                    case 'typing-master':
                        initTypingGame();
                        break;
                    case 'math-challenge':
                        initMathGame();
                        break;
                    case 'aim-trainer':
                        initAimTrainer();
                        break;
                }
            }, 100);
        } else {
            document.getElementById('gameContent').innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">${game.icon}</div>
                    <h3>${game.title}</h3>
                    <p>Эта игра скоро будет доступна!</p>
                    <p style="color: var(--text-secondary); margin-top: 20px;">Мы активно работаем над её созданием.</p>
                    <button class="btn btn-primary" onclick="closeGameModal()" style="margin-top: 20px;">Вернуться к играм</button>
                </div>
            `;
        }

        document.getElementById('gameModal').classList.add('active');
    }

    unlockAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.stats.achievementsUnlocked++;
            this.saveAchievements();
            this.displayAchievements();
            showNotification(`🎉 Достижение разблокировано: ${achievement.title}!`);
            addXP(25);
        }
    }

    updateStatsDisplay() {
        document.getElementById('totalGames').textContent = this.games.length;
        
        // Calculate best score from all games
        const bestScores = Object.values(this.stats.bestScores);
        const bestScore = bestScores.length > 0 ? Math.max(...bestScores) : 0;
        document.getElementById('bestScore').textContent = bestScore;
        
        document.getElementById('playerLevel').textContent = this.stats.playerLevel;
        
        // Update level progress
        const xpForNextLevel = this.stats.playerLevel * 100;
        const progress = (this.stats.playerXP / xpForNextLevel) * 100;
        document.getElementById('levelProgress').style.width = `${Math.min(progress, 100)}%`;
        document.getElementById('currentLevel').textContent = this.stats.playerLevel;
        document.getElementById('currentXP').textContent = this.stats.playerXP;
        document.getElementById('nextLevelXP').textContent = xpForNextLevel;
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Show target section
                document.querySelectorAll('.section').forEach(section => {
                    section.classList.remove('active');
                    if (section.id === targetId) {
                        section.classList.add('active');
                        
                        // Load section-specific data
                        if (targetId === 'stats') {
                            this.loadStatistics();
                        }
                    }
                });
            });
        });

        // Search functionality
        document.getElementById('gameSearch').addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const gameCards = document.querySelectorAll('.game-card');
            
            gameCards.forEach(card => {
                const title = card.querySelector('.game-title').textContent.toLowerCase();
                const description = card.querySelector('.game-description').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || description.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    loadStatistics() {
        // Update recent scores
        const recentScores = document.getElementById('recentScores');
        recentScores.innerHTML = Object.entries(this.stats.bestScores)
            .slice(0, 5)
            .map(([game, score]) => {
                const gameInfo = this.games.find(g => g.id === game);
                return `
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border);">
                        <span>${gameInfo?.title || game}</span>
                        <span style="color: var(--primary-color);">${score}</span>
                    </div>
                `;
            }).join('') || '<p style="color: var(--text-secondary); text-align: center;">Нет данных</p>';
    }
}

// ==================== 2048 GAME ====================
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
        const oldGrid = this.grid.map(row => [...row]);

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
                showNotification('💔 Игра окончена! Попробуйте еще раз.');
            }
            
            // Save best score
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem('best2048', this.bestScore.toString());
                app.stats.bestScores['neuron-2048'] = this.bestScore;
                app.saveStats();
                showNotification('🎉 Новый рекорд!');
            }
            
            addXP(1);
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
                    tile.classList.add(`tile-${this.grid[i][j]}`);
                }
                gridElement.appendChild(tile);
            }
        }

        if (document.getElementById('score2048')) {
            document.getElementById('score2048').textContent = this.score;
            document.getElementById('moves2048').textContent = this.moves;
            document.getElementById('best2048').textContent = this.bestScore;
        }
    }
}

// ==================== MEMORY GAME ====================
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
            card.dataset.symbol = symbol;
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
            
            addXP(2);
        } else {
            // No match
            setTimeout(() => {
                document.querySelector(`.memory-card[data-index="${card1.index}"]`).classList.remove('flipped');
                document.querySelector(`.memory-card[data-index="${card2.index}"]`).classList.remove('flipped');
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
        showNotification(`🎉 Поздравляем! Вы нашли все пары за ${this.timer} секунд!`);
        addXP(10);
        
        // Save best time
        const bestTime = localStorage.getItem('bestMemoryTime');
        if (!bestTime || this.timer < parseInt(bestTime)) {
            localStorage.setItem('bestMemoryTime', this.timer.toString());
            app.stats.bestScores['memory-cards'] = this.timer;
            app.saveStats();
            showNotification('🏆 Новый рекорд времени!');
        }
    }

    updateDisplay() {
        if (document.getElementById('pairsFound')) {
            document.getElementById('pairsFound').textContent = this.matchedPairs;
            document.getElementById('attemptsCount').textContent = this.moves;
            document.getElementById('timerMemory').textContent = this.timer;
        }
    }
}

// ==================== TYPING GAME ====================
class TypingGame {
    constructor() {
        this.texts = [
            "Neuron Ecosystem создает инновационные проекты для образования и развлечений.",
            "Программирование это искусство создания цифровых миров и решения сложных задач.",
            "Игры развивают логическое мышление, креативность и стратегическое планирование.",
            "JavaScript является одним из самых популярных языков программирования в мире.",
            "Российские разработчики создают качественное программное обеспечение мирового уровня."
        ];
        this.currentText = '';
        this.currentCharIndex = 0;
        this.startTime = 0;
        this.timerInterval = null;
        this.timeLeft = 60;
        this.isPlaying = false;
        this.correctChars = 0;
        this.totalChars = 0;
    }

    init() {
        this.currentText = this.texts[Math.floor(Math.random() * this.texts.length)];
        this.currentCharIndex = 0;
        this.timeLeft = 60;
        this.isPlaying = false;
        this.correctChars = 0;
        this.totalChars = 0;
        
        this.renderText();
        this.updateDisplay();
        
        const input = document.getElementById('typingInput');
        if (input) {
            input.value = '';
            input.disabled = false;
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
            
            if (this.currentCharIndex > 0) {
                const prevSpan = spans[this.currentCharIndex - 1];
                prevSpan.className = prevSpan.textContent === inputText[this.currentCharIndex - 1] ? 'correct-char' : 'incorrect-char';
            }
            
            if (this.currentCharIndex < spans.length) {
                spans[this.currentCharIndex].className = inputChar === currentChar ? 'current-char' : 'current-char incorrect-char';
            }
            
            if (inputChar === currentChar) {
                this.correctChars++;
            }
            this.totalChars++;
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
        const accuracy = (this.correctChars / this.totalChars) * 100;
        
        showNotification(`🎯 Скорость: ${wpm} слов/мин | Точность: ${accuracy.toFixed(1)}%`);
        addXP(5);
        
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
        
        const finalWPM = Math.round((this.totalChars / 5) / (60 / 60));
        const accuracy = this.totalChars > 0 ? (this.correctChars / this.totalChars) * 100 : 0;
        
        showNotification(`🏁 Игра окончена! ${finalWPM} WPM, точность: ${accuracy.toFixed(1)}%`);
        addXP(10);
    }

    updateDisplay() {
        if (document.getElementById('wpm')) {
            const timeElapsed = (60 - this.timeLeft);
            const wpm = timeElapsed > 0 ? Math.round((this.totalChars / 5) / (timeElapsed / 60)) : 0;
            const accuracy = this.totalChars > 0 ? (this.correctChars / this.totalChars) * 100 : 100;
            
            document.getElementById('wpm').textContent = wpm;
            document.getElementById('accuracy').textContent = `${accuracy.toFixed(1)}%`;
            document.getElementById('timerTyping').textContent = this.timeLeft;
        }
    }
}

// ==================== SIMPLE MATH GAME ====================
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
        const container = document.getElementById('mathContent');
        if (!container) return;

        container.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin: 20px 0;">
                    ${this.currentProblem.a} ${this.currentProblem.operation} ${this.currentProblem.b} = ?
                </div>
                <input type="number" id="mathAnswer" placeholder="Введите ответ" style="
                    padding: 15px;
                    font-size: 1.2rem;
                    width: 200px;
                    text-align: center;
                    border: 2px solid var(--primary-color);
                    border-radius: 8px;
                    background: var(--background);
                    color: var(--text-primary);
                ">
                <button class="btn btn-primary" onclick="checkMathAnswer()" style="margin-left: 10px;">Проверить</button>
            </div>
        `;

        const input = document.getElementById('mathAnswer');
        if (input) {
            input.focus();
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    checkMathAnswer();
                }
            });
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
            showNotification('✅ Правильно! +10 очков');
            addXP(2);
        } else {
            showNotification('❌ Неправильно! Попробуйте еще раз.');
        }

        this.generateProblem();
        this.updateDisplay();
    }

    endGame() {
        clearInterval(this.timerInterval);
        this.isPlaying = false;
        showNotification(`🏁 Игра окончена! Ваш счет: ${this.score}`);
        addXP(5);
        
        // Save best score
        const bestScore = localStorage.getItem('bestMathScore');
        if (!bestScore || this.score > parseInt(bestScore)) {
            localStorage.setItem('bestMathScore', this.score.toString());
            app.stats.bestScores['math-challenge'] = this.score;
            app.saveStats();
            showNotification('🎉 Новый рекорд!');
        }
    }

    updateDisplay() {
        if (document.getElementById('mathScore')) {
            document.getElementById('mathScore').textContent = this.score;
            document.getElementById('mathTime').textContent = this.timeLeft;
        }
    }
}

// ==================== AIM TRAINER ====================
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
        const container = document.getElementById('aimContent');
        if (!container) return;

        container.innerHTML = `
            <div style="position: relative; width: 100%; height: 400px; background: var(--surface-light); border-radius: 12px; overflow: hidden; cursor: crosshair;" id="aimArea">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--text-secondary);">
                    Кликайте по появляющимся целям!
                </div>
            </div>
        `;

        const aimArea = document.getElementById('aimArea');
        aimArea.addEventListener('click', (e) => {
            if (e.target === aimArea && this.isPlaying) {
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
            transform: translate(-50%, -50%);
            transition: all 0.1s ease;
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
        
        const accuracy = this.targetsClicked > 0 ? (this.score / (this.targetsClicked * 10)) * 100 : 0;
        showNotification(`🏁 Игра окончена! Счет: ${this.score} | Точность: ${accuracy.toFixed(1)}%`);
        addXP(8);
        
        // Save best score
        const bestScore = localStorage.getItem('bestAimScore');
        if (!bestScore || this.score > parseInt(bestScore)) {
            localStorage.setItem('bestAimScore', this.score.toString());
            app.stats.bestScores['aim-trainer'] = this.score;
            app.saveStats();
            showNotification('🎉 Новый рекорд!');
        }
    }

    updateDisplay() {
        if (document.getElementById('aimScore')) {
            document.getElementById('aimScore').textContent = this.score;
            document.getElementById('aimTargets').textContent = this.targetsClicked;
            document.getElementById('aimTime').textContent = this.timeLeft;
        }
    }
}

// ==================== GAME TEMPLATES ====================
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
            
            <div id="mathContent"></div>
            
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
            
            <div id="aimContent"></div>
            
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
    `
};

// ==================== GLOBAL GAME INSTANCES ====================
let game2048;
let memoryGame;
let typingGame;
let mathGame;
let aimTrainer;

// ==================== GAME INITIALIZATION FUNCTIONS ====================
function init2048() {
    game2048 = new Game2048();
    game2048.init();
}

function start2048() {
    if (game2048) {
        game2048.init();
    }
}

function initMemoryGame() {
    memoryGame = new MemoryGame();
    memoryGame.init();
}

function startMemoryGame() {
    if (memoryGame) {
        memoryGame.init();
    }
}

function initTypingGame() {
    typingGame = new TypingGame();
    typingGame.init();
    
    const input = document.getElementById('typingInput');
    if (input) {
        input.addEventListener('input', (e) => {
            typingGame.handleInput(e.target.value);
        });
    }
}

function startTypingGame() {
    if (typingGame) {
        typingGame.init();
    }
}

function initMathGame() {
    mathGame = new MathGame();
    mathGame.init();
    
    // Load best score
    const bestScore = localStorage.getItem('bestMathScore') || '0';
    if (document.getElementById('mathBest')) {
        document.getElementById('mathBest').textContent = bestScore;
    }
}

function startMathGame() {
    if (mathGame) {
        mathGame.init();
    }
}

function initAimTrainer() {
    aimTrainer = new AimTrainer();
    aimTrainer.init();
    
    // Load best score
    const bestScore = localStorage.getItem('bestAimScore') || '0';
    if (document.getElementById('aimBest')) {
        document.getElementById('aimBest').textContent = bestScore;
    }
}

function startAimTrainer() {
    if (aimTrainer) {
        aimTrainer.init();
    }
}

// ==================== UTILITY FUNCTIONS ====================
function checkMathAnswer() {
    const input = document.getElementById('mathAnswer');
    if (input && mathGame) {
        mathGame.checkAnswer(input.value);
        input.value = '';
        input.focus();
    }
}

function showInstructions2048() {
    const element = document.getElementById('instructions2048');
    element.style.display = element.style.display === 'none' ? 'block' : 'none';
}

function showInstructionsMemory() {
    const element = document.getElementById('instructionsMemory');
    element.style.display = element.style.display === 'none' ? 'block' : 'none';
}

function showInstructionsTyping() {
    const element = document.getElementById('instructionsTyping');
    element.style.display = element.style.display === 'none' ? 'block' : 'none';
}

function showInstructionsMath() {
    const element = document.getElementById('instructionsMath');
    element.style.display = element.style.display === 'none' ? 'block' : 'none';
}

function showInstructionsAim() {
    const element = document.getElementById('instructionsAim');
    element.style.display = element.style.display === 'none' ? 'block' : 'none';
}

function closeGameModal() {
    document.getElementById('gameModal').classList.remove('active');
    
    // Stop all game timers
    if (memoryGame && memoryGame.timerInterval) {
        clearInterval(memoryGame.timerInterval);
    }
    if (typingGame && typingGame.timerInterval) {
        clearInterval(typingGame.timerInterval);
    }
    if (mathGame && mathGame.timerInterval) {
        clearInterval(mathGame.timerInterval);
    }
    if (aimTrainer && aimTrainer.timerInterval) {
        clearInterval(aimTrainer.timerInterval);
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeGameModal();
    }
});

// Keyboard controls for 2048
document.addEventListener('keydown', (e) => {
    if (game2048 && document.getElementById('gameModal').classList.contains('active')) {
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                game2048.move('up');
                break;
            case 'ArrowDown':
                e.preventDefault();
                game2048.move('down');
                break;
            case 'ArrowLeft':
                e.preventDefault();
                game2048.move('left');
                break;
            case 'ArrowRight':
                e.preventDefault();
                game2048.move('right');
                break;
        }
    }
});

// Add XP to player
function addXP(amount) {
    app.stats.playerXP += amount;
    const xpForNextLevel = app.stats.playerLevel * 100;
    
    if (app.stats.playerXP >= xpForNextLevel) {
        app.stats.playerLevel++;
        app.stats.playerXP -= xpForNextLevel;
        showNotification(`🎉 Поздравляем! Вы достигли ${app.stats.playerLevel} уровня!`);
    }
    
    app.saveStats();
    app.updateStatsDisplay();
}

// Notification system
function showNotification(message) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--secondary-color);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: var(--shadow);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new NeuronGameHub();
});
