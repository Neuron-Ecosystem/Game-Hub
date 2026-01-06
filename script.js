// Import Firebase Functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyDOaDVzzPjyYm4HWMND2XYWjLy_h4wty5s",
    authDomain: "neuron-ecosystem-2025.firebaseapp.com",
    projectId: "neuron-ecosystem-2025",
    storageBucket: "neuron-ecosystem-2025.firebasestorage.app",
    messagingSenderId: "589834476565",
    appId: "1:589834476565:web:cd4db27c95950b7edd421c",
    measurementId: "G-NSNQGK4THN"
};

// Initialize Firebase
const appFirebase = initializeApp(firebaseConfig);
const analytics = getAnalytics(appFirebase);
const auth = getAuth(appFirebase);
const db = getFirestore(appFirebase);

// Auth Manager Class
class AuthManager {
    constructor(gameHub) {
        this.gameHub = gameHub;
        this.authModal = document.getElementById('authModal');
        this.user = null;
        this.isLoginMode = true;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthState();
    }

    setupEventListeners() {
        // Open/Close Modal
        document.getElementById('openAuthBtn').addEventListener('click', () => this.openModal());
        document.getElementById('closeAuthModal').addEventListener('click', () => this.closeModal());
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());

        // Tab Switching
        const tabs = document.querySelectorAll('.auth-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.isLoginMode = e.target.dataset.tab === 'login';
                
                // Update UI
                tabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                
                document.getElementById('authTitle').textContent = this.isLoginMode ? 'Вход в систему' : 'Регистрация';
                document.getElementById('authSubmitBtn').textContent = this.isLoginMode ? 'Войти' : 'Зарегистрироваться';
                document.getElementById('authError').textContent = '';
            });
        });

        // Form Submit
        document.getElementById('authForm').addEventListener('submit', (e) => this.handleEmailAuth(e));

        // Google Login
        document.getElementById('googleLoginBtn').addEventListener('click', () => this.handleGoogleLogin());
    }

    checkAuthState() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                this.user = user;
                this.updateUIForUser(user);
                this.closeModal();
                
                // SYNC DATA: Load from cloud when user logs in
                await this.gameHub.syncWithCloud(user);
                
                if (window.app) window.app.showNotification(`👋 Добро пожаловать, ${user.displayName || user.email}!`);
            } else {
                this.user = null;
                this.updateUIForGuest();
            }
        });
    }

    updateUIForUser(user) {
        document.getElementById('authSection').style.display = 'none';
        const userSection = document.getElementById('userSection');
        userSection.style.display = 'flex';
        
        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');

        userName.textContent = user.displayName || user.email.split('@')[0];
        
        if (user.photoURL) {
            userAvatar.src = user.photoURL;
            userAvatar.style.display = 'block';
        } else {
            userAvatar.style.display = 'none';
        }
    }

    updateUIForGuest() {
        document.getElementById('authSection').style.display = 'flex';
        document.getElementById('userSection').style.display = 'none';
    }

    openModal() {
        this.authModal.classList.add('active');
        document.getElementById('authError').textContent = '';
    }

    closeModal() {
        this.authModal.classList.remove('active');
    }

    async handleEmailAuth(e) {
        e.preventDefault();
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        const errorEl = document.getElementById('authError');

        try {
            if (this.isLoginMode) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (error) {
            console.error(error);
            let msg = 'Произошла ошибка';
            if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                msg = 'Неверный email или пароль';
            } else if (error.code === 'auth/email-already-in-use') {
                msg = 'Email уже используется';
            } else if (error.code === 'auth/weak-password') {
                msg = 'Пароль должен быть не менее 6 символов';
            }
            errorEl.textContent = msg;
        }
    }

    async handleGoogleLogin() {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error(error);
            document.getElementById('authError').textContent = 'Ошибка авторизации через Google';
        }
    }

    async handleLogout() {
        try {
            await signOut(auth);
            // On logout, we might want to keep the current data in local storage 
            // or clear it depending on preference. Usually keeping it is safer for UX.
            if (window.app) window.app.showNotification('Вы успешно вышли');
            // Reload page to reset game states ensures clean slate
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error(error);
        }
    }
}

// Main Application Logic
class NeuronGameHub {
    constructor() {
        this.games = games;
        this.achievements = achievements;
        // Load initial stats from LocalStorage (fastest)
        this.stats = this.loadLocalStats();
        
        // Initialize Auth Manager
        this.authManager = new AuthManager(this);
        
        this.init();
    }

    init() {
        this.displayGames();
        this.displayAchievements();
        this.setupEventListeners();
        this.updateStatsDisplay();
        this.loadAchievements(); // Local load
        
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

    // New Method: Sync with Cloud Firestore
    async syncWithCloud(user) {
        if (!user) return;

        try {
            const userDocRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                // Case 1: User has data in cloud -> Download and overwrite local
                console.log("Found user data in cloud. Syncing...");
                const cloudData = docSnap.data();
                
                this.stats = cloudData.stats || this.stats;
                
                // Merge achievements: unlock if unlocked in cloud OR locally
                if (cloudData.achievements) {
                    this.achievements = this.achievements.map(localAch => {
                        const cloudAch = cloudData.achievements.find(a => a.id === localAch.id);
                        if (cloudAch && cloudAch.unlocked) {
                            return { ...localAch, unlocked: true };
                        }
                        return localAch;
                    });
                }
                
                this.saveLocalStats(); // Save cloud data to local storage for offline use
                this.updateStatsDisplay();
                this.displayAchievements();
                this.showNotification("☁️ Прогресс синхронизирован!");
            } else {
                // Case 2: User is new in cloud -> Upload local Guest data to cloud
                console.log("New cloud user. Uploading local progress...");
                await this.saveStatsToCloud();
            }
        } catch (e) {
            console.error("Error syncing with cloud:", e);
        }
    }

