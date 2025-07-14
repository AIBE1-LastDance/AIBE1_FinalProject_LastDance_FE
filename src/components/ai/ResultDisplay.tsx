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
import type { AiJudgmentResponse } from "../../types/aijudgment/aiMessage";
import { copyToClipboard } from "../../utils/api";

interface ResultDisplayProps {
  aiJudgmentResult: AiJudgmentResponse | null;
  onReset: () => void;
  onFeedbackSent: () => void;
}

const personLabels = ["A", "B", "C", "D"];

const personThemes = {
  A: {
    gradient: "bg-blue-50",
    border: "border-blue-200",
    label: "bg-blue-500 text-white",
    accent: "border-l-4 border-blue-400",
  },
  B: {
    gradient: "bg-green-50",
    border: "border-green-200",
    label: "bg-green-500 text-white",
    accent: "border-l-4 border-green-400",
  },
  C: {
    gradient: "bg-yellow-50",
    border: "border-yellow-200",
    label: "bg-yellow-500 text-white",
    accent: "border-l-4 border-yellow-400",
  },
  D: {
    gradient: "bg-purple-50",
    border: "border-purple-200",
    label: "bg-purple-500 text-white",
    accent: "border-l-4 border-purple-400",
  },
};

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

    // 현재 피드백 상태가 없거나, 클릭한 피드백이 기존 피드백과 다르면
    // 새로운 피드백을 적용합니다.
    // 만약 현재 피드백과 클릭한 피드백이 같다면, 'null'로 설정하여 취소 상태를 나타냅니다.
    const willBeCanceled = currentRating === rating;
    const feedbackTypeToSend = rating; // 백엔드는 'up' 또는 'down'을 예상합니다.

    try {
      // 백엔드에 요청을 보냅니다. 백엔드에서 취소 로직을 처리합니다.
      await sendFeedback(aiJudgmentResult.judgmentId, feedbackTypeToSend);

      if (willBeCanceled) {
        // 이미 같은 타입의 피드백이 있었고 다시 눌러서 취소된 경우
        setCurrentRating(null); // 프론트엔드 상태를 null로 변경
        toast.success(
          rating === "up" ? "좋아요를 취소했습니다." : "싫어요를 취소했습니다."
        );
      } else {
        // 새로운 피드백이 적용되거나 다른 피드백으로 변경된 경우
        setCurrentRating(rating); // 프론트엔드 상태를 새 rating으로 변경
        toast.success(
          rating === "up" ? "좋아요를 남겼습니다." : "싫어요를 남겼습니다."
        );
      }
      onFeedbackSent(); // 피드백 상태가 변경되었으므로 부모 컴포넌트에 알림
    } catch (error: any) {
      // 백엔드 오류 메시지를 그대로 사용
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
          {Object.entries(aiJudgmentResult.situations)
            .filter(([, content]) => content.trim() !== "")
            .sort(
              ([keyA], [keyB]) =>
                personLabels.indexOf(keyA) - personLabels.indexOf(keyB)
            )
            .map(([person, content], index) => {
              const theme = personThemes[person as keyof typeof personThemes];
              return (
                <motion.div
                  key={person}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative ${theme.gradient} ${theme.border} ${theme.accent} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`flex-shrink-0 w-12 h-12 ${theme.label.replace(
                        "bg-gradient-to-br from-primary-500 to-primary-600",
                        "bg-primary-500"
                      )} rounded-2xl flex items-center justify-center font-bold text-lg shadow-lg`}
                    >
                      {person}
                    </div>
                    <div className="flex-grow">
                      <div className="text-sm font-semibold text-gray-600 mb-2">
                        {person}의 입장
                      </div>
                      <p className="text-gray-800 leading-relaxed text-xl font-medium">
                        {content}
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
