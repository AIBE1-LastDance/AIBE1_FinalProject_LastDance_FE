'use client';
import type React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, MessageSquare } from 'lucide-react';

interface MiniTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MiniTipsModal: React.FC<MiniTipsModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 500 }}
            className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="bg-primary-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">작성 예시</h2>
                    <p className="text-primary-100 text-sm">
                      효과적인 작성을 위한 예시를 확인하세요
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
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 text-primary-500 mr-2" />
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
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-all duration-200 shadow-lg"
                >
                  닫기
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MiniTipsModal;