    loadLocalStats() {
        try {
            const saved = localStorage.getItem('neuronGameHubStats');
            if (saved) {
                const stats = JSON.parse(saved);
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

    // Unified Save Method
    async saveStats() {
        // 1. Always save to Local Storage (fast, offline)
        this.saveLocalStats();

        // 2. If User is logged in, save to Cloud (async)
        await this.saveStatsToCloud();
    }

    saveLocalStats() {
        try {
            localStorage.setItem('neuronGameHubStats', JSON.stringify(this.stats));
        } catch (e) {
            console.log('Не удалось сохранить статистику локально');
        }
    }

    async saveStatsToCloud() {
        const user = auth.currentUser;
        if (!user) return; // Guest mode - do nothing

        try {
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, {
                stats: this.stats,
                achievements: this.achievements.map(a => ({ id: a.id, unlocked: a.unlocked })), // Save minimal achievement data
                lastUpdated: new Date()
            }, { merge: true });
            console.log("Saved to cloud");
        } catch (e) {
            console.error("Error saving to cloud:", e);
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
            // Trigger cloud save as well because achievements changed
            this.saveStatsToCloud();
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
        this.saveStats(); // Now saves to Cloud if logged in
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
                // Check if init2048 exists globally (from games.js)
                if (typeof init2048 === 'function') init2048();
                break;
            case 'memory-cards':
                if (typeof initMemoryGame === 'function') initMemoryGame();
                break;
            case 'typing-master':
                if (typeof initTypingGame === 'function') initTypingGame();
                break;
            case 'math-challenge':
                if (typeof initMathGame === 'function') initMathGame();
                break;
            case 'aim-trainer':
                if (typeof initAimTrainer === 'function') initAimTrainer();
                break;
            default:
                console.log('Инициализация игры не требуется:', gameId);
        }
    }

    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length === 0) return;

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
            this.saveAchievements(); // Saves to local + cloud
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
        
        this.saveStats(); // Now saves to Cloud if logged in
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

// Global functions for HTML onclick handlers
window.start2048 = function() { if (typeof window.game2048 !== 'undefined') window.game2048.init(); else if (typeof init2048 === 'function') init2048(); };
window.startMemoryGame = function() { if (typeof window.memoryGame !== 'undefined') window.memoryGame.init(); else if (typeof initMemoryGame === 'function') initMemoryGame(); };
window.startTypingGame = function() { if (typeof window.typingGame !== 'undefined') window.typingGame.init(); else if (typeof initTypingGame === 'function') initTypingGame(); };
window.startMathGame = function() { if (typeof window.mathGame !== 'undefined') window.mathGame.init(); else if (typeof initMathGame === 'function') initMathGame(); };
window.startAimTrainer = function() { if (typeof window.aimTrainer !== 'undefined') window.aimTrainer.init(); else if (typeof initAimTrainer === 'function') initAimTrainer(); };

window.checkMathAnswer = function() { 
    const input = document.getElementById('mathAnswer');
    if (input && window.mathGame) {
        window.mathGame.checkAnswer(input.value);
    }
};

window.showInstructions2048 = function() { toggleDisplay('instructions2048'); };
window.showInstructionsMemory = function() { toggleDisplay('instructionsMemory'); };
window.showInstructionsTyping = function() { toggleDisplay('instructionsTyping'); };
window.showInstructionsMath = function() { toggleDisplay('instructionsMath'); };
window.showInstructionsAim = function() { toggleDisplay('instructionsAim'); };

function toggleDisplay(id) {
    const element = document.getElementById(id);
    if (element) {
        element.style.display = element.style.display === 'none' ? 'block' : 'none';
    }
}

window.closeGameModal = function() {
    const modal = document.getElementById('gameModal');
    if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    }
    
    // Stop all game timers
    if (window.memoryGame && window.memoryGame.timerInterval) clearInterval(window.memoryGame.timerInterval);
    if (window.typingGame && window.typingGame.timerInterval) clearInterval(window.typingGame.timerInterval);
    if (window.mathGame && window.mathGame.timerInterval) clearInterval(window.mathGame.timerInterval);
    if (window.aimTrainer && window.aimTrainer.timerInterval) clearInterval(window.aimTrainer.timerInterval);
};

// Close modal when clicking outside or pressing Escape
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        if (e.target.id === 'gameModal') window.closeGameModal();
        if (e.target.id === 'authModal') document.getElementById('authModal').classList.remove('active');
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (document.getElementById('gameModal').classList.contains('active')) window.closeGameModal();
        if (document.getElementById('authModal').classList.contains('active')) document.getElementById('authModal').classList.remove('active');
    }
});

// Initialize application
let app;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Neuron Game Hub...');
    app = new NeuronGameHub();
    window.app = app;
});
