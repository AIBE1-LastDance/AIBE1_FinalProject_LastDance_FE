"use client";

import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Users,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw,
  Check,
  Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";
import { sendFeedback } from "../../api/aijudgment/aiJudgment";
// ParticipantSituation 타입을 aiMessage에서 제거했다면 여기서는 필요 없습니다.
// 현재 코드에서는 사용되지 않으므로 제거하거나, 필요하다면 적절히 수정해야 합니다.
import type { AiJudgmentResponse } from "../../types/aijudgment/aiMessage";
import { copyToClipboard } from "../../utils/api";

interface ResultDisplayProps {
  aiJudgmentResult: AiJudgmentResponse | null;
  onReset: () => void;
  onFeedbackSent: () => void;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  aiJudgmentResult,
  onReset,
  onFeedbackSent,
}) => {
  const [currentRating, setCurrentRating] = useState<"up" | "down" | null>(
    null
  );
  const [copySuccess, setCopySuccess] = useState(false);

  if (!aiJudgmentResult) {
    return null;
  }

  const handleRating = async (rating: "up" | "down") => {
    if (!aiJudgmentResult?.judgmentId) return;

    const willBeCanceled = currentRating === rating;
    const feedbackTypeToSend = rating;

    try {
      await sendFeedback(aiJudgmentResult.judgmentId, feedbackTypeToSend);

      if (willBeCanceled) {
        setCurrentRating(null);
        toast.success(
          rating === "up" ? "좋아요를 취소했습니다." : "싫어요를 취소했습니다."
        );
      } else {
        setCurrentRating(rating);
        toast.success(
          rating === "up" ? "좋아요를 남겼습니다." : "싫어요를 남겼습니다."
        );
      }
      onFeedbackSent();
    } catch (error: any) {
      toast.error(error.message || "피드백 처리 중 오류가 발생했습니다.");
    }
  };

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

  // aiJudgmentResult.situations가 객체이므로, 이를 배열로 변환하여 사용합니다.
  // Object.entries를 사용하여 [key, value] 쌍의 배열을 얻은 후,
  // map을 사용하여 { name: key, situation: value } 형태로 변환합니다.
  const participantSituations = Object.entries(aiJudgmentResult.situations).map(
    ([name, situation]) => ({
      name,
      situation,
    })
  );

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-500 rounded-3xl mb-6 shadow-xl">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-4xl font-bold text-primary-600 mb-4">
          AI의 공정한 판결
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white rounded-3xl p-8 mb-8 border border-gray-200 shadow-xl border-l-4 border-l-primary-400"
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          입력된 갈등 상황
        </h3>
        <div className="grid gap-6">
          {/* participantSituations 배열을 사용하도록 변경 */}
          {participantSituations
            .filter((p) => p.situation.trim() !== "")
            .map((participant, index) => {
              const colors = [
                "bg-blue-50 border-blue-200 border-l-4 border-blue-400",
                "bg-green-50 border-green-200 border-l-4 border-green-400",
                "bg-yellow-50 border-yellow-200 border-l-4 border-yellow-400",
                "bg-purple-50 border-purple-200 border-l-4 border-purple-400",
              ];
              const labelColors = [
                "bg-blue-500",
                "bg-green-500",
                "bg-yellow-500",
                "bg-purple-500",
              ];
              const chosenColor = colors[index % colors.length];
              const chosenLabelColor = labelColors[index % labelColors.length];

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative ${chosenColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`flex-shrink-0 w-12 h-12 ${chosenLabelColor} text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg`}
                    >
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-grow">
                      <div className="text-sm font-semibold text-gray-600 mb-2">
                        {participant.name}의 입장
                      </div>
                      <p className="text-gray-800 leading-relaxed text-xl font-medium">
                        {participant.situation}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 w-2 h-2 bg-white/50 rounded-full"></div>
                  <div className="absolute top-6 right-6 w-1 h-1 bg-white/30 rounded-full"></div>
                </motion.div>
              );
            })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative bg-white border border-gray-200 border-l-4 border-l-orange-400 rounded-3xl p-8 shadow-xl transition-all duration-300 mb-8"
      >
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-800">AI 판결 결과</h3>
            <p className="text-primary-700 font-medium">
              공정하고 객관적인 분석 결과
            </p>
          </div>
        </div>

        <div className="bg-white/100 backdrop-blur-sm rounded-2xl p-6 border border-primary-200/50 shadow-inner relative">
          <div className="prose prose-lg prose-gray max-w-none text-gray-800 leading-relaxed">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {aiJudgmentResult.judgmentResult}
            </ReactMarkdown>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCopy(aiJudgmentResult.judgmentResult)}
            className={`absolute bottom-4 right-4 flex items-center justify-center p-3 rounded-xl font-medium transition-all duration-200 shadow-sm ${
              copySuccess
                ? "bg-orange-400 text-white"
                : "bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-500 border border-orange-200"
            }`}
          >
            {copySuccess ? (
              <Check className="w-5 h-5" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </motion.button>
        </div>

        <div className="absolute top-6 right-6 w-3 h-3 bg-white/50 rounded-full"></div>
        <div className="absolute top-10 right-10 w-2 h-2 bg-white/30 rounded-full"></div>
        <div className="absolute bottom-6 right-8 w-1 h-1 bg-white/40 rounded-full"></div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-wrap gap-4 justify-center"
      >
        <motion.button
          className={`flex items-center px-8 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg ${
            currentRating === "up"
              ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-xl"
              : "bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 border border-gray-200 hover:border-green-300"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleRating("up")}
        >
          <ThumbsUp className="w-5 h-5 mr-3" />
          좋아요
        </motion.button>

        <motion.button
          className={`flex items-center px-8 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg ${
            currentRating === "down"
              ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-xl"
              : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-300"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleRating("down")}
        >
          <ThumbsDown className="w-5 h-5 mr-3" />
          싫어요
        </motion.button>

        <motion.button
          className="flex items-center px-8 py-4 rounded-2xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
        >
          <RotateCcw className="w-5 h-5 mr-3" />
          다시 시작
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default ResultDisplay;
