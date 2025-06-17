import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Play, ArrowLeft, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GameSetupModal from './GameSetupModal';

const RoulettePage: React.FC = () => {
  const navigate = useNavigate();
  const [showSetup, setShowSetup] = useState(true);
  const [players, setPlayers] = useState<string[]>([]);
  const [penalty, setPenalty] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ winner: string; penalty: string } | null>(null);
  const [rotation, setRotation] = useState(0);

  const handleGameSetup = (playerNames: string[], penaltyText: string) => {
    setPlayers(playerNames);
    setPenalty(penaltyText);
    setShowSetup(false);
  };

  const spinRoulette = () => {
    if (isSpinning || players.length === 0) return;

    setIsSpinning(true);
    setResult(null);

    const spins = 5 + Math.random() * 5; // 5-10 spins
    const finalRotation = rotation + spins * 360;
    const selectedIndex = Math.floor(Math.random() * players.length);
    const degreePerOption = 360 / players.length;
    const finalDegree = finalRotation + (selectedIndex * degreePerOption);

    setRotation(finalDegree);

    setTimeout(() => {
      setResult({ winner: players[selectedIndex], penalty });
      setIsSpinning(false);
    }, 3000);
  };

  const resetRoulette = () => {
    setResult(null);
    setRotation(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
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
              <h1 className="text-2xl font-bold text-gray-800">룰렛</h1>
              <p className="text-gray-600">룰렛을 돌려서 당번을 정하세요!</p>
            </div>
          </div>
          {!showSetup && !result && (
            <button
              onClick={resetRoulette}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>초기화</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Game Setup Modal */}
        <GameSetupModal
          isOpen={showSetup}
          onClose={() => navigate('/games')}
          onStart={handleGameSetup}
          gameTitle="룰렛"
          minPlayers={2}
          maxPlayers={8}
        />

        {/* Game Result Modal */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
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
                <span className="font-bold text-red-600">{result.winner}</span>님이
              </p>
              <p className="text-2xl font-bold text-red-600 mb-6">
                "{result.penalty}"
              </p>
              <p className="text-gray-500 mb-6">을 담당하게 되었습니다!</p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setResult(null);
                    resetRoulette();
                  }}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
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

        {/* Roulette Game */}
        {!showSetup && !result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <div className="flex flex-col items-center space-y-8">
              {/* Roulette Wheel */}
              <div className="relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-10">
                  <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[30px] border-l-transparent border-r-transparent border-t-red-500"></div>
                </div>
                
                <motion.div
                  className="w-80 h-80 rounded-full relative overflow-hidden shadow-2xl"
                  style={{
                    background: `conic-gradient(${players.map((_, index) => {
                      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFB6C1', '#98FB98'];
                      return `${colors[index % colors.length]} ${(index * 360 / players.length)}deg ${((index + 1) * 360 / players.length)}deg`;
                    }).join(', ')})`,
                  }}
                  animate={{
                    rotate: rotation,
                  }}
                  transition={{
                    duration: isSpinning ? 3 : 0,
                    ease: isSpinning ? "easeOut" : "linear",
                  }}
                >
                  {/* Roulette Sections */}
                  {players.map((player, index) => {
                    const angle = (360 / players.length) * index;
                    const textAngle = angle + (360 / players.length) / 2;
                    return (
                      <div
                        key={index}
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          transformOrigin: 'center',
                          transform: `rotate(${textAngle}deg)`,
                        }}
                      >
                        <div
                          className="text-white font-bold text-sm transform -rotate-90"
                          style={{
                            marginTop: '-120px',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                          }}
                        >
                          {player}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </div>

              {/* Spin Button */}
              <motion.button
                className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all ${
                  isSpinning
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl'
                }`}
                whileHover={!isSpinning ? { scale: 1.05 } : {}}
                whileTap={!isSpinning ? { scale: 0.95 } : {}}
                onClick={spinRoulette}
                disabled={isSpinning}
              >
                <Play className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? '돌리는 중...' : '룰렛 돌리기'}</span>
              </motion.button>

              {/* Game Info */}
              <div className="text-center bg-red-50 rounded-lg p-6 w-full">
                <h3 className="font-semibold text-red-800 mb-3">게임 정보</h3>
                <div className="space-y-2 text-red-700">
                  <div className="flex justify-center space-x-4">
                    <span>참여자: {players.join(', ')}</span>
                  </div>
                  <div>벌칙: {penalty}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RoulettePage;