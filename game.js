const POINTS_PER_TRICK = 1;
const POINTS_FOR_OVERTHROW_WIN = 2;
const POINTS_FOR_CLOSE = 5;
const POINTS_PER_LEFT = 1;
const POINTS_TO_WIN = 21;
const PASS_PLAY = { pass: true };

class Card {
    constructor(suit, value, extras = {}) {
        this.suit = suit;
        this.value = value;
        this.isJoker = Boolean(extras.isJoker);
        this.jokerId = extras.jokerId || 0;
        this.numericValue = this.getNumericValue();
        this.color = this.isJoker ? 'joker' : ((suit === '♥' || suit === '♦') ? 'red' : 'black');
    }

    getNumericValue() {
        if (this.isJoker) return 15;
        if (this.value === 'K') return 13;
        if (this.value === 'Q') return 12;
        if (this.value === 'J') return 11;
        if (this.value === 'A') return 1;
        return parseInt(this.value, 10);
    }

    toString() {
        if (this.isJoker) return `★${this.jokerId}`;
        return `${this.value}${this.suit}`;
    }

    label() {
        return this.isJoker ? 'Comodín' : this.toString();
    }

    createElement() {
        const el = document.createElement('div');
        el.className = `card ${this.color}`;
        el.dataset.card = this.toString();
        if (this.isJoker) {
            el.innerHTML = `
                <span class="corner tl"><span>★</span></span>
                <span class="pip">🃏</span>
                <span class="joker-label">Comodín</span>
                <span class="corner br"><span>★</span></span>
            `;
            return el;
        }
        el.innerHTML = `
            <span class="corner tl"><span>${this.value}</span><span>${this.suit}</span></span>
            <span class="pip">${this.suit}</span>
            <span class="corner br"><span>${this.value}</span><span>${this.suit}</span></span>
        `;
        return el;
    }
}

class Deck {
    constructor() {
        this.cards = [];
        this.reset();
    }

    reset() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.cards = [];
        for (const suit of suits) {
            for (const value of values) {
                this.cards.push(new Card(suit, value));
            }
        }
        this.cards.push(new Card('★', 'Joker', { isJoker: true, jokerId: 1 }));
        this.cards.push(new Card('★', 'Joker', { isJoker: true, jokerId: 2 }));
        this.shuffle();
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal() {
        return this.cards.pop();
    }

    size() {
        return this.cards.length;
    }
}

class Player {
    constructor(name, isHuman = false) {
        this.name = name;
        this.hand = [];
        this.isHuman = isHuman;
        this.handsWon = 0;
        this.score = 0;
    }

    addCard(card) {
        this.hand.push(card);
    }

    removeCard(cardString) {
        const index = this.hand.findIndex(card => card.toString() === cardString);
        if (index !== -1) return this.hand.splice(index, 1)[0];
        return null;
    }

    hasCard(cardString) {
        return this.hand.some(card => card.toString() === cardString);
    }

    hasSuit(suit) {
        return this.hand.some(card => card.suit === suit);
    }

    isEmpty() {
        return this.hand.length === 0;
    }

    overthrowCards(kingCard) {
        if (!kingCard || kingCard.isJoker) return [];
        return this.hand.filter(card => (
            !card.isJoker && card.value === kingCard.value && card.suit !== kingCard.suit
        ));
    }

    getPlayableCards(kingCard) {
        if (!kingCard) return this.hand.slice();
        if (kingCard.isJoker) {
            const jokers = this.hand.filter(card => card.isJoker);
            if (jokers.length) return jokers;
        }
        return this.hand.slice();
    }
}

const PLAYER_NAME_KEY = 'yoSoyElRey.playerName';
const AI_NAMES = [
    'Luis', 'Marta', 'Ana', 'Diego', 'Sofía', 'Nico', 'Clara', 'Tomás',
    'Elena', 'Mateo', 'Inés', 'Bruno', 'Lola', 'Hugo', 'Camila', 'Javier',
];

function sanitizePlayerName(raw) {
    const name = String(raw || '').replace(/\s+/g, ' ').trim().slice(0, 16);
    return name || 'Tú';
}

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function shuffleList(list) {
    const items = list.slice();
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
}

function pickAiNames(count, humanName) {
    const taken = sanitizePlayerName(humanName).toLowerCase();
    const pool = shuffleList(AI_NAMES).filter(name => name.toLowerCase() !== taken);
    const names = [];
    for (let i = 0; i < count; i++) {
        names.push(pool[i] || `Rival ${i + 1}`);
    }
    return names;
}

class Game {
    constructor() {
        this.deck = new Deck();
        this.players = [];
        this.currentPlayerIndex = 0;
        this.currentKing = null;
        this.playedCards = [];
        this.round = 1;
        this.gamePhase = 'waiting';
        this.forceKingCard = null;
        this.trickWinner = null;
        this.kingStartIndex = 0;
        this.kingHistory = [];
        this.deal = 1;
        this.sixRuleActive = false;
        this.overthrowers = new Set();
        this.drawEligible = new Set();
        this.pendingHandWinner = null;
        this.scoreFlash = new Map();
        this.rulesReturnScreen = 'start-screen';
        this.tutorialStep = 0;
        this.toastTimer = null;
        this.turnTimer = null;

        this.initializeEventListeners();
        this.restorePlayerName();
        this.maybeShowFirstTutorial();
    }

    on(id, event, handler) {
        const el = document.getElementById(id);
        if (el) el.addEventListener(event, handler);
    }

