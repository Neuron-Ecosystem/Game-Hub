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
        
        // Initialize service worker for PWA capabilities
        this.initServiceWorker();
    }

    initServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker registration failed'));
        }
    }

    loadStats() {
        try {
            const saved = localStorage.getItem('neuronGameHubStats');
            if (saved) {
                const stats = JSON.parse(saved);
                // Ensure all required fields exist
                return {
                    totalGamesPlayed: stats.totalGamesPlayed || 0,
                    bestScores: stats.bestScores || {},
                    timePlayed: stats.timePlayed || {},
                    achievementsUnlocked: stats.achievementsUnlocked || 0,
                    playerLevel: stats.playerLevel || 1,
                    playerXP: stats.playerXP || 0,
                    gamesPlayed: stats.gamesPlayed || {}
                };
            }
        } catch (e) {
            console.log('Error loading stats, using defaults');
        }
        
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
            <div class="game-card" data-game-id="${game.id}" role="button" tabindex="0" 
                 aria-label="${game.title}. ${game.description}">
                <div class="game-icon" aria-hidden="true">${game.icon}</div>
                <div class="game-title">${game.title}</div>
                <div class="game-description">${game.description}</div>
                <div class="game-meta">
                    <span>${game.category}</span>
                    <div class="game-difficulty" aria-label="Сложность: ${game.difficulty} из 5">
                        ${[1,2,3,4,5].map(i => `
                            <div class="difficulty-dot ${i <= game.difficulty ? 'active' : ''}"></div>
                        `).join('')}
                    </div>
                </div>
                ${game.featured ? '<div class="featured-badge">Featured</div>' : ''}
            </div>
        `).join('');

        // Add event listeners for game cards
        container.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const gameId = card.getAttribute('data-game-id');
                this.openGame(gameId);
            });
            
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const gameId = card.getAttribute('data-game-id');
                    this.openGame(gameId);
                }
            });
        });
    }

    displayAchievements() {
        const container = document.getElementById('achievementsContainer');
        if (!container) return;

        container.innerHTML = this.achievements.map(achievement => `
            <div class="achievement-card ${achievement.unlocked ? '' : 'locked'}" 
                 aria-label="${achievement.title}. ${achievement.description} ${achievement.unlocked ? 'Разблокировано' : 'Заблокировано'}">
                <div class="achievement-icon" aria-hidden="true">${achievement.icon}</div>
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
            }, 100);
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

        const modal = document.getElementById('gameModal');
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        
        // Trap focus inside modal
        this.trapFocus(modal);
    }

    initializeGame(gameId) {
        console.log('Initializing game:', gameId);
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
            default:
                console.log('Инициализация игры не требуется:', gameId);
        }
    }

    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        modal.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });

        firstElement.focus();
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
                const searchTerm = e.target.value.toLowerCase().trim();
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
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    e.preventDefault();
                    const direction = e.key.replace('Arrow', '').toLowerCase();
                    window.game2048.move(direction);
                }
            }
        });

        // Prevent zoom on mobile
        document.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(e) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
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
                            <span style="color: var(--primary-color); font-weight: bold;">${score}</span>
                        </div>
                    `;
                }).join('') || '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">Нет данных об играх</p>';
            
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
        notification.setAttribute('aria-live', 'polite');
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
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
    window.game2048.init();
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
    window.memoryGame.init();
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
    window.typingGame.init();
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
    window.mathGame.init();
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
    window.aimTrainer.init();
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
        modal.setAttribute('aria-hidden', 'true');
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

// Close modal when clicking outside or pressing Escape
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeGameModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('gameModal').classList.contains('active')) {
        closeGameModal();
    }
});

// Initialize application
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Neuron Game Hub...');
    app = new NeuronGameHub();
    window.app = app;
});

// Service Worker for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
