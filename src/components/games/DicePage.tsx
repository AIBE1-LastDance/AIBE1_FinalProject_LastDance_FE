import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Dice6 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DicePage: React.FC = () => {
  const navigate = useNavigate();
  const [isRolling, setIsRolling] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const players = [
    { id: '1', name: '김우리', avatar: '🧑‍💼' },
    { id: '2', name: '박집사', avatar: '👩‍🎨' },
    { id: '3', name: '이하우스', avatar: '👨‍💻' },
    { id: '4', name: '최메이트', avatar: '👩‍🔬' },
  ];

  const rollDice = () => {
    setIsRolling(true);
    setTimeout(() => {
      const randomWinner = players[Math.floor(Math.random() * players.length)];
      setWinner(randomWinner.name);
      setIsRolling(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigate('/games')}
            className="flex items-center space-x-2 text-white hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>게임 목록</span>
          </button>
          <h1 className="text-3xl font-bold text-white">주사위 게임</h1>
          <div></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {players.map((player, index) => (
              <div key={player.id} className="text-center">
                <div className="text-3xl mb-2">{player.avatar}</div>
                <div className="text-white font-bold">{player.name}</div>
              </div>
            ))}
          </div>

          <motion.div
            animate={isRolling ? { rotateX: 360, rotateY: 360 } : {}}
            transition={isRolling ? { duration: 0.3, repeat: Infinity } : {}}
            className="w-32 h-32 bg-white rounded-xl flex items-center justify-center mx-auto mb-8"
          >
            <div className="text-6xl">🎲</div>
          </motion.div>

          <button
            onClick={rollDice}
            disabled={isRolling}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-lg disabled:opacity-50"
          >
            <Dice6 className="w-5 h-5 inline mr-2" />
            {isRolling ? '굴리는 중...' : '주사위 굴리기'}
          </button>
        </motion.div>

        <AnimatePresence>
          {winner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
            >
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-12 text-center text-white">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold mb-4">승리!</h2>
                <div className="text-2xl font-bold mb-6">{winner}</div>
                <button
                  onClick={() => {
                    setWinner(null);
                  }}
                  className="px-6 py-3 bg-white text-orange-500 rounded-xl font-bold"
                >
                  다시 플레이
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DicePage;