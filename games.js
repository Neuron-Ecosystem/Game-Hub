// Games Data and Logic
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
                <button class="btn btn-secondary" onclick="showInstructions('2048')">Инструкция</button>
            </div>
            
            <div id="instructions2048" style="display: none; margin-top: 20px; padding: 15px; background: var(--surface-light); border-radius: 8px;">
                <h4>Как играть в 2048:</h4>
                <p>Используйте стрелки клавиатуры для перемещения плиток. Когда две плитки с одинаковым числом соприкасаются, они сливаются в одну!</p>
                <p>Цель: получить плитку 2048</p>
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
                <button class="btn btn-secondary" onclick="showInstructions('Memory')">Инструкция</button>
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
                <button class="btn btn-primary" onclick="startTypingTest()">Начать тест</button>
                <button class="btn btn-secondary" onclick="showInstructions('Typing')">Инструкция</button>
            </div>
        </div>
    `
};

// Game Logic Functions
class Game2048 {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('best2048') || '0');
        this.moves = 0;
        this.init();
    }

    init() {
        this.grid = Array(4).fill().map(() => Array(4).fill(0));
        this.score = 0;
        this.moves = 0;
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
        let moved = false;
        const oldGrid = this.grid.map(row => [...row]);

        // Implement move logic based on direction
        // This is a simplified version - you'd implement full 2048 logic here

        if (this.gridChanged(oldGrid)) {
            this.moves++;
            this.addRandomTile();
            moved = true;
        }

        this.updateDisplay();
        return moved;
    }

    gridChanged(oldGrid) {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (oldGrid[i][j] !== this.grid[i][j]) return true;
            }
        }
        return false;
    }

    updateDisplay() {
        const gridElement = document.getElementById('grid2048');
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

        document.getElementById('score2048').textContent = this.score;
        document.getElementById('moves2048').textContent = this.moves;
        document.getElementById('best2048').textContent = this.bestScore;

        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('best2048', this.bestScore.toString());
        }
    }
}

// Global game instances
let game2048;
let memoryGame;
let typingGame;

// Initialize games
function init2048() {
    game2048 = new Game2048();
}

function start2048() {
    game2048.init();
}

function startMemoryGame() {
    // Initialize memory game
    const symbols = ['🚀', '⭐', '🎮', '💻', '🎯', '🧩', '🎨', '🎵'];
    const cards = [...symbols, ...symbols];
    
    // Shuffle cards
    cards.sort(() => Math.random() - 0.5);
    
    const grid = document.getElementById('gridMemory');
    grid.innerHTML = '';
    
    cards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.innerHTML = `
            <div class="front">${symbol}</div>
            <div class="back">?</div>
        `;
        card.addEventListener('click', () => flipCard(card, symbol));
        grid.appendChild(card);
    });
    
    // Reset stats
    document.getElementById('pairsFound').textContent = '0';
    document.getElementById('attemptsCount').textContent = '0';
    document.getElementById('timerMemory').textContent = '0';
}

function startTypingTest() {
    const texts = [
        "Neuron Ecosystem создает инновационные проекты для образования и развлечений.",
        "Программирование это искусство создания цифровых миров и решения сложных задач.",
        "Игры развивают логическое мышление, креативность и стратегическое планирование."
    ];
    
    const randomText = texts[Math.floor(Math.random() * texts.length)];
    document.getElementById('typingText').innerHTML = '';
    document.getElementById('typingInput').value = '';
    document.getElementById('typingInput').disabled = false;
    document.getElementById('typingInput').focus();
    
    // Display text with spans for each character
    randomText.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char;
        document.getElementById('typingText').appendChild(span);
    });
    
    // Start timer
    let timeLeft = 60;
    document.getElementById('timerTyping').textContent = timeLeft;
    
    const timer = setInterval(() => {
        timeLeft--;
        document.getElementById('timerTyping').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            document.getElementById('typingInput').disabled = true;
            calculateTypingStats();
        }
    }, 1000);
}

function showInstructions(game) {
    const element = document.getElementById(`instructions${game}`);
    if (element) {
        element.style.display = element.style.display === 'none' ? 'block' : 'none';
    }
}

// Utility functions
function flipCard(card, symbol) {
    card.classList.toggle('flipped');
    // Add memory game logic here
}

function calculateTypingStats() {
    // Calculate WPM and accuracy
    const typedText = document.getElementById('typingInput').value;
    const originalText = document.getElementById('typingText').textContent;
    
    let correctChars = 0;
    for (let i = 0; i < Math.min(typedText.length, originalText.length); i++) {
        if (typedText[i] === originalText[i]) {
            correctChars++;
        }
    }
    
    const accuracy = (correctChars / originalText.length) * 100;
    const words = typedText.split(' ').length;
    const wpm = Math.round((words / 60) * 100); // Based on 60-second test
    
    document.getElementById('wpm').textContent = wpm;
    document.getElementById('accuracy').textContent = `${accuracy.toFixed(1)}%`;
}
