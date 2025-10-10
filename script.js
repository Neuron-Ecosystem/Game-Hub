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
        try {
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
        } catch (e) {
            return {
                totalGamesPlayed: 0,
                bestScores: {},
                timePlayed: {},
                achievementsUnlocked: 0,
                playerLevel: 1,
                playerXP: 0,
                gamesPlayed: {}
            };
        }
    }

    saveStats() {
        try {
            localStorage.setItem('neuronGameHubStats', JSON.stringify(this.stats));
        } catch (e) {
            console.log('Не удалось сохранить статистику');
        }
    }

    loadAchievements() {
        try {
            const saved = localStorage.getItem('neuronGameAchievements');
            if (saved) {
                const savedAchievements = JSON.parse(saved);
                this.achievements = this.achievements.map(achievement => {
                    const savedAchievement = savedAchievements.find(a => a.id === achievement.id);
                    return savedAchievement ? { ...achievement, ...savedAchievement } : achievement;
                });
            }
        } catch (e) {
            console.log('Не удалось загрузить достижения');
        }
    }

    saveAchievements() {
        try {
            localStorage.setItem('neuronGameAchievements', JSON.stringify(this.achievements));
        } catch (e) {
            console.log('Не удалось сохранить достижения');
        }
    }

    displayGames() {
        const container = document.getElementById('gamesContainer');
        if (!container) {
            console.error('Контейнер игр не найден!');
            return;
        }

        container.innerHTML = this.games.map(game => `
            <div class="game-card" data-game-id="${game.id}">
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
                ${game.featured ? '<div class="featured-badge">Featured</div>' : ''}
            </div>
        `).join('');

        // Добавляем обработчики событий для карточек игр
        container.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const gameId = card.getAttribute('data-game-id');
                this.openGame(gameId);
            });
        });
    }

    displayAchievements() {
        const container = document.getElementById('achievementsContainer');
        if (!container) return;

        container.innerHTML = this.achievements.map(achievement => `
            <div class="achievement-card ${achievement.unlocked ? '' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                    ${achievement.unlocked ? '<small class="achievement-unlocked">✔️ Получено</small>' : ''}
                </div>
            </div>
        `).join('');
    }

    openGame(gameId) {
        console.log('Opening game:', gameId);
        const game = this.games.find(g => g.id === gameId);
        if (!game) {
            console.error('Игра не найдена:', gameId);
            return;
        }

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
        const modalTitle = document.getElementById('modalGameTitle');
        const gameContent = document.getElementById('gameContent');
        
        if (!modalTitle || !gameContent) {
            console.error('Элементы модального окна не найдены!');
            return;
        }

        modalTitle.textContent = game.title;
        
        // Load game template
        if (gameTemplates[gameId]) {
            gameContent.innerHTML = gameTemplates[gameId];
            
            // Initialize specific game
            setTimeout(() => {
                this.initializeGame(gameId);
            }, 50);
        } else {
            gameContent.innerHTML = `
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

    initializeGame(gameId) {
        console.log('Initializing game:', gameId);
        switch(gameId) {
            case 'neuron-2048':
                if (typeof init2048 === 'function') {
                    init2048();
                }
                break;
            case 'memory-cards':
                if (typeof initMemoryGame === 'function') {
                    initMemoryGame();
                }
                break;
            case 'typing-master':
                if (typeof initTypingGame === 'function') {
                    initTypingGame();
                }
                break;
            case 'math-challenge':
                if (typeof initMathGame === 'function') {
                    initMathGame();
                }
                break;
            case 'aim-trainer':
                if (typeof initAimTrainer === 'function') {
                    initAimTrainer();
                }
                break;
            default:
                console.log('Инициализация игры не требуется:', gameId);
        }
    }

    unlockAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.stats.achievementsUnlocked++;
            this.saveAchievements();
            this.displayAchievements();
            this.showNotification(`🎉 Достижение разблокировано: ${achievement.title}!`);
            this.addXP(25);
        }
    }

    updateStatsDisplay() {
        const totalGamesEl = document.getElementById('totalGames');
        const bestScoreEl = document.getElementById('bestScore');
        const playerLevelEl = document.getElementById('playerLevel');
        const levelProgressEl = document.getElementById('levelProgress');
        const currentLevelEl = document.getElementById('currentLevel');
        const currentXPEl = document.getElementById('currentXP');
        const nextLevelXPEl = document.getElementById('nextLevelXP');

        if (totalGamesEl) totalGamesEl.textContent = this.games.length;
        
        // Calculate best score from all games
        const bestScores = Object.values(this.stats.bestScores);
        const bestScore = bestScores.length > 0 ? Math.max(...bestScores) : 0;
        if (bestScoreEl) bestScoreEl.textContent = bestScore;
        
        if (playerLevelEl) playerLevelEl.textContent = this.stats.playerLevel;
        
        // Update level progress
        const xpForNextLevel = this.stats.playerLevel * 100;
        const progress = (this.stats.playerXP / xpForNextLevel) * 100;
        if (levelProgressEl) levelProgressEl.style.width = `${Math.min(progress, 100)}%`;
        if (currentLevelEl) currentLevelEl.textContent = this.stats.playerLevel;
        if (currentXPEl) currentXPEl.textContent = this.stats.playerXP;
        if (nextLevelXPEl) nextLevelXPEl.textContent = xpForNextLevel;
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
        const searchInput = document.getElementById('gameSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
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

        // Keyboard controls for 2048
        document.addEventListener('keydown', (e) => {
            if (window.game2048 && document.getElementById('gameModal').classList.contains('active')) {
                switch(e.key) {
                    case 'ArrowUp':
                        e.preventDefault();
                        window.game2048.move('up');
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        window.game2048.move('down');
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        window.game2048.move('left');
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        window.game2048.move('right');
                        break;
                }
            }
        });
    }

    loadStatistics() {
        // Update recent scores
        const recentScores = document.getElementById('recentScores');
        if (recentScores) {
            const scores = Object.entries(this.stats.bestScores)
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
            
            recentScores.innerHTML = scores;
        }
    }

    addXP(amount) {
        this.stats.playerXP += amount;
        const xpForNextLevel = this.stats.playerLevel * 100;
        
        if (this.stats.playerXP >= xpForNextLevel) {
            this.stats.playerLevel++;
            this.stats.playerXP -= xpForNextLevel;
            this.showNotification(`🎉 Поздравляем! Вы достигли ${this.stats.playerLevel} уровня!`);
        }
        
        this.saveStats();
        this.updateStatsDisplay();
    }

    showNotification(message) {
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
}

// ==================== GAME FUNCTIONS ====================

// 2048 Game
function init2048() {
    console.log('Initializing 2048...');
    window.game2048 = new Game2048();
}

function start2048() {
    if (window.game2048) {
        window.game2048.init();
    } else {
        init2048();
    }
}

// Memory Game
function initMemoryGame() {
    console.log('Initializing Memory Game...');
    window.memoryGame = new MemoryGame();
}

function startMemoryGame() {
    if (window.memoryGame) {
        window.memoryGame.init();
    } else {
        initMemoryGame();
    }
}

// Typing Game
function initTypingGame() {
    console.log('Initializing Typing Game...');
    window.typingGame = new TypingGame();
}

function startTypingGame() {
    if (window.typingGame) {
        window.typingGame.init();
    } else {
        initTypingGame();
    }
}

// Math Game
function initMathGame() {
    console.log('Initializing Math Game...');
    window.mathGame = new MathGame();
}

function startMathGame() {
    if (window.mathGame) {
        window.mathGame.init();
    } else {
        initMathGame();
    }
}

// Aim Trainer
function initAimTrainer() {
    console.log('Initializing Aim Trainer...');
    window.aimTrainer = new AimTrainer();
}

function startAimTrainer() {
    if (window.aimTrainer) {
        window.aimTrainer.init();
    } else {
        initAimTrainer();
    }
}

// Utility Functions
function checkMathAnswer() {
    const input = document.getElementById('mathAnswer');
    if (input && window.mathGame) {
        window.mathGame.checkAnswer(input.value);
    }
}

function showInstructions2048() {
    const element = document.getElementById('instructions2048');
    if (element) {
        element.style.display = element.style.display === 'none' ? 'block' : 'none';
    }
}

function showInstructionsMemory() {
    const element = document.getElementById('instructionsMemory');
    if (element) {
        element.style.display = element.style.display === 'none' ? 'block' : 'none';
    }
}

function showInstructionsTyping() {
    const element = document.getElementById('instructionsTyping');
    if (element) {
        element.style.display = element.style.display === 'none' ? 'block' : 'none';
    }
}

function showInstructionsMath() {
    const element = document.getElementById('instructionsMath');
    if (element) {
        element.style.display = element.style.display === 'none' ? 'block' : 'none';
    }
}

function showInstructionsAim() {
    const element = document.getElementById('instructionsAim');
    if (element) {
        element.style.display = element.style.display === 'none' ? 'block' : 'none';
    }
}

function closeGameModal() {
    const modal = document.getElementById('gameModal');
    if (modal) {
        modal.classList.remove('active');
    }
    
    // Stop all game timers
    if (window.memoryGame && window.memoryGame.timerInterval) {
        clearInterval(window.memoryGame.timerInterval);
    }
    if (window.typingGame && window.typingGame.timerInterval) {
        clearInterval(window.typingGame.timerInterval);
    }
    if (window.mathGame && window.mathGame.timerInterval) {
        clearInterval(window.mathGame.timerInterval);
    }
    if (window.aimTrainer && window.aimTrainer.timerInterval) {
        clearInterval(window.aimTrainer.timerInterval);
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeGameModal();
    }
});

// Initialize application
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Neuron Game Hub...');
    app = new NeuronGameHub();
});
