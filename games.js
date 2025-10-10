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
