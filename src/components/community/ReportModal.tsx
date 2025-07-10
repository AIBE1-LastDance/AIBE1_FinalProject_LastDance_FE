import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Flag,
  AlertTriangle,
  MessageSquare,
  User,
  Trash2,
  Shield,
  Heart,
} from "lucide-react";
import toast from "react-hot-toast";
import { reportContent } from "../../api/community/report";
import {
  ReportTargetType,
  ReportReasonType,
} from "../../types/community/communityReport"; // 변경된 enum 임포트

// UUID 형식 유효성 검사 헬퍼 함수
function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ReportTargetType.POST | ReportTargetType.COMMENT; // ReportTargetType으로 변경
  targetId: string;
  targetContent?: string; // targetContent로 이름 통일
}

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  type,
  targetId,
  targetContent,
}) => {
  const [selectedReason, setSelectedReason] = useState<ReportReasonType | "">(
    ""
  ); // ReportReasonType으로 변경
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = [
    {
      id: ReportReasonType.SPAM, // ReportReasonType 값 사용
      label: "스팸/도배",
      description: "반복적인 광고나 의미없는 내용",
      icon: Trash2,
      color: "text-orange-600",
    },
    {
      id: ReportReasonType.INAPPROPRIATE, // ReportReasonType 값 사용
      label: "부적절한 내용",
      description: "선정적이거나 폭력적인 내용",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      id: ReportReasonType.HARASSMENT, // ReportReasonType 값 사용
      label: "괴롭힘/욕설",
      description: "다른 사용자를 향한 괴롭힘이나 욕설",
      icon: User,
      color: "text-purple-600",
    },
    {
      id: ReportReasonType.MISINFORMATION, // ReportReasonType 값 사용
      label: "허위정보",
      description: "거짓되거나 오해를 불러일으키는 정보",
      icon: Shield,
      color: "text-blue-600",
    },
    {
      id: ReportReasonType.COPYRIGHT, // ReportReasonType 값 사용
      label: "저작권 침해",
      description: "다른 사람의 저작물을 무단 사용",
      icon: MessageSquare,
      color: "text-green-600",
    },
    {
      id: ReportReasonType.HATE_SPEECH, // ReportReasonType 값 사용
      label: "혐오 발언",
      description: "특정 집단에 대한 차별이나 혐오 표현",
      icon: Heart,
      color: "text-pink-600",
    },
    {
      id: ReportReasonType.OTHER, // ReportReasonType 값 사용
      label: "기타",
      description: "위에 해당하지 않는 기타 사유",
      icon: Flag,
      color: "text-gray-600",
    },
  ];

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error("신고 사유를 선택해주세요.");
      return;
    }

    // targetId가 유효한 UUID 형식인지 확인
    if (!targetId || !isValidUUID(targetId)) {
      toast.error("신고 대상 ID가 유효하지 않은 형식입니다.");
      return;
    }

    let reasonToSend: string;

    if (selectedReason === ReportReasonType.OTHER) {
      reasonToSend = customReason.trim();
      if (!reasonToSend) {
        toast.error("기타 사유를 작성해주세요.");
        return;
      }
    } else {
      reasonToSend = selectedReason; // ✅ 백엔드 enum과 일치하는 영문 키워드 값 사용
    }

    setIsSubmitting(true);

    const payload = {
      reportType: type.toUpperCase() as ReportTargetType, // ✅ 무조건 "POST", "COMMENT"
      targetId: targetId,
      reason: reasonToSend,
    };

    // ✅ 여기에 로그를 넣으세요:
    console.log("🚨 payload 확인:", {
      reportType: typeof payload.reportType,
      value: payload.reportType,
      isString: typeof payload.reportType === "string",
    });

    console.log("🚨 최종 payload JSON:", JSON.stringify(payload, null, 2));

    try {
      await reportContent(payload);

      toast.success(
        `${
          type === ReportTargetType.POST ? "게시글" : "댓글" // ReportTargetType 사용
        }이 신고되었습니다. 검토 후 조치하겠습니다.`
      );
      onClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "신고 처리 중 오류가 발생했습니다.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedReason("");
      setCustomReason("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Flag className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {type === ReportTargetType.POST ? "게시글" : "댓글"} 신고하기
                </h2>
                {targetContent && (
                  <p className="text-sm text-gray-500 truncate max-w-48">
                    "{targetContent}"
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* 내용 */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  신고 사유를 선택해주세요
                </h3>
                <div className="space-y-2">
                  {reportReasons.map((reason) => (
                    <motion.button
                      key={reason.id}
                      onClick={() => setSelectedReason(reason.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-colors ${
                        selectedReason === reason.id
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <reason.icon
                          className={`w-5 h-5 mt-0.5 ${reason.color}`}
                        />
                        <div>
                          <div className="font-medium text-gray-900 mb-1">
                            {reason.label}
                          </div>
                          <div className="text-sm text-gray-600">
                            {reason.description}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 기타 사유 작성 */}
              {selectedReason === ReportReasonType.OTHER && ( // ReportReasonType 사용
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-gray-700">
                    구체적인 신고 사유를 작성해주세요
                  </label>
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="신고 사유를 상세히 작성해주세요..."
                    rows={4}
                    maxLength={300}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  />
                  <div className="text-xs text-gray-500 text-right">
                    {customReason.length}/300
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              허위 신고 시 제재를 받을 수 있습니다.
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedReason}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>신고 중...</span>
                  </>
                ) : (
                  <>
                    <Flag className="w-4 h-4" />
                    <span>신고하기</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReportModal;
