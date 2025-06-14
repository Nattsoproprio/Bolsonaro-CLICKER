// Game state
const gameState = {
    cookies: 0,
    cookiesPerSecond: 0,
    clickPower: 1,
    lastSave: Date.now(),
    lastUpdate: Date.now(),
    upgrades: [
        {
            id: 'militar',
            name: 'Militar',
            description: 'Ganha 1 voto por segundo',
            baseCost: 10,
            owned: 0,
            cps: 1,
            costIncrease: 1.15,
            icon: '🎖️'
        },
        {
            id: 'pastor',
            name: 'Pastor',
            description: 'Ganha 5 votos por segundo',
            baseCost: 50,
            owned: 0,
            cps: 5,
            costIncrease: 1.15,
            icon: '✝️'
        },
        {
            id: 'empresario',
            name: 'Empresário',
            description: 'Ganha 10 votos por segundo',
            baseCost: 200,
            owned: 0,
            cps: 10,
            costIncrease: 1.15,
            icon: '💼'
        },
        {
            id: 'fazendeiro',
            name: 'Fazendeiro',
            description: 'Ganha 20 votos por segundo',
            baseCost: 500,
            owned: 0,
            cps: 20,
            costIncrease: 1.15,
            icon: '🚜'
        },
        {
            id: 'politico',
            name: 'Político',
            description: 'Ganha 50 votos por segundo',
            baseCost: 2000,
            owned: 0,
            cps: 50,
            costIncrease: 1.15,
            icon: '🏛️'
        },
        {
            id: 'presidente',
            name: 'Presidente',
            description: 'Ganha 100 votos por segundo',
            baseCost: 5000,
            owned: 0,
            cps: 100,
            costIncrease: 1.15,
            icon: '👔'
        },
        {
            id: 'mito',
            name: 'Mito',
            description: 'Dobra o poder de clique',
            baseCost: 15,
            owned: 0,
            clickPower: 1,
            costIncrease: 1.15,
            icon: '👑'
        }
    ],
    achievements: [
        {
            id: 'first-click',
            name: 'Primeiro Voto',
            description: 'Vote pela primeira vez',
            achieved: false,
            condition: (state) => state.cookies >= 1
        },
        {
            id: 'hundred-cookies',
            name: 'Cem Votos',
            description: 'Consiga 100 votos',
            achieved: false,
            condition: (state) => state.cookies >= 100
        },
        {
            id: 'thousand-cookies',
            name: 'Mil Votos',
            description: 'Consiga 1.000 votos',
            achieved: false,
            condition: (state) => state.cookies >= 1000
        },
        {
            id: 'million-cookies',
            name: 'Milhão de Votos',
            description: 'Consiga 1.000.000 votos',
            achieved: false,
            condition: (state) => state.cookies >= 1000000
        },
        {
            id: 'first-upgrade',
            name: 'Primeiro Apoiador',
            description: 'Contrate seu primeiro apoiador',
            achieved: false,
            condition: (state) => state.upgrades.some(upgrade => upgrade.owned > 0)
        },
        {
            id: 'ten-upgrades',
            name: 'Mestre dos Apoiadores',
            description: 'Tenha 10 apoiadores no total',
            achieved: false,
            condition: (state) => state.upgrades.reduce((total, upgrade) => total + upgrade.owned, 0) >= 10
        }
    ]
};

// DOM elements
let cookiesCountEl;
let cookiesPerSecondEl;
let cookieEl;
let cookieImgEl;
let clickEffectsEl;
let upgradesContainerEl;
let achievementsContainerEl;
let resetBtn;

// Sound effects
const clickAudio = new Audio('sounds/click.mp3');
clickAudio.volume = 0.2;

const achievementAudio = new Audio('sounds/achivement.mp3');
achievementAudio.volume = 0.3;

// Format number with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Calculate the cost of an upgrade
function getUpgradeCost(upgrade) {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costIncrease, upgrade.owned));
}

// Update the game display
function updateDisplay() {
    cookiesCountEl.textContent = formatNumber(Math.floor(gameState.cookies));
    cookiesPerSecondEl.textContent = formatNumber(gameState.cookiesPerSecond);
}

