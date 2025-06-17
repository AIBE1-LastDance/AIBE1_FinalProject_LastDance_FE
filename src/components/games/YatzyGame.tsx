import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RotateCcw, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GameSetupModal from './GameSetupModal';

const YatzyGame: React.FC = () => {
  const navigate = useNavigate();
  const [showSetup, setShowSetup] = useState(true);
  const [players, setPlayers] = useState<string[]>([]);
  const [penalty, setPenalty] = useState('');
  const [dice, setDice] = useState<number[]>([1, 1, 1, 1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [gameResult, setGameResult] = useState<{winner: string, penalty: string} | null>(null);

  const DICE_ICONS = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

  const handleGameSetup = (playerNames: string[], penaltyText: string) => {
    setPlayers(playerNames);
    setPenalty(penaltyText);
    setShowSetup(false);
  };

  const rollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    let rollCount = 0;
    const maxRolls = 15;
    
    const rollInterval = setInterval(() => {
      setDice(prev => prev.map(() => Math.floor(Math.random() * 6) + 1));
      
      rollCount++;
      if (rollCount >= maxRolls) {
        clearInterval(rollInterval);
        setIsRolling(false);
        
        setTimeout(() => {
          const winner = players[Math.floor(Math.random() * players.length)];
          setGameResult({ winner, penalty });
        }, 500);
      }
    }, 100);
  };

  const resetGame = () => {
    setDice([1, 1, 1, 1, 1]);
    setGameResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
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
              <h1 className="text-2xl font-bold text-gray-800">YATZY (얏지)</h1>
              <p className="text-gray-600">주사위 5개로 운명을 결정하세요!</p>
            </div>
          </div>
          {!showSetup && !gameResult && (
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

      <div className="max-w-4xl mx-auto p-6">
        <GameSetupModal
          isOpen={showSetup}
          onClose={() => navigate('/games')}
          onStart={handleGameSetup}
          gameTitle="YATZY"
          minPlayers={1}
          maxPlayers={6}
        />

        <AnimatePresence>
          {gameResult && (
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
                
                <h2 className="text-3xl font-bold text-gray-800 mb-2">결과 발표!</h2>
                <p className="text-xl text-gray-600 mb-2">
                  <span className="font-bold text-red-600">{gameResult.winner}</span>님이
                </p>
                <p className="text-2xl font-bold text-red-600 mb-6">
                  "{gameResult.penalty}"
                </p>
                <p className="text-gray-500 mb-6">을 담당하게 되었습니다!</p>
                
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

        {!showSetup && !gameResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg text-center"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">주사위를 굴려보세요!</h2>
            
            <div className="flex justify-center space-x-4 mb-8">
              {dice.map((die, index) => {
                const DiceIcon = DICE_ICONS[die - 1];
                return (
                  <motion.div
                    key={index}
                    animate={isRolling ? { rotate: 360 } : {}}
                    transition={{ duration: 0.1 }}
                    className="w-20 h-20 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center shadow-lg"
                  >
                    <DiceIcon className="w-12 h-12 text-gray-700" />
                  </motion.div>
                );
              })}
            </div>

            <motion.button
              onClick={rollDice}
              disabled={isRolling}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-12 py-4 rounded-lg font-bold text-lg transition-all ${
                isRolling
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isRolling ? '굴리는 중...' : '주사위 굴리기'}
            </motion.button>

            <div className="mt-8 p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">참여자</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {players.map((player, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    {player}
                  </span>
                ))}
              </div>
              <p className="text-sm text-green-600 mt-2">벌칙: {penalty}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default YatzyGame;
