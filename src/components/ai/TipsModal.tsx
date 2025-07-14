"use client";
import type React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XCircle,
  Lightbulb,
  Users,
  MessageSquare,
  Clock,
  MapPin,
  HelpCircle,
  Target,
} from "lucide-react";

interface TipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TipsModal: React.FC<TipsModalProps> = ({ isOpen, onClose }) => {
  const tips = [
    {
      icon: Users,
      title: "누가 (Who)",
      description: "갈등에 관련된 사람들을 명확히 구분해주세요",
      example: "나, 룸메이트 B, 방문 친구", // 수정된 예시
    },
    {
      icon: Clock,
      title: "언제 (When)",
      description: "갈등이 발생한 구체적인 시간을 알려주세요",
      example: "어제 밤 11시, 지난주 화요일", // 수정된 예시
    },
    {
      icon: MapPin,
      title: "어디서 (Where)",
      description: "갈등이 일어난 장소를 구체적으로 명시해주세요",
      example: "내 방, 주방, 거실", // 수정된 예시
    },
    {
      icon: MessageSquare,
      title: "무엇을 (What)",
      description: "실제로 일어난 사건이나 행동을 객관적으로 서술해주세요",
      example: "개인 물건 사용, 설거지 안 함, 소음 발생", // 수정된 예시
    },
    {
      icon: Target,
      title: "어떻게 (How)",
      description: "상황이 어떤 방식으로 전개되었는지 설명해주세요",
      example: "미리 양해 없이, 여러 번 반복적으로", // 수정된 예시
    },
    {
      icon: HelpCircle,
      title: "왜 (Why)",
      description: "각자의 입장과 이유를 이해할 수 있도록 설명해주세요",
      example: "개인 공간 침해, 위생 문제", // 수정된 예시
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">효과적인 작성 가이드</h2>
                    <p className="text-primary-100 text-sm">
                      육하원칙으로 상황을 구체적으로 설명해주세요
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </motion.button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="mb-6 p-4 bg-primary-50 rounded-xl border border-primary-200">
                <p className="text-primary-800 text-sm leading-relaxed">
                  <strong>💡 핵심 포인트:</strong> AI가 정확하고 공정한 판단을
                  내리기 위해서는 감정적인 표현보다는{" "}
                  <strong>구체적인 사실과 상황</strong>을 중심으로 작성해주세요.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {tips.map((tip, index) => (
                  <motion.div
                    key={tip.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border border-gray-200 rounded-xl hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <tip.icon className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {tip.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {tip.description}
                        </p>
                        <div className="text-xs text-primary-700 bg-primary-50 px-2 py-1 rounded">
                          예: {tip.example}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 text-primary-600 mr-2" />
                  작성 예시
                </h3>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-700 leading-relaxed">
                    <p className="mb-3">
                      <strong className="text-primary-600">좋은 예시:</strong>
                    </p>
                    <p className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400 mb-4">
                      "저는 룸메이트 A입니다.{" "}
                      <span className="text-green-700 font-medium">(누가)</span>
                      어제 밤 새벽 2시부터 4시까지{" "}
                      <span className="text-green-700 font-medium">(언제)</span>
                      거실에서{" "}
                      <span className="text-green-700 font-medium">
                        (어디서)
                      </span>
                      룸메이트 B가 친구 3명과 함께 큰 소리로 게임을 하며
                      대화했습니다.
                      <span className="text-green-700 font-medium">
                        (무엇을)
                      </span>
                      저는 다음 날 오전 9시에 중요한 면접이 있어서 일찍 잠들어야
                      했는데, 소음 때문에 잠을 잘 수 없었습니다.{" "}
                      <span className="text-green-700 font-medium">
                        (왜/어떻게)
                      </span>
                      "
                    </p>
                    <p className="mb-3">
                      <strong className="text-red-600">피해야 할 예시:</strong>
                    </p>
                    <p className="bg-red-50 p-3 rounded-lg border-l-4 border-red-400">
                      "룸메이트가 너무 시끄럽게 해서 짜증나요. 맨날 이래요."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg"
                >
                  이해했어요
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TipsModal;
