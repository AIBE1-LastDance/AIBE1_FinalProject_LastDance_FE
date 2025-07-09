// src/components/youthPolicy/YouthPolicyCard.tsx
import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Calendar,
  Tag,
  Info,
  Layers,
  CheckCircle,
} from "lucide-react";
import { YouthPolicy } from "../../types/youthpolicy/youthPolicy"; // 경로 수정

interface YouthPolicyCardProps {
  policy: YouthPolicy;
  onClick: (policy: YouthPolicy) => void;
}

const YouthPolicyCard: React.FC<YouthPolicyCardProps> = ({
  policy,
  onClick,
}) => {
  // 날짜 형식 변경 (YYYYMMDD ->YYYY.MM.DD)
  const formatYMD = (ymd: string) => {
    if (!ymd || ymd.length !== 8) return ymd;
    return `${ymd.substring(0, 4)}.${ymd.substring(4, 6)}.${ymd.substring(
      6,
      8
    )}`;
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      // 카드 전체 높이 고정 (이전과 동일)
      className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 cursor-pointer transform transition-transform duration-200 flex flex-col justify-between h-[450px]"
      onClick={() => onClick(policy)}
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 leading-snug pr-4 line-clamp-2 min-h-[56px] flex-grow">
            {policy.plcyNm}
          </h3>
          <div className="flex-shrink-0 text-xs font-medium text-teal-600 bg-teal-100 px-3 py-1 rounded-full">
            {policy.lclsfNm}
          </div>
        </div>

        <div className="space-y-3 text-gray-600 text-sm flex flex-col">
          {/* 키워드 항목 */}
          <div className="flex items-center min-h-[24px] flex-shrink-0">
            <Tag className="w-4 h-4 mr-2 text-primary-500 flex-shrink-0" />
            <span className="font-semibold text-gray-700 flex-shrink-0">
              키워드:
            </span>
            <span className="ml-2 line-clamp-1 overflow-hidden text-ellipsis flex-grow">
              {policy.plcyKywdNm || "-"}
            </span>
          </div>

          {/* 사업기간 항목 */}
          <div className="flex items-center min-h-[24px] flex-shrink-0">
            <Calendar className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
            <span className="font-semibold text-gray-700 flex-shrink-0">
              사업기간:
            </span>
            <span className="ml-2 flex-grow">
              {formatYMD(policy.bizPrdBgngYmd)} ~{" "}
              {formatYMD(policy.bizPrdEndYmd)}
            </span>
          </div>

          {/* 신청시기 항목 */}
          <div className="flex items-start min-h-[48px] flex-shrink-0">
            <Info className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
            <span className="font-semibold text-gray-700 flex-shrink-0">
              신청시기:
            </span>
            <span className="ml-2 line-clamp-2 overflow-hidden text-ellipsis flex-grow">
              {policy.aplyYmd || "-"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-gray-100 flex-grow">
        <p className="text-gray-500 text-sm line-clamp-4">
          {policy.plcyExplnCn || "자세한 설명이 없습니다."}
        </p>
      </div>
    </motion.div>
  );
};

export default YouthPolicyCard;
