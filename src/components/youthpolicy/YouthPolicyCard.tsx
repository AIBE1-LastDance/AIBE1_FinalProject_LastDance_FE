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

  // 신청 기간 형식 변환 함수 (20240205 ~ 20240222 -> 2024.02.05 ~ 2024.02.22)
  const formatApplicationPeriod = (periodString?: string) => {
    if (!periodString) return "-";
    
    // "20240205 ~ 20240222" 형태의 문자열을 분리
    const dates = periodString.split(' ~ ');
    if (dates.length === 2) {
      const startDate = formatYMD(dates[0].trim());
      const endDate = formatYMD(dates[1].trim());
      return `${startDate} ~ ${endDate}`;
    }
    
    // 단일 날짜인 경우
    if (periodString.length === 8) {
      return formatYMD(periodString);
    }
    
    return periodString; // 다른 형태면 그대로 반환
  };

  // 카테고리별 색상 매핑
  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, { border: string; text: string; bg: string }> = {
      // 대분류 5가지
      '일자리': { border: 'border-blue-500', text: 'text-blue-700', bg: 'bg-transparent' },
      '교육': { border: 'border-purple-500', text: 'text-purple-700', bg: 'bg-transparent' },
      '주거': { border: 'border-primary-500', text: 'text-primary-700', bg: 'bg-transparent' },
      '복지문화': { border: 'border-emerald-500', text: 'text-emerald-700', bg: 'bg-transparent' },
      '참여권리': { border: 'border-red-500', text: 'text-red-700', bg: 'bg-transparent' },
      
      // 중분류들
      '취업': { border: 'border-blue-600', text: 'text-blue-800', bg: 'bg-transparent' },
      '창업': { border: 'border-green-500', text: 'text-green-700', bg: 'bg-transparent' },
      '재직자': { border: 'border-cyan-500', text: 'text-cyan-700', bg: 'bg-transparent' },
      '미래역량강화': { border: 'border-purple-600', text: 'text-purple-800', bg: 'bg-transparent' },
      '교육비지원': { border: 'border-indigo-500', text: 'text-indigo-700', bg: 'bg-transparent' },
      '주택 및 거주지': { border: 'border-primary-600', text: 'text-primary-800', bg: 'bg-transparent' },
      '전월세 및 주거급여 지원': { border: 'border-orange-500', text: 'text-orange-700', bg: 'bg-transparent' },
      '취약계층 및 금융지원': { border: 'border-emerald-600', text: 'text-emerald-800', bg: 'bg-transparent' },
      '문화활동': { border: 'border-teal-500', text: 'text-teal-700', bg: 'bg-transparent' },
      '예술인지원': { border: 'border-green-600', text: 'text-green-800', bg: 'bg-transparent' },
      '건강': { border: 'border-lime-500', text: 'text-lime-700', bg: 'bg-transparent' },
      '청년참여': { border: 'border-red-600', text: 'text-red-800', bg: 'bg-transparent' },
      '청년국제교류': { border: 'border-red-400', text: 'text-red-600', bg: 'bg-transparent' },
      '권익보호': { border: 'border-red-700', text: 'text-red-900', bg: 'bg-transparent' },
      '정책인프라구축': { border: 'border-slate-500', text: 'text-slate-700', bg: 'bg-transparent' },
    };
    
    return colorMap[category] || { border: 'border-gray-500', text: 'text-gray-700', bg: 'bg-transparent' };
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      // 카드 전체 높이만 축소 (360px -> 300px)
      className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 cursor-pointer transform transition-transform duration-200 flex flex-col justify-between h-[300px]"
      onClick={() => onClick(policy)}
    >
      <div>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 leading-snug pr-4 line-clamp-2 min-h-[48px] flex-grow">
            {policy.plcyNm}
          </h3>
          <div className="flex-shrink-0">
            {/* 대분류 태그만 표시 */}
            <div className={`text-xs font-medium px-3 py-1 rounded-full border ${getCategoryColor(policy.lclsfNm).border} ${getCategoryColor(policy.lclsfNm).text} ${getCategoryColor(policy.lclsfNm).bg}`}>
              {policy.lclsfNm}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-gray-600 text-sm flex flex-col">
          {/* 키워드 항목 */}
          <div className="flex items-center min-h-[20px] flex-shrink-0">
            <Tag className="w-4 h-4 mr-2 text-primary-500 flex-shrink-0" />
            <span className="font-semibold text-gray-700 flex-shrink-0">
              키워드:
            </span>
            <span className="ml-2 line-clamp-1 overflow-hidden text-ellipsis flex-grow">
              {policy.plcyKywdNm || "-"}
            </span>
          </div>

          {/* 사업기간 항목 */}
          <div className="flex items-center min-h-[20px] flex-shrink-0">
            <Calendar className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
            <span className="font-semibold text-gray-700 flex-shrink-0">
              사업기간:
            </span>
            <span className="ml-2 flex-grow text-xs">
              {formatYMD(policy.bizPrdBgngYmd)} ~{" "}
              {formatYMD(policy.bizPrdEndYmd)}
            </span>
          </div>

          {/* 신청시기 항목 */}
          <div className="flex items-start min-h-[35px] flex-shrink-0">
            <Info className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
            <span className="font-semibold text-gray-700 flex-shrink-0">
              신청시기:
            </span>
            <span className="ml-2 line-clamp-2 overflow-hidden text-ellipsis flex-grow text-xs">
              {formatApplicationPeriod(policy.aplyYmd)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex-grow">
        <p className="text-gray-500 text-sm line-clamp-3">
          {policy.plcyExplnCn || "자세한 설명이 없습니다."}
        </p>
      </div>
    </motion.div>
  );
};

export default YouthPolicyCard;
