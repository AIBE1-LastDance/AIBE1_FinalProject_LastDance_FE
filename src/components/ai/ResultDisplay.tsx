import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Users,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import toast from "react-hot-toast";
import { sendFeedback } from "../../api/aijudgment/aiJudgment";
import type { AiJudgmentResponse } from "../../types/aijudgment/aiMessage";
import { copyToClipboard } from "../../utils/api.ts";

interface ResultDisplayProps {
  aiJudgmentResult: AiJudgmentResponse | null;
  onReset: () => void;
  onFeedbackSent: () => void;
}

const personLabelColor = "border-2 border-orange-300 text-orange-700 bg-white";
const personLabels = ["A", "B", "C", "D"];

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

    const isSame = currentRating === rating;
    const newRating: "up" | "down" | null = isSame ? null : rating;

    try {
      if (newRating) {
        await sendFeedback(aiJudgmentResult.judgmentId, newRating);
        toast.success(
          newRating === "up" ? "좋아요를 남겼습니다." : "싫어요를 남겼습니다."
        );
      } else {
        // Feedback 취소 로직 (API에서 null을 보내는 것이 지원된다면)
        // 현재 sendFeedback 함수는 type이 "up" | "down" 만 허용하므로,
        // null로 취소하는 기능이 백엔드에 없다면 이 부분은 다르게 처리해야 합니다.
        // 예를 들어, 백엔드에서 feedback 삭제 API를 제공하는 경우 해당 API를 호출해야 합니다.
        // 여기서는 기존 피드백 상태를 토글하는 것으로 가정하고 구현합니다.
        toast.error("피드백 취소는 지원되지 않습니다.");
        return;
      }
      setCurrentRating(newRating);
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

  return (
    <motion.div
      key="result"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          AI의 공정한 판결
        </h2>
        <p className="text-gray-600">
          객관적인 분석을 통한 해결 방안을 제시합니다
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-orange-600" />
          입력된 갈등 상황
        </h3>
        <div className="space-y-3">
          {Object.entries(aiJudgmentResult.situations)
            .filter(([, content]) => content.trim() !== "")
            .sort(
              ([keyA], [keyB]) =>
                personLabels.indexOf(keyA) - personLabels.indexOf(keyB)
            )
            .map(([person, content]) => (
              <div
                key={person}
                className="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-100"
              >
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs ${personLabelColor}`}
                >
                  {person}
                </div>
                <p className="ml-3 text-gray-700 flex-grow leading-snug">
                  {content}
                </p>
              </div>
            ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 mb-8 border border-gray-200">
        <div className="prose prose-gray prose-lg max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {aiJudgmentResult.judgmentResult}
          </ReactMarkdown>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <motion.button
          className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            currentRating === "up"
              ? "bg-green-500 text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-green-50 border border-gray-200"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleRating("up")}
        >
          <ThumbsUp className="w-5 h-5 mr-2" />
          좋아요
        </motion.button>

        <motion.button
          className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            currentRating === "down"
              ? "bg-red-500 text-white shadow-lg"
              : "bg-white text-gray-700 hover:bg-red-50 border border-gray-200"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleRating("down")}
        >
          <ThumbsDown className="w-5 h-5 mr-2" />
          싫어요
        </motion.button>

        <motion.button
          className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
            copySuccess
              ? "bg-green-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleCopy(aiJudgmentResult.judgmentResult)}
        >
          {copySuccess ? (
            <Check className="w-5 h-5 mr-2" />
          ) : (
            <Copy className="w-5 h-5 mr-2" />
          )}
          {copySuccess ? "복사됨" : "복사하기"}
        </motion.button>

        <motion.button
          className="flex items-center px-6 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-all duration-200 shadow-lg"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReset}
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          다시 시작
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ResultDisplay;
