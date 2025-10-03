class CardPackSimulator {
    constructor() {
        this.packsOpened = 0;
        this.rareCards = 0;
        this.cardsPerPack = 5;
        this.rareChance = 0.15; // 15% chance of rare card
        
        this.cardNames = [
            "Brave Warrior", "Wise Mage", "Elven Archer", "Noble Knight",
            "Dark Sorcerer", "Nature Druid", "Sacred Paladin", "Silent Assassin",
            "Furious Berserker", "Devoted Cleric", "Savage Barbarian", "Peaceful Monk",
            "Cunning Explorer", "Defensive Guardian", "Expert Hunter", "Professional Mercenary"
        ];
        
        this.rareCardNames = [
            "Ancient Dragon", "Reborn Phoenix", "Crystal Titan", "Infernal Demon",
            "Celestial Angel", "Abyssal Kraken", "Mystical Unicorn", "Golden Golem",
            "Enchanting Siren", "Legendary Minotaur", "Multi-Headed Hydra", "Wild Chimera"
        ];
        
        this.cardTypes = [
            "Creature", "Spell", "Artifact", "Enchantment", "Instant"
        ];
        
        this.cardDescriptions = [
            "A powerful warrior with exceptional combat skills and unwavering courage in battle.",
            "A mystical spell that harnesses the forces of nature to create devastating magical effects.",
            "An ancient artifact imbued with mysterious powers that can alter the course of destiny.",
            "A permanent enchantment that bestows magical properties upon creatures or objects.",
            "An instant magical effect that can be cast at any time to turn the tide of battle.",
            "A legendary creature with unique abilities that can change the entire game strategy.",
            "A defensive spell that creates protective barriers and shields against enemy attacks.",
            "An offensive artifact that enhances combat capabilities and increases damage output."
        ];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateStats();
    }
    
    bindEvents() {
        const openPackBtn = document.getElementById('open-pack-btn');
        const pack = document.getElementById('pack');
        const modalClose = document.getElementById('modal-close');
        
        openPackBtn.addEventListener('click', () => this.openPack());
        pack.addEventListener('click', () => this.openPack());
        modalClose.addEventListener('click', () => this.closeModal());
        
        // Cerrar modal al hacer clic fuera
        document.getElementById('rare-modal').addEventListener('click', (e) => {
            if (e.target.id === 'rare-modal') {
                this.closeModal();
            }
        });
    }
    
    openPack() {
        const pack = document.getElementById('pack');
        const openPackBtn = document.getElementById('open-pack-btn');
        const cardsContainer = document.getElementById('cards-container');
        
        // Disable button during animation
        openPackBtn.disabled = true;
        openPackBtn.style.opacity = '0.5';
        
        // Animate pack opening
        pack.classList.add('opened');
        
        // Clear previous cards
        cardsContainer.innerHTML = '';
        
        // Wait for pack animation to finish
        setTimeout(() => {
            this.generateCards();
            this.packsOpened++;
            this.updateStats();
            
            // Re-enable button
            openPackBtn.disabled = false;
            openPackBtn.style.opacity = '1';
            
            // Reset pack for next opening
            setTimeout(() => {
                pack.classList.remove('opened');
            }, 2000);
            
        }, 800);
    }
    
    generateCards() {
        const cardsContainer = document.getElementById('cards-container');
        let hasRare = false;
        
        for (let i = 0; i < this.cardsPerPack; i++) {
            const isRare = Math.random() < this.rareChance;
            const card = this.createCard(isRare);
            
            if (isRare) {
                hasRare = true;
                this.rareCards++;
            }
            
            // Add staggered delay for cards
            setTimeout(() => {
                cardsContainer.appendChild(card);
                this.addCardHoverEffect(card);
            }, i * 200);
        }
        
        // Show rare card modal if there's one
        if (hasRare) {
            setTimeout(() => {
                this.showRareModal();
                this.createParticles();
            }, this.cardsPerPack * 200 + 500);
        }
        
        this.updateStats();
    }
    
    createCard(isRare) {
        const card = document.createElement('div');
        card.className = `card ${isRare ? 'rare' : ''}`;
        
        const cardName = isRare 
            ? this.rareCardNames[Math.floor(Math.random() * this.rareCardNames.length)]
            : this.cardNames[Math.floor(Math.random() * this.cardNames.length)];
        
        const cardType = this.cardTypes[Math.floor(Math.random() * this.cardTypes.length)];
        const cardDescription = this.cardDescriptions[Math.floor(Math.random() * this.cardDescriptions.length)];
        const power = isRare 
            ? Math.floor(Math.random() * 50) + 50  // 50-100 for rare cards
            : Math.floor(Math.random() * 30) + 10; // 10-40 for normal cards
        
        const levelOrQuantity = isRare ? `Level: ${Math.floor(Math.random() * 10) + 1}` : `Quantity: ${Math.floor(Math.random() * 99) + 1}`;
        
        card.innerHTML = `
            <div class="card-front">
                <div class="card-content">
                    <div class="card-name">${cardName}</div>
                    <div class="card-image"></div>
                    <div class="card-level-quantity">${levelOrQuantity}</div>
                    <div class="card-type">${cardDescription}</div>
                </div>
            </div>
            <div class="card-back"></div>
        `;
        
        // Cards are no longer clickable for flipping
        
        return card;
    }
    
    addCardHoverEffect(card) {
        card.addEventListener('mouseenter', () => {
            if (card.classList.contains('rare')) {
                this.createSparkles(card);
            }
        });
    }
    
    createSparkles(element) {
        const rect = element.getBoundingClientRect();
        const sparkleCount = 8;
        
        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'particle';
            sparkle.style.left = (rect.left + Math.random() * rect.width) + 'px';
            sparkle.style.top = (rect.top + Math.random() * rect.height) + 'px';
            sparkle.style.background = `hsl(${Math.random() * 60 + 30}, 100%, 60%)`;
            sparkle.style.width = (Math.random() * 4 + 2) + 'px';
            sparkle.style.height = sparkle.style.width;
            
            document.getElementById('particles').appendChild(sparkle);
            
            setTimeout(() => {
                sparkle.remove();
            }, 2000);
        }
    }
    
    createParticles() {
        const particleCount = 20;
        const particlesContainer = document.getElementById('particles');
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.top = Math.random() * window.innerHeight + 'px';
            particle.style.background = `hsl(${Math.random() * 60 + 30}, 100%, 60%)`;
            particle.style.width = (Math.random() * 6 + 4) + 'px';
            particle.style.height = particle.style.width;
            
            particlesContainer.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 2000);
        }
    }
    
    showRareModal() {
        const modal = document.getElementById('rare-modal');
        const rareCardPreview = document.getElementById('rare-card-preview');
        
        // Create a sample rare card for the modal
        const rareName = this.rareCardNames[Math.floor(Math.random() * this.rareCardNames.length)];
        const rareType = this.cardTypes[Math.floor(Math.random() * this.cardTypes.length)];
        const rarePower = Math.floor(Math.random() * 50) + 50;
        
        const rareDescription = this.cardDescriptions[Math.floor(Math.random() * this.cardDescriptions.length)];
        rareCardPreview.innerHTML = `
            <div class="card-content">
                <div class="card-name">${rareName}</div>
                <div class="card-image"></div>
                <div class="card-type" data-full-text="${rareDescription}">${rareDescription}</div>
            </div>
        `;
        
        modal.classList.add('show');
        
        // Create celebration particles
        this.createCelebrationParticles();
    }
    
    createCelebrationParticles() {
        const particleCount = 30;
        const particlesContainer = document.getElementById('particles');
        
        for (let i = 0; i < particleCount; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = (window.innerWidth / 2 + (Math.random() - 0.5) * 200) + 'px';
                particle.style.top = (window.innerHeight / 2 + (Math.random() - 0.5) * 200) + 'px';
                particle.style.background = `hsl(${Math.random() * 60 + 30}, 100%, 60%)`;
                particle.style.width = (Math.random() * 8 + 4) + 'px';
                particle.style.height = particle.style.width;
                
                particlesContainer.appendChild(particle);
                
                setTimeout(() => {
                    particle.remove();
                }, 3000);
            }, i * 50);
        }
    }
    
    closeModal() {
        const modal = document.getElementById('rare-modal');
        modal.classList.remove('show');
    }
    
    updateStats() {
        document.getElementById('packs-opened').textContent = this.packsOpened;
        document.getElementById('rare-cards').textContent = this.rareCards;
    }
}

// Initialize the simulator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CardPackSimulator();
});

// Add simulated sound effects with vibration (if available)
function playSoundEffect(type) {
    if (navigator.vibrate) {
        switch(type) {
            case 'packOpen':
                navigator.vibrate([100, 50, 100]);
                break;
            case 'rareCard':
                navigator.vibrate([200, 100, 200, 100, 200]);
                break;
            case 'cardFlip':
                navigator.vibrate([50]);
                break;
        }
    }
}

// Add sound effects to events
document.addEventListener('DOMContentLoaded', () => {
    const openPackBtn = document.getElementById('open-pack-btn');
    const pack = document.getElementById('pack');
    
    openPackBtn.addEventListener('click', () => playSoundEffect('packOpen'));
    pack.addEventListener('click', () => playSoundEffect('packOpen'));
    
    // Add sound effect to rare cards
    document.addEventListener('click', (e) => {
        if (e.target.closest('.card.rare')) {
            playSoundEffect('rareCard');
        }
    });
});

