import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, Clock, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Card {
  id: number;
  emoji: string;
  task: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryGamePage: React.FC = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const tasks = [
    { emoji: '🧽', task: '설거지' },
    { emoji: '🧹', task: '청소' },
    { emoji: '🗑️', task: '쓰레기 배출' },
    { emoji: '👔', task: '빨래' },
    { emoji: '🍳', task: '요리' },
    { emoji: '🛒', task: '장보기' },
  ];

  const initializeGame = () => {
    const gameCards: Card[] = [];
    tasks.forEach((task, index) => {
      gameCards.push(
        { id: index * 2, emoji: task.emoji, task: task.task, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, emoji: task.emoji, task: task.task, isFlipped: false, isMatched: false }
      );
    });
    
    const shuffled = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setGameStarted(true);
  };

  const flipCard = (cardId: number) => {
    if (flippedCards.length === 2 || flippedCards.includes(cardId)) return;
    
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);
    
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      checkMatch(newFlipped);
    }
  };

  const checkMatch = (flipped: number[]) => {
    const [first, second] = flipped;
    const firstCard = cards.find(card => card.id === first);
    const secondCard = cards.find(card => card.id === second);

    setTimeout(() => {
      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        setCards(prev => prev.map(card => 
          card.id === first || card.id === second 
            ? { ...card, isMatched: true }
            : card
        ));
        setMatchedPairs(prev => prev + 1);
      } else {
        setCards(prev => prev.map(card => 
          card.id === first || card.id === second 
            ? { ...card, isFlipped: false }
            : card
        ));
      }
      setFlippedCards([]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
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
          <h1 className="text-3xl font-bold text-white">기억력 게임</h1>
          <div className="text-white">이동: {moves}</div>
        </motion.div>

        {!gameStarted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 text-center"
          >
            <div className="text-6xl mb-6">🧠</div>
            <h2 className="text-2xl font-bold text-white mb-4">집안일 카드 짝 맞추기</h2>
            <p className="text-purple-300 mb-8">같은 집안일 카드를 찾아 짝을 맞춰보세요!</p>
            <button
              onClick={initializeGame}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg"
            >
              <Zap className="w-5 h-5 inline mr-2" />
              게임 시작!
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6"
          >
            <div className="grid grid-cols-4 gap-4">
              {cards.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, rotateY: 180 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => !card.isMatched && flipCard(card.id)}
                  className="aspect-square cursor-pointer"
                >
                  <div
                    className={`w-full h-full rounded-xl flex flex-col items-center justify-center transition-all duration-300 ${
                      card.isFlipped || card.isMatched
                        ? card.isMatched 
                          ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                          : 'bg-gradient-to-br from-blue-400 to-cyan-500'
                        : 'bg-gradient-to-br from-purple-500 to-pink-500'
                    }`}
                  >
                    {card.isFlipped || card.isMatched ? (
                      <>
                        <div className="text-3xl mb-2">{card.emoji}</div>
                        <div className="text-white text-xs font-medium text-center">
                          {card.task}
                        </div>
                      </>
                    ) : (
                      <div className="text-3xl">🎮</div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {matchedPairs === tasks.length && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
            >
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-12 text-center text-white">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-3xl font-bold mb-4">축하합니다!</h2>
                <div className="text-lg mb-6">{moves}번 만에 완성!</div>
                <button
                  onClick={() => window.location.reload()}
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

export default MemoryGamePage;