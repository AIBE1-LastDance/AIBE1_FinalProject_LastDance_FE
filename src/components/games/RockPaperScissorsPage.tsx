import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, ArrowLeft, Play, RotateCcw, Trophy, Users, Clock, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Player {
  id: string;
  name: string;
  avatar: string;
  choice?: 'rock' | 'paper' | 'scissors';
  eliminated?: boolean;
}

interface Match {
  player1: Player;
  player2: Player;
  winner?: Player;
}

const RockPaperScissorsPage: React.FC = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'countdown' | 'result' | 'finished'>('setup');
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: '김우리', avatar: '🧑‍💼' },
    { id: '2', name: '박집사', avatar: '👩‍🎨' },
    { id: '3', name: '이하우스', avatar: '👨‍💻' },
    { id: '4', name: '최메이트', avatar: '👩‍🔬' },
  ]);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentMatches, setCurrentMatches] = useState<Match[]>([]);
  const [roundWinners, setRoundWinners] = useState<Player[]>([]);
  const [countdown, setCountdown] = useState(3);
  const [showChoices, setShowChoices] = useState(false);
  const [champion, setChampion] = useState<Player | null>(null);

  const choices = [
    { id: 'rock', emoji: '✊', name: '바위', beats: 'scissors' },
    { id: 'paper', emoji: '✋', name: '보', beats: 'rock' },
    { id: 'scissors', emoji: '✌️', name: '가위', beats: 'paper' },
  ] as const;

  const addPlayer = () => {
    const newPlayer: Player = {
      id: Date.now().toString(),
      name: `플레이어 ${players.length + 1}`,
      avatar: ['🧑‍💼', '👩‍🎨', '👨‍💻', '👩‍🔬', '🧑‍🎓', '👨‍🍳', '👩‍⚕️', '🧑‍🚀'][players.length % 8],
    };
    setPlayers([...players, newPlayer]);
  };

  const removePlayer = (id: string) => {
    if (players.length > 2) {
      setPlayers(players.filter(p => p.id !== id));
    }
  };

  const startTournament = () => {
    const activePlayers = players.filter(p => !p.eliminated);
    if (activePlayers.length < 2) return;

    // Create matches for current round
    const matches: Match[] = [];
    for (let i = 0; i < activePlayers.length; i += 2) {
      if (i + 1 < activePlayers.length) {
        matches.push({
          player1: activePlayers[i],
          player2: activePlayers[i + 1],
        });
      } else {
        // Odd number of players, this player gets a bye
        setRoundWinners(prev => [...prev, activePlayers[i]]);
      }
    }
    
    setCurrentMatches(matches);
    setGameState('countdown');
    setCountdown(3);
  };

  const handlePlayerChoice = (playerId: string, choice: 'rock' | 'paper' | 'scissors') => {
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, choice } : p
    ));
  };

  const determineWinner = (choice1: string, choice2: string): 'player1' | 'player2' | 'tie' => {
    if (choice1 === choice2) return 'tie';
    
    const choice1Obj = choices.find(c => c.id === choice1);
    if (choice1Obj && choice1Obj.beats === choice2) return 'player1';
    return 'player2';
  };

  const processRoundResults = () => {
    const newWinners: Player[] = [];
    
    currentMatches.forEach(match => {
      const p1Choice = match.player1.choice;
      const p2Choice = match.player2.choice;
      
      if (p1Choice && p2Choice) {
        const result = determineWinner(p1Choice, p2Choice);
        if (result === 'player1') {
          newWinners.push(match.player1);
        } else if (result === 'player2') {
          newWinners.push(match.player2);
        } else {
          // Tie - both advance or replay
          newWinners.push(match.player1, match.player2);
        }
      }
    });

    setRoundWinners(prev => [...prev, ...newWinners]);
    
    // Mark eliminated players
    const winnerIds = new Set([...roundWinners, ...newWinners].map(p => p.id));
    setPlayers(prev => prev.map(p => ({
      ...p,
      eliminated: !winnerIds.has(p.id),
      choice: undefined,
    })));

    const totalWinners = roundWinners.length + newWinners.length;
    
    if (totalWinners === 1) {
      setChampion([...roundWinners, ...newWinners][0]);
      setGameState('finished');
    } else if (totalWinners > 1) {
      setCurrentRound(prev => prev + 1);
      setRoundWinners([...roundWinners, ...newWinners]);
      setTimeout(() => {
        setGameState('setup');
        setShowChoices(false);
      }, 3000);
    }
  };

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      setGameState('playing');
      setShowChoices(true);
    }
  }, [gameState, countdown]);

  useEffect(() => {
    if (gameState === 'playing') {
      const allPlayersReady = currentMatches.every(match => 
        match.player1.choice && match.player2.choice
      );
      
      if (allPlayersReady && currentMatches.length > 0) {
        setTimeout(() => {
          setGameState('result');
          processRoundResults();
        }, 1000);
      }
    }
  }, [players, gameState]);

  const resetGame = () => {
    setGameState('setup');
    setCurrentRound(1);
    setCurrentMatches([]);
    setRoundWinners([]);
    setChampion(null);
    setShowChoices(false);
    setPlayers(prev => prev.map(p => ({ ...p, choice: undefined, eliminated: false })));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
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
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">가위바위보 토너먼트</h1>
            <div className="flex items-center justify-center space-x-4 text-purple-300">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>라운드 {currentRound}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Trophy className="w-4 h-4" />
                <span>{players.filter(p => !p.eliminated).length}명 남음</span>
              </div>
            </div>
          </div>

          <button
            onClick={resetGame}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>재시작</span>
          </button>
        </motion.div>

        {/* Game Content */}
        <AnimatePresence mode="wait">
          {gameState === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Player Setup */}
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">참가자 설정</h2>
                  <button
                    onClick={addPlayer}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    플레이어 추가
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {players.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative p-4 rounded-xl text-center ${
                        player.eliminated 
                          ? 'bg-red-500 bg-opacity-20 border-2 border-red-500' 
                          : 'bg-white bg-opacity-20 border-2 border-transparent hover:border-purple-400'
                      } transition-all cursor-pointer`}
                    >
                      <div className="text-3xl mb-2">{player.avatar}</div>
                      <div className="text-white font-medium">{player.name}</div>
                      {player.eliminated && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                          <span className="text-red-400 font-bold">탈락</span>
                        </div>
                      )}
                      {players.length > 2 && !player.eliminated && (
                        <button
                          onClick={() => removePlayer(player.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={startTournament}
                  disabled={players.filter(p => !p.eliminated).length < 2}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5 inline mr-2" />
                  토너먼트 시작
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'countdown' && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-12">
                <h2 className="text-2xl font-bold text-white mb-8">라운드 {currentRound} 시작!</h2>
                <motion.div
                  key={countdown}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="text-8xl font-bold text-purple-300 mb-8"
                >
                  {countdown || '시작!'}
                </motion.div>
                <div className="text-purple-200">가위바위보를 선택하세요!</div>
              </div>
            </motion.div>
          )}

          {(gameState === 'playing' || gameState === 'result') && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {currentMatches.map((match, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between">
                    {/* Player 1 */}
                    <div className="flex-1 text-center">
                      <div className="text-3xl mb-2">{match.player1.avatar}</div>
                      <div className="text-white font-bold mb-4">{match.player1.name}</div>
                      
                      {showChoices && gameState === 'playing' && !match.player1.choice && (
                        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                          {choices.map((choice) => (
                            <button
                              key={choice.id}
                              onClick={() => handlePlayerChoice(match.player1.id, choice.id)}
                              className="p-3 bg-purple-500 bg-opacity-50 rounded-xl hover:bg-opacity-80 transition-all"
                            >
                              <div className="text-2xl">{choice.emoji}</div>
                              <div className="text-xs text-white">{choice.name}</div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {match.player1.choice && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-6xl"
                        >
                          {choices.find(c => c.id === match.player1.choice)?.emoji}
                        </motion.div>
                      )}
                    </div>

                    {/* VS */}
                    <div className="px-8">
                      <div className="text-2xl font-bold text-purple-300">VS</div>
                    </div>

                    {/* Player 2 */}
                    <div className="flex-1 text-center">
                      <div className="text-3xl mb-2">{match.player2.avatar}</div>
                      <div className="text-white font-bold mb-4">{match.player2.name}</div>
                      
                      {showChoices && gameState === 'playing' && !match.player2.choice && (
                        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                          {choices.map((choice) => (
                            <button
                              key={choice.id}
                              onClick={() => handlePlayerChoice(match.player2.id, choice.id)}
                              className="p-3 bg-purple-500 bg-opacity-50 rounded-xl hover:bg-opacity-80 transition-all"
                            >
                              <div className="text-2xl">{choice.emoji}</div>
                              <div className="text-xs text-white">{choice.name}</div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {match.player2.choice && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-6xl"
                        >
                          {choices.find(c => c.id === match.player2.choice)?.emoji}
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {gameState === 'result' && match.player1.choice && match.player2.choice && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 text-center"
                    >
                      {(() => {
                        const result = determineWinner(match.player1.choice, match.player2.choice);
                        if (result === 'tie') {
                          return <div className="text-yellow-400 font-bold text-xl">무승부!</div>;
                        } else {
                          const winner = result === 'player1' ? match.player1 : match.player2;
                          return (
                            <div className="text-green-400 font-bold text-xl">
                              🎉 {winner.name} 승리! 🎉
                            </div>
                          );
                        }
                      })()}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {gameState === 'finished' && champion && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-12 text-white">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-6xl mb-6"
                >
                  👑
                </motion.div>
                <h2 className="text-4xl font-bold mb-4">토너먼트 우승!</h2>
                <div className="text-6xl mb-4">{champion.avatar}</div>
                <div className="text-2xl font-bold mb-6">{champion.name}</div>
                <div className="text-lg opacity-90 mb-8">
                  축하합니다! 가위바위보 토너먼트에서 우승하셨습니다!
                </div>
                <button
                  onClick={resetGame}
                  className="px-8 py-3 bg-white text-orange-500 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
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

export default RockPaperScissorsPage;