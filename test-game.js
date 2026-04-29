const { Game, Card, Player } = require('./src/game');

console.log('=== 全面测试游戏逻辑 ===\n');

function runTest(testName, testFn) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`测试: ${testName}`);
  console.log(`${'='.repeat(60)}\n`);
  testFn();
}

runTest('场景1: 基本收牌 - 匹配最早的相同牌', () => {
  const game = new Game();
  game.player.hand = [];
  game.ai.hand = [];
  
  game.playedCards = [
    new Card('hearts', 'A', 'A'),
    new Card('spades', '2', '2'),
    new Card('diamonds', '3', '3'),
    new Card('clubs', '2', '2'),
    new Card('hearts', '5', '5'),
  ];
  
  game.player.hand.push(new Card('spades', 'A', 'A'));
  
  console.log('已出牌序列:');
  game.playedCards.forEach((c, i) => console.log(`  [${i}] ${c.displayValue}${c.suitSymbol} (id: ${c.id})`));
  console.log('\n玩家出: A♠');
  console.log('期望: 收集 [A♥, 2♠, 3♦, 2♣, 5♥, A♠] 共 6 张牌\n');
  
  const result = game.playCard('player');
  
  console.log('结果:');
  console.log(`  操作类型: ${result.lastAction.type}`);
  console.log(`  收集牌数: ${result.lastAction.collectedCards.length}`);
  console.log('  收集的牌:');
  result.lastAction.collectedCards.forEach((c, i) => 
    console.log(`    [${i}] ${c.displayValue}${c.suitSymbol} (id: ${c.id})`));
  console.log(`  玩家得分: ${game.player.score}`);
  console.log(`  剩余已出牌: ${game.playedCards.length} 张`);
  
  const success = result.lastAction.collectedCards.length === 6 && game.player.score === 6;
  console.log(`\n  测试结果: ${success ? '✅ 通过' : '❌ 失败'}`);
});

runTest('场景2: 连续匹配 - 匹配最近的相同牌', () => {
  const game = new Game();
  game.player.hand = [];
  game.ai.hand = [];
  
  game.playedCards = [
    new Card('hearts', 'A', 'A'),
    new Card('spades', '2', '2'),
    new Card('diamonds', '3', '3'),
    new Card('clubs', '2', '2'),
    new Card('hearts', '5', '5'),
  ];
  
  game.player.hand.push(new Card('spades', '2', '2'));
  
  console.log('已出牌序列:');
  game.playedCards.forEach((c, i) => console.log(`  [${i}] ${c.displayValue}${c.suitSymbol}`));
  console.log('\n玩家出: 2♠');
  console.log('期望: 匹配最近的 2♣ (索引3)，收集 [2♣, 5♥, 2♠] 共 3 张牌');
  console.log('     : 剩余已出牌应该是 [A♥, 2♠, 3♦]\n');
  
  const result = game.playCard('player');
  
  console.log('结果:');
  console.log(`  操作类型: ${result.lastAction.type}`);
  console.log(`  匹配索引: ${result.lastAction.matchIndex}`);
  console.log(`  收集牌数: ${result.lastAction.collectedCards.length}`);
  console.log('  收集的牌:');
  result.lastAction.collectedCards.forEach((c, i) => 
    console.log(`    [${i}] ${c.displayValue}${c.suitSymbol}`));
  console.log(`  玩家得分: ${game.player.score}`);
  console.log(`  剩余已出牌: ${game.playedCards.length} 张`);
  if (game.playedCards.length > 0) {
    console.log('  剩余已出牌:');
    game.playedCards.forEach((c, i) => 
      console.log(`    [${i}] ${c.displayValue}${c.suitSymbol}`));
  }
  
  const success = result.lastAction.collectedCards.length === 3 && 
                  game.player.score === 3 && 
                  game.playedCards.length === 3;
  console.log(`\n  测试结果: ${success ? '✅ 通过' : '❌ 失败'}`);
});

