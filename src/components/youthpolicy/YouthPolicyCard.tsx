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
  // 날짜 형식 변경 (YYYYMMDD -> YYYY.MM.DD)
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
      className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 cursor-pointer transform transition-transform duration-200"
      onClick={() => onClick(policy)}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 leading-snug pr-4">
          {policy.plcyNm}
        </h3>
        <div className="flex-shrink-0 text-xs font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
          {policy.lclsfNm}
        </div>
      </div>

      <div className="space-y-3 text-gray-600 text-sm">
        <div className="flex items-center">
          <Tag className="w-4 h-4 mr-2 text-primary-500 flex-shrink-0" />
          <span className="font-semibold text-gray-700">키워드:</span>
          <span className="ml-2 line-clamp-1">{policy.plcyKywdNm || "-"}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
          <span className="font-semibold text-gray-700">사업기간:</span>
          <span className="ml-2">
            {formatYMD(policy.bizPrdBgngYmd)} ~ {formatYMD(policy.bizPrdEndYmd)}
          </span>
        </div>
        <div className="flex items-center">
          <Info className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
          <span className="font-semibold text-gray-700">신청시기:</span>
          <span className="ml-2 line-clamp-1">{policy.aplyYmd || "-"}</span>
        </div>
        <div className="flex items-center">
          <CheckCircle className="w-4 h-4 mr-2 text-red-500 flex-shrink-0" />
          <span className="font-semibold text-gray-700">지원내용:</span>
          <span className="ml-2 line-clamp-2">
            {policy.plcySprtCn || "정보 없음"}
          </span>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-gray-100">
        <p className="text-gray-500 text-sm line-clamp-2">
          {policy.plcyExplnCn || "자세한 설명이 없습니다."}
        </p>
      </div>
    </motion.div>
  );
};

export default YouthPolicyCard;
