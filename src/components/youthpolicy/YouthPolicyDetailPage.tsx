import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchYouthPolicyById } from "../../api/youthpolicy/youthPolicy";
import { YouthPolicy } from "../../types/youthpolicy/youthPolicy";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Tag,
  ClipboardList,
  Target,
  DollarSign,
  Info,
} from "lucide-react";

const YouthPolicyDetailPage: React.FC = () => {
  const { plcyNo } = useParams<{ plcyNo: string }>(); // URL 파라미터에서 plcyNo 가져오기
  const navigate = useNavigate();

  const [policy, setPolicy] = useState<YouthPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (plcyNo) {
      // 상세페이지 경로를 세션 스토리지에 저장
      sessionStorage.setItem("lastVisitedPath", `/youth-policy/${plcyNo}`);
      
      fetchYouthPolicyById(plcyNo)
        .then((data) => {
          setPolicy(data);
        })
        .catch((error) => {
          console.error(
            `[❌ 청년 정책 상세 로딩 실패] 정책 번호: ${plcyNo}`,
            error
          );
          setNotFound(true);
        })
        .finally(() => setLoading(false));
    } else {
      setNotFound(true); // plcyNo가 없으면 찾을 수 없음으로 처리
      setLoading(false);
    }
  }, [plcyNo]); // plcyNo가 변경될 때마다 재실행

  // 날짜 형식 변환 함수 (YYYYMMDD -> YYYY.MM.DD)
  const formatDate = (dateString?: string) => {
    if (!dateString) return "정보 없음";
    if (dateString.length === 8) {
      return `${dateString.substring(0, 4)}.${dateString.substring(
        4,
        6
      )}.${dateString.substring(6, 8)}`;
    }
    return dateString; // 8자리 숫자가 아니면 그대로 반환
  };

  // 신청 기간 형식 변환 함수 (20240205 ~ 20240222 -> 2024.02.05 ~ 2024.02.22)
  const formatApplicationPeriod = (periodString?: string) => {
    if (!periodString) return "정보 없음";
    
    // "20240205 ~ 20240222" 형태의 문자열을 분리
    const dates = periodString.split(' ~ ');
    if (dates.length === 2) {
      const startDate = formatDate(dates[0].trim());
      const endDate = formatDate(dates[1].trim());
      return `${startDate} ~ ${endDate}`;
    }
    
    // 단일 날짜인 경우
    if (periodString.length === 8) {
      return formatDate(periodString);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] py-20">
        <div className="w-16 h-16 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">
          정책 상세 정보를 불러오는 중입니다...
        </p>
      </div>
    );
  }

  if (notFound || !policy) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            정책을 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 mb-6">
            요청하신 청년 정책이 삭제되었거나 존재하지 않습니다.
          </p>
          <button
            onClick={() => navigate("/youth-policy")}
            className="bg-accent-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-accent-700 transition-colors flex items-center justify-center mx-auto"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            청년 정책 목록으로 돌아가기
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/youth-policy")}
        className="flex items-center text-gray-600 hover:text-accent-600 transition-colors mb-6 font-medium cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        목록으로 돌아가기
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
      >
        {/* 정책 헤더 */}
        <div className="bg-gradient-to-r from-accent-500 to-accent-600 p-8 text-white">
          <h1 className="text-3xl font-extrabold mb-2">{policy.plcyNm}</h1>
          <p className="text-accent-100 text-lg">{policy.plcyKywdNm}</p>
        </div>

        {/* 정책 상세 내용 */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-8">
            {/* 카테고리 */}
            <div className="flex items-center">
              <Tag className="w-5 h-5 text-accent-600 mr-2 flex-shrink-0" />
              <div className="flex flex-wrap gap-2">
                <span className={`border px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(policy.lclsfNm).border} ${getCategoryColor(policy.lclsfNm).text} ${getCategoryColor(policy.lclsfNm).bg}`}>
                  {policy.lclsfNm}
                </span>
                {policy.mclsfNm && policy.lclsfNm !== policy.mclsfNm && (
                  <span className={`border px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(policy.mclsfNm).border} ${getCategoryColor(policy.mclsfNm).text} ${getCategoryColor(policy.mclsfNm).bg}`}>
                    {policy.mclsfNm}
                  </span>
                )}
              </div>
            </div>

            {/* 사업 기간 */}
            <div className="flex items-center">
              <CalendarDays className="w-5 h-5 text-accent-600 mr-2 flex-shrink-0" />
              <p className="text-gray-700 text-sm">
                사업 기간: {formatDate(policy.bizPrdBgngYmd)} ~{" "}
                {formatDate(policy.bizPrdEndYmd)}
              </p>
            </div>

            {/* 신청 기간 */}
            <div className="flex items-center">
              <CalendarDays className="w-5 h-5 text-accent-600 mr-2 flex-shrink-0" />
              <p className="text-gray-700 text-sm">
                신청 기간: {formatApplicationPeriod(policy.aplyYmd)}
              </p>
            </div>
          </div>

          <hr className="my-8 border-gray-200" />

          {/* 정책 설명 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
              <ClipboardList className="w-6 h-6 text-accent-600 mr-2" />
              정책 설명
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {policy.plcyExplnCn || "정책 설명이 제공되지 않습니다."}
            </p>
          </div>

          {/* 정책 지원 내용 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
              <DollarSign className="w-6 h-6 text-accent-600 mr-2" />
              지원 내용
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {policy.plcySprtCn || "지원 내용이 제공되지 않습니다."}
            </p>
          </div>

          {/* 대상 정보 (필요시 추가) */}
          {/*
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 flex items-center mb-4">
              <Target className="w-6 h-6 text-teal-600 mr-2" />
              지원 대상
            </h2>
            <p className="text-gray-700 leading-relaxed">
              여기에 정책 대상 정보를 추가할 수 있습니다.
            </p>
          </div>
          */}
        </div>
      </motion.div>
    </div>
  );
};

export default YouthPolicyDetailPage;