runTest('场景3: 大小王匹配', () => {
  const game = new Game();
  game.player.hand = [];
  game.ai.hand = [];
  
  game.playedCards = [
    new Card('hearts', '10', '10'),
    new Card('joker', 'small', '小王'),
    new Card('spades', 'Q', 'Q'),
  ];
  
  game.player.hand.push(new Card('joker', 'big', '大王'));
  
  console.log('已出牌序列:');
  game.playedCards.forEach((c, i) => 
    console.log(`  [${i}] ${c.displayValue} (numericValue: ${c.numericValue}, id: ${c.id})`));
  console.log('\n玩家出: 大王 (numericValue: 14)');
  console.log('期望: 小王和大王 numericValue 都是 14，应该匹配');
  console.log('     : 收集 [小王, Q, 大王] 共 3 张牌\n');
  
  const result = game.playCard('player');
  
  console.log('结果:');
  console.log(`  操作类型: ${result.lastAction.type}`);
  console.log(`  收集牌数: ${result.lastAction.collectedCards.length}`);
  console.log('  收集的牌:');
  result.lastAction.collectedCards.forEach((c, i) => 
    console.log(`    [${i}] ${c.displayValue} (numericValue: ${c.numericValue})`));
  console.log(`  玩家得分: ${game.player.score}`);
  
  const success = result.lastAction.collectedCards.length === 3 && game.player.score === 3;
  console.log(`\n  测试结果: ${success ? '✅ 通过' : '❌ 失败'}`);
});

runTest('场景4: 输赢逻辑 - 得分高的获胜', () => {
  console.log('测试1: 玩家得分高，玩家剩余牌为0');
  const game1 = new Game();
  game1.player.score = 50;
  game1.ai.score = 4;
  game1.player.hand = [];
  game1.ai.hand = [new Card('hearts', 'A', 'A')];
  
  game1.checkGameEnd();
  
  console.log(`  玩家得分: ${game1.player.score}, 剩余牌: ${game1.player.remainingCards}`);
  console.log(`  电脑得分: ${game1.ai.score}, 剩余牌: ${game1.ai.remainingCards}`);
  console.log(`  赢家: ${game1.winner === 'player' ? '玩家' : (game1.winner === 'ai' ? '电脑' : '平局')}`);
  console.log(`  结果: ${game1.winner === 'player' ? '✅ 通过' : '❌ 失败'}`);
  
  console.log('\n测试2: 电脑得分高，电脑剩余牌为0');
  const game2 = new Game();
  game2.player.score = 10;
  game2.ai.score = 44;
  game2.player.hand = [new Card('hearts', 'A', 'A')];
  game2.ai.hand = [];
  
  game2.checkGameEnd();
  
  console.log(`  玩家得分: ${game2.player.score}, 剩余牌: ${game2.player.remainingCards}`);
  console.log(`  电脑得分: ${game2.ai.score}, 剩余牌: ${game2.ai.remainingCards}`);
  console.log(`  赢家: ${game2.winner === 'player' ? '玩家' : (game2.winner === 'ai' ? '电脑' : '平局')}`);
  console.log(`  结果: ${game2.winner === 'ai' ? '✅ 通过' : '❌ 失败'}`);
  
  console.log('\n测试3: 平局');
  const game3 = new Game();
  game3.player.score = 27;
  game3.ai.score = 27;
  game3.player.hand = [];
  game3.ai.hand = [new Card('hearts', 'A', 'A')];
  
  game3.checkGameEnd();
  
  console.log(`  玩家得分: ${game3.player.score}, 剩余牌: ${game3.player.remainingCards}`);
  console.log(`  电脑得分: ${game3.ai.score}, 剩余牌: ${game3.ai.remainingCards}`);
  console.log(`  赢家: ${game3.winner === 'player' ? '玩家' : (game3.winner === 'ai' ? '电脑' : '平局')}`);
  console.log(`  结果: ${game3.winner === 'draw' ? '✅ 通过' : '❌ 失败'}`);
});

