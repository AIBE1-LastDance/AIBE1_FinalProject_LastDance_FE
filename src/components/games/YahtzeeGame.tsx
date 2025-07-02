import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RotateCcw, Trophy, HelpCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GameSetupModal from './GameSetupModal';

const YahtzeeGame: React.FC = () => {
  const navigate = useNavigate();
  const [showSetup, setShowSetup] = useState(true);
  const [players, setPlayers] = useState<string[]>([]);
  const [penalty, setPenalty] = useState('');
  const [dice, setDice] = useState<number[]>([1, 1, 1, 1, 1]);
  const [heldDice, setHeldDice] = useState<boolean[]>([false, false, false, false, false]);
  const [rollsLeft, setRollsLeft] = useState(3);
  const [isRolling, setIsRolling] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [scores, setScores] = useState<{[key: string]: {[key: string]: number | null}}>({});
  const [gameEnded, setGameEnded] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

  const handleGameSetup = (playerNames: string[], penaltyText: string) => {
    setPlayers(playerNames);
    setPenalty(penaltyText);
    
    // 각 플레이어별 점수표 초기화
    const initialScores: {[key: string]: {[key: string]: number | null}} = {};
    playerNames.forEach(player => {
      initialScores[player] = {
        ones: null,
        twos: null,
        threes: null,
        fours: null,
        fives: null,
        sixes: null,
        threeOfKind: null,
        fourOfKind: null,
        fullHouse: null,
        smallStraight: null,
        largeStraight: null,
        yahtzee: null,
        chance: null
      };
    });
    setScores(initialScores);
    setShowSetup(false);
  };

  const rollDice = () => {
    if (rollsLeft === 0 || isRolling) return;
    
    setIsRolling(true);
    
    let rollCount = 0;
    const maxRolls = 10;
    
    const rollInterval = setInterval(() => {
      setDice(prev => prev.map((die, index) => 
        heldDice[index] ? die : Math.floor(Math.random() * 6) + 1
      ));
      
      rollCount++;
      if (rollCount >= maxRolls) {
        clearInterval(rollInterval);
        setIsRolling(false);
        setRollsLeft(prev => prev - 1);
      }
    }, 100);
  };

  const toggleHold = (index: number) => {
    if (rollsLeft === 3) return;
    
    setHeldDice(prev => {
      const newHeld = [...prev];
      newHeld[index] = !newHeld[index];
      return newHeld;
    });
  };

  const calculateScore = (category: string): number => {
    const counts = Array(7).fill(0);
    dice.forEach(die => counts[die]++);
    const sum = dice.reduce((a, b) => a + b, 0);

    switch (category) {
      case 'ones': return counts[1] * 1;
      case 'twos': return counts[2] * 2;
      case 'threes': return counts[3] * 3;
      case 'fours': return counts[4] * 4;
      case 'fives': return counts[5] * 5;
      case 'sixes': return counts[6] * 6;
      
      case 'threeOfKind':
        return counts.some(count => count >= 3) ? sum : 0;
      
      case 'fourOfKind':
        return counts.some(count => count >= 4) ? sum : 0;
      
      case 'fullHouse':
        { const hasThree = counts.some(count => count === 3);
        const hasTwo = counts.some(count => count === 2);
        return (hasThree && hasTwo) ? 25 : 0; }
      
      case 'smallStraight':
        { const sortedUnique = [...new Set(dice)].sort();
        const straights = [
          [1, 2, 3, 4],
          [2, 3, 4, 5],
          [3, 4, 5, 6]
        ];
        return straights.some(straight =>
          straight.every(num => sortedUnique.includes(num))
        ) ? 30 : 0; }
      
      case 'largeStraight':
        { const sorted = [...dice].sort();
        return (
          JSON.stringify(sorted) === JSON.stringify([1, 2, 3, 4, 5]) ||
          JSON.stringify(sorted) === JSON.stringify([2, 3, 4, 5, 6])
        ) ? 40 : 0; }
      
      case 'yahtzee':
        return counts.some(count => count === 5) ? 50 : 0;
      
      case 'chance':
        return sum;
      
      default:
        return 0;
    }
  };

  const selectCategory = (category: string) => {
    const currentPlayer = players[currentPlayerIndex];
    if (scores[currentPlayer]?.[category] !== null || rollsLeft === 3) return;
    
    const score = calculateScore(category);
    setScores(prev => ({
      ...prev,
      [currentPlayer]: {
        ...prev[currentPlayer],
        [category]: score
      }
    }));
    
    // 다음 플레이어로 넘어가기
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextPlayerIndex);
    
    // 모든 플레이어가 한 라운드를 완료했으면 턴 증가
    if (nextPlayerIndex === 0) {
      if (currentTurn >= 13) {
        setGameEnded(true);
      } else {
        setCurrentTurn(prev => prev + 1);
      }
    }
    
    // 다음 턴 준비
    setRollsLeft(3);
    setHeldDice([false, false, false, false, false]);
    setDice([1, 1, 1, 1, 1]);
  };

  const getLoser = () => {
    if (players.length === 1) {
      return { player: players[0], penalty };
    }
    
    // 각 플레이어의 총점 계산
    const playerTotals = players.map(player => ({
      player,
      total: getPlayerTotalScore(player)
    }));
    
    // 가장 낮은 점수를 가진 플레이어 찾기
    const loser = playerTotals.reduce((min, current) => 
      current.total < min.total ? current : min
    );
    
    return { player: loser.player, penalty };
  };

  const getPlayerUpperSectionTotal = (player: string) => {
    return ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes']
      .reduce((sum, key) => sum + (scores[player]?.[key] || 0), 0);
  };

  const getPlayerUpperSectionBonus = (player: string) => {
    return getPlayerUpperSectionTotal(player) >= 63 ? 35 : 0;
  };

  const getPlayerLowerSectionTotal = (player: string) => {
    return ['threeOfKind', 'fourOfKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yahtzee', 'chance']
      .reduce((sum, key) => sum + (scores[player]?.[key] || 0), 0);
  };

  const getPlayerTotalScore = (player: string) => {
    return getPlayerUpperSectionTotal(player) + getPlayerUpperSectionBonus(player) + getPlayerLowerSectionTotal(player);
  };

  const resetGame = () => {
    setDice([1, 1, 1, 1, 1]);
    setHeldDice([false, false, false, false, false]);
    setRollsLeft(3);
    setCurrentTurn(1);
    setCurrentPlayerIndex(0);
    
    // 각 플레이어별 점수표 초기화
    const initialScores: {[key: string]: {[key: string]: number | null}} = {};
    players.forEach(player => {
      initialScores[player] = {
        ones: null,
        twos: null,
        threes: null,
        fours: null,
        fives: null,
        sixes: null,
        threeOfKind: null,
        fourOfKind: null,
        fullHouse: null,
        smallStraight: null,
        largeStraight: null,
        yahtzee: null,
        chance: null
      };
    });
    setScores(initialScores);
    setGameEnded(false);
    setHoveredCategory(null);
  };

  const categories = [
    { key: 'ones', name: 'Ones', description: '1의 합계' },
    { key: 'twos', name: 'Twos', description: '2의 합계' },
    { key: 'threes', name: 'Threes', description: '3의 합계' },
    { key: 'fours', name: 'Fours', description: '4의 합계' },
    { key: 'fives', name: 'Fives', description: '5의 합계' },
    { key: 'sixes', name: 'Sixes', description: '6의 합계' },
    { key: 'threeOfKind', name: 'Three of a Kind', description: '같은 숫자 3개 이상 - 총합' },
    { key: 'fourOfKind', name: 'Four of a Kind', description: '같은 숫자 4개 이상 - 총합' },
    { key: 'fullHouse', name: 'Full House', description: '3개 + 2개 조합 - 25점' },
    { key: 'smallStraight', name: 'Small Straight', description: '4개 연속 - 30점' },
    { key: 'largeStraight', name: 'Large Straight', description: '5개 연속 - 40점' },
    { key: 'yahtzee', name: 'Yahtzee', description: '같은 숫자 5개 - 50점' },
    { key: 'chance', name: 'Chance', description: '주사위 총합' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/games')}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">YAHTZEE (야찌)</h1>
              <p className="text-gray-600">전략적인 주사위 게임</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowHelpModal(true)}
              className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
              title="게임 방법 보기"
            >
              <HelpCircle className="w-5 h-5 text-blue-600" />
            </button>
            {!gameEnded && (
              <button
                onClick={resetGame}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>새 게임</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowHelpModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">게임 방법</h2>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="space-y-6">
                {/* 게임 방법 */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-3">🎲 게임 방법</h3>
                  <ul className="text-sm text-green-700 space-y-2">
                    <li>• 턴마다 최대 3번까지 주사위를 굴릴 수 있습니다</li>
                    <li>• 첫 굴리기 후 원하는 주사위를 클릭해서 고정할 수 있습니다</li>
                    <li>• 오른쪽 점수표에서 카테고리를 선택해 점수를 기록하세요</li>
                    <li>• 각 카테고리는 한 번만 사용할 수 있습니다</li>
                    <li>• 13턴을 모두 마치면 게임이 종료됩니다</li>
                  </ul>
                </div>

                {/* 게임 정보 */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-3">🎯 게임 정보</h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div><strong>참여자:</strong> {players.join(', ')}</div>
                    <div><strong>벌칙:</strong> {penalty}</div>
                  </div>
                </div>

                {/* 점수 계산법 */}
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-3">📊 점수 계산법</h3>
                  <div className="text-sm text-purple-700 space-y-2">
                    <div><strong>숫자 합계:</strong> 각 숫자의 개수 × 해당 숫자</div>
                    <div><strong>보너스:</strong> 숫자 합계 63점 이상시 +35점</div>
                    <div><strong>풀하우스:</strong> 3개 + 2개 조합 → 25점</div>
                    <div><strong>스몰 스트레이트:</strong> 4개 연속 → 30점</div>
                    <div><strong>라지 스트레이트:</strong> 5개 연속 → 40점</div>
                    <div><strong>YAHTZEE:</strong> 같은 숫자 5개 → 50점</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Setup Modal */}
      <GameSetupModal
        isOpen={showSetup}
        onClose={() => navigate('/games')}
        onStart={handleGameSetup}
        gameTitle="YAHTZEE"
        minPlayers={1}
        maxPlayers={4}
      />

      {/* Game End Modal */}
      <AnimatePresence>
        {gameEnded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl p-8 text-center max-w-md w-full">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Trophy className="w-10 h-10 text-yellow-600" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-4">게임 종료!</h2>
              
              {/* 모든 플레이어 점수 표시 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">최종 점수</h3>
                <div className="space-y-2">
                  {[...players]
                    .sort((a, b) => getPlayerTotalScore(b) - getPlayerTotalScore(a)) // 높은 점수부터 정렬
                    .map((player, index) => (
                    <div key={player} className={`flex justify-between p-3 rounded-lg ${
                      index === 0 ? 'bg-yellow-100 border-2 border-yellow-300' : 'bg-gray-50'
                    }`}>
                      <span className="font-medium">
                        {index === 0 && '🏆 '}{player}
                      </span>
                      <span className="font-bold">{getPlayerTotalScore(player)}점</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 벌칙 결과 */}
              <div className="mb-6 p-4 bg-red-50 rounded-lg">
                <p className="text-lg text-gray-600 mb-2">
                  <span className="font-bold text-red-600">{getLoser().player}</span>님이
                </p>
                <p className="text-xl font-bold text-red-600 mb-2">
                  "{getLoser().penalty}"
                </p>
                <p className="text-gray-500">을 담당하게 되었습니다!</p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={resetGame}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  다시 하기
                </button>
                <button
                  onClick={() => navigate('/games')}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  게임 종료
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto p-6">
        {!showSetup && (
          <div className="space-y-6">
            {/* 상단 영역: 주사위와 현재 순위 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 주사위 영역 */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-4 shadow-lg"
                >
                  <div className="text-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800 mb-1">
                      턴 {currentTurn}/13
                    </h2>
                    <div className="mb-1">
                      <span className="text-base font-bold text-blue-600">
                        {players[currentPlayerIndex]}님의 차례
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      남은 굴리기: <span className="font-bold text-blue-600">{rollsLeft}</span>회
                    </p>
                  </div>

                  {/* 주사위 */}
                  <div className="flex justify-center space-x-3 mb-4">
                    {dice.map((die, index) => {
                      const DiceIcon = DICE_ICONS[die - 1];
                      return (
                        <motion.button
                          key={index}
                          onClick={() => toggleHold(index)}
                          disabled={rollsLeft === 3}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          animate={isRolling && !heldDice[index] ? { rotate: 360 } : {}}
                          transition={{ duration: 0.1 }}
                          className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center transition-all ${
                            heldDice[index]
                              ? 'bg-blue-100 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                          } ${rollsLeft === 3 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        >
                          <DiceIcon className="w-10 h-10" />
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* 고정된 주사위 표시 */}
                  <div className="flex justify-center space-x-3 mb-4">
                    {dice.map((_, index) => (
                      <div key={index} className="w-16 text-center">
                        <span className={`text-xs ${heldDice[index] ? 'text-blue-600 font-bold' : 'text-transparent'}`}>
                          HELD
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 굴리기 버튼 */}
                  <div className="text-center">
                    <motion.button
                      onClick={rollDice}
                      disabled={rollsLeft === 0 || isRolling}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        rollsLeft === 0 || isRolling
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isRolling ? '굴리는 중...' : rollsLeft === 3 ? '주사위 굴리기' : '다시 굴리기'}
                    </motion.button>
                  </div>
                </motion.div>
              </div>

              {/* 현재 순위 */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl p-4 shadow-lg h-full"
                >
                  <h3 className="text-lg font-bold text-gray-800 mb-3">현재 순위</h3>
                  
                  {/* 모든 플레이어 점수 요약 */}
                  <div className="space-y-2">
                    {[...players]
                      .sort((a, b) => getPlayerTotalScore(b) - getPlayerTotalScore(a))
                      .map((player, index) => (
                        <div key={player} className={`flex justify-between items-center p-2 rounded-lg ${
                          player === players[currentPlayerIndex] 
                            ? 'bg-blue-100 border border-blue-300' 
                            : 'bg-gray-50'
                        }`}>
                          <span className={`text-sm font-medium ${
                            player === players[currentPlayerIndex] ? 'text-blue-700' : 'text-gray-700'
                          }`}>
                            {index + 1}. {player}
                          </span>
                          <span className={`text-sm font-bold ${
                            player === players[currentPlayerIndex] ? 'text-blue-700' : 'text-gray-700'
                          }`}>
                            {getPlayerTotalScore(player)}점
                          </span>
                        </div>
                      ))}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* 하단 영역: 점수표 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 숫자 합계 (상단 섹션) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4">숫자 합계</h3>
                
                <div className="space-y-2">
                  {categories.slice(0, 6).map((category) => {
                    const currentPlayer = players[currentPlayerIndex];
                    const isUsed = scores[currentPlayer]?.[category.key] !== null;
                    const potentialScore = rollsLeft < 3 ? calculateScore(category.key) : 0;
                    
                    return (
                      <motion.button
                        key={category.key}
                        onClick={() => selectCategory(category.key)}
                        onMouseEnter={() => setHoveredCategory(category.key)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        disabled={isUsed || rollsLeft === 3}
                        whileHover={!isUsed && rollsLeft < 3 ? { scale: 1.02 } : {}}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          isUsed
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : rollsLeft === 3
                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-50 hover:bg-blue-100 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{category.name}</div>
                            <div className="text-xs text-gray-600">{category.description}</div>
                          </div>
                          <div className="text-right">
                            {isUsed ? (
                              <span className="font-bold text-gray-800">{scores[currentPlayer]?.[category.key]}</span>
                            ) : rollsLeft < 3 && hoveredCategory === category.key ? (
                              <span className="font-bold text-blue-600">{potentialScore}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                
                {/* 상단 섹션 합계 및 보너스 */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">소계</span>
                    <span className="font-bold">{getPlayerUpperSectionTotal(players[currentPlayerIndex])}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-yellow-50 rounded">
                    <span className="font-medium">보너스 (63점 이상시 +35)</span>
                    <span className="font-bold text-yellow-600">{getPlayerUpperSectionBonus(players[currentPlayerIndex])}</span>
                  </div>
                </div>
              </motion.div>

              {/* 특수 조합 (하단 섹션) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4">특수 조합</h3>
                
                <div className="space-y-2">
                  {categories.slice(6).map((category) => {
                    const currentPlayer = players[currentPlayerIndex];
                    const isUsed = scores[currentPlayer]?.[category.key] !== null;
                    const potentialScore = rollsLeft < 3 ? calculateScore(category.key) : 0;
                    
                    return (
                      <motion.button
                        key={category.key}
                        onClick={() => selectCategory(category.key)}
                        onMouseEnter={() => setHoveredCategory(category.key)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        disabled={isUsed || rollsLeft === 3}
                        whileHover={!isUsed && rollsLeft < 3 ? { scale: 1.02 } : {}}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          isUsed
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : rollsLeft === 3
                            ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'bg-purple-50 hover:bg-purple-100 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{category.name}</div>
                            <div className="text-xs text-gray-600">{category.description}</div>
                          </div>
                          <div className="text-right">
                            {isUsed ? (
                              <span className="font-bold text-gray-800">{scores[currentPlayer]?.[category.key]}</span>
                            ) : rollsLeft < 3 && hoveredCategory === category.key ? (
                              <span className="font-bold text-purple-600">{potentialScore}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* 현재 플레이어 총점 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <div className="font-bold text-xl text-gray-800">{players[currentPlayerIndex]}님 총점</div>
                <span className="font-bold text-green-600 text-2xl">{getPlayerTotalScore(players[currentPlayerIndex])}</span>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YahtzeeGame;
