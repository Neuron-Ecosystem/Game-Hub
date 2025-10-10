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
    }

    loadStats() {
        const saved = localStorage.getItem('neuronGameHubStats');
        return saved ? JSON.parse(saved) : {
            totalGamesPlayed: 0,
            bestScores: {},
            timePlayed: {},
            achievementsUnlocked: 0,
            playerLevel: 1,
            playerXP: 0
        };
    }

    saveStats() {
        localStorage.setItem('neuronGameHubStats', JSON.stringify(this.stats));
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
                </div>
            </div>
        `).join('');
    }

    openGame(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;

        // Update stats
        this.stats.totalGamesPlayed++;
        this.saveStats();
        this.updateStatsDisplay();

        // Show game modal
        document.getElementById('modalGameTitle').textContent = game.title;
        document.getElementById('gameContent').innerHTML = gameTemplates[gameId] || `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 4rem; margin-bottom: 20px;">${game.icon}</div>
                <h3>${game.title}</h3>
                <p>Эта игра скоро будет доступна!</p>
                <p style="color: var(--text-secondary); margin-top: 20px;">Мы активно работаем над её созданием.</p>
            </div>
        `;

        // Initialize specific game
        if (gameId === 'neuron-2048') {
            setTimeout(() => init2048(), 100);
        }

        document.getElementById('gameModal').classList.add('active');
    }

    updateStatsDisplay() {
        document.getElementById('totalGames').textContent = this.games.length;
        document.getElementById('bestScore').textContent = Math.max(...Object.values(this.stats.bestScores).map(Number), 0);
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

        // Keyboard controls for games
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
    }
}

// Modal functions
function closeGameModal() {
    document.getElementById('gameModal').classList.remove('active');
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
    app = new NeuronGameHub();
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
    const notification = document.createElement('div');
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
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
