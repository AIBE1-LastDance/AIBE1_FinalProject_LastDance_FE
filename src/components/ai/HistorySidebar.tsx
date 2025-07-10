import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  ChevronLeft,
  ShieldCheck,
  Eye,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  Users,
  Copy,
  Check,
  FileText,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchAiJudgmentHistory } from "../../api/aijudgment/aiJudgment";
import type { AiJudgmentHistoryResponse } from "../../types/aijudgment/aiMessage";
import { formatDate, copyToClipboard } from "../../utils/api.ts";
import toast from "react-hot-toast";

interface HistorySidebarProps {
  isHistoryOpen: boolean;
  toggleHistory: () => void;
}

const personLabelColor = "border-2 border-orange-300 text-orange-700 bg-white";

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
    } catch (error: any) {
      toast.error(error.message || "판단 내역을 불러오는 데 실패했습니다.");
    } finally {
      setHistoryLoading(false);
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
      setTimeout(() => setCopySuccess(false), 2000);
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
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-hidden flex flex-col rounded-r-2xl"
          >
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white rounded-tr-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">판단 히스토리</h2>
                    <p className="text-orange-100 text-sm">과거 AI 판단 기록</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleHistory}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {historyLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">히스토리를 불러오는 중...</p>
                  </div>
                </div>
              ) : selectedHistoryItem ? (
                <div className="p-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedHistoryItem(null)}
                    className="flex items-center mb-6 p-2 -ml-2 text-gray-600 hover:text-orange-600 transition-colors rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    <span className="font-semibold text-sm">
                      목록으로 돌아가기
                    </span>
                  </motion.button>

                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-orange-600" />
                      판단 상세
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {selectedHistoryItem.timestamp &&
                        formatDate(selectedHistoryItem.timestamp)}
                    </p>
                  </div>

                  <div className="mb-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <h4 className="text-base font-semibold text-gray-700 mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-orange-600" />
                      갈등 상황 요약
                    </h4>
                    <div className="space-y-4">
                      {Object.entries(selectedHistoryItem.situations).map(
                        ([person, content]) => (
                          <div
                            key={person}
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-start"
                          >
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${personLabelColor} mr-3 shadow`}
                            >
                              {person}
                            </div>
                            <p className="text-sm text-gray-700 flex-grow leading-relaxed">
                              {content}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="mb-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <h4 className="text-base font-semibold text-gray-700 mb-4 flex items-center">
                      <ShieldCheck className="w-5 h-5 mr-2 text-orange-600" />
                      AI 판결 결과
                    </h4>
                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                      <div className="prose prose-sm prose-gray max-w-none text-gray-800 leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {selectedHistoryItem.judgmentResult}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>

                  {selectedHistoryItem.rating && (
                    <div className="mb-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                      <h4 className="text-base font-semibold text-gray-700 mb-4 flex items-center">
                        <ThumbsUp className="w-5 h-5 mr-2 text-orange-600" />
                        사용자 피드백
                      </h4>
                      <div
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-sm ${
                          selectedHistoryItem.rating === "up"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-red-100 text-red-700 border border-red-200"
                        }`}
                      >
                        {selectedHistoryItem.rating === "up" ? (
                          <ThumbsUp className="w-4 h-4 mr-2" />
                        ) : (
                          <ThumbsDown className="w-4 h-4 mr-2" />
                        )}
                        {selectedHistoryItem.rating === "up"
                          ? "좋아요"
                          : "싫어요"}
                      </div>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: "#f97316" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      handleCopy(selectedHistoryItem.judgmentResult)
                    }
                    className="w-full flex items-center justify-center px-4 py-3 bg-orange-500 text-white rounded-xl font-semibold shadow-md hover:bg-orange-600 transition-colors mt-6"
                  >
                    {copySuccess ? (
                      <Check className="w-5 h-5 mr-2" />
                    ) : (
                      <Copy className="w-5 h-5 mr-2" />
                    )}
                    {copySuccess ? "판결문 복사 완료!" : "판결문 복사하기"}
                  </motion.button>
                </div>
              ) : (
                <div className="p-4">
                  {historyData.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <History className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        아직 판단 기록이 없습니다
                      </h3>
                      <p className="text-gray-600 text-sm">
                        첫 번째 갈등 상황을 입력해보세요!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 p-2">
                      {historyData.map((item, index) => (
                        <motion.div
                          key={item.judgmentId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white rounded-xl p-5 hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200 shadow-sm"
                          onClick={() => setSelectedHistoryItem(item)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center shadow-sm">
                                <ShieldCheck className="w-5 h-5 text-orange-600" />
                              </div>
                              <span className="font-bold text-gray-800 text-base">
                                AI 판단 #{historyData.length - index}
                              </span>
                            </div>
                            <Eye className="w-5 h-5 text-gray-400" />
                          </div>

                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <Calendar className="w-3 h-3 mr-1.5" />
                            <span>
                              {item.timestamp && formatDate(item.timestamp)}
                            </span>
                          </div>

                          <div className="text-sm text-gray-600 mb-3">
                            <span className="font-medium text-gray-700">
                              참여자:
                            </span>{" "}
                            {Object.keys(item.situations).join(", ")}
                          </div>

                          {item.rating && (
                            <div
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${
                                item.rating === "up"
                                  ? "bg-green-100 text-green-700 border border-green-200"
                                  : "bg-red-100 text-red-700 border border-red-200"
                              }`}
                            >
                              {item.rating === "up" ? (
                                <ThumbsUp className="w-3.5 h-3.5 mr-1.5" />
                              ) : (
                                <ThumbsDown className="w-3.5 h-3.5 mr-1.5" />
                              )}
                              {item.rating === "up"
                                ? "좋아요 피드백"
                                : "싫어요 피드백"}
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
