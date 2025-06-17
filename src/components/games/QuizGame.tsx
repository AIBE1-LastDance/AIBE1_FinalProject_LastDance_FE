import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, Clock, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  answered: boolean;
  answerTime?: number;
}

const QuizGame: React.FC = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: '김우리', avatar: '🧑‍💼', score: 0, answered: false },
    { id: '2', name: '박집사', avatar: '👩‍🎨', score: 0, answered: false },
    { id: '3', name: '이하우스', avatar: '👨‍💻', score: 0, answered: false },
    { id: '4', name: '최메이트', avatar: '👩‍🔬', score: 0, answered: false },
  ]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameState, setGameState] = useState<'setup' | 'question' | 'result' | 'finished'>('setup');
  const [timeLeft, setTimeLeft] = useState(15);
  const [selectedAnswers, setSelectedAnswers] = useState<{[playerId: string]: number}>({});
  const [showExplanation, setShowExplanation] = useState(false);

  const questions: Question[] = [
    {
      id: 1,
      question: "설거지를 할 때 가장 효율적인 순서는?",
      options: [
        "접시 → 컵 → 수저 → 팬",
        "팬 → 접시 → 컵 → 수저", 
        "수저 → 컵 → 접시 → 팬",
        "컵 → 수저 → 접시 → 팬"
      ],
      correctAnswer: 2,
      explanation: "기름기가 적은 것부터 씻어야 깨끗하게 설거지할 수 있습니다."
    },
    {
      id: 2,
      question: "쓰레기 분리수거에서 플라스틱 용기를 버릴 때 주의사항은?",
      options: [
        "그냥 버린다",
        "물로 헹군 후 버린다",
        "찢어서 버린다",
        "뚜껑만 분리해서 버린다"
      ],
      correctAnswer: 1,
      explanation: "플라스틱 용기는 내용물을 비우고 물로 헹군 후 버려야 합니다."
    },
    {
      id: 3,
      question: "세탁기 사용 시 가장 적절한 세제 양은?",
      options: [
        "눈대중으로 많이",
        "계량컵으로 정확히",
        "조금만",
        "세제가 보일 때까지"
      ],
      correctAnswer: 1,
      explanation: "세제는 세탁물 양에 맞춰 계량컵으로 정확한 양을 넣어야 효과적입니다."
    },
    {
      id: 4,
      question: "화장실 청소에서 가장 먼저 해야 할 것은?",
      options: [
        "변기 청소",
        "바닥 청소",
        "환기",
        "세면대 청소"
      ],
      correctAnswer: 2,
      explanation: "청소 전 환기를 먼저 해야 화학세제 냄새와 습기를 제거할 수 있습니다."
    },
    {
      id: 5,
      question: "음식물 쓰레기 처리에서 피해야 할 것은?",
      options: [
        "양파껍질",
        "계란껍질",
        "수박껍질",
        "당근껍질"
      ],
      correctAnswer: 1,
      explanation: "계란껍질은 음식물 쓰레기가 아니라 일반쓰레기로 분류됩니다."
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];

  const startGame = () => {
    setGameState('question');
    setTimeLeft(15);
  };

  const selectAnswer = (playerId: string, answerIndex: number) => {
    if (gameState !== 'question') return;
    
    setSelectedAnswers(prev => ({ ...prev, [playerId]: answerIndex }));
    setPlayers(prev => prev.map(player => 
      player.id === playerId 
        ? { ...player, answered: true, answerTime: 15 - timeLeft }
        : player
    ));
  };

  const calculateScore = (playerId: string): number => {
    const answer = selectedAnswers[playerId];
    if (answer === undefined) return 0;
    
    const isCorrect = answer === currentQuestion.correctAnswer;
    if (!isCorrect) return 0;
    
    const player = players.find(p => p.id === playerId);
    const timeBonus = player?.answerTime ? Math.max(0, 15 - player.answerTime) * 10 : 0;
    return 100 + timeBonus;
  };

  const nextQuestion = () => {
    // Update scores
    setPlayers(prev => prev.map(player => ({
      ...player,
      score: player.score + calculateScore(player.id),
      answered: false,
      answerTime: undefined
    })));

    // Clear answers
    setSelectedAnswers({});
    setShowExplanation(false);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeLeft(15);
      setGameState('question');
    } else {
      setGameState('finished');
    }
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setGameState('setup');
    setTimeLeft(15);
    setSelectedAnswers({});
    setShowExplanation(false);
    setPlayers(prev => prev.map(player => ({
      ...player,
      score: 0,
      answered: false,
      answerTime: undefined
    })));
  };

  useEffect(() => {
    if (gameState === 'question' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'question' && timeLeft === 0) {
      setGameState('result');
      setShowExplanation(true);
    }
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (gameState === 'result' && showExplanation) {
      const timer = setTimeout(() => {
        nextQuestion();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [gameState, showExplanation]);

  const getWinner = () => {
    return players.reduce((prev, current) => 
      prev.score > current.score ? prev : current
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigate('/games')}
            className="flex items-center space-x-2 text-white hover:text-orange-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>게임 목록</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">하우스메이트 퀴즈</h1>
            {gameState !== 'setup' && (
              <div className="text-orange-300">
                문제 {currentQuestionIndex + 1}/{questions.length}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {gameState === 'question' && (
              <div className="flex items-center space-x-2 text-white">
                <Clock className="w-5 h-5" />
                <span className="text-xl font-bold">{timeLeft}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Scoreboard */}
        {gameState !== 'setup' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 mb-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {players
                .sort((a, b) => b.score - a.score)
                .map((player, index) => (
                  <div 
                    key={player.id}
                    className={`p-4 rounded-xl text-center ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 'bg-white bg-opacity-20'
                    }`}
                  >
                    <div className="text-2xl mb-2">{player.avatar}</div>
                    <div className="text-white font-bold">{player.name}</div>
                    <div className="text-white text-lg font-bold">{player.score}점</div>
                    {gameState === 'question' && player.answered && (
                      <CheckCircle className="w-5 h-5 text-green-400 mx-auto mt-2" />
                    )}
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Setup Screen */}
        {gameState === 'setup' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 text-center"
          >
            <div className="text-6xl mb-6">🧠</div>
            <h2 className="text-2xl font-bold text-white mb-4">집안일 퀴즈에 도전하세요!</h2>
            <p className="text-orange-300 mb-8">
              총 {questions.length}문제의 집안일 관련 퀴즈를 풀어보세요.<br/>
              빠르게 정답을 맞힐수록 높은 점수를 얻습니다!
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transition-all"
            >
              <HelpCircle className="w-5 h-5 inline mr-2" />
              퀴즈 시작!
            </button>
          </motion.div>
        )}

        {/* Question Screen */}
        {gameState === 'question' && currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                {currentQuestion.question}
              </h2>
              <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / 15) * 100}%` }}
                  className="bg-gradient-to-r from-yellow-400 to-red-500 h-2 rounded-full transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {currentQuestion.options.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="text-white font-medium mb-2">옵션 {index + 1}</div>
                  <button
                    className="w-full p-4 bg-white bg-opacity-20 rounded-xl text-white font-medium hover:bg-opacity-30 transition-all text-left"
                  >
                    {option}
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Player Answer Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {players.map((player) => (
                <div key={player.id} className="text-center">
                  <div className="text-white font-medium mb-2">{player.name}</div>
                  <div className="space-y-2">
                    {currentQuestion.options.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => selectAnswer(player.id, index)}
                        disabled={player.answered}
                        className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          selectedAnswers[player.id] === index
                            ? 'bg-blue-500 text-white'
                            : player.answered
                              ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                              : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Result Screen */}
        {gameState === 'result' && showExplanation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 text-center"
          >
            <h2 className="text-2xl font-bold text-white mb-6">정답 공개!</h2>
            
            <div className="mb-6">
              <div className="text-lg text-white mb-4">
                정답: <span className="font-bold text-green-400">
                  {currentQuestion.options[currentQuestion.correctAnswer]}
                </span>
              </div>
              <div className="text-orange-300">
                {currentQuestion.explanation}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {players.map((player) => {
                const playerAnswer = selectedAnswers[player.id];
                const isCorrect = playerAnswer === currentQuestion.correctAnswer;
                const score = calculateScore(player.id);
                
                return (
                  <div 
                    key={player.id}
                    className={`p-4 rounded-xl ${
                      isCorrect ? 'bg-green-500 bg-opacity-20' : 'bg-red-500 bg-opacity-20'
                    }`}
                  >
                    <div className="text-2xl mb-2">{player.avatar}</div>
                    <div className="text-white font-bold">{player.name}</div>
                    <div className="flex items-center justify-center mt-2">
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                    </div>
                    {score > 0 && (
                      <div className="text-yellow-400 font-bold mt-2">+{score}점</div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Finished Screen */}
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
                <h2 className="text-3xl font-bold mb-4">퀴즈 완료!</h2>
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
      </div>
    </div>
  );
};

export default QuizGame;