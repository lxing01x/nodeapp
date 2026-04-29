const { Game, Card, Player } = require('./src/game');

console.log('=== 测试收牌逻辑 ===\n');

const game = new Game();

console.log('初始状态:');
console.log(`玩家剩余牌: ${game.player.remainingCards}`);
console.log(`电脑剩余牌: ${game.ai.remainingCards}`);
console.log(`玩家得分: ${game.player.score}`);
console.log(`电脑得分: ${game.ai.score}\n`);

game.player.hand = [];
game.ai.hand = [];

const testCards = [
  new Card('hearts', 'A', 'A'),
  new Card('spades', '2', '2'),
  new Card('diamonds', '3', '3'),
  new Card('clubs', '2', '2'),
  new Card('hearts', '5', '5'),
];

const playerCard1 = new Card('spades', 'A', 'A');
const playerCard2 = new Card('diamonds', '2', '2');

game.player.hand.push(playerCard1, playerCard2);
game.ai.hand.push(new Card('clubs', 'K', 'K'));

console.log('测试场景1: 已出牌 [A, 2, 3, 2, 5]，玩家出 A');
console.log('期望: 应该收集 [A, 2, 3, 2, 5, A] 共 6 张牌\n');

game.playedCards = [...testCards];

console.log(`出牌前已出牌数: ${game.playedCards.length}`);
console.log('已出牌序列:');
game.playedCards.forEach((c, i) => console.log(`  [${i}] ${c.displayValue}${c.suitSymbol}`));
console.log();

const result1 = game.playCard('player');

console.log(`\n出牌结果:`);
console.log(`当前出的牌: ${result1.card.displayValue}${result1.card.suitSymbol}`);
console.log(`操作类型: ${result1.lastAction.type}`);
if (result1.lastAction.type === 'collect') {
  console.log(`收集的牌数: ${result1.lastAction.collectedCards.length}`);
  console.log('收集的牌:');
  result1.lastAction.collectedCards.forEach((c, i) => console.log(`  [${i}] ${c.displayValue}${c.suitSymbol}`));
  console.log(`匹配索引: ${result1.lastAction.matchIndex}`);
}
console.log(`玩家得分: ${game.player.score}`);
console.log(`剩余已出牌数: ${game.playedCards.length}`);
if (game.playedCards.length > 0) {
  console.log('剩余已出牌:');
  game.playedCards.forEach((c, i) => console.log(`  [${i}] ${c.displayValue}${c.suitSymbol}`));
}

console.log('\n=== 测试场景2: 验证大小王视为同一数字 ===\n');

const game2 = new Game();
game2.player.hand = [new Card('joker', 'big', '大王')];
game2.ai.hand = [];

game2.playedCards = [
  new Card('hearts', '10', '10'),
  new Card('joker', 'small', '小王'),
  new Card('spades', 'Q', 'Q'),
];

console.log('已出牌序列:');
game2.playedCards.forEach((c, i) => console.log(`  [${i}] ${c.displayValue} (numericValue: ${c.numericValue})`));
console.log('\n玩家出: 大王 (numericValue: 14)');
console.log('期望: 小王和大王 numericValue 都是 14，应该匹配，收集 [小王, Q, 大王] 共 3 张牌\n');

const result2 = game2.playCard('player');

console.log(`出牌结果:`);
console.log(`操作类型: ${result2.lastAction.type}`);
if (result2.lastAction.type === 'collect') {
  console.log(`收集的牌数: ${result2.lastAction.collectedCards.length}`);
  console.log('收集的牌:');
  result2.lastAction.collectedCards.forEach((c, i) => console.log(`  [${i}] ${c.displayValue} (numericValue: ${c.numericValue})`));
}
console.log(`玩家得分: ${game2.player.score}`);

console.log('\n=== 测试场景3: 输赢逻辑验证 ===\n');

const game3 = new Game();
game3.player.score = 50;
game3.ai.score = 4;
game3.player.hand = [];
game3.ai.hand = [new Card('hearts', 'A', 'A')];

console.log('状态:');
console.log(`玩家得分: ${game3.player.score}, 剩余牌: ${game3.player.remainingCards}`);
console.log(`电脑得分: ${game3.ai.score}, 剩余牌: ${game3.ai.remainingCards}`);
console.log('\n玩家没有牌了，游戏结束');
console.log('期望: 玩家得分 50 > 电脑得分 4，玩家获胜\n');

game3.checkGameEnd();

console.log(`游戏结束: ${game3.gameEnded}`);
console.log(`赢家: ${game3.winner === 'player' ? '玩家' : (game3.winner === 'ai' ? '电脑' : '平局')}`);

console.log('\n=== 测试完成 ===');
