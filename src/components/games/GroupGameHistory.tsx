import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Calendar, TrendingUp, Gamepad2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { gameApi, GameResultResponse } from '../../api/games';

interface GroupGameHistoryProps {
  groupId: string;
  groupName: string;
}

const GroupGameHistory: React.FC<GroupGameHistoryProps> = ({ groupId, groupName }) => {
  const [gameResults, setGameResults] = useState<GameResultResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroupGameResults = async () => {
      try {
        setLoading(true);
        const results = await gameApi.getGroupResults(groupId);
        setGameResults(results);
      } catch (error) {
        console.error('그룹 게임 결과 조회 실패:', error);
        toast.error('그룹 게임 결과를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchGroupGameResults();
    }
  }, [groupId]);

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

  // 게임 타입별 아이콘 색상
  const getGameTypeColor = (gameType: string) => {
    switch (gameType) {
      case 'ROULETTE':
        return 'text-red-600 bg-red-100';
      case 'LADDER':
        return 'text-purple-600 bg-purple-100';
      case 'YAHTZEE':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
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
    
    return gameDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 승부 결과 통계
  const getGameStats = () => {
    const stats: { [key: string]: number } = {};
    gameResults.forEach(result => {
      stats[result.result] = (stats[result.result] || 0) + 1;
    });
    
    return Object.entries(stats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5); // 상위 5명만 표시
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
          <div className="w-32 h-5 bg-gray-300 rounded animate-pulse"></div>
        </div>
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
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-800">{groupName} 게임 기록</h3>
        </div>
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <TrendingUp className="w-4 h-4" />
          <span>총 {gameResults.length}개</span>
        </div>
      </div>

      {gameResults.length > 0 ? (
        <div className="space-y-6">
          {/* 게임 통계 */}
          {gameResults.length >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg"
            >
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Trophy className="w-4 h-4 mr-2 text-yellow-600" />
                벌칙 왕 순위
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {getGameStats().map(([player, count], index) => (
                  <div key={player} className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-bold ${
                        index === 0 ? 'text-yellow-600' : 
                        index === 1 ? 'text-gray-500' : 
                        index === 2 ? 'text-orange-600' : 'text-gray-400'
                      }`}>
                        {index + 1}위
                      </span>
                      <span className="text-sm font-medium text-gray-800">{player}</span>
                    </div>
                    <span className="text-sm font-bold text-red-600">{count}회</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 게임 기록 리스트 */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-blue-600" />
              최근 게임 기록
            </h4>
            
            {gameResults.slice(0, 10).map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {/* 게임 타입 아이콘 */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getGameTypeColor(result.gameType)}`}>
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-800">
                        {getGameTypeName(result.gameType)}
                      </span>
                      <span className="text-sm px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                        {result.result}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      참여자: {result.participants.join(', ')}
                    </div>
                    {result.penalty && (
                      <div className="text-xs text-red-600 font-medium">
                        벌칙: {result.penalty}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 text-right">
                  {formatTimeAgo(result.createdAt)}
                </div>
              </motion.div>
            ))}
            
            {gameResults.length > 10 && (
              <div className="text-center pt-4">
                <span className="text-sm text-gray-500">
                  총 {gameResults.length}개 중 최근 10개만 표시
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gamepad2 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-2">아직 플레이한 게임이 없습니다</p>
          <p className="text-sm text-gray-400">그룹원들과 함께 게임을 플레이해보세요!</p>
        </div>
      )}
    </div>
  );
};

export default GroupGameHistory;
