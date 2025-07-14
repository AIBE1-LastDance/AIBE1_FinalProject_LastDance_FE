import React, { useEffect, useState } from 'react';
import {motion} from 'framer-motion';
import {Gamepad2, RotateCcw, GitBranch, Dice6, Star, History, TrendingUp} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import toast from 'react-hot-toast';
import { gameApi, GameResultResponse } from '../../api/games';
import { useAppStore } from '../../store/appStore';

const GamesPage: React.FC = () => {
    const navigate = useNavigate();
    const { mode, currentGroup, joinedGroups } = useAppStore();
    const [gameResults, setGameResults] = useState<GameResultResponse[]>([]);
    const [displayedResults, setDisplayedResults] = useState<GameResultResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGroupId, setSelectedGroupId] = useState<string>('');
    const [showMore, setShowMore] = useState(false);

    // 게임 결과 불러오기
    useEffect(() => {
        const fetchGameResults = async () => {
            try {
                setLoading(true);
                let results: GameResultResponse[] = [];
                
                if (mode === 'personal') {
                    results = await gameApi.getMyResults();
                } else if (mode === 'group' && currentGroup) {
                    results = await gameApi.getGroupResults(currentGroup.id);
                }
                
                // 최신순으로 정렬 (createdAt 기준)
                results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                
                setGameResults(results);
                setDisplayedResults(results.slice(0, 5)); // 처음엔 5개만 표시
                setShowMore(false);
            } catch (error) {
                console.error('게임 결과 조회 실패:', error);
                toast.error('게임 결과를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchGameResults();
    }, [mode, currentGroup]);

    // 더보기 버튼 클릭 핸들러
    const handleShowMore = () => {
        if (showMore) {
            setDisplayedResults(gameResults.slice(0, 5));
            setShowMore(false);
        } else {
            setDisplayedResults(gameResults);
            setShowMore(true);
        }
    };

    // 게임 타입별 한글 이름 변환
    const getGameTypeName = (gameType: string) => {
        switch (gameType) {
            case 'ROULETTE':
                return '룰렛';
            case 'LADDER':
                return '사다리타기';
            case 'YAHTZEE':
                return 'YAHTZEE';
            default:
                return gameType;
        }
    };

    // 시간 포맷팅
    const formatTimeAgo = (dateString: string) => {
        const now = new Date();
        const gameDate = new Date(dateString);
        const diffInMinutes = Math.floor((now.getTime() - gameDate.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return '방금 전';
        if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}시간 전`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}일 전`;
        
        return gameDate.toLocaleDateString();
    };

    const games = [
        {
            id: 'roulette',
            title: '룰렛',
            description: '당번을 정하는 재밌는 룰렛 게임',
            icon: RotateCcw,
            color: 'bg-gradient-to-br from-primary-300 to-primary-400',
            path: '/games/roulette',
            players: '2-8명',
            duration: '1분',
        },
        {
            id: 'ladder',
            title: '사다리타기',
            description: '사다리를 타고 내려가서 운명을 결정하세요',
            icon: GitBranch,
            color: 'bg-gradient-to-br from-primary-300 to-primary-400',
            path: '/games/ladder',
            players: '2-8명',
            duration: '2분',
        },
        {
            id: 'yahtzee',
            title: 'YAHTZEE (주사위)',
            description: '최고의 주사위 조합을 만드는 전략형 점수 게임',
            icon: Dice6,
            color: 'bg-gradient-to-br from-primary-300 to-primary-400',
            path: '/games/yahtzee',
            players: '1~4명',
            duration: '5~15분',
        }
    ];

    return (
        <div className="space-y-6">

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

                            <div className="text-right">
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
                                <h4 className="font-medium text-gray-800">YAHTZEE (주사위)</h4>
                                <p className="text-sm text-gray-600">
                                    5개의 주사위를 최대 3번까지 굴려 조합을 완성하고 점수를 채우는 전략형 주사위 게임입니다.
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
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <History className="w-5 h-5 text-primary-600" />
                        <h2 className="text-xl font-bold text-gray-800">
                            {mode === 'personal' ? '개인 게임 기록' : `그룹 게임 기록 - ${currentGroup?.name || '그룹 없음'}`}
                        </h2>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <TrendingUp className="w-4 h-4" />
                        <span>총 {gameResults.length}개</span>
                    </div>
                </div>
                
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                                    <div className="space-y-1">
                                        <div className="w-24 h-4 bg-gray-300 rounded"></div>
                                        <div className="w-16 h-3 bg-gray-300 rounded"></div>
                                    </div>
                                </div>
                                <div className="w-12 h-3 bg-gray-300 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : displayedResults.length > 0 ? (
                    <div className="space-y-3">
                        {displayedResults.map((result, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div>
                                        <div className="w-16 min-w-[4rem] max-w-[4rem] text-sm font-medium text-gray-800 text-center">
                                            {getGameTypeName(result.gameType)}
                                        </div>
                                    </div>

                                    <div className="w-px bg-gray-300 h-12" />

                                    <div>
                                        <div className="text-xs text-gray-600">
                                            참여자: {result.participants.join(', ')}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            당첨자: {result.result}
                                        </div>
                                        {result.penalty && (
                                            <div className="text-xs text-red-600 font-medium">
                                                벌칙: {result.penalty}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {formatTimeAgo(result.createdAt)}
                                </div>
                            </div>
                        ))}
                        
                        {gameResults.length > 5 && (
                            <div className="text-center pt-4">
                                <button
                                    onClick={handleShowMore}
                                    className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                                >
                                    {showMore ? '접기' : `더보기 (${gameResults.length - 5}개 더)`}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Gamepad2 className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 mb-2">
                            {mode === 'personal' 
                                ? '아직 플레이한 게임이 없습니다'
                                : mode === 'group' && !currentGroup
                                ? '현재 선택된 그룹이 없습니다'
                                : '이 그룹에서 플레이한 게임이 없습니다'
                            }
                        </p>
                        <p className="text-sm text-gray-400">
                            {mode === 'personal' 
                                ? '위의 게임들을 플레이해보세요!'
                                : mode === 'group' && !currentGroup
                                ? '헤더에서 그룹을 선택해주세요!'
                                : '그룹원들과 함께 게임을 플레이해보세요!'
                            }
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default GamesPage;