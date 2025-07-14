'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  ChevronLeft,
  ShieldCheck,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Users,
  Copy,
  Check,
  Clock,
  Star,
  Trash2, // Add Trash2 icon
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchAiJudgmentHistory, deleteAiJudgmentHistory } from '../../api/aijudgment/aiJudgment';
import type { AiJudgmentHistoryResponse } from '../../types/aijudgment/aiMessage';
import { copyToClipboard } from '../../utils/api.ts';
import toast from 'react-hot-toast';

interface HistorySidebarProps {
  isHistoryOpen: boolean;
  toggleHistory: () => void;
}

const personThemes = {
  A: {
    bg: "bg-primary-50",
    border: "border-primary-200",
    text: "text-primary-600",
    dot: "bg-primary-300",
  },
  B: {
    bg: "bg-status-warning",
    border: "border-status-warning",
    text: "text-gray-800",
    dot: "bg-status-warning",
  },
  C: {
    bg: "bg-category-yellow",
    border: "border-category-yellow",
    text: "text-gray-800",
    dot: "bg-category-yellow",
  },
  D: {
    bg: "bg-status-error",
    border: "border-status-error",
    text: "text-gray-800",
    dot: "bg-status-error",
  },
};

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isHistoryOpen,
  toggleHistory,
}) => {
  const [historyData, setHistoryData] = useState<AiJudgmentHistoryResponse[]>(
    []
  );
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<AiJudgmentHistoryResponse | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const history = await fetchAiJudgmentHistory();
      setHistoryData(
        history.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      );
    } catch (error) {
      toast.error(
        (error as Error).message || '판단 내역을 불러오는 데 실패했습니다.'
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDelete = async (judgmentId: string) => {
    if (window.confirm('정말로 이 기록을 삭제하시겠습니까?')) {
      try {
        await deleteAiJudgmentHistory(judgmentId);
        toast.success('기록이 성공적으로 삭제되었습니다.');
        fetchHistory(); // Refresh the history list
        setSelectedHistoryItem(null); // Deselect if the deleted item was selected
      } catch (error) {
        toast.error(
          (error as Error).message || '기록 삭제에 실패했습니다.'
        );
      }
    }
  };

  useEffect(() => {
    if (isHistoryOpen) {
      fetchHistory();
    }
  }, [isHistoryOpen]);

  const handleCopy = async (content: string) => {
    const { success, message } = await copyToClipboard(content);
    if (success) {
      setCopySuccess(true);
      toast.success(message);
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } else {
      toast.error(message);
    }
  };

  return (
    <AnimatePresence>
      {isHistoryOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50"
            onClick={toggleHistory}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-96 bg-white z-50 overflow-hidden flex flex-col rounded-r-2xl shadow-lg"
          >
            <div className="bg-primary-500 p-5 text-white rounded-tr-2xl relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <History className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold truncate">히스토리</h2>
                    <p className="text-primary-100 text-sm truncate">
                      지난 기록들을 살펴보세요
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleHistory}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="absolute top-3 right-3 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
              <div className="absolute top-6 right-6 w-1 h-1 bg-white/20 rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-3 right-4 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse delay-700"></div>
            </div>

            <div className="flex-1 overflow-y-auto pb-16">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 text-gray-600">히스토리를 불러오는 중입니다...</p>
                </div>
              ) : selectedHistoryItem ? (
                <div className="p-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedHistoryItem(null)}
                    className="flex items-center mb-4 px-3 py-2 text-gray-600 hover:text-primary-500 hover:bg-primary-50 transition-all duration-200 rounded-xl font-medium text-sm"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    목록으로 돌아가기
                  </motion.button>

                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 bg-white rounded-2xl p-4 shadow-sm border border-primary-200"
                  >
                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center mr-3">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      갈등 상황
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(selectedHistoryItem.situations).map(([name, situation], index) => {
                        const colors = [
                          'bg-primary-50 border-primary-200 text-primary-600',
                          'bg-accent-50 border-accent-200 text-accent-600',
                          'bg-yellow-50 border-yellow-200 text-yellow-600',
                          'bg-rose-50 border-rose-200 text-rose-600',
                        ];
                        const chosenColor = colors[index % colors.length];
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`${chosenColor} rounded-xl p-3 border-l-4 hover:shadow-sm transition-all duration-200`}
                          >
                            <div className="flex items-start space-x-3">
                              <div
                                className={`flex-shrink-0 w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-sm border ${chosenColor.split(' ')[1].replace('bg-', 'border-')}`}
                              >
                                {name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-grow min-w-0">
                                <p className="font-bold text-gray-800 truncate" title={name}>{name}</p>
                                <p className="text-gray-700 text-sm truncate" title={situation}>
                                  {situation}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-4 bg-white rounded-2xl p-4 shadow-sm border border-primary-200"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-800">
                          AI 판결
                        </h4>
                        <p className="text-primary-500 text-xs">
                          공정한 분석 결과
                        </p>
                      </div>
                    </div>
                    <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
                      <div className="prose prose-sm prose-gray max-w-none text-gray-700 leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {selectedHistoryItem.judgmentResult}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </motion.div>

                  {selectedHistoryItem.rating && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mb-4 bg-white rounded-2xl p-4 shadow-sm border border-primary-200"
                    >
                      <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                        <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center mr-3">
                          <ThumbsUp className="w-4 h-4 text-white" />
                        </div>
                        피드백
                      </h4>
                      <div
                        className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium ${
                          selectedHistoryItem.rating === "up"
                            ? "bg-status-success text-gray-800 border border-status-success"
                            : "bg-status-error text-gray-800 border border-status-error"
                        }`}
                      >
                        {selectedHistoryItem.rating === 'up' ? (
                          <ThumbsUp className="w-4 h-4 mr-2" />
                        ) : (
                          <ThumbsDown className="w-4 h-4 mr-2" />
                        )}
                        {selectedHistoryItem.rating === 'up'
                          ? '좋아요 👍'
                          : '아쉬워요 👎'}
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <div className="p-4">
                  {historyData.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-primary-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <History className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
                        아직 기록이 없어요
                      </h3>
                      <p className="text-gray-600">
                        첫 번째 갈등을 해결해보세요!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {historyData.map((item, index) => (
                        <motion.div
                          key={item.judgmentId}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer border border-primary-200 group hover:border-primary-300"
                          onClick={() => setSelectedHistoryItem(item)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <ShieldCheck className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-bold text-gray-800 truncate">
                                AI 판단
                              </span>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={e => {
                                e.stopPropagation(); // Prevent triggering onClick of parent div
                                handleDelete(item.judgmentId);
                              }}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                          <div className="flex text-sm text-gray-600 mb-3">
                            <span className="font-medium text-gray-700 flex-shrink-0">
                              참여자:
                            </span>
                            <span className="text-primary-500 font-medium ml-2 truncate" title={Object.keys(item.situations).join(', ')}>
                              {Object.keys(item.situations).join(', ')}
                            </span>
                          </div>
                          {item.rating && (
                            <div
                              className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                                item.rating === "up"
                                  ? "bg-status-success text-gray-800"
                                  : "bg-status-error text-gray-800"
                              }`}
                            >
                              {item.rating === 'up' ? (
                                <ThumbsUp className="w-3 h-3 mr-1" />
                              ) : (
                                <ThumbsDown className="w-3 h-3 mr-1" />
                              )}
                              {item.rating === 'up' ? '좋아요' : '아쉬워요'}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>


          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HistorySidebar;

