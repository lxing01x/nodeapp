class Card {
  constructor(suit, value, displayValue) {
    this.suit = suit;
    this.value = value;
    this.displayValue = displayValue;
    this.id = `${suit}-${value}`;
  }

  get numericValue() {
    if (this.suit === 'joker') {
      return 14;
    }
    
    switch (this.value) {
      case 'A': return 1;
      case 'J': return 11;
      case 'Q': return 12;
      case 'K': return 13;
      default: return parseInt(this.value);
    }
  }

  get suitSymbol() {
    switch (this.suit) {
      case 'spades': return '♠';
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'joker': return this.value === 'big' ? '🃏' : '🂿';
      default: return '';
    }
  }

  get isRed() {
    return this.suit === 'hearts' || this.suit === 'diamonds' || 
           (this.suit === 'joker' && this.value === 'big');
  }
}

class Player {
  constructor(name, isAI = false) {
    this.name = name;
    this.isAI = isAI;
    this.hand = [];
    this.score = 0;
    this.collectedCards = [];
  }

  get remainingCards() {
    return this.hand.length;
  }

  addCardsToHand(cards) {
    this.hand = [...this.hand, ...cards];
  }

  playCard() {
    if (this.hand.length === 0) return null;
    return this.hand.shift();
  }

  collectCards(cards) {
    this.collectedCards = [...this.collectedCards, ...cards];
    this.score += cards.length;
  }
}

class Game {
  constructor() {
    this.deck = this.createDeck();
    this.shuffleDeck();
    
    this.player = new Player('你', false);
    this.ai = new Player('电脑', true);
    
    this.dealCards();
    
    this.playedCards = [];
    this.currentTurn = 'player';
    this.gameStartTime = Date.now();
    this.gameEnded = false;
    this.winner = null;
    this.lastAction = null;
  }

  createDeck() {
    const suits = ['spades', 'hearts', 'diamonds', 'clubs'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    const deck = [];
    
    for (const suit of suits) {
      for (const value of values) {
        deck.push(new Card(suit, value, value));
      }
    }
    
    deck.push(new Card('joker', 'big', '大王'));
    deck.push(new Card('joker', 'small', '小王'));
    
    return deck;
  }

  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  dealCards() {
    const halfDeck = Math.floor(this.deck.length / 2);
    this.player.addCardsToHand(this.deck.slice(0, halfDeck));
    this.ai.addCardsToHand(this.deck.slice(halfDeck));
  }

  playCard(playerType) {
    if (this.gameEnded) return null;
    if (playerType !== this.currentTurn) return null;
    
    const player = playerType === 'player' ? this.player : this.ai;
    const card = player.playCard();
    
    if (!card) {
      this.checkGameEnd();
      return null;
    }
    
    this.playedCards.push(card);
    
    const matchResult = this.checkForMatch(card);
    
    if (matchResult.hasMatch) {
      const collectedCards = this.playedCards.splice(matchResult.startIndex);
      player.collectCards(collectedCards);
      this.lastAction = {
        type: 'collect',
        player: playerType,
        card: card,
        collectedCards: collectedCards,
        matchIndex: matchResult.matchIndex
      };
    } else {
      this.lastAction = {
        type: 'play',
        player: playerType,
        card: card
      };
      this.currentTurn = this.currentTurn === 'player' ? 'ai' : 'player';
    }
    
    this.checkGameEnd();
    
    return {
      card,
      lastAction: this.lastAction,
      currentTurn: this.currentTurn,
      gameEnded: this.gameEnded,
      winner: this.winner
    };
  }

  checkForMatch(card) {
    if (this.playedCards.length <= 1) {
      return { hasMatch: false };
    }
    
    for (let i = this.playedCards.length - 2; i >= 0; i--) {
      const existingCard = this.playedCards[i];
      
      if (existingCard.numericValue === card.numericValue) {
        return {
          hasMatch: true,
          startIndex: i,
          matchIndex: i
        };
      }
    }
    
    return { hasMatch: false };
  }

  checkGameEnd() {
    if (this.player.remainingCards === 0 || this.ai.remainingCards === 0) {
      this.gameEnded = true;
      if (this.player.score > this.ai.score) {
        this.winner = 'player';
      } else if (this.player.score < this.ai.score) {
        this.winner = 'ai';
      } else {
        this.winner = 'draw';
      }
    }
  }

  getGameTime() {
    const endTime = this.gameEnded ? Date.now() : Date.now();
    const diff = Math.floor((endTime - this.gameStartTime) / 1000);
    
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getGameState() {
    return {
      player: {
        name: this.player.name,
        remainingCards: this.player.remainingCards,
        score: this.player.score
      },
      ai: {
        name: this.ai.name,
        remainingCards: this.ai.remainingCards,
        score: this.ai.score
      },
      playedCards: this.playedCards.length,
      currentTurn: this.currentTurn,
      gameTime: this.getGameTime(),
      gameEnded: this.gameEnded,
      winner: this.winner,
      lastAction: this.lastAction
    };
  }
}

module.exports = { Card, Player, Game };
