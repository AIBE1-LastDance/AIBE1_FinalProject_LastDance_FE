import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SlotItem {
  id: string;
  emoji: string;
  text: string;
  type: 'chore' | 'reward' | 'neutral';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const SlotMachine: React.FC = () => {
  const navigate = useNavigate();
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<SlotItem[]>([]);
  const [credits, setCredits] = useState(100);
  const [showResult, setShowResult] = useState(false);

  const slotItems: SlotItem[] = [
    { id: '1', emoji: '🧽', text: '설거지', type: 'chore', rarity: 'common' },
    { id: '2', emoji: '🧹', text: '청소', type: 'chore', rarity: 'common' },
    { id: '3', emoji: '🗑️', text: '쓰레기 배출', type: 'chore', rarity: 'common' },
    { id: '4', emoji: '🍕', text: '피자 주문권', type: 'reward', rarity: 'rare' },
    { id: '5', emoji: '☕', text: '커피 쿠폰', type: 'reward', rarity: 'rare' },
    { id: '6', emoji: '👑', text: '하루 면제권', type: 'reward', rarity: 'legendary' },
  ];

  const spin = () => {
    if (isSpinning || credits < 10) return;
    
    setCredits(prev => prev - 10);
    setIsSpinning(true);
    setShowResult(false);
    
    setTimeout(() => {
      const newResult = Array.from({ length: 4 }, () => 
        slotItems[Math.floor(Math.random() * slotItems.length)]
      );
      setResult(newResult);
      setIsSpinning(false);
      setShowResult(true);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 p-6">
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
          
          <h1 className="text-3xl font-bold text-white">슬롯머신</h1>
          
          <div className="text-white">크레딧: {credits}</div>
        </motion.div>

        {/* Slot Machine */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-yellow-400 to-red-500 rounded-3xl p-8 mb-8"
        >
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🎰</div>
            <div className="text-white font-bold text-xl">HOUSEMATE SLOTS</div>
          </div>

          {/* Reels */}
          <div className="bg-black bg-opacity-30 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg h-32 flex items-center justify-center relative overflow-hidden">
                  {isSpinning ? (
                    <motion.div
                      animate={{ y: [-100, 100, -100] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="text-4xl"
                    >
                      🎲
                    </motion.div>
                  ) : result[index] ? (
                    <div className="text-center">
                      <div className="text-3xl mb-1">{result[index].emoji}</div>
                      <div className="text-xs font-medium">{result[index].text}</div>
                    </div>
                  ) : (
                    <div className="text-4xl text-gray-400">?</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Spin Button */}
          <div className="text-center">
            <motion.button
              onClick={spin}
              disabled={isSpinning || credits < 10}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-8 py-4 rounded-xl font-bold text-xl transition-all ${
                isSpinning || credits < 10
                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600'
              }`}
            >
              {isSpinning ? (
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="w-6 h-6" />
                  </motion.div>
                  <span>스핀 중...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Play className="w-6 h-6" />
                  <span>SPIN! (10 크레딧)</span>
                </div>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Result */}
        <AnimatePresence>
          {showResult && result.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 text-center">결과</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {result.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-xl text-center bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                  >
                    <div className="text-3xl mb-2">{item.emoji}</div>
                    <div className="font-bold">{item.text}</div>
                    <div className="text-xs mt-1">
                      {item.type === 'chore' ? '📋 할일' : '🎁 보상'}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SlotMachine;