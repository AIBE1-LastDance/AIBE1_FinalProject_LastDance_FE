import React from 'react';
import {motion} from 'framer-motion';
import {Gamepad2, RotateCcw, GitBranch, Dice6, Star} from 'lucide-react';
import {useNavigate} from 'react-router-dom';

const GamesPage: React.FC = () => {
    const navigate = useNavigate();

    const games = [
        {
            id: 'roulette',
            title: '룰렛',
            description: '당번을 정하는 재밌는 룰렛 게임',
            icon: RotateCcw,
            color: 'bg-gradient-to-br from-orange-300 to-orange-400',
            path: '/games/roulette',
            players: '2-8명',
            duration: '1분',
            difficulty: 'Easy'
        },
        {
            id: 'ladder',
            title: '사다리타기',
            description: '사다리를 타고 내려가서 운명을 결정하세요',
            icon: GitBranch,
            color: 'bg-gradient-to-br from-orange-300 to-orange-400',
            path: '/games/ladder',
            players: '2-8명',
            duration: '2분',
            difficulty: 'Easy'
        },
        {
            id: 'yatzy',
            title: 'YATZY (주사위)',
            description: '주사위 5개로 운명을 결정하는 게임',
            icon: Dice6,
            color: 'bg-gradient-to-br from-orange-300 to-orange-400',
            path: '/games/yatzy',
            players: '1-6명',
            duration: '2분',
            difficulty: 'Easy'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6}}
                className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white"
            >
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <Gamepad2 className="w-6 h-6"/>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">미니게임</h1>
                        <p className="text-primary-100">
                            재밌는 게임으로 당번을 정하고 함께 즐겨보세요!
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {games.map((game, index) => (
                    <motion.div
                        key={game.id}
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.6, delay: index * 0.1}}
                        className={`${game.color} rounded-2xl p-6 text-white cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl relative overflow-hidden`}
                        whileHover={{scale: 1.05}}
                        whileTap={{scale: 0.95}}
                        onClick={() => navigate(game.path)}
                    >
                        <div
                            className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -mr-10 -mt-10"></div>
                        <div
                            className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-10 rounded-full -ml-8 -mb-8"></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                    <game.icon className="w-6 h-6"/>
                                </div>
                                <div className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    game.difficulty === 'Easy' ? 'bg-green-500 bg-opacity-20' :
                                        game.difficulty === 'Medium' ? 'bg-yellow-500 bg-opacity-20' :
                                            'bg-red-500 bg-opacity-20'
                                }`}>
                                    {game.difficulty}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-2">{game.title}</h3>
                            <p className="text-white text-opacity-90 text-sm mb-4 line-clamp-2">{game.description}</p>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-white text-opacity-70">참여인원</span>
                                    <span className="font-medium">{game.players}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-white text-opacity-70">소요시간</span>
                                    <span className="font-medium">{game.duration}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3 h-3 ${
                                                i < 4 ? 'text-yellow-300 fill-current' : 'text-white text-opacity-30'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <div className="text-sm font-medium">플레이 →</div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Game Rules */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6, delay: 0.4}}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
                <h2 className="text-xl font-bold text-gray-800 mb-4">게임 규칙</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-1">
                                <RotateCcw className="w-4 h-4 text-primary-600"/>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800">룰렛</h4>
                                <p className="text-sm text-gray-600">
                                    게임 시작 전 참여자와 벌칙을 설정한 후, 룰렛을 돌려서 당번을 정하는 게임입니다.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-1">
                                <GitBranch className="w-4 h-4 text-primary-600"/>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800">사다리타기</h4>
                                <p className="text-sm text-gray-600">
                                    참여자를 선택하면 사다리를 따라 내려가며 최종 도착지에 따라 결과가 정해집니다.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mt-1">
                                <Dice6 className="w-4 h-4 text-primary-600"/>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800">YATZY (주사위)</h4>
                                <p className="text-sm text-gray-600">
                                    주사위 5개를 굴려서 랜덤하게 결과를 정하는 간단한 운빨 게임입니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                    <h3 className="font-semibold text-primary-800 mb-2">공통 사항</h3>
                    <ul className="text-sm text-primary-700 space-y-1">
                        <li>• 모든 게임은 시작하기 전에 참여자와 벌칙을 설정해야 합니다</li>
                        <li>• 게임 결과는 완전히 랜덤으로 결정됩니다</li>
                        <li>• 결과가 나온 후 다시 하기 또는 게임 종료를 선택할 수 있습니다</li>
                    </ul>
                </div>
            </motion.div>

            {/* Recent Games */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6, delay: 0.5}}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
                <h2 className="text-xl font-bold text-gray-800 mb-4">최근 게임 결과</h2>
                <div className="space-y-3">
                    {[
                        {game: '룰렛', winner: '김우리', task: '설거지', time: '1시간 전'},
                        {game: '사다리타기', winner: '박집사', task: '청소', time: '3시간 전'},
                        {game: 'YATZY', winner: '이하우스', task: '쓰레기 배출', time: '1일 전'},
                    ].map((result, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">{result.winner.charAt(0)}</span>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-800">
                                        {result.game} - {result.winner}
                                    </div>
                                    <div className="text-xs text-gray-600">{result.task}</div>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500">{result.time}</div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default GamesPage;