// Update upgrades display
function updateUpgradesDisplay() {
    upgradesContainerEl.innerHTML = '';
    gameState.upgrades.forEach(upgrade => {
        const cost = getUpgradeCost(upgrade);
        const canAfford = gameState.cookies >= cost;

        // Criar o elemento do upgrade
        const upgradeEl = document.createElement('div');
        upgradeEl.setAttribute('data-upgrade-id', upgrade.id);
        upgradeEl.className = `upgrade-item border rounded-lg p-4 transition-all duration-200 ${canAfford
                ? 'bg-blue-50 border-blue-300 hover:bg-blue-100 cursor-pointer transform hover:scale-105'
                : 'bg-gray-100 border-gray-300 opacity-75'
            }`;

        const ownedCount = upgrade.owned || 0;
        let nextBonus = '';
        if (upgrade.cps) {
            nextBonus = `+${upgrade.cps} vps`;
        } else if (upgrade.clickPower) {
            nextBonus = `x${Math.pow(2, ownedCount + 1)} votos`;
        }

        upgradeEl.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center">
                    <span class="text-2xl mr-2">${upgrade.icon}</span>
                    <h3 class="font-bold text-lg text-blue-800">${upgrade.name}</h3>
                </div>
                <span class="bg-blue-200 text-blue-800 px-2 py-1 rounded-full text-xs">${ownedCount}</span>
            </div>
            <p class="text-gray-600 text-sm mb-3">${upgrade.description}</p>
            <div class="flex justify-between items-center">
                <span class="font-bold ${canAfford ? 'text-blue-700' : 'text-gray-500'}">${formatNumber(cost)} votos</span>
                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">${nextBonus}</span>
            </div>
        `;

        // Adicionar evento de clique
        if (canAfford) {
            upgradeEl.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Clique detectado no upgrade:', upgrade.id);
                purchaseUpgrade(upgrade.id);
            });
        }

        upgradesContainerEl.appendChild(upgradeEl);
    });
}

// Purchase an upgrade
function purchaseUpgrade(upgradeId) {
    console.log('Iniciando compra do upgrade:', upgradeId);

    const upgrade = gameState.upgrades.find(u => u.id === upgradeId);
    if (!upgrade) {
        console.log('Upgrade não encontrado:', upgradeId);
        return;
    }

    const cost = getUpgradeCost(upgrade);
    console.log('Custo do upgrade:', cost, 'Votos disponíveis:', gameState.cookies);

    if (gameState.cookies >= cost) {
        console.log('Compra autorizada');

        // Efeito sonoro de compra
        const purchaseSound = new Audio('sounds/purchase.mp3');
        purchaseSound.volume = 0.3;
        purchaseSound.play().catch(() => { });

        gameState.cookies -= cost;
        upgrade.owned++;

        // Apply upgrade effects
        if (upgrade.cps) {
            gameState.cookiesPerSecond += upgrade.cps;
            console.log('Adicionado CPS:', upgrade.cps);
        } else if (upgrade.clickPower) {
            gameState.clickPower *= 2; // Dobra o poder de clique
            console.log('Novo poder de clique:', gameState.clickPower);
        }

        // Check for achievements
        checkAchievements();

        // Update display
        updateDisplay();
        updateUpgradesDisplay();

        // Visual feedback
        const upgradeEl = document.querySelector(`[data-upgrade-id="${upgradeId}"]`);
        if (upgradeEl) {
            // Efeito de destaque
            upgradeEl.classList.add('animate-pulse', 'bg-green-100', 'border-green-400');
            setTimeout(() => {
                upgradeEl.classList.remove('animate-pulse', 'bg-green-100', 'border-green-400');
            }, 1000);

            // Mostrar popup de compra
            const popup = document.createElement('div');
            popup.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out';
            popup.textContent = `Comprado: ${upgrade.name}!`;
            document.body.appendChild(popup);
            setTimeout(() => {
                popup.remove();
            }, 2000);
        }

        // Salvar o estado do jogo
        saveGame();
    } else {
        console.log('Votos insuficientes para compra');
        // Feedback visual quando não pode comprar
        const upgradeEl = document.querySelector(`[data-upgrade-id="${upgradeId}"]`);
        if (upgradeEl) {
            upgradeEl.classList.add('animate-shake');
            setTimeout(() => {
                upgradeEl.classList.remove('animate-shake');
            }, 500);
        }
    }
}

// Check for unlocked achievements
function checkAchievements() {
    let newAchievement = false;
    gameState.achievements.forEach(achievement => {
        if (!achievement.achieved && achievement.condition(gameState)) {
            achievement.achieved = true;
            showAchievementPopup(achievement);
            newAchievement = true;
        }
    });

    if (newAchievement) {
        updateAchievementsDisplay();
    }
}

// Show achievement popup
function showAchievementPopup(achievement) {
    // Play achievement sound
    try {
        achievementAudio.currentTime = 0;
        achievementAudio.play();
    } catch (err) {
        console.warn('Erro ao tocar som de conquista:', err);
    }

    const popup = document.createElement('div');
    popup.className = 'fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-xl transform transition-all duration-500 animate-bounce';
    popup.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-trophy text-2xl mr-3"></i>
            <div>
                <h3 class="font-bold">Conquista Desbloqueada!</h3>
                <p>${achievement.name}</p>
            </div>
        </div>
    `;
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.classList.remove('animate-bounce');
        popup.classList.add('opacity-0', 'translate-y-4');
        setTimeout(() => popup.remove(), 500);
    }, 3000);
}

