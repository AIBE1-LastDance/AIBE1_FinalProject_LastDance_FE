import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Target, Users, Trophy, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  throws: number[];
  currentRound: number;
}

interface DartThrow {
  x: number;
  y: number;
  score: number;
  playerId: string;
}

const DartsGame: React.FC = () => {
  const navigate = useNavigate();
  const dartboardRef = useRef<HTMLDivElement>(null);
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: '김우리', avatar: '🧑‍💼', score: 0, throws: [], currentRound: 0 },
    { id: '2', name: '박집사', avatar: '👩‍🎨', score: 0, throws: [], currentRound: 0 },
    { id: '3', name: '이하우스', avatar: '👨‍💻', score: 0, throws: [], currentRound: 0 },
    { id: '4', name: '최메이트', avatar: '👩‍🔬', score: 0, throws: [], currentRound: 0 },
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [throws, setThrows] = useState<DartThrow[]>([]);
  const [currentThrowCount, setCurrentThrowCount] = useState(0);
  const [maxRounds, setMaxRounds] = useState(5);
  const [gameMode, setGameMode] = useState<'501' | 'target' | 'cricket'>('target');

  const dartboardSize = 300;
  const center = dartboardSize / 2;

  // 다트보드 점수 계산
  const calculateScore = (x: number, y: number): number => {
    const distance = Math.sqrt((x - center) ** 2 + (y - center) ** 2);
    const angle = Math.atan2(y - center, x - center) * 180 / Math.PI;
    
    // 중심에서의 거리에 따른 점수
    if (distance <= 15) return 50; // 불스아이
    if (distance <= 30) return 25; // 불스
    if (distance <= 100) {
      // 내부 링 (더블/트리플 점수)
      const segment = Math.floor(((angle + 360 + 9) % 360) / 18);
      const scores = [6, 13, 4, 18, 1, 20, 5, 12, 9, 14, 11, 8, 16, 7, 19, 3, 17, 2, 15, 10];
      
      if (distance >= 85) return scores[segment] * 2; // 더블 링
      if (distance >= 65 && distance <= 75) return scores[segment] * 3; // 트리플 링
      return scores[segment]; // 일반 점수
    }
    if (distance <= 150) {
      // 외부 링
      const segment = Math.floor(((angle + 360 + 9) % 360) / 18);
      const scores = [6, 13, 4, 18, 1, 20, 5, 12, 9, 14, 11, 8, 16, 7, 19, 3, 17, 2, 15, 10];
      return scores[segment];
    }
    return 0; // 보드 밖
  };

  const handleDartboardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (gameState !== 'playing' || currentThrowCount >= 3) return;

    const rect = dartboardRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const score = calculateScore(x, y);
    
    const currentPlayer = players[currentPlayerIndex];
    const newThrow: DartThrow = {
      x,
      y,
      score,
      playerId: currentPlayer.id
    };

    setThrows(prev => [...prev, newThrow]);
    setCurrentThrowCount(prev => prev + 1);

    // 플레이어 점수 업데이트
    setPlayers(prev => prev.map(player => 
      player.id === currentPlayer.id 
        ? { 
            ...player, 
            score: player.score + score,
            throws: [...player.throws, score]
          }
        : player
    ));

    // 3번 던지면 다음 플레이어로
    if (currentThrowCount + 1 >= 3) {
      setTimeout(() => {
        nextPlayer();
      }, 1000);
    }
  };

  const nextPlayer = () => {
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    
    if (nextIndex === 0) {
      // 모든 플레이어가 한 라운드 완료
      const newRound = players[0].currentRound + 1;
      
      if (newRound >= maxRounds) {
        setGameState('finished');
        return;
      }
      
      setPlayers(prev => prev.map(player => ({
        ...player,
        currentRound: newRound
      })));
    }
    
    setCurrentPlayerIndex(nextIndex);
    setCurrentThrowCount(0);
    setThrows(prev => prev.filter(t => t.playerId !== players[nextIndex].id));
  };

  const startGame = () => {
    setGameState('playing');
    setCurrentPlayerIndex(0);
    setCurrentThrowCount(0);
    setThrows([]);
  };

  const resetGame = () => {
    setGameState('setup');
    setCurrentPlayerIndex(0);
    setCurrentThrowCount(0);
    setThrows([]);
    setPlayers(prev => prev.map(player => ({
      ...player,
      score: 0,
      throws: [],
      currentRound: 0
    })));
  };

  const getWinner = () => {
    return players.reduce((prev, current) => 
      prev.score > current.score ? prev : current
    );
  };

  const getCurrentRound = () => {
    return players[0]?.currentRound + 1 || 1;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigate('/games')}
            className="flex items-center space-x-2 text-white hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>게임 목록</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">다트 게임</h1>
            {gameState === 'playing' && (
              <div className="text-cyan-300">
                라운드 {getCurrentRound()}/{maxRounds} - {players[currentPlayerIndex].name}의 차례
              </div>
            )}
          </div>

          <button
            onClick={resetGame}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>재시작</span>
          </button>
        </motion.div>

        {/* Setup Screen */}
        {gameState === 'setup' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8"
          >
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold text-white mb-4">다트 게임 설정</h2>
            </div>

            <div className="mb-8">
              <h3 className="text-white font-bold mb-4">라운드 수</h3>
              <div className="flex space-x-4 justify-center">
                {[3, 5, 7, 10].map(rounds => (
                  <button
                    key={rounds}
                    onClick={() => setMaxRounds(rounds)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${
                      maxRounds === rounds
                        ? 'bg-cyan-500 text-white'
                        : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                    }`}
                  >
                    {rounds}라운드
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={startGame}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold text-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
              >
                <Target className="w-5 h-5 inline mr-2" />
                게임 시작!
              </button>
            </div>
          </motion.div>
        )}

        {/* Game Screen */}
        {gameState === 'playing' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Dartboard */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8"
              >
                <h3 className="text-xl font-bold text-white mb-4 text-center">
                  {players[currentPlayerIndex].name}의 차례 ({currentThrowCount}/3)
                </h3>
                
                <div className="flex justify-center">
                  <div
                    ref={dartboardRef}
                    onClick={handleDartboardClick}
                    className="relative cursor-crosshair"
                    style={{ width: dartboardSize, height: dartboardSize }}
                  >
                    {/* Dartboard Background */}
                    <svg width={dartboardSize} height={dartboardSize} className="absolute inset-0">
                      {/* Outer ring */}
                      <circle 
                        cx={center} 
                        cy={center} 
                        r={150} 
                        fill="#2d5a27" 
                        stroke="#000" 
                        strokeWidth="2"
                      />
                      
                      {/* Inner sections */}
                      <circle 
                        cx={center} 
                        cy={center} 
                        r={100} 
                        fill="#8b4513" 
                        stroke="#000" 
                        strokeWidth="2"
                      />
                      
                      {/* Bull ring */}
                      <circle 
                        cx={center} 
                        cy={center} 
                        r={30} 
                        fill="#ffff00" 
                        stroke="#000" 
                        strokeWidth="2"
                      />
                      
                      {/* Bulls-eye */}
                      <circle 
                        cx={center} 
                        cy={center} 
                        r={15} 
                        fill="#ff0000" 
                        stroke="#000" 
                        strokeWidth="2"
                      />
                      
                      {/* Sector lines */}
                      {[...Array(20)].map((_, i) => {
                        const angle = (i * 18 - 90) * Math.PI / 180;
                        const x1 = center + 30 * Math.cos(angle);
                        const y1 = center + 30 * Math.sin(angle);
                        const x2 = center + 150 * Math.cos(angle);
                        const y2 = center + 150 * Math.sin(angle);
                        
                        return (
                          <line
                            key={i}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="#000"
                            strokeWidth="1"
                          />
                        );
                      })}
                    </svg>
                    
                    {/* Thrown darts */}
                    {throws.map((dart, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute w-3 h-3 bg-red-500 rounded-full border-2 border-white transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: dart.x, top: dart.y }}
                      >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {dart.score}점
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {throws.length > 0 && (
                  <div className="mt-4 text-center">
                    <div className="text-white font-bold">
                      이번 턴: {throws.reduce((sum, dart) => sum + dart.score, 0)}점
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Scoreboard */}
            <div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4 text-center">점수판</h3>
                <div className="space-y-4">
                  {players
                    .sort((a, b) => b.score - a.score)
                    .map((player, index) => (
                      <div 
                        key={player.id}
                        className={`p-4 rounded-xl ${
                          player.id === players[currentPlayerIndex].id
                            ? 'bg-cyan-500 bg-opacity-30 border-2 border-cyan-400'
                            : index === 0
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                              : 'bg-white bg-opacity-20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{player.avatar}</div>
                            <div>
                              <div className="text-white font-bold">{player.name}</div>
                              <div className="text-white text-opacity-70 text-sm">
                                라운드 {player.currentRound + 1}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold text-xl">{player.score}</div>
                            <div className="text-white text-opacity-70 text-sm">점</div>
                          </div>
                        </div>
                        
                        {player.throws.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white border-opacity-20">
                            <div className="text-white text-opacity-70 text-xs">
                              최근: {player.throws.slice(-3).join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Winner Display */}
        <AnimatePresence>
          {gameState === 'finished' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
            >
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-12 text-center text-white max-w-md mx-4">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 0.6, 
                    repeat: Infinity 
                  }}
                  className="text-6xl mb-4"
                >
                  🏆
                </motion.div>
                <h2 className="text-3xl font-bold mb-4">다트 챔피언!</h2>
                <div className="text-4xl mb-2">{getWinner().avatar}</div>
                <div className="text-xl font-bold mb-2">{getWinner().name}</div>
                <div className="text-lg mb-6">{getWinner().score}점으로 우승!</div>
                
                <div className="space-y-3">
                  <button
                    onClick={resetGame}
                    className="w-full px-6 py-3 bg-white text-orange-500 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                  >
                    다시 플레이
                  </button>
                  <button
                    onClick={() => navigate('/games')}
                    className="w-full px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors"
                  >
                    게임 목록으로
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 mt-8"
        >
          <h3 className="text-xl font-bold text-white mb-4">게임 규칙</h3>
          <div className="text-white text-opacity-80 space-y-2">
            <p>• 각 플레이어는 매 턴마다 3번의 다트를 던집니다</p>
            <p>• 다트보드를 클릭하여 다트를 던지세요</p>
            <p>• 중심에 가까울수록 높은 점수를 얻습니다</p>
            <p>• 모든 라운드가 끝나면 총점이 가장 높은 플레이어가 승리합니다</p>
            <p>• 불스아이(중심): 50점, 불스(노란색): 25점</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DartsGame;