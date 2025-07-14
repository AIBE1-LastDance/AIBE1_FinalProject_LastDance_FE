"use client";
import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  PlusCircle,
  MessageCircle,
  Sparkles,
  BookOpenText,
  Lightbulb,
  Users,
  History,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { judgeConflict } from "../../api/aijudgment/aiJudgment";
import type {
  AiJudgmentRequest,
  AiJudgmentResponse,
} from "../../types/aijudgment/aiMessage";
import HistorySidebar from "./HistorySidebar";
import ResultDisplay from "./ResultDisplay";
import ConflictInputModal from "./ConflictInputModal.tsx";
import TipsModal from "./TipsModal.tsx"; // TipsModal도 여전히 사용됩니다.

type PageState = "INITIAL" | "LOADING" | "RESULT";

const personLabels = ["A", "B", "C", "D"];

const AIAssistantPage: React.FC = () => {
  const [pageState, setPageState] = useState<PageState>("INITIAL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  // TipsModal 상태는 ConflictInputModal 내부에서 관리되므로, AIAssistantPage에서는 더 이상 필요 없습니다.
  // const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);
  const [situations, setSituations] = useState<{ [key: string]: string }>({
    A: "",
    B: "",
  });
  const [aiJudgmentResult, setAiJudgmentResult] =
    useState<AiJudgmentResponse | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
    // ConflictInputModal이 열릴 때 TipsModal도 자동으로 열리게 하려면 여기서 호출
    // openTipsModal(); // 이 함수는 이제 ConflictInputModal 내부에서 제어됩니다.
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSituations({ A: "", B: "" });
  };

  // TipsModal의 열림/닫힘 함수는 이제 ConflictInputModal 내부에서 처리되므로 제거합니다.
  // const openTipsModal = () => setIsTipsModalOpen(true);
  // const closeTipsModal = () => setIsTipsModalOpen(false);

  const handleSituationChange = (person: string, value: string) => {
    setSituations((prev) => ({ ...prev, [person]: value }));
  };

  const addPerson = () => {
    if (Object.keys(situations).length < 4) {
      const currentPersonIds = Object.keys(situations);
      const nextAvailableLabel = personLabels.find(
        (label) => !currentPersonIds.includes(label)
      );
      if (nextAvailableLabel) {
        setSituations((prev) => ({ ...prev, [nextAvailableLabel]: "" }));
      }
    } else {
      toast.error("최대 4명까지 추가할 수 있습니다.");
    }
  };

  const removePerson = (personToRemove: string) => {
    setSituations((prev) => {
      const newSituations = { ...prev };
      delete newSituations[personToRemove];
      const sortedKeys = Object.keys(newSituations).sort(
        (a, b) => personLabels.indexOf(a) - personLabels.indexOf(b)
      );
      const reorderedSituations: { [key: string]: string } = {};
      personLabels.forEach((label, index) => {
        if (index < sortedKeys.length) {
          reorderedSituations[label] = newSituations[sortedKeys[index]];
        }
      });
      return reorderedSituations;
    });
  };

  const toggleHistory = () => {
    setIsHistoryOpen((prev) => !prev);
  };

  const handleSendSituations = async () => {
    const filledSituations: { [key: string]: string } = {};
    let allFieldsFilled = true;

    Object.entries(situations).forEach(([person, content]) => {
      if (content.trim()) {
        filledSituations[person] = content.trim();
      } else {
        allFieldsFilled = false;
      }
    });

    if (!allFieldsFilled) {
      toast.error("모든 입력란을 채워주세요.");
      return;
    }

    if (Object.keys(filledSituations).length < 2) {
      toast.error("최소 2명의 입장을 입력해야 합니다.");
      return;
    }

    closeModal();
    setPageState("LOADING");

    try {
      const requestBody: AiJudgmentRequest = { situations: filledSituations };
      const response = await judgeConflict(requestBody);
      setAiJudgmentResult(response);
      setPageState("RESULT");
    } catch (error: any) {
      toast.error(error.message || "AI 응답을 받아오는 데 실패했습니다.");
      setPageState("INITIAL");
    }
  };

  const resetPage = () => {
    setPageState("INITIAL");
    setSituations({ A: "", B: "" });
    setAiJudgmentResult(null);
  };

  const handleFeedbackSent = () => {};

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-6xl w-full mx-auto">
          {pageState !== "RESULT" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-12 bg-white rounded-2xl p-8 border border-gray-200"
            >
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-4 shadow-lg">
                  <BookOpenText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  사용 가이드
                </h3>
                <p className="text-gray-600">
                  효과적인 갈등 해결을 위한 사용법을 안내합니다
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-transparent rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        갈등 상황 입력
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        각 룸메이트의 입장을 최소 2명부터 최대 4명까지
                        구체적이고 객관적으로 입력해주세요.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-transparent rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        AI 분석 및 판단
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        입력된 정보를 바탕으로 AI가 공정하게 상황을 분석하고
                        해결책을 제시합니다.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl p-6 border border-gray-100 bg-gray-50">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-transparent rounded-xl flex items-center justify-center mr-2">
                      <Lightbulb className="w-5 h-5 text-primary-600" />
                    </div>
                    <h4 className="font-semibold text-primary-800">
                      효과적인 사용 팁
                    </h4>
                  </div>
                  <ul className="space-y-2 text-sm text-primary-700">
                    <li className="flex items-start">
                      <span className="text-primary-500 mr-2">•</span>
                      감정보다는 구체적인 사실과 상황을 위주로 작성
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-500 mr-2">•</span>
                      각자의 입장과 요구사항을 명확히 기술
                    </li>
                    <li className="flex items-start">
                      <span className="text-primary-500 mr-2">•</span>
                      AI 판단은 참고용이며, 최종 결정은 대화로 해결
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden"
          >
            <div className="p-8 lg:p-12">
              <AnimatePresence mode="wait">
                {pageState === "INITIAL" && (
                  <motion.div
                    key="initial"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <div className="mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-6 shadow-lg">
                        <MessageCircle className="w-8 h-8 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        룸메이트 갈등을 해결해보세요
                      </h2>
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        복잡한 갈등 상황에서 각자의 입장을 명확히 입력하면, AI가
                        공정하고 객관적인 판단을 내려드립니다.
                      </p>
                    </div>
                    <motion.button
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl text-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={openModal} // 이 버튼 클릭 시 ConflictInputModal이 열립니다.
                    >
                      <PlusCircle className="w-5 h-5 mr-2" />
                      갈등 상황 입력하기
                    </motion.button>
                  </motion.div>
                )}

                {pageState === "LOADING" && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-16"
                  >
                    <div className="relative mb-8 flex justify-center items-center">
                      <div className="w-16 h-16 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      <motion.div
                        className="absolute"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }}
                      >
                        <Sparkles className="w-8 h-8 text-primary-500" />
                      </motion.div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      AI가 상황을 분석하고 있습니다
                    </h3>
                    <p className="text-gray-600">
                      공정한 판단을 위해 모든 입장을 신중히 검토 중입니다...
                    </p>
                  </motion.div>
                )}

                {pageState === "RESULT" && (
                  <ResultDisplay
                    aiJudgmentResult={aiJudgmentResult}
                    onReset={resetPage}
                    onFeedbackSent={handleFeedbackSent}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.button
        className="fixed bottom-6 left-6 w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleHistory}
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          left: "1.5rem",
        }}
      >
        <History className="w-6 h-6" />
      </motion.button>

      <HistorySidebar
        isHistoryOpen={isHistoryOpen}
        toggleHistory={toggleHistory}
      />

      <ConflictInputModal
        isOpen={isModalOpen}
        onClose={closeModal}
        situations={situations}
        onSituationChange={handleSituationChange}
        onAddPerson={addPerson}
        onRemovePerson={removePerson}
        onSubmit={handleSendSituations}
        // onOpenTips prop은 ConflictInputModal에서 더 이상 받지 않습니다.
        // ConflictsInputModal 내부에서 TipsModal의 상태를 관리합니다.
        // onOpenTips={openTipsModal} // 이 줄을 제거하거나 주석 처리합니다.
      />

      {/* TipsModal은 ConflictInputModal 내부에서 렌더링되므로, 여기서 직접 렌더링할 필요가 없습니다. */}
      {/* <TipsModal isOpen={isTipsModalOpen} onClose={closeTipsModal} /> */}

      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
};

export default AIAssistantPage;