// Create click effect
function createClickEffect(x, y, amount) {
    // Create number effect
    const effect = document.createElement('div');
    effect.className = 'click-effect text-amber-600 font-bold';
    effect.textContent = `+${amount}`;
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    clickEffectsEl.appendChild(effect);

    // Create ripple effect
    const ripple = document.createElement('div');
    ripple.className = 'cookie-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.width = '50px';
    ripple.style.height = '50px';
    clickEffectsEl.appendChild(ripple);

    setTimeout(() => {
        effect.remove();
        ripple.remove();
    }, 1000);
}

// Handle cookie click
function handleCookieClick(e) {
    // Prevent default behavior
    e.preventDefault();

    // Get click position
    const rect = cookieEl.getBoundingClientRect();
    let x, y;
    if (e.touches) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }

    // Add cookies
    gameState.cookies += gameState.clickPower;

    // Play sound
    try {
        clickAudio.currentTime = 0;
        clickAudio.play();
    } catch (err) {
        // Ignore audio errors
    }

    // Create visual effects
    createClickEffect(x, y, gameState.clickPower);

    // Animate cookie
    cookieEl.classList.remove('cookie-pulse', 'cookie-shake', 'cookie-glow');
    void cookieEl.offsetWidth; // Trigger reflow

    // Randomly choose between different animations
    const animations = ['cookie-pulse', 'cookie-shake', 'cookie-glow'];
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    cookieEl.classList.add(randomAnimation);

    // Check for achievements
    checkAchievements();

    // Update display
    updateDisplay();
}

// Game loop
function gameLoop() {
    const now = Date.now();
    const deltaTime = (now - gameState.lastUpdate) / 1000;
    gameState.lastUpdate = now;

    // Update cookies based on CPS
    gameState.cookies += gameState.cookiesPerSecond * deltaTime;

    // Update display
    updateDisplay();

    // Check achievements
    checkAchievements();

    // Save game every 10 seconds
    if (Math.floor(now / 1000) > Math.floor(gameState.lastSave / 1000)) {
        saveGame();
        updateDisplay();
        updateUpgradesDisplay();
        console.log("PEGARAM MEU TELEFONE")
    }

    requestAnimationFrame(gameLoop);
}

// Save game state
function saveGame() {
    const saveData = {
        cookies: gameState.cookies,
        cookiesPerSecond: gameState.cookiesPerSecond,
        clickPower: gameState.clickPower,
        upgrades: gameState.upgrades.map(upgrade => ({
            id: upgrade.id,
            owned: upgrade.owned
        })),
        achievements: gameState.achievements.map(achievement => ({
            id: achievement.id,
            achieved: achievement.achieved
        })),
        lastUpdate: Date.now()
    };

    try {
        localStorage.setItem('bolsonaroClickerSave', JSON.stringify(saveData));
        gameState.lastSave = Date.now();
        console.log('Jogo salvo com sucesso:', saveData);
    } catch (error) {
        console.error('Erro ao salvar o jogo:', error);
    }
}

