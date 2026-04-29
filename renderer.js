const { Game, Card } = require('./src/game');

class GameUI {
  constructor() {
    this.game = null;
    this.autoPlayEnabled = false;
    this.autoPlayTimer = null;
    this.timeDisplayTimer = null;
    this.playedCards = [];
    
    this.initializeElements();
    this.initializeEventListeners();
    this.startNewGame();
  }

  initializeElements() {
    this.gameTimeEl = document.getElementById('gameTime');
    this.newGameBtn = document.getElementById('newGameBtn');
    this.playerDeck = document.getElementById('playerDeck');
    this.aiDeck = document.getElementById('aiDeck');
    this.playerScoreEl = document.getElementById('playerScore');
    this.aiScoreEl = document.getElementById('aiScore');
    this.playerCardsEl = document.getElementById('playerCards');
    this.aiCardsEl = document.getElementById('aiCards');
    this.playerDeckCount = document.getElementById('playerDeckCount');
    this.aiDeckCount = document.getElementById('aiDeckCount');
    this.currentTurnText = document.getElementById('currentTurnText');
    this.playedCardsContainer = document.getElementById('playedCardsContainer');
    this.playedCardsCount = document.getElementById('playedCardsCount');
    this.autoPlayToggle = document.getElementById('autoPlayToggle');
    this.gameOverModal = document.getElementById('gameOverModal');
    this.gameResultTitle = document.getElementById('gameResultTitle');
    this.resultIcon = document.getElementById('resultIcon');
    this.resultText = document.getElementById('resultText');
    this.finalGameTime = document.getElementById('finalGameTime');
    this.finalPlayerScore = document.getElementById('finalPlayerScore');
    this.finalAiScore = document.getElementById('finalAiScore');
    this.playAgainBtn = document.getElementById('playAgainBtn');
    this.actionMessage = document.getElementById('actionMessage');
  }

  initializeEventListeners() {
    this.newGameBtn.addEventListener('click', () => this.startNewGame());
    this.playAgainBtn.addEventListener('click', () => {
      this.hideGameOverModal();
      this.startNewGame();
    });
    
    this.playerDeck.addEventListener('click', () => this.playerPlayCard());
    
    this.autoPlayToggle.addEventListener('change', (e) => {
      this.autoPlayEnabled = e.target.checked;
      if (this.autoPlayEnabled) {
        this.startAutoPlay();
      } else {
        this.stopAutoPlay();
      }
    });

    if (window.ipcRenderer) {
      window.ipcRenderer.on('new-game', () => {
        this.startNewGame();
      });
    }
  }

  startNewGame() {
    this.stopAutoPlay();
    this.autoPlayToggle.checked = false;
    this.autoPlayEnabled = false;
    
    this.game = new Game();
    this.playedCards = [];
    this.clearPlayedCards();
    this.updateUI();
    this.startTimeDisplay();
    
    this.showMessage('新游戏开始！点击牌堆出牌');
  }

  startTimeDisplay() {
    if (this.timeDisplayTimer) {
      clearInterval(this.timeDisplayTimer);
    }
    
    this.updateTimeDisplay();
    this.timeDisplayTimer = setInterval(() => {
      this.updateTimeDisplay();
    }, 1000);
  }

  updateTimeDisplay() {
    if (this.game) {
      this.gameTimeEl.textContent = this.game.getGameTime();
    }
  }

  playerPlayCard() {
    if (!this.game || this.game.gameEnded) return;
    if (this.game.currentTurn !== 'player') return;
    
    this.playCard('player');
  }

  aiPlayCard() {
    if (!this.game || this.game.gameEnded) return;
    if (this.game.currentTurn !== 'ai') return;
    
    setTimeout(() => {
      this.playCard('ai');
    }, 600);
  }

  playCard(playerType) {
    if (!this.game || this.game.gameEnded) return;
    
    const result = this.game.playCard(playerType);
    if (!result) return;
    
    const { card, lastAction, currentTurn, gameEnded, winner } = result;
    
    this.addPlayedCard(card, playerType);
    
    if (lastAction.type === 'collect') {
      setTimeout(() => {
        this.highlightAndCollectCards(lastAction);
      }, 300);
      
      const playerName = playerType === 'player' ? '你' : '电脑';
      this.showMessage(`${playerName}收集了 ${lastAction.collectedCards.length} 张牌！`);
    }
    
    setTimeout(() => {
      this.updateUI();
      
      if (gameEnded) {
        this.endGame();
      } else if (currentTurn === 'ai') {
        this.aiPlayCard();
      } else if (this.autoPlayEnabled && currentTurn === 'player') {
        setTimeout(() => this.playerPlayCard(), 600);
      }
    }, lastAction.type === 'collect' ? 1200 : 100);
  }

  addPlayedCard(card, playerType) {
    this.playedCards.push(card);
    
    const cardElement = this.createCardElement(card);
    
    if (this.playedCardsContainer.querySelector('.played-cards-placeholder')) {
      this.playedCardsContainer.innerHTML = '';
    }
    
    this.playedCardsContainer.appendChild(cardElement);
    this.scrollToLastCard();
    
    this.playedCardsCount.textContent = this.playedCards.length;
  }

  createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'played-card';
    cardDiv.dataset.cardId = card.id;
    cardDiv.dataset.index = this.playedCards.length - 1;
    
    const colorClass = card.isRed ? 'card-red' : 'card-black';
    
    let displayValue = card.displayValue;
    if (card.suit === 'joker') {
      displayValue = card.value === 'big' ? '大' : '小';
    }
    
    cardDiv.innerHTML = `
      <div class="card-value-top ${colorClass}">
        <span class="card-number">${displayValue}</span>
        <span class="card-suit-small">${card.suitSymbol}</span>
      </div>
      <div class="card-center ${colorClass}">${card.suitSymbol}</div>
      <div class="card-value-bottom ${colorClass}">
        <span class="card-number">${displayValue}</span>
        <span class="card-suit-small">${card.suitSymbol}</span>
      </div>
    `;
    
    return cardDiv;
  }

  highlightAndCollectCards(lastAction) {
    const startIndex = lastAction.matchIndex;
    const cardElements = this.playedCardsContainer.querySelectorAll('.played-card');
    
    cardElements.forEach((el, index) => {
      if (index >= startIndex) {
        el.classList.add('matching-card');
        
        setTimeout(() => {
          el.classList.add('collected-card');
          
          setTimeout(() => {
            el.remove();
            this.playedCards = this.game.playedCards;
            this.playedCardsCount.textContent = this.playedCards.length;
            
            if (this.playedCardsContainer.children.length === 0) {
              this.playedCardsContainer.innerHTML = '<div class="played-cards-placeholder">点击下方牌堆开始出牌</div>';
            }
          }, 800);
        }, 600);
      }
    });
  }

  clearPlayedCards() {
    this.playedCardsContainer.innerHTML = '<div class="played-cards-placeholder">点击下方牌堆开始出牌</div>';
    this.playedCardsCount.textContent = '0';
  }

  scrollToLastCard() {
    this.playedCardsContainer.scrollLeft = this.playedCardsContainer.scrollWidth;
  }

  updateUI() {
    if (!this.game) return;
    
    const state = this.game.getGameState();
    
    this.playerScoreEl.textContent = state.player.score;
    this.aiScoreEl.textContent = state.ai.score;
    this.playerCardsEl.textContent = state.player.remainingCards;
    this.aiCardsEl.textContent = state.ai.remainingCards;
    this.playerDeckCount.textContent = state.player.remainingCards;
    this.aiDeckCount.textContent = state.ai.remainingCards;
    
    if (state.currentTurn === 'player') {
      this.currentTurnText.textContent = '轮到你出牌';
      this.currentTurnText.style.color = '#4ade80';
      this.playerDeck.classList.add('clickable-deck');
    } else {
      this.currentTurnText.textContent = '电脑思考中...';
      this.currentTurnText.style.color = '#fbbf24';
      this.playerDeck.classList.remove('clickable-deck');
    }
    
    if (state.player.remainingCards === 0) {
      this.playerDeck.style.opacity = '0.5';
      this.playerDeck.style.cursor = 'not-allowed';
    } else {
      this.playerDeck.style.opacity = '1';
    }
    
    if (state.ai.remainingCards === 0) {
      this.aiDeck.style.opacity = '0.5';
    } else {
      this.aiDeck.style.opacity = '1';
    }
  }

  startAutoPlay() {
    if (!this.game || this.game.gameEnded) return;
    if (this.game.currentTurn === 'player') {
      setTimeout(() => this.playerPlayCard(), 600);
    }
  }

  stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearTimeout(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  endGame() {
    this.stopAutoPlay();
    
    if (this.timeDisplayTimer) {
      clearInterval(this.timeDisplayTimer);
    }
    
    setTimeout(() => {
      this.showGameOverModal();
    }, 500);
  }

  showGameOverModal() {
    if (!this.game) return;
    
    const state = this.game.getGameState();
    
    this.finalGameTime.textContent = state.gameTime;
    this.finalPlayerScore.textContent = state.player.score;
    this.finalAiScore.textContent = state.ai.score;
    
    if (state.winner === 'player') {
      this.gameResultTitle.textContent = '🎉 恭喜获胜！';
      this.resultIcon.textContent = '🏆';
      this.resultText.textContent = '你赢了这场比赛！';
      this.resultText.style.color = '#4ade80';
    } else if (state.winner === 'ai') {
      this.gameResultTitle.textContent = '😢 游戏结束';
      this.resultIcon.textContent = '💔';
      this.resultText.textContent = '电脑获胜了，再接再厉！';
      this.resultText.style.color = '#f87171';
    } else {
      this.gameResultTitle.textContent = '🤝 平局';
      this.resultIcon.textContent = '⚖️';
      this.resultText.textContent = '势均力敌，打成平局！';
      this.resultText.style.color = '#fbbf24';
    }
    
    this.gameOverModal.classList.remove('hidden');
  }

  hideGameOverModal() {
    this.gameOverModal.classList.add('hidden');
  }

  showMessage(text) {
    this.actionMessage.textContent = text;
    this.actionMessage.classList.remove('hidden');
    
    setTimeout(() => {
      this.actionMessage.classList.add('hidden');
    }, 2000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new GameUI();
});