runTest('场景5: 连续收牌 - 收牌方继续出牌', () => {
  const game = new Game();
  game.player.hand = [];
  game.ai.hand = [];
  
  game.playedCards = [
    new Card('hearts', 'A', 'A'),
    new Card('spades', '2', '2'),
  ];
  
  game.player.hand.push(
    new Card('diamonds', 'A', 'A'),
    new Card('clubs', '2', '2')
  );
  
  console.log('初始状态:');
  console.log(`  已出牌: ${game.playedCards.map(c => c.displayValue).join(', ')}`);
  console.log(`  玩家手牌: ${game.player.hand.length} 张`);
  console.log(`  当前回合: ${game.currentTurn}\n`);
  
  console.log('--- 第一次出牌: 玩家出 A♦ ---');
  console.log('期望: 匹配 A♥，收集 [A♥, 2♠, A♦] 共 3 张牌');
  console.log('     : 玩家继续出牌（不切换回合）\n');
  
  const result1 = game.playCard('player');
  
  console.log('结果:');
  console.log(`  操作类型: ${result1.lastAction.type}`);
  console.log(`  收集牌数: ${result1.lastAction.collectedCards.length}`);
  console.log(`  当前回合: ${game.currentTurn}`);
  console.log(`  玩家得分: ${game.player.score}`);
  console.log(`  结果: ${result1.lastAction.type === 'collect' && game.currentTurn === 'player' ? '✅ 通过' : '❌ 失败'}`);
  
  console.log('\n--- 第二次出牌: 玩家继续出 2♣ ---');
  console.log('期望: 已出牌为空，无法匹配，切换回合到电脑\n');
  
  game.playedCards = [];
  const result2 = game.playCard('player');
  
  console.log('结果:');
  console.log(`  操作类型: ${result2 ? result2.lastAction.type : '无'}`);
  console.log(`  当前回合: ${game.currentTurn}`);
  console.log(`  结果: ${game.currentTurn === 'ai' ? '✅ 通过' : '❌ 失败'}`);
});

runTest('场景6: 验证 collectedCards 包含所有牌', () => {
  const game = new Game();
  game.player.hand = [];
  game.ai.hand = [];
  
  const cardA1 = new Card('hearts', 'A', 'A');
  const card2 = new Card('spades', '2', '2');
  const card3 = new Card('diamonds', '3', '3');
  const card2_2 = new Card('clubs', '2', '2');
  const cardA2 = new Card('spades', 'A', 'A');
  
  game.playedCards = [cardA1, card2, card3, card2_2];
  game.player.hand.push(cardA2);
  
  console.log('已出牌:');
  game.playedCards.forEach((c, i) => console.log(`  [${i}] ${c.id}`));
  console.log(`\n玩家出: ${cardA2.id}`);
  console.log('\n期望: collectedCards 应包含:\n' +
              `  ${cardA1.id} (匹配的牌)\n` +
              `  ${card2.id} (中间牌)\n` +
              `  ${card3.id} (中间牌)\n` +
              `  ${card2_2.id} (中间牌)\n` +
              `  ${cardA2.id} (当前牌)\n`);
  
  const result = game.playCard('player');
  
  console.log('实际 collectedCards:');
  result.lastAction.collectedCards.forEach((c, i) => 
    console.log(`  [${i}] ${c.id}`));
  
  const collectedIds = result.lastAction.collectedCards.map(c => c.id);
  const expectedIds = [cardA1.id, card2.id, card3.id, card2_2.id, cardA2.id];
  
  const allIncluded = expectedIds.every(id => collectedIds.includes(id));
  const correctCount = result.lastAction.collectedCards.length === 5;
  
  console.log(`\n  所有牌都在 collectedCards 中: ${allIncluded ? '✅' : '❌'}`);
  console.log(`  收集牌数正确 (5张): ${correctCount ? '✅' : '❌'}`);
  console.log(`  测试结果: ${allIncluded && correctCount ? '✅ 通过' : '❌ 失败'}`);
});

console.log('\n' + '='.repeat(60));
console.log('所有测试完成！');
console.log('='.repeat(60));