// Load game state
function loadGame() {
    try {
        const savedGame = localStorage.getItem('bolsonaroClickerSave');
        if (savedGame) {
            const saveData = JSON.parse(savedGame);

            // Restore basic stats
            gameState.cookies = saveData.cookies || 0;
            gameState.cookiesPerSecond = saveData.cookiesPerSecond || 0;
            gameState.clickPower = saveData.clickPower || 1;

            // Restore upgrades
            if (saveData.upgrades) {
                saveData.upgrades.forEach(savedUpgrade => {
                    const upgrade = gameState.upgrades.find(u => u.id === savedUpgrade.id);
                    if (upgrade) {
                        upgrade.owned = savedUpgrade.owned || 0;
                    }
                });
            }

            // Restore achievements
            if (saveData.achievements) {
                saveData.achievements.forEach(savedAchievement => {
                    const achievement = gameState.achievements.find(a => a.id === savedAchievement.id);
                    if (achievement) {
                        achievement.achieved = savedAchievement.achieved || false;
                    }
                });
            }

            gameState.lastUpdate = saveData.lastUpdate || Date.now();
            gameState.lastSave = gameState.lastUpdate;

            console.log('Jogo carregado com sucesso:', saveData);

            // Update display after loading
            updateDisplay();
            updateUpgradesDisplay();
        }
    } catch (error) {
        console.error('Erro ao carregar o jogo:', error);
        resetGame();
    }
}

// Reset game
function resetGame() {
    // Reset basic stats
    gameState.cookies = 0;
    gameState.cookiesPerSecond = 0;
    gameState.clickPower = 1;

    // Reset upgrades
    gameState.upgrades.forEach(upgrade => {
        upgrade.owned = 0;
    });

    // Reset achievements
    gameState.achievements.forEach(achievement => {
        achievement.achieved = false;
    });

    gameState.lastUpdate = Date.now();
    gameState.lastSave = gameState.lastUpdate;

    // Clear save data
    localStorage.removeItem('bolsonaroClickerSave');

    // Update display
    updateDisplay();
    updateUpgradesDisplay();

    console.log('Jogo resetado');
}

// Update achievements display
function updateAchievementsDisplay() {
    achievementsContainerEl.innerHTML = '';
    gameState.achievements.forEach(achievement => {
        const achievementEl = document.createElement('div');
        achievementEl.className = `achievement-item border rounded-lg p-4 transition-all duration-200 ${achievement.achieved
                ? 'bg-green-50 border-green-300'
                : 'bg-gray-100 border-gray-300 opacity-75'
            }`;

        achievementEl.innerHTML = `
            <div class="flex items-center mb-2">
                <i class="fas fa-trophy text-2xl mr-3 ${achievement.achieved ? 'text-yellow-500' : 'text-gray-400'}"></i>
                <h3 class="font-bold text-lg ${achievement.achieved ? 'text-green-800' : 'text-gray-600'}">${achievement.name}</h3>
            </div>
            <p class="text-sm ${achievement.achieved ? 'text-green-600' : 'text-gray-500'}">${achievement.description}</p>
        `;

        achievementsContainerEl.appendChild(achievementEl);
    });
}

// Initialize the game
function init() {
    // Initialize DOM elements
    cookiesCountEl = document.getElementById('cookies-count');
    cookiesPerSecondEl = document.getElementById('cookies-per-second');
    cookieEl = document.getElementById('cookie');
    cookieImgEl = cookieEl.querySelector('img');
    clickEffectsEl = document.getElementById('click-effects');
    upgradesContainerEl = document.getElementById('upgrades-container');
    achievementsContainerEl = document.getElementById('achievements-container');
    resetBtn = document.getElementById('reset-btn');

    // Verify if all elements were found
    if (!cookiesCountEl || !cookiesPerSecondEl || !cookieEl || !clickEffectsEl ||
        !upgradesContainerEl || !achievementsContainerEl || !resetBtn) {
        console.error('Some DOM elements were not found!');
        return;
    }

    // Load saved game
    loadGame();

    // Set up event listeners
    cookieEl.addEventListener('click', handleCookieClick);
    cookieEl.addEventListener('touchstart', handleCookieClick);
    cookieEl.addEventListener('dblclick', (e) => e.preventDefault()); // Prevent double-click

    // Reset button
    resetBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja resetar o jogo?')) {
            resetGame();
            saveGame();
        }
    });

    // Start game loop
    gameState.lastUpdate = Date.now();
    requestAnimationFrame(gameLoop);

    // Initial display update
    updateDisplay();
    updateUpgradesDisplay();
    updateAchievementsDisplay();
}

// Start the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 