    initializeEventListeners() {
        this.on('start-game', 'click', () => this.startGame());
        this.on('mode-solo', 'click', () => this.setGameMode('solo'));
        this.on('mode-table', 'click', () => this.setGameMode('table'));
        this.on('show-rules', 'click', (event) => this.showRules(event));
        this.on('back-to-start', 'click', (event) => this.backFromRules(event));
        this.on('show-tutorial', 'click', () => this.openTutorial());
        this.on('help-ingame', 'click', (event) => this.showRules(event));
        this.on('new-game-ingame', 'click', () => this.playAgain());
        this.on('play-again', 'click', () => this.playAgain());
        this.on('back-to-menu', 'click', () => this.backToMenu());
        this.on('tutorial-next', 'click', () => this.nextTutorial());
        this.on('tutorial-skip', 'click', () => this.closeTutorial(true));
        this.on('draw-take', 'click', () => this.resolveHumanDraw(true));
        this.on('draw-skip', 'click', () => this.resolveHumanDraw(false));
        this.on('pass-trick', 'click', () => this.passTrick(this.human()));
        this.on('felt-stock', 'click', () => this.resolveHumanDraw(true));
        this.on('felt-stock', 'keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            this.resolveHumanDraw(true);
        });
        this.on('player-name', 'keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.startGame();
            }
        });
        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;
            const tutorial = document.getElementById('tutorial-overlay');
            if (tutorial && !tutorial.hidden) this.closeTutorial(true);
        });
    }

    human() {
        return this.players.find(player => player.isHuman);
    }

    current() {
        return this.players[this.currentPlayerIndex];
    }

    isHumanTurn() {
        const current = this.current();
        return Boolean(this.human() && current && current.isHuman);
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
        const screen = document.getElementById(screenId);
        if (screen) screen.classList.add('active');
        if (window.location && window.location.hash) {
            window.history.replaceState(null, '', window.location.href.split('#')[0]);
        }
    }

    showRules(event) {
        if (event) event.preventDefault();
        const active = document.querySelector('.screen.active');
        this.rulesReturnScreen = (active && active.id !== 'rules-screen') ? active.id : 'start-screen';
        this.showScreen('rules-screen');
    }

    backFromRules(event) {
        if (event) event.preventDefault();
        this.showScreen(this.rulesReturnScreen || 'start-screen');
        this.rulesReturnScreen = 'start-screen';
    }

    toast(message) {
        const el = document.getElementById('toast');
        if (!el) return;
        el.textContent = message;
        el.classList.add('show');
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
    }

    later(fn, ms, slot = 'turnTimer') {
        const run = () => fn.call(this);
        if (Game.instant) {
            if (!this._jobs) this._jobs = [];
            this._jobs.push(run);
            if (this._flushing) return;
            this._flushing = true;
            while (this._jobs.length) this._jobs.shift()();
            this._flushing = false;
            return;
        }
        clearTimeout(this[slot]);
        this[slot] = setTimeout(run, ms);
    }

    maybeShowFirstTutorial() {
        if (window.location && window.location.hash === '#rules-screen') return;
        try {
            if (localStorage.getItem('yoSoyElRey.tutorialSeen')) return;
        } catch {
            return;
        }
        this.openTutorial();
    }

    openTutorial() {
        this.tutorialStep = 0;
        this.renderTutorial();
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) overlay.hidden = false;
    }

    closeTutorial(markSeen = true) {
        const overlay = document.getElementById('tutorial-overlay');
        if (overlay) overlay.hidden = true;
        if (markSeen) {
            try { localStorage.setItem('yoSoyElRey.tutorialSeen', '1'); } catch { /* ignore */ }
        }
    }

    nextTutorial() {
        const steps = document.querySelectorAll('.tutorial-step');
        if (this.tutorialStep >= steps.length - 1) {
            this.closeTutorial(true);
            return;
        }
        this.tutorialStep += 1;
        this.renderTutorial();
    }

    renderTutorial() {
        const steps = document.querySelectorAll('.tutorial-step');
        steps.forEach((step, index) => step.classList.toggle('active', index === this.tutorialStep));
        const progress = document.getElementById('tutorial-progress');
        if (progress) progress.textContent = `${this.tutorialStep + 1} / ${steps.length}`;
        const nextBtn = document.getElementById('tutorial-next');
        if (nextBtn) nextBtn.textContent = this.tutorialStep === steps.length - 1 ? 'A la mesa' : 'Siguiente';
    }

    restorePlayerName() {
        const input = document.getElementById('player-name');
        if (!input) return;
        try {
            const saved = localStorage.getItem(PLAYER_NAME_KEY);
            if (saved) input.value = saved;
        } catch {
            /* ignore */
        }
    }

    readPlayerName() {
        const input = document.getElementById('player-name');
        return sanitizePlayerName(input && input.value);
    }

    savePlayerName(name) {
        const input = document.getElementById('player-name');
        if (input && name !== 'Tú') input.value = name;
        try {
            if (name === 'Tú') localStorage.removeItem(PLAYER_NAME_KEY);
            else localStorage.setItem(PLAYER_NAME_KEY, name);
        } catch {
            /* ignore */
        }
    }

    setGameMode(mode) {
        const soloBtn = document.getElementById('mode-solo');
        const tableBtn = document.getElementById('mode-table');
        const tableSetup = document.getElementById('table-setup');
        const hint = document.getElementById('mode-hint');
        if (soloBtn) soloBtn.classList.toggle('active', mode === 'solo');
        if (tableBtn) tableBtn.classList.toggle('active', mode === 'table');
        if (tableSetup) tableSetup.hidden = mode !== 'table';
        if (hint) {
            hint.textContent = mode === 'solo'
                ? '12 cartas, pozo y dos comodines. Sumá hasta 21 puntos.'
                : '8 cartas cada uno. El pozo queda para pescar. Primero en 21 se lleva la corona.';
        }
    }

    startGame() {
        const soloBtn = document.getElementById('mode-solo');
        const isSolo = !soloBtn || soloBtn.classList.contains('active');
        const countInput = document.getElementById('player-count');
        const playerCount = isSolo ? 2 : parseInt(countInput && countInput.value, 10) || 4;
        this.initializePlayers(playerCount);
        this.dealInitialCards();
        this.findInitialPlayer();
        this.showScreen('game-screen');
        this.updateUI();
        const starter = this.current();
        const human = this.human();
        const rivals = this.players.filter(player => !player.isHuman).map(player => player.name);
        this.toast(playerCount === 2
            ? `${human.name} vs ${rivals[0]}. Primero en ${this.pointsToWin()}. Empieza ${starter.name}.`
            : `Mesa de ${playerCount}. Primero en ${this.pointsToWin()}. Empieza ${starter.name}.`);
        this.later(() => this.checkAITurn(), 700, 'turnTimer');
    }

    initializePlayers(count) {
        const humanName = this.readPlayerName();
        this.savePlayerName(humanName);
        const names = pickAiNames(count - 1, humanName);
        this.players = [new Player(humanName, true)];
        for (let i = 1; i < count; i++) {
            this.players.push(new Player(names[i - 1]));
        }
        this.currentPlayerIndex = 0;
        this.gamePhase = 'choosing-king';
        this.currentKing = null;
        this.playedCards = [];
        this.round = 1;
        this.deal = 1;
        this.forceKingCard = null;
        this.trickWinner = null;
        this.kingStartIndex = 0;
        this.kingHistory = [];
        this.sixRuleActive = false;
        this.overthrowers = new Set();
        this.drawEligible = new Set();
        this.pendingHandWinner = null;
        this.scoreFlash = new Map();
        this.handsThisMatch = 0;
        this.hideDrawPrompt();
    }

    pointsToWin() {
        return Game.POINTS_TO_WIN || POINTS_TO_WIN;
    }

    handSize() {
        return this.players.length <= 2 ? 12 : 8;
    }

    dealInitialCards() {
        this.deck.reset();
        const cardsEach = this.handSize();
        for (let i = 0; i < cardsEach; i++) {
            for (const player of this.players) player.addCard(this.deck.deal());
        }
    }

    findInitialPlayer() {
        const heartsKing = this.players.findIndex(player => player.hasCard('K♥'));
        if (heartsKing !== -1) {
            this.currentPlayerIndex = heartsKing;
            this.forceKingCard = 'K♥';
            return;
        }
        this.forceKingCard = null;
        let highest = null;
        let highestPlayer = 0;
        this.players.forEach((player, index) => {
            for (const card of player.hand) {
                if (card.isJoker) continue;
                if (!highest || card.numericValue > highest.numericValue) {
                    highest = card;
                    highestPlayer = index;
                }
            }
        });
        this.currentPlayerIndex = highestPlayer;
    }

    updateUI() {
        this.updateHeader();
        this.updateScoreBoard();
        this.updateSeats();
        this.updateTrick();
        this.updateHand();
        this.updateHints();
        this.updatePassButton();
        this.updateStockInteract();
    }

    updateHeader() {
        const round = document.getElementById('current-round');
        const king = document.getElementById('current-king');
        const suit = document.getElementById('suit-label');
        const stock = document.getElementById('stock-count');
        const headerStock = document.getElementById('header-stock');
        if (round) round.textContent = `Ronda ${this.deal} · Mano ${this.round}`;
        if (king) king.textContent = this.currentKing ? `Rey ${this.currentKing.label()}` : 'Rey —';
        if (stock) stock.textContent = this.players.length ? `Pozo ${this.deck.size()}` : 'Pozo —';
        if (headerStock) headerStock.textContent = this.players.length ? `Pozo ${this.deck.size()}` : 'Pozo —';
        if (suit) {
            if (this.gamePhase === 'drawing') {
                suit.textContent = 'Pesca del pozo';
            } else if (this.gamePhase === 'round-end' && this.trickWinner) {
                suit.textContent = `Gana ${this.trickWinner.name}`;
            } else if (this.currentKing && this.currentKing.isJoker) {
                suit.textContent = 'Rey comodín';
            } else if (this.currentKing) {
                const six = this.sixRuleActive ? ' · la media' : '';
                suit.textContent = `Palo ${this.currentKing.suit} · ${this.currentKing.value}${six}`;
            } else {
                suit.textContent = this.forceKingCard ? 'Abrir con K♥' : 'Esperando Rey';
            }
        }
    }

    updateScoreBoard() {
        const rows = document.getElementById('score-board-rows');
        const target = document.getElementById('score-target');
        if (target) target.textContent = `a ${this.pointsToWin()}`;
        if (!rows) return;
        rows.innerHTML = '';
        if (!this.players.length) return;
        const leadScore = Math.max(...this.players.map(player => player.score));
        this.players.forEach((player, index) => {
            const row = document.createElement('div');
            row.className = 'score-row';
            if (index === this.currentPlayerIndex && this.gamePhase !== 'round-end' && this.gamePhase !== 'drawing') {
                row.classList.add('is-turn');
            }
            if (player.isHuman) row.classList.add('is-you');
            if (player.score === leadScore && leadScore > 0) row.classList.add('is-lead');
            if (this.scoreFlash.get(player) > 0) row.classList.add('is-bump');
            row.innerHTML = `
                <span class="score-name">${escapeHtml(player.name)}</span>
                <span class="score-pts">${player.score}<small> pts</small></span>
                <span class="score-meta">${player.handsWon} manos · ${player.hand.length} cartas</span>
            `;
            rows.appendChild(row);
        });
    }

    bumpScore(player) {
        if (!player) return;
        this.scoreFlash.set(player, (this.scoreFlash.get(player) || 0) + 1);
        this.later(() => {
            const n = (this.scoreFlash.get(player) || 1) - 1;
            if (n <= 0) this.scoreFlash.delete(player);
            else this.scoreFlash.set(player, n);
            this.updateScoreBoard();
        }, 700, 'scoreFlashTimer');
    }

    updateSeats() {
        const area = document.getElementById('players-area');
        if (!area) return;
        area.innerHTML = '';
        this.players.forEach((player, index) => {
            if (player.isHuman) return;
            const seat = document.createElement('div');
            seat.className = 'seat ai';
            if (index === this.currentPlayerIndex) seat.classList.add('turn');
            const backs = `<div class="backs">${'<span class="card-back"></span>'.repeat(Math.min(player.hand.length, 12))}</div>`;
            seat.innerHTML = `
                <div class="seat-name">${escapeHtml(player.name)}</div>
                <div class="seat-role">IA</div>
                ${backs}
            `;
            area.appendChild(seat);
        });
    }

    updateTrick() {
        const area = document.getElementById('played-cards');
        if (!area) return;
        area.innerHTML = '';
        const lead = this.currentLeadCard();
        const currentKingCard = this.currentKing;
        this.playedCards.forEach((entry) => {
            const wrap = document.createElement('div');
            wrap.className = 'play';
            if (!entry.card) {
                if (!entry.passed) return;
                wrap.classList.add('is-pass');
                const chip = document.createElement('span');
                chip.className = 'pass-chip';
                chip.textContent = 'Pasa';
                const name = document.createElement('span');
                name.className = 'play-name';
                name.textContent = entry.player.name;
                wrap.appendChild(chip);
                wrap.appendChild(name);
                area.appendChild(wrap);
                return;
            }
            const isCurrentKing = currentKingCard && entry.card === currentKingCard;
            const isPastKing = this.kingHistory.includes(entry.card) && !isCurrentKing;
            if (isCurrentKing) wrap.classList.add('is-king');
            if (isPastKing) wrap.classList.add('is-overthrown');
            if (entry.card.isJoker) wrap.classList.add('is-joker');
            else if (currentKingCard && currentKingCard.isJoker) wrap.classList.add('is-discard');
            else if (currentKingCard && entry.card.suit !== currentKingCard.suit) wrap.classList.add('is-discard');
            if (lead && entry.card === lead && this.gamePhase !== 'round-end') wrap.classList.add('is-lead');
            if (this.trickWinner && entry.player === this.trickWinner) wrap.classList.add('is-winner');
            const name = document.createElement('span');
            name.className = 'play-name';
            if (isCurrentKing) name.textContent = `${entry.player.name} · Rey`;
            else if (isPastKing) name.textContent = `${entry.player.name} · Derrocado`;
            else if (entry.card.isJoker) name.textContent = `${entry.player.name} · Comodín`;
            else name.textContent = entry.player.name;
            wrap.appendChild(entry.card.createElement());
            wrap.appendChild(name);
            area.appendChild(wrap);
        });
    }

    updateHand() {
        const hand = document.getElementById('hand-cards');
        if (!hand) return;
        hand.innerHTML = '';
        const human = this.human();
        if (!human) return;
        const playable = this.cardsAllowedForHuman();
        const playableSet = new Set(playable.map(card => card.toString()));
        const canClick = this.isHumanTurn() &&
            (this.gamePhase === 'choosing-king' || this.gamePhase === 'playing-cards') &&
            !Game.autoPlay;
        hand.classList.toggle('is-waiting', !canClick);

        human.hand.forEach(card => {
            const el = card.createElement();
            const allowed = playableSet.has(card.toString());
            if (!allowed) el.classList.add('not-playable');
            if (canClick && allowed) {
                el.addEventListener('click', () => this.playFromHand(card));
            }
            hand.appendChild(el);
        });
    }

    cardsAllowedForHuman() {
        const human = this.human();
        if (!human) return [];
        if (this.gamePhase === 'choosing-king') {
            if (this.forceKingCard && human.hasCard(this.forceKingCard)) {
                return human.hand.filter(card => card.toString() === this.forceKingCard);
            }
            return human.hand.slice();
        }
        if (this.gamePhase === 'playing-cards' && this.currentKing) {
            return human.getPlayableCards(this.currentKing);
        }
        return [];
    }

    updateHints() {
        const banner = document.getElementById('turn-hint');
        const rack = document.getElementById('rack-hint');
        const current = this.current();
        const human = this.human();
        let text = 'La mesa está en juego.';

        if (this.gamePhase === 'drawing') {
            text = this.drawEligible.has(human)
                ? 'Descartaste: tocá el pozo para pescar una, o quedate con lo que tenés.'
                : 'Alguien pesca del pozo…';
        } else if (!this.isHumanTurn()) {
            if (human && human.isEmpty()) {
                text = 'Te quedaste sin cartas. Esperá a que se resuelva la ronda.';
            } else {
                text = current ? `${current.name} está jugando…` : 'Espera tu turno.';
            }
        } else if (this.gamePhase === 'choosing-king') {
            text = this.forceKingCard && human && human.hasCard(this.forceKingCard)
                ? 'Tenés el K♥: tocá esa carta. Es el primer Rey de la ronda.'
                : 'Tu turno: tocá una carta para declararla Rey. Esa carta marca el palo.';
        } else if (this.gamePhase === 'playing-cards' && this.currentKing && human) {
            const hasJoker = human.hand.some(card => card.isJoker);
            if (this.currentKing.isJoker) {
                text = hasJoker
                    ? 'El Rey es un comodín: si tenés el otro, tenés que tirarlo.'
                    : 'Rey comodín. Podés descartar una carta, o pasar y guardar la mano. Solo otro comodín gana.';
            } else if (human.hasSuit(this.currentKing.suit)) {
                const left = human.hand.filter(card => card.suit === this.currentKing.suit).length;
                const coups = human.overthrowCards(this.currentKing);
                const coupHint = coups.length
                    ? ` Derrocá con ${this.currentKing.value} de otro palo si querés cambiar el palo.`
                    : '';
                text = `Elegí: una de ${this.currentKing.suit} para competir (tenés ${left}), descartar otra, o pasar y guardarlas.${coupHint}`;
            } else {
                const coups = human.overthrowCards(this.currentKing);
                const drawHint = this.deck.size()
                    ? ' Si descartás, después podés robar del pozo.'
                    : '';
                text = coups.length
                    ? `No tenés ${this.currentKing.suit}. Derrocá con ${this.currentKing.value} de otro palo, descartá, o pasá.`
                    : hasJoker
                        ? `No tenés ${this.currentKing.suit}. Comodín para ganar, descartá, o pasá.${drawHint}`
                        : `No tenés ${this.currentKing.suit}. Descartá una carta o pasá para no competir.${drawHint}`;
            }
        } else if (this.gamePhase === 'round-end' && this.trickWinner) {
            text = `${this.trickWinner.name} ganó la mano.`;
        }

        if (banner) banner.textContent = text;
        if (rack) {
            rack.textContent = this.gamePhase === 'drawing'
                ? (this.drawEligible.has(human) ? '¿Pescás del pozo?' : 'Pozo')
                : this.isHumanTurn()
                    ? (this.gamePhase === 'playing-cards' && this.canPass(human) ? 'Toca una carta o pasá' : 'Toca una carta')
                    : 'Espera';
        }
    }

    playFromHand(card) {
        if (this.gamePhase === 'drawing' || Game.autoPlay) return;
        if (!this.isHumanTurn()) return;
        if (this.gamePhase === 'choosing-king') {
            this.declareKing(card);
            return;
        }
        if (this.gamePhase === 'playing-cards') {
            this.playCardFor(this.human(), card);
        }
    }

    declareKing(card) {
        const player = this.current();
        if (!player || this.gamePhase !== 'choosing-king' || !card) return;
        if (this.forceKingCard && card.toString() !== this.forceKingCard) {
            this.toast('La partida se abre con el Rey de corazones.');
            return;
        }
        const played = player.removeCard(card.toString());
        if (!played) return;
        this.forceKingCard = null;
        this.trickWinner = null;
        this.currentKing = played;
        this.playedCards = [{ card: played, player }];
        this.kingStartIndex = 0;
        this.kingHistory = [played];
        this.sixRuleActive = played.value === '6' && !played.isJoker;
        this.overthrowers = new Set();
        this.drawEligible = new Set();
        this.gamePhase = 'playing-cards';
        const sixNote = this.sixRuleActive ? ' Entra la media: gana lo más cerca del 6.' : '';
        this.toast(`${player.name} declara el Rey: ${played.label()}. Cada uno elige: seguir el palo, derrocar, descartar o pasar.${sixNote}`);
        this.record('king', { player: player.name, card: played.toString(), six: this.sixRuleActive });
        this.continueAfterPlay();
    }

    playCardFor(player, card) {
        if (!player || this.gamePhase !== 'playing-cards' || !card) return;
        if (this.current() !== player) return;
        if (this.playerFinishedHand(player)) return;
        const king = this.currentKing;
        if (player.isHuman && king && !Game.autoPlay) {
            const playable = player.getPlayableCards(king);
            if (!playable.some(c => c.toString() === card.toString())) {
                this.toast(king.isJoker
                    ? 'Si tenés el otro comodín, tenés que tirarlo.'
                    : 'Esa carta no se puede jugar ahora.');
                return;
            }
        }
        const played = player.removeCard(card.toString());
        if (!played) return;
        const overthrew = this.wouldOverthrow(played);
        this.playedCards.push({ card: played, player });
        const followed = king && !king.isJoker && played.suit === king.suit;
        if (!played.isJoker && !overthrew && !followed) {
            this.drawEligible.add(player);
        }
        if (overthrew) {
            this.currentKing = played;
            this.kingStartIndex = this.playedCards.length - 1;
            this.kingHistory.push(played);
            const droppedMedia = this.sixRuleActive;
            this.sixRuleActive = false;
            this.overthrowers.add(player);
            this.toast(`${player.name} derroca al Rey: ahora es ${played.label()}. Cada uno elige de nuevo: palo ${played.suit}, derrocar, descartar o pasar.${droppedMedia ? ' La media se cae.' : ''}`);
            this.record('overthrow', { player: player.name, card: played.toString() });
        }
        this.continueAfterPlay();
    }

    canPass(player) {
        if (this.gamePhase !== 'playing-cards' || !this.currentKing) return false;
        if (!player || player.isEmpty() || this.playerFinishedHand(player)) return false;
        if (this.current() !== player) return false;
        if (this.currentKing.isJoker && player.hand.some(card => card.isJoker)) return false;
        return true;
    }

    updatePassButton() {
        const btn = document.getElementById('pass-trick');
        if (!btn) return;
        const show = this.canPass(this.human()) && this.isHumanTurn() && !Game.autoPlay;
        btn.hidden = !show;
    }

    humanCanDraw() {
        const human = this.human();
        return this.gamePhase === 'drawing'
            && Boolean(human)
            && this.drawEligible.has(human)
            && !human.isEmpty()
            && this.deck.size() > 0
            && !Game.autoPlay;
    }

    updateStockInteract() {
        const stock = document.getElementById('felt-stock');
        if (!stock) return;
        const live = this.humanCanDraw();
        stock.classList.toggle('is-live', live);
        if (live) {
            stock.setAttribute('role', 'button');
            stock.tabIndex = 0;
            stock.setAttribute('aria-label', `Pozo: tocá para robar. Quedan ${this.deck.size()} cartas.`);
        } else {
            stock.removeAttribute('role');
            stock.tabIndex = -1;
            stock.setAttribute('aria-label', 'Pozo');
        }
    }

    flashStock() {
        const stock = document.getElementById('felt-stock');
        if (!stock) return;
        stock.classList.remove('is-taking');
        void stock.offsetWidth;
        stock.classList.add('is-taking');
    }

    passTrick(player) {
        if (!this.canPass(player)) {
            if (player && player.isHuman && this.currentKing && this.currentKing.isJoker && player.hand.some(card => card.isJoker)) {
                this.toast('Si tenés el otro comodín, tenés que tirarlo.');
            }
            return;
        }
        this.playedCards.push({ card: null, player, passed: true });
        this.toast(`${player.name} pasa: guarda las cartas y no compite esta mano.`);
        this.record('pass', { player: player.name });
        this.continueAfterPlay();
    }

    wouldOverthrow(card, king = this.currentKing) {
        if (!card || !king || card.isJoker || king.isJoker) return false;
        return card.value === king.value && card.suit !== king.suit;
    }

    hasPlayed(player) {
        return this.playedCards.some(entry => entry.player === player);
    }

    hasPlayedSinceCurrentKing(player) {
        const start = this.kingStartIndex || 0;
        return this.playedCards.slice(start).some(entry => entry.player === player);
    }

    playerFinishedHand(player) {
        if (!player || player.isEmpty()) return true;
        if (!this.currentKing) return false;
        return this.hasPlayedSinceCurrentKing(player);
    }

    roundIsComplete() {
        return this.players.every(player => this.playerFinishedHand(player));
    }

    nextActivePlayer() {
        const n = this.players.length;
        for (let i = 0; i < n; i++) {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % n;
            const player = this.current();
            if (!this.playerFinishedHand(player)) return true;
        }
        return false;
    }

    continueAfterPlay() {
        this.updateUI();
        if (this.roundIsComplete()) {
            this.later(() => this.endRound(), 900, 'resolveTimer');
            return;
        }
        if (this.playerFinishedHand(this.current())) {
            this.nextActivePlayer();
        }
        this.updateUI();
        this.later(() => this.checkAITurn(), 550, 'turnTimer');
    }

    checkAITurn() {
        if (this.gamePhase !== 'choosing-king' && this.gamePhase !== 'playing-cards') return;
        if (this.gamePhase === 'playing-cards' && this.roundIsComplete()) {
            this.endRound();
            return;
        }
        const current = this.current();
        if (!current) return;

        if (this.gamePhase === 'playing-cards' && this.playerFinishedHand(current)) {
            if (!this.nextActivePlayer()) {
                this.endRound();
                return;
            }
            this.updateUI();
            this.later(() => this.checkAITurn(), 350, 'turnTimer');
            return;
        }

        if (this.gamePhase === 'choosing-king' && current.isEmpty()) {
            const withCards = this.players.findIndex(player => !player.isEmpty());
            if (withCards === -1) return;
            this.currentPlayerIndex = withCards;
            this.updateUI();
            this.later(() => this.checkAITurn(), 350, 'turnTimer');
            return;
        }

        if (!current.isHuman || Game.autoPlay) this.playAI();
    }

    playAI() {
        const player = this.current();
        if (!player) return;
        if (player.isHuman && !Game.autoPlay) return;

        if (this.gamePhase === 'choosing-king') {
            if (player.isEmpty()) {
                this.checkAITurn();
                return;
            }
            this.declareKing(this.chooseAIKing(player));
            return;
        }

        if (this.gamePhase === 'playing-cards') {
            if (this.playerFinishedHand(player)) {
                this.checkAITurn();
                return;
            }
            const chosen = this.chooseAIPlay(player);
            if (!chosen || chosen === PASS_PLAY) {
                this.passTrick(player);
                return;
            }
            this.playCardFor(player, chosen);
        }
    }

    lowestOf(cards) {
        return cards.slice().sort((a, b) => a.numericValue - b.numericValue)[0];
    }

    highestOf(cards) {
        return cards.slice().sort((a, b) => b.numericValue - a.numericValue)[0];
    }

    cardBeats(card, other, king) {
        if (!other) return true;
        if (card.isJoker) return true;
        if (other.isJoker) return false;
        if (!king || king.isJoker || card.suit !== king.suit) return false;
        if (other.suit !== king.suit) return true;
        if (this.sixRuleActive) {
            const dCard = Math.abs(card.numericValue - 6);
            const dOther = Math.abs(other.numericValue - 6);
            return dCard < dOther || (dCard === dOther && card.numericValue > other.numericValue);
        }
        return card.numericValue > other.numericValue;
    }

    currentLeadCard() {
        const king = this.currentKing;
        if (!king) return null;
        const jokers = this.playedCards.filter(entry => entry.card && entry.card.isJoker);
        if (jokers.length) return jokers[jokers.length - 1].card;
        if (king.isJoker) return king;
        const valid = this.playedCards.filter(entry => entry.card && entry.card.suit === king.suit);
        if (!valid.length) return null;
        let best = valid[0].card;
        for (const entry of valid) {
            if (this.cardBeats(entry.card, best, king)) best = entry.card;
        }
        return best;
    }

    chooseAIKing(player) {
        if (this.forceKingCard) {
            const forced = player.hand.find(card => card.toString() === this.forceKingCard);
            if (forced) return forced;
        }
        if (player.hand.length === 1) return player.hand[0];
        const real = player.hand.filter(card => !card.isJoker);
        if (!real.length) return player.hand[0];
        const six = real.find(card => card.value === '6');
        if (six) return six;
        const kingFace = real.find(card => card.value === 'K');
        if (kingFace) return kingFace;
        const bySuit = {};
        for (const card of real) {
            (bySuit[card.suit] ||= []).push(card);
        }
        const longest = Object.values(bySuit).sort((a, b) => b.length - a.length)[0];
        return this.highestOf(longest);
    }

    chooseAIPlay(player) {
        const king = this.currentKing;
        const hand = player.hand;
        if (!hand.length) return PASS_PLAY;

        const jokers = hand.filter(card => card.isJoker);
        const lead = this.currentLeadCard();
        const overthrow = player.overthrowCards(king);
        const jokerOut = this.playedCards.some(entry => entry.card && entry.card.isJoker);

        if (king && king.isJoker && jokers.length) return jokers[0];

        if (hand.length === 1) {
            const last = hand[0];
            if (last.isJoker || this.wouldOverthrow(last, king) || this.cardBeats(last, lead, king)) {
                return last;
            }
            return PASS_PLAY;
        }

        if (king && !king.isJoker) {
            const suited = hand.filter(card => !card.isJoker && card.suit === king.suit);
            const winners = suited.filter(card => this.cardBeats(card, lead, king));
            if (winners.length) return this.lowestOf(winners);
        }

        if (overthrow.length && !jokerOut) return overthrow[0];

        const threatClose = this.players.some(other => other !== player && other.hand.length <= 1);
        if (jokers.length && (threatClose || (lead && (lead.value === 'K' || lead.isJoker)))) {
            return jokers[0];
        }

        if (this.deck.size() > 0 && hand.length >= 7) {
            const junk = this.chooseDiscard(player, king);
            if (junk) return junk;
        }
        return PASS_PLAY;
    }

    chooseDiscard(player, king) {
        const ranked = player.hand.filter(card => !card.isJoker && card.value !== 'K' && card.value !== '6');
        const off = king && !king.isJoker
            ? ranked.filter(card => card.suit !== king.suit && card.value !== king.value)
            : ranked;
        const pool = off.length ? off : ranked;
        if (!pool.length) return null;
        return this.lowestOf(pool);
    }

    endRound() {
        if (this.gamePhase !== 'playing-cards') return;
        const winner = this.determineWinner();
        const winnerIndex = this.players.indexOf(winner);
        if (!winner || winnerIndex === -1) {
            this.toast('No se pudo resolver la mano.');
            return;
        }
        this.gamePhase = 'round-end';

        this.handsThisMatch = (this.handsThisMatch || 0) + 1;
        if (this.handsThisMatch > 500) {
            this.toast('La partida se corta: demasiadas manos.');
            this.endGame(this.leader());
            return;
        }
        const overthrewAndWon = this.overthrowers.has(winner);
        const trickPts = overthrewAndWon ? POINTS_FOR_OVERTHROW_WIN : POINTS_PER_TRICK;
        winner.handsWon += 1;
        winner.score += trickPts;
        this.trickWinner = winner;
        this.bumpScore(winner);
        this.updateUI();
        this.record('hand', {
            winner: winner.name,
            pts: trickPts,
            overthrow: overthrewAndWon,
            king: this.currentKing && this.currentKing.toString(),
            six: this.sixRuleActive,
            scores: this.players.map(player => `${player.name}:${player.score}`),
            stock: this.deck.size(),
        });

        if (winner.isEmpty()) {
            const leftover = this.players.reduce((sum, player) => (
                player === winner ? sum : sum + player.hand.length
            ), 0);
            const closePts = POINTS_FOR_CLOSE + leftover * POINTS_PER_LEFT;
            winner.score += closePts;
            this.bumpScore(winner);
            this.updateUI();
            const champ = this.leader();
            const tied = this.players.filter(player => player.score === champ.score);
            const totalPts = trickPts + closePts;
            this.record('close', { player: winner.name, leftover, totalPts, score: winner.score });
            if (champ.score >= this.pointsToWin() && tied.length === 1) {
                this.toast(`${winner.name} cierra la ronda (+${totalPts}) y gana la partida con ${champ.score}.`);
                this.later(() => this.endGame(champ), 1400, 'resolveTimer');
                return;
            }
            const extra = champ.score >= this.pointsToWin()
                ? ' Empate en el objetivo: ronda extra.'
                : '';
            this.toast(`${winner.name} cierra la ronda: +${totalPts} (${winner.score} pts).${extra}`);
            this.later(() => this.beginNextDeal(), 1600, 'resolveTimer');
            return;
        }

        const why = overthrewAndWon ? 'derrocó y gana (+2)' : `gana la mano (+${trickPts})`;
        this.toast(`${winner.name} ${why}.`);
        this.later(() => this.startDrawPhase(winner), 1100, 'resolveTimer');
    }

    startDrawPhase(winner) {
        this.pendingHandWinner = winner;
        this.gamePhase = 'drawing';
        this.updateUI();
        this.processDraws();
    }

    processDraws() {
        if (this.deck.size() === 0) {
            this.finishDraws();
            return;
        }
        for (const player of this.players) {
            if (!this.drawEligible.has(player) || player.isEmpty()) continue;
            if (player.isHuman && !Game.autoPlay) continue;
            if (this.shouldAIDraw(player)) this.drawFor(player);
            this.drawEligible.delete(player);
        }
        const human = this.human();
        if (human && this.drawEligible.has(human) && !human.isEmpty() && this.deck.size() > 0 && !Game.autoPlay) {
            this.showDrawPrompt();
            this.updateUI();
            return;
        }
        this.finishDraws();
    }

    shouldAIDraw(player) {
        if (!player || this.deck.size() === 0) return false;
        if (player.hand.length <= 2) return false;
        if (player.hand.length <= 3 && player.score >= this.pointsToWin() - 7) return false;
        return true;
    }

    drawFor(player) {
        const card = this.deck.deal();
        if (!card || !player) return null;
        player.addCard(card);
        this.flashStock();
        this.record('draw', { player: player.name, card: card.toString(), stock: this.deck.size() });
        this.toast(player.isHuman
            ? `Pescaste ${card.label()}. Quedan ${this.deck.size()} en el pozo.`
            : `${player.name} pesca del pozo. Quedan ${this.deck.size()}.`);
        this.updateUI();
        return card;
    }

    showDrawPrompt() {
        const bar = document.getElementById('draw-bar');
        const text = document.getElementById('draw-bar-text');
        const n = this.deck.size();
        if (text) {
            text.textContent = n
                ? `Descartaste en vez de seguir el palo. Tocá el pozo para pescar una — quedan ${n}.`
                : 'El pozo está vacío.';
        }
        if (bar) bar.hidden = false;
        this.updateStockInteract();
    }

    hideDrawPrompt() {
        const bar = document.getElementById('draw-bar');
        if (bar) bar.hidden = true;
        const stock = document.getElementById('felt-stock');
        if (stock) {
            stock.classList.remove('is-live');
            stock.removeAttribute('role');
            stock.tabIndex = -1;
            stock.setAttribute('aria-label', 'Pozo');
        }
    }

    resolveHumanDraw(take) {
        if (this.gamePhase !== 'drawing') return;
        const human = this.human();
        if (!human || !this.drawEligible.has(human)) return;
        if (take && this.deck.size() > 0) this.drawFor(human);
        else if (!take) this.toast('Te quedás con lo que tenés. No pescás.');
        this.drawEligible.delete(human);
        this.hideDrawPrompt();
        this.finishDraws();
    }

    finishDraws() {
        this.hideDrawPrompt();
        this.drawEligible = new Set();
        const winner = this.pendingHandWinner;
        this.pendingHandWinner = null;
        this.later(() => this.beginNextHand(winner), 500, 'resolveTimer');
    }

    record(type, data) {
        if (!Game.record) return;
        if (!Game.log) Game.log = [];
        Game.log.push({ type, deal: this.deal, round: this.round, ...data });
    }

    leader() {
        return this.players.slice().sort((a, b) => b.score - a.score || b.handsWon - a.handsWon)[0];
    }

    beginNextDeal() {
        this.deal += 1;
        this.round = 1;
        this.playedCards = [];
        this.currentKing = null;
        this.trickWinner = null;
        this.kingStartIndex = 0;
        this.kingHistory = [];
        this.forceKingCard = null;
        this.sixRuleActive = false;
        this.overthrowers = new Set();
        this.drawEligible = new Set();
        this.pendingHandWinner = null;
        this.hideDrawPrompt();
        this.players.forEach(player => {
            player.hand = [];
        });
        this.dealInitialCards();
        this.findInitialPlayer();
        this.gamePhase = 'choosing-king';
        this.updateUI();
        const starter = this.current();
        this.toast(`Ronda ${this.deal}. Empieza ${starter.name}.`);
        this.later(() => this.checkAITurn(), 700, 'turnTimer');
    }

    beginNextHand(winner) {
        const winnerIndex = this.players.indexOf(winner);
        if (winnerIndex === -1) return;
        this.playedCards = [];
        this.currentKing = null;
        this.trickWinner = null;
        this.kingStartIndex = 0;
        this.kingHistory = [];
        this.sixRuleActive = false;
        this.overthrowers = new Set();
        this.drawEligible = new Set();
        this.currentPlayerIndex = winnerIndex;
        this.gamePhase = 'choosing-king';
        this.round += 1;
        this.updateUI();
        if (!winner.isHuman || Game.autoPlay) this.later(() => this.checkAITurn(), 600, 'turnTimer');
    }

    determineWinner() {
        const kingCard = this.currentKing;
        if (!kingCard || this.playedCards.length === 0) return this.current();
        const jokers = this.playedCards.filter(entry => entry.card && entry.card.isJoker);
        if (jokers.length) return jokers[jokers.length - 1].player;

        const kingEntry = this.playedCards.find(entry => entry.card === kingCard)
            || this.playedCards[this.kingStartIndex]
            || this.playedCards[0];
        const kingPlayer = kingEntry.player;
        if (kingCard.isJoker) return kingPlayer;

        const validPlays = this.playedCards.filter(entry => entry.card && entry.card.suit === kingCard.suit);
        if (validPlays.length === 0) return kingPlayer;

        let winnerPlay = validPlays[0];
        if (this.sixRuleActive) {
            let minDistance = Math.abs(winnerPlay.card.numericValue - 6);
            for (const entry of validPlays) {
                const distance = Math.abs(entry.card.numericValue - 6);
                if (distance < minDistance ||
                    (distance === minDistance && entry.card.numericValue > winnerPlay.card.numericValue)) {
                    winnerPlay = entry;
                    minDistance = distance;
                }
            }
        } else {
            for (const entry of validPlays) {
                if (entry.card.numericValue > winnerPlay.card.numericValue) winnerPlay = entry;
            }
        }
        return winnerPlay.player;
    }

    endGame(winner) {
        const title = document.getElementById('winner-title');
        const text = document.getElementById('winner-text');
        const list = document.getElementById('final-stats-list');
        if (title) title.textContent = winner.isHuman ? 'La corona es tuya' : `${winner.name} se queda con la mesa`;
        if (text) {
            const scores = this.players.map(player => `${player.name} ${player.score}`).join(' · ');
            text.textContent = winner.isHuman
                ? `Ganaste ${winner.score} a ${this.pointsToWin()} en ${this.deal} ronda${this.deal === 1 ? '' : 's'}. ${scores}.`
                : `${winner.name} llegó a ${winner.score} pts. ${scores}.`;
        }
        if (list) {
            list.innerHTML = '';
            this.players.slice().sort((a, b) => b.score - a.score).forEach(player => {
                const row = document.createElement('div');
                row.className = 'stat-row';
                if (player === winner) row.classList.add('is-winner');
                row.innerHTML = `<span>${escapeHtml(player.name)}</span><span>${player.score} pts · ${player.handsWon} manos</span>`;
                list.appendChild(row);
            });
        }
        this.showScreen('end-screen');
        this.record('end', {
            winner: winner.name,
            scores: this.players.map(player => `${player.name}:${player.score}`),
            deals: this.deal,
        });
    }

    playAgain() {
        if (!this.players.length) return;
        this.clearTimers();
        this.deck = new Deck();
        this.currentKing = null;
        this.playedCards = [];
        this.round = 1;
        this.deal = 1;
        this.players.forEach(player => {
            player.hand = [];
            player.handsWon = 0;
            player.score = 0;
        });
        this.forceKingCard = null;
        this.trickWinner = null;
        this.kingStartIndex = 0;
        this.kingHistory = [];
        this.sixRuleActive = false;
        this.overthrowers = new Set();
        this.drawEligible = new Set();
        this.pendingHandWinner = null;
        this.handsThisMatch = 0;
        this.hideDrawPrompt();
        this.dealInitialCards();
        this.findInitialPlayer();
        this.gamePhase = 'choosing-king';
        this.showScreen('game-screen');
        this.updateUI();
        this.toast('Nueva partida. Los puntos vuelven a cero.');
        this.later(() => this.checkAITurn(), 700, 'turnTimer');
    }

    clearTimers() {
        clearTimeout(this.toastTimer);
        clearTimeout(this.turnTimer);
        clearTimeout(this.resolveTimer);
        clearTimeout(this.scoreFlashTimer);
    }

    backToMenu() {
        this.clearTimers();
        this.gamePhase = 'waiting';
        this.showScreen('start-screen');
    }
}

if (typeof window !== 'undefined') {
    window.Card = Card;
    window.Deck = Deck;
    window.Player = Player;
    window.Game = Game;
    Game.POINTS_TO_WIN = POINTS_TO_WIN;
    Game.POINTS_PER_TRICK = POINTS_PER_TRICK;
    Game.POINTS_FOR_OVERTHROW_WIN = POINTS_FOR_OVERTHROW_WIN;
    Game.POINTS_FOR_CLOSE = POINTS_FOR_CLOSE;
}

function bootGame() {
    if (typeof window !== 'undefined' && window.game) return window.game;
    const game = new Game();
    if (typeof window !== 'undefined') window.game = game;
    return game;
}

function bootWhenReady() {
    if (typeof document === 'undefined') return;
    if (document.getElementById('start-game')) {
        bootGame();
        return;
    }
    document.addEventListener('DOMContentLoaded', bootWhenReady);
}

bootWhenReady();
