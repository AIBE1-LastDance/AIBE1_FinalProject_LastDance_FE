import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Play, RotateCcw, Trophy, HelpCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import GameSetupModal from './GameSetupModal';
import { gameApi, GameResultRequest } from '../../api/games';
import { useAppStore } from '../../store/appStore';

interface LadderLine {
  from: number;
  to: number;
  y: number;
}

const LadderGamePage: React.FC = () => {
  const navigate = useNavigate();
  const { mode, currentGroup } = useAppStore();
  const [showSetup, setShowSetup] = useState(true);
  const [players, setPlayers] = useState<string[]>([]);
  const [penalty, setPenalty] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [result, setResult] = useState<{ player: string; penalty: string } | null>(null);
  const [ladderLines, setLadderLines] = useState<LadderLine[]>([]);
  const [animationPath, setAnimationPath] = useState<{x: number, y: number}[]>([]);
  const [showAnimation, setShowAnimation] = useState(false);
  const [playedPlayers, setPlayedPlayers] = useState<number[]>([]);
  const [gameFinished, setGameFinished] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const generateLadder = (numPlayers: number) => {
    if (numPlayers < 2) {
      console.log('Not enough players for ladder');
      return [];
    }
    
    const lines: LadderLine[] = [];
    const numLevels = Math.max(12, numPlayers * 3);
    
    // Y축 범위를 제한 - 세로선의 중간 부분에서만 가로선 생성
    const minY = 10; // 상단 20% 지점부터
    const maxY = 90; // 하단 80% 지점까지
    
    console.log(`Generating ladder for ${numPlayers} players with ${numLevels} levels`);
    console.log(`Horizontal lines will be generated only between Y=${minY}% to Y=${maxY}%`);
    
    // 각 레벨별로 가로선 생성 (제한된 Y 범위에서만)
    for (let level = 1; level < numLevels; level++) {
      const y = (level / numLevels) * 100;
      
      // Y 좌표가 허용 범위에 있는지 확인
      if (y < minY || y > maxY) {
        continue; // 범위 밖이면 가로선 생성하지 않음
      }
      
      // 연결 가능한 모든 인접 쌍
      const availablePairs: number[] = [];
      for (let i = 0; i < numPlayers - 1; i++) {
        if (i >= 0 && i < numPlayers - 1) {
          availablePairs.push(i);
        }
      }
      
      console.log(`Level ${level} (Y=${y.toFixed(1)}%): Available pairs:`, availablePairs);
      
      // 배열 섞기
      for (let i = availablePairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availablePairs[i], availablePairs[j]] = [availablePairs[j], availablePairs[i]];
      }
      
      // 이미 사용된 세로선 번호들
      const usedVerticals = new Set<number>();
      
      // 랜덤하게 연결선 생성 (40% 확률)
      for (const startIdx of availablePairs) {
        const endIdx = startIdx + 1;
        
        // 두 세로선이 모두 사용되지 않았고, 확률적으로 연결
        if (!usedVerticals.has(startIdx) && 
            !usedVerticals.has(endIdx) && 
            Math.random() < 0.4) {
          
          lines.push({
            from: startIdx,
            to: endIdx,
            y: y
          });
          
          usedVerticals.add(startIdx);
          usedVerticals.add(endIdx);
          
          console.log(`✓ Added line: ${startIdx} -> ${endIdx} at y=${y.toFixed(1)}%`);
        }
      }
    }
    
    console.log(`Generated ${lines.length} lines total (all within Y=${minY}%-${maxY}%)`);
    
    // 최종 검증: 모든 라인이 유효한지 확인
    const validLines = lines.filter(line => {
      const isValid = typeof line.from === 'number' &&
                     typeof line.to === 'number' &&
                     line.from >= 0 && 
                     line.to < numPlayers && 
                     line.from < line.to && 
                     (line.to - line.from) === 1 &&
                     typeof line.y === 'number' &&
                     line.y >= minY && 
                     line.y <= maxY;
      
      if (!isValid) {
        console.error('❌ Invalid line filtered:', line);
      }
      return isValid;
    });
    
    console.log(`Final valid lines: ${validLines.length}`);
    return validLines;
  };

  const calculatePath = (startIndex: number, lines: LadderLine[], numPlayers: number) => {
    const path: {x: number, y: number}[] = [];
    let currentIndex = startIndex;
    const numLevels = Math.max(12, numPlayers * 3);
    const stepSize = 100 / numLevels;
    
    // X 좌표 계산 함수 - 세로선과 동일한 범위 사용 (0~100)
    const getX = (index: number) => {
      return numPlayers === 1 ? 50 : (index / (numPlayers - 1)) * 100;
    };
    
    path.push({ x: getX(currentIndex), y: 0 });
    
    for (let level = 1; level < numLevels; level++) {
      const y = level * stepSize;
      
      // 현재 레벨에서 연결선 확인 (더 정확한 범위로 체크)
      const connectionAtLevel = lines.find(line => 
        Math.abs(line.y - y) < stepSize * 0.8 && 
        (line.from === currentIndex || line.to === currentIndex)
      );
      
      if (connectionAtLevel) {
        // 연결선이 있으면 이동
        const newIndex = connectionAtLevel.from === currentIndex 
          ? connectionAtLevel.to 
          : connectionAtLevel.from;
        
        // 가로로 이동하는 패스 추가 (부드러운 곡선으로)
        path.push({ x: getX(currentIndex), y });
        path.push({ x: getX(newIndex), y });
        currentIndex = newIndex;
      } else {
        // 연결선이 없으면 직진
        path.push({ x: getX(currentIndex), y });
      }
    }
    
    // 최종 위치
    path.push({ x: getX(currentIndex), y: 100 });
    return { path, finalIndex: currentIndex };
  };

  const handleGameSetup = (playerNames: string[], penaltyText: string) => {
    console.log('Setting up game with players:', playerNames);
    setPlayers(playerNames);
    setPenalty(penaltyText);
    setShowSetup(false);
    
    // 약간의 지연 후 사다리 생성 (상태 업데이트 완료 후)
    setTimeout(() => {
      const newLadder = generateLadder(playerNames.length);
      setLadderLines(newLadder);
    }, 100);
  };

  // 게임 결과 저장 함수
  const saveGameResult = async (winner: string) => {
    try {
      const gameData: GameResultRequest = {
        gameType: "LADDER",
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

  const playGame = (playerIndex: number) => {
    if (isPlaying || playedPlayers.includes(playerIndex) || gameFinished) return;
    
    setIsPlaying(true);
    setSelectedPlayer(playerIndex);
    setShowAnimation(true);
    
    const { path, finalIndex } = calculatePath(playerIndex, ladderLines, players.length);
    setAnimationPath(path);
    
    // 오직 한 명만 벌칙에 당첨 (마지막 인덱스가 벌칙)
    const isPenalty = finalIndex === players.length - 1;
    
    // 애니메이션 후 결과 표시 (더 부드럽고 느린 애니메이션)
    setTimeout(() => {
      if (isPenalty) {
        // 벌칙에 당첨된 경우: 게임 종료
        const winner = players[playerIndex];
        setResult({
          player: winner,
          penalty: penalty
        });
        setGameFinished(true);
        setIsPlaying(false);
        setShowAnimation(false);
        
        // 게임 결과 저장
        saveGameResult(winner);
      } else {
        // 통과한 경우: 플레이어를 사용됨 목록에 추가하고 게임 계속
        setPlayedPlayers(prev => [...prev, playerIndex]);
        setIsPlaying(false);
        setShowAnimation(false);
        setSelectedPlayer(null);
        
        // 잠시 결과를 보여준 후 계속 진행
        setResult({
          player: players[playerIndex],
          penalty: "통과"
        });
        
        setTimeout(() => {
          setResult(null);
        }, 1500);
      }
    }, path.length * 300 + 1500); // 더 부드러운 애니메이션을 위해 시간 연장
  };

  const resetGame = () => {
    setSelectedPlayer(null);
    setResult(null);
    setAnimationPath([]);
    setShowAnimation(false);
    setPlayedPlayers([]);
    setGameFinished(false);
    
    console.log('Resetting game with', players.length, 'players');
    const newLadderLines = generateLadder(players.length);
    console.log('New ladder lines count:', newLadderLines.length);
    setLadderLines(newLadderLines);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
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
              <h1 className="text-2xl font-bold text-gray-800">사다리타기</h1>
              <p className="text-gray-600">사다리를 타고 내려가서 운명을 결정하세요!</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowHelpModal(true)}
              className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center hover:bg-purple-200 transition-colors"
              title="게임 방법 보기"
            >
              <HelpCircle className="w-5 h-5 text-purple-600" />
            </button>
            {!showSetup && !gameFinished && (
              <button
                onClick={resetGame}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>새 사다리</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
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
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-3">🪜 게임 방법</h3>
                    <ul className="text-sm text-purple-700 space-y-2">
                      <li>• 위에서 참여자를 선택하세요</li>
                      <li>• 빨간 공이 사다리를 따라 부드럽게 내려갑니다</li>
                      <li>• 연결된 가로줄을 만나면 반대편으로 이동합니다</li>
                      <li>• <span className="font-bold">통과한 플레이어는 다시 선택할 수 없습니다</span></li>
                      <li>• <span className="font-bold text-red-600">가장 오른쪽 끝에 도착하면 벌칙입니다!</span></li>
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

                  {/* 게임 규칙 */}
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-3">📋 게임 규칙</h3>
                    <div className="text-sm text-green-700 space-y-2">
                      <div>• <strong>한 번에 한 명씩</strong> 플레이합니다</div>
                      <div>• <strong>가로선을 만나면</strong> 무조건 이동해야 합니다</div>
                      <div>• <strong>통과한 플레이어</strong>는 더 이상 선택할 수 없습니다</div>
                      <div>• <strong>벌칙 당첨자</strong>가 나오면 게임이 종료됩니다</div>
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
          gameTitle="사다리타기"
          minPlayers={2}
          maxPlayers={8}
        />

        {/* Game Result */}
        <AnimatePresence>
          {result && gameFinished && (
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
                
                <h2 className="text-3xl font-bold text-gray-800 mb-2">벌칙 당첨!</h2>
                <p className="text-xl text-gray-600 mb-2">
                  <span className="font-bold text-red-600">{result.player}</span>님이
                </p>
                <p className="text-2xl font-bold mb-6 text-red-600">
                  "{result.penalty}"
                </p>
                <p className="text-gray-500 mb-6">
                  을 담당하게 되었습니다!
                </p>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setResult(null);
                      resetGame();
                    }}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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

        {/* Pass Result Notification */}
        <AnimatePresence>
          {result && !gameFinished && result.penalty === "통과" && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40"
            >
              <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
                <span className="font-medium">{result.player}님 통과!</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Board */}
        {!showSetup && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {gameFinished ? "게임 종료!" : "참여자를 선택하세요"}
              </h2>
              <p className="text-gray-600">
                {gameFinished 
                  ? "벌칙 당첨자가 결정되었습니다!" 
                  : "선택한 참여자의 경로를 따라 결과가 정해집니다"}
              </p>
              {playedPlayers.length > 0 && !gameFinished && (
                <p className="text-sm text-blue-600 mt-2">
                  통과한 플레이어: {playedPlayers.map(i => players[i]).join(', ')}
                </p>
              )}
            </div>

            {/* Player Selection */}
            <div className="flex justify-center space-x-4 mb-8">
              {players.map((player, index) => (
                <motion.button
                  key={index}
                  onClick={() => playGame(index)}
                  disabled={isPlaying || playedPlayers.includes(index) || gameFinished}
                  whileHover={{ scale: playedPlayers.includes(index) || gameFinished ? 1 : 1.05 }}
                  whileTap={{ scale: playedPlayers.includes(index) || gameFinished ? 1 : 0.95 }}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedPlayer === index
                      ? 'bg-blue-600 text-white'
                      : playedPlayers.includes(index)
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : isPlaying || gameFinished
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {playedPlayers.includes(index) ? `${player} (통과)` : player}
                </motion.button>
              ))}
            </div>

            {/* Ladder Visualization */}
            <div className="relative w-full h-96 bg-gradient-to-b from-blue-50 to-purple-50 rounded-xl overflow-hidden border-2 border-blue-100">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
                className="absolute inset-0"
              >
                {/* 세로 막대 - 원래대로 전체 범위 사용 */}
                {players.map((_, index) => {
                  const x = players.length === 1 
                    ? 50 // 1명일 때는 중앙에
                    : (index / (players.length - 1)) * 100; // 0~100 범위
                  
                  return (
                    <line
                      key={`vertical-${index}`}
                      x1={x}
                      y1="8"
                      x2={x}
                      y2="92"
                      stroke="#1e40af"
                      strokeWidth="0.8"
                      strokeLinecap="round"
                      style={{
                        filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.2))'
                      }}
                    />
                  );
                })}

                {/* 가로 연결선 - 세로선과 동일한 범위 사용 */}
                {ladderLines.map((line, index) => {
                  // 다시 한번 엄격한 검증
                  if (typeof line.from !== 'number' || 
                      typeof line.to !== 'number' || 
                      line.from < 0 || 
                      line.to >= players.length ||
                      line.from >= line.to ||
                      (line.to - line.from) !== 1 ||
                      typeof line.y !== 'number' ||
                      line.y < 0 || 
                      line.y > 100) {
                    console.error('Invalid line in render:', line);
                    return null;
                  }
                  
                  // 가로선도 세로선과 동일한 계산 방식 사용
                  const startX = players.length === 1 
                    ? 50 
                    : (line.from / (players.length - 1)) * 100;
                  const endX = players.length === 1 
                    ? 50 
                    : (line.to / (players.length - 1)) * 100;
                  const y = line.y;
                  
                  return (
                    <line
                      key={`ladder-line-${index}-${line.from}-${line.to}`}
                      x1={startX}
                      y1={y}
                      x2={endX}
                      y2={y}
                      stroke="#2563eb"
                      strokeWidth="0.6"
                      strokeLinecap="round"
                      style={{
                        filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.2))'
                      }}
                    />
                  );
                })}

                {/* 빨간 선 애니메이션 - 세로선과 동일한 범위 */}
                {showAnimation && animationPath.length > 1 && (
                  <motion.polyline
                    points={animationPath.map(point => `${point.x},${point.y}`).join(' ')}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="4 4"
                    style={{
                      filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                    }}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{
                      duration: animationPath.length * 0.3,
                      ease: "easeInOut"
                    }}
                  />
                )}

                {/* Player Names at Top - 세로선과 정확히 일치 */}
                {players.map((player, index) => {
                  const x = players.length === 1 
                    ? 50 
                    : (index / (players.length - 1)) * 100;
                  
                  return (
                    <text
                      key={`player-name-${index}`}
                      x={x}
                      y="4"
                      textAnchor="middle"
                      className="text-xs font-bold fill-blue-700"
                      style={{ fontSize: '3px' }}
                    >
                      {player}
                    </text>
                  );
                })}

                {/* Results at Bottom - 세로선과 정확히 일치 */}
                {players.map((_, index) => {
                  const x = players.length === 1 
                    ? 50 
                    : (index / (players.length - 1)) * 100;
                  
                  return (
                    <text
                      key={`result-${index}`}
                      x={x}
                      y="98"
                      textAnchor="middle"
                      className={`text-xs font-bold ${
                        index === players.length - 1 ? 'fill-red-700' : 'fill-green-700'
                      }`}
                      style={{ fontSize: '3px' }}
                    >
                      {index === players.length - 1 ? '벌칙' : '통과'}
                    </text>
                  );
                })}
              </svg>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LadderGamePage;