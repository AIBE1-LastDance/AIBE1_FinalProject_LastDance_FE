import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Play, ArrowLeft, Trophy, HelpCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import GameSetupModal from './GameSetupModal';
import { gameApi, GameResultRequest } from '../../api/games';
import { useAppStore } from '../../store/appStore';

const RoulettePage: React.FC = () => {
  const navigate = useNavigate();
  const { mode, currentGroup } = useAppStore();
  const [showSetup, setShowSetup] = useState(true);
  const [players, setPlayers] = useState<string[]>([]);
  const [penalty, setPenalty] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<{ winner: string; penalty: string } | null>(null);
  const [rotation, setRotation] = useState(0);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleGameSetup = (playerNames: string[], penaltyText: string) => {
    setPlayers(playerNames);
    setPenalty(penaltyText);
    setShowSetup(false);
  };

  // 게임 결과 저장 함수
  const saveGameResult = async (winner: string) => {
    try {
      const gameData: GameResultRequest = {
        gameType: "ROULETTE",
        participants: players,
        result: winner,
        penalty: penalty
      };

      if (mode === 'group' && currentGroup) {
        // 그룹 모드: 그룹 결과만 저장
        await gameApi.saveGroupResult(currentGroup.id, gameData);
        toast.success(`그룹(${currentGroup.name})에 게임 결과가 저장되었습니다!`);
      } else {
        // 개인 모드: 개인 결과만 저장
        await gameApi.saveMyResult(gameData);
        toast.success('개인 게임 결과가 저장되었습니다!');
      }
    } catch (error) {
      console.error('게임 결과 저장 실패:', error);
      toast.error('게임 결과 저장에 실패했습니다.');
    }
  };

  const spinRoulette = () => {
    if (isSpinning || players.length === 0) return;

    setIsSpinning(true);
    setResult(null);

    const spins = 5 + Math.random() * 5; // 5-10 spins
    const extraRotation = Math.random() * 360; // 추가 랜덤 회전
    const finalRotation = rotation + spins * 360 + extraRotation;

    setRotation(finalRotation);

    // 3초 후 스피닝 종료, 그 후 1초 딜레이 후 결과 표시
    setTimeout(() => {
      setIsSpinning(false);
      
      // 1초 딜레이 후 결과 표시
      setTimeout(() => {
        // 최종 회전 각도에서 화살표가 가리키는 섹션 계산
        const normalizedRotation = finalRotation % 360;
        const degreePerOption = 360 / players.length;
        
        // 화살표는 위쪽(0도)에 있고, 룰렛이 시계방향으로 회전하므로
        // 화살표가 가리키는 섹션을 계산
        const selectedIndex = Math.floor((360 - normalizedRotation) / degreePerOption) % players.length;
        const winner = players[selectedIndex];
        
        setResult({ winner, penalty });
        
        // 게임 결과 저장
        saveGameResult(winner);
      }, 1000);
    }, 3000);
  };

  const resetRoulette = () => {
    setResult(null);
    setRotation(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
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
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowHelpModal(true)}
              className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center hover:bg-primary-200 transition-colors"
              title="게임 방법 보기"
            >
              <HelpCircle className="w-5 h-5 text-primary-600" />
            </button>
            {!showSetup && !result && (
              <button
                onClick={resetRoulette}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>초기화</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
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
                  <div className="p-4 bg-primary-50 rounded-lg">
                    <h3 className="font-semibold text-primary-800 mb-3">🎯 게임 방법</h3>
                    <ul className="text-sm text-primary-700 space-y-2">
                      <li>• 빨간 화살표가 가리키는 위치에서 당첨자가 결정됩니다</li>
                      <li>• 룰렛이 멈춘 후 1초 뒤에 결과가 발표됩니다</li>
                      <li>• 다시 하기를 누르면 새로운 게임을 시작할 수 있습니다</li>
                      <li>• <span className="font-bold">룰렛 돌리기 버튼</span>을 눌러 게임을 시작하세요</li>
                    </ul>
                  </div>

                  {/* 게임 정보 */}
                  <div className="p-4 bg-accent-50 rounded-lg">
                    <h3 className="font-semibold text-accent-800 mb-3">🎲 게임 정보</h3>
                    <div className="text-sm text-accent-700 space-y-1">
                      <div><strong>참여자:</strong> {players.join(', ')}</div>
                      <div><strong>벌칙:</strong> {penalty}</div>
                    </div>
                  </div>

                  {/* 게임 특징 */}
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h3 className="font-semibold text-yellow-800 mb-3">⭐ 게임 특징</h3>
                    <div className="text-sm text-yellow-700 space-y-2">
                      <div>• <strong>완전한 랜덤</strong>으로 공정한 결과</div>
                      <div>• <strong>시각적 효과</strong>로 재미있는 경험</div>
                      <div>• <strong>즉시 결과</strong> 확인 가능</div>
                      <div>• <strong>반복 플레이</strong> 가능</div>
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
                className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Trophy className="w-10 h-10 text-accent-600" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-gray-800 mb-2">결과 발표!</h2>
              <p className="text-xl text-gray-600 mb-2">
                <span className="font-bold text-primary-600">{result.winner}</span>님이
              </p>
              <p className="text-2xl font-bold text-primary-600 mb-6">
                "{result.penalty}"
              </p>
              <p className="text-gray-500 mb-6">을 담당하게 되었습니다!</p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setResult(null);
                    resetRoulette();
                  }}
                  className="flex-1 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
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
              {/* Roulette Wheel Container */}
              <div className="relative flex flex-col items-center">
                {/* 상단 화살표 - 당첨 지점 표시 */}
                <motion.div
                  className="mb-2 flex flex-col items-center z-50"
                  animate={isSpinning ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: isSpinning ? Infinity : 0 }}
                >
                  {/* 작은 삼각형 화살표 */}
                  <div 
                    className="w-0 h-0"
                    style={{ 
                      borderLeft: '15px solid transparent',
                      borderRight: '15px solid transparent',
                      borderTop: '30px solid #E69975', // primary-500 색상
                      filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                    }}
                  />
                </motion.div>

                {/* 룰렛 휠 컨테이너 */}
                <div className="relative">
                  {/* 룰렛 휠 외부 테두리 */}
                  <div className="absolute -inset-2 rounded-full border-8 border-accent-400 shadow-2xl"></div>
                  
                  <motion.div
                    className="w-80 h-80 rounded-full relative overflow-hidden shadow-2xl border-4 border-white"
                    animate={{
                      rotate: rotation,
                    }}
                    transition={{
                      duration: isSpinning ? 3 : 0,
                      ease: isSpinning ? "easeOut" : "linear",
                    }}
                  >
                    {/* SVG로 정확한 섹션 그리기 */}
                    <svg
                      width="100%"
                      height="100%"
                      viewBox="0 0 200 200"
                      className="absolute inset-0"
                    >
                      {players.map((_, index) => {
                        const colors = ['#E69975', '#6C92E6', '#F1B088', '#A3CCFF', '#F6CCB3', '#C7E0FF', '#FAE1D4', '#E1EFFF'];
                        const anglePerSection = 360 / players.length;
                        const startAngle = index * anglePerSection;
                        const endAngle = (index + 1) * anglePerSection;
                        
                        // SVG path로 정확한 섹션 그리기
                        const centerX = 100;
                        const centerY = 100;
                        const radius = 100;
                        
                        const startAngleRad = (startAngle - 90) * Math.PI / 180; // -90도로 12시 방향을 0도로
                        const endAngleRad = (endAngle - 90) * Math.PI / 180;
                        
                        const x1 = centerX + radius * Math.cos(startAngleRad);
                        const y1 = centerY + radius * Math.sin(startAngleRad);
                        const x2 = centerX + radius * Math.cos(endAngleRad);
                        const y2 = centerY + radius * Math.sin(endAngleRad);
                        
                        const largeArc = anglePerSection > 180 ? 1 : 0;
                        
                        const pathData = [
                          `M ${centerX} ${centerY}`,
                          `L ${x1} ${y1}`,
                          `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                          'Z'
                        ].join(' ');
                        
                        return (
                          <path
                            key={index}
                            d={pathData}
                            fill={colors[index % colors.length]}
                            stroke="white"
                            strokeWidth="2"
                          />
                        );
                      })}
                    </svg>

                    {/* 룰렛 섹션 텍스트 */}
                    {players.map((player, index) => {
                      const anglePerSection = 360 / players.length;
                      const textAngle = index * anglePerSection + anglePerSection / 2;
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
                              textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                            }}
                          >
                            {player}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>

                  {/* 중앙 원 */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-accent-400 shadow-lg flex items-center justify-center z-10">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Spin Button */}
              <motion.button
                className={`flex items-center space-x-3 px-8 py-4 rounded-2xl font-bold text-lg transition-all ${
                  isSpinning
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600 shadow-lg hover:shadow-xl'
                }`}
                whileHover={!isSpinning ? { scale: 1.05 } : {}}
                whileTap={!isSpinning ? { scale: 0.95 } : {}}
                onClick={spinRoulette}
                disabled={isSpinning}
              >
                <Play className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? '돌리는 중...' : '룰렛 돌리기'}</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RoulettePage;