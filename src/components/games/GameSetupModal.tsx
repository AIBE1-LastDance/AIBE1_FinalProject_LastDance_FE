import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, AlertTriangle, Plus, Minus } from 'lucide-react';

interface GameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (players: string[], penalty: string) => void;
  gameTitle: string;
  minPlayers?: number;
  maxPlayers?: number;
}

const GameSetupModal: React.FC<GameSetupModalProps> = ({
  isOpen,
  onClose,
  onStart,
  gameTitle,
  minPlayers = 2,
  maxPlayers = 8
}) => {
  const [players, setPlayers] = useState<string[]>(['']);
  const [penalty, setPenalty] = useState('');

  const addPlayer = () => {
    if (players.length < maxPlayers) {
      setPlayers([...players, '']);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 1) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };

  const handleStart = () => {
    const validPlayers = players.filter(name => name.trim() !== '');
    if (validPlayers.length >= minPlayers && penalty.trim() !== '') {
      onStart(validPlayers, penalty.trim());
      // onClose()는 제거 - 각 게임에서 모달을 닫는 것을 처리
    }
  };

  const isValid = () => {
    const validPlayers = players.filter(name => name.trim() !== '');
    return validPlayers.length >= minPlayers && penalty.trim() !== '';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{gameTitle} 설정</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Players Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                참여자
              </h3>
              <span className="text-sm text-gray-500">
                {minPlayers}-{maxPlayers}명
              </span>
            </div>

            <div className="space-y-3">
              {players.map((player, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={player}
                      onChange={(e) => updatePlayer(index, e.target.value)}
                      placeholder={`참여자 ${index + 1}`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  {players.length > 1 && (
                    <button
                      onClick={() => removePlayer(index)}
                      className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {players.length < maxPlayers && (
              <button
                onClick={addPlayer}
                className="w-full mt-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                참여자 추가
              </button>
            )}
          </div>

          {/* Penalty Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
              <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
              벌칙
            </h3>
            <input
              type="text"
              value={penalty}
              onChange={(e) => setPenalty(e.target.value)}
              placeholder="예: 설거지, 청소, 쓰레기 배출 등"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              취소
            </button>
            <button
              onClick={handleStart}
              disabled={!isValid()}
              className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                isValid()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              게임 시작
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GameSetupModal;
