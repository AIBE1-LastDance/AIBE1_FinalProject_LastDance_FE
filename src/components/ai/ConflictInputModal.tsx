"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle, XCircle, MessageCircle, Info } from "lucide-react";
import MiniTipsModal from "./MiniTipsModal";

import type { ParticipantSituation } from "../../types/aijudgment/aiMessage";

interface ConflictInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  situations: ParticipantSituation[];
  onSituationChange: (
    index: number,
    field: keyof ParticipantSituation,
    value: string
  ) => void;
  onAddPerson: () => void;
  onRemovePerson: (index: number) => void;
  onSubmit: () => void;
}

const ConflictInputModal: React.FC<ConflictInputModalProps> = ({
  isOpen,
  onClose,
  situations,
  onSituationChange,
  onAddPerson,
  onRemovePerson,
  onSubmit,
}) => {
  const [isMiniTipsModalOpen, setIsMiniTipsModalOpen] = useState(false);

  const handleOpenTips = () => {
    setIsMiniTipsModalOpen(true);
  };

  const handleCloseTips = () => {
    setIsMiniTipsModalOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="conflict-input-modal-overlay"
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
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden relative"
          >
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">갈등 상황 입력</h2>
                    <p className="text-orange-100 text-sm">
                      각자의 입장을 자세히 설명해주세요
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

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="flex justify-end mb-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleOpenTips}
                  className="p-2 text-gray-500 hover:text-orange-600 transition-colors flex items-center space-x-1"
                >
                  <Info className="w-5 h-5" />
                  <span>작성 팁</span>
                </motion.button>
              </div>

              <div className="space-y-6">
                {situations.map((participant, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <input
                        type="text"
                        value={participant.name}
                        onChange={(e) =>
                          onSituationChange(index, "name", e.target.value)
                        }
                        placeholder="참가자 이름 (예: 룸메이트 A)"
                        className="w-40 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                      />
                      <label className="font-semibold text-gray-800">
                        의 입장
                      </label>
                      {situations.length > 2 && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onRemovePerson(index)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                    <textarea
                      value={participant.situation}
                      onChange={(e) =>
                        onSituationChange(index, "situation", e.target.value)
                      }
                      placeholder={`${
                        participant.name || "참가자"
                      }의 입장과 상황을 자세히 설명해주세요...`}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all duration-200 hover:border-gray-300"
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                {situations.length < 4 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onAddPerson}
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" /> 인원 추가
                  </motion.button>
                )}
                <div className="flex items-center space-x-3 ml-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    취소
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onSubmit}
                    disabled={
                      situations.some(
                        (p) => p.name.trim() === "" || p.situation.trim() === ""
                      ) || situations.length < 2
                    }
                    className="px-8 py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    AI 판단 요청
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      <MiniTipsModal isOpen={isMiniTipsModalOpen} onClose={handleCloseTips} />
    </AnimatePresence>
  );
};

export default ConflictInputModal;
