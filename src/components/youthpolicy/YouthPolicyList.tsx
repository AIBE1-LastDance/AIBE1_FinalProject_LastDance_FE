// src/components/youthPolicy/YouthPolicyList.tsx
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { YouthPolicy } from "../../types/youthpolicy/youthPolicy";
import YouthPolicyCard from "./YouthPolicyCard";
import { fetchAllYouthPolicies } from "../../api/youthpolicy/youthPolicy";

const YouthPolicyList: React.FC = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<YouthPolicy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = localStorage.getItem("youthPolicyCurrentPage");
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  const policiesPerPage = 9;

  const categories = [
    { id: "all", name: "전체" },
    { id: "취업지원", name: "취업지원" },
    { id: "창업지원", name: "창업지원" },
    { id: "주거/생활", name: "주거/생활" },
    { id: "금융", name: "금융" },
    { id: "정책참여", name: "정책참여" },
  ];

  const loadPolicies = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllYouthPolicies();
      setPolicies(data);
    } catch (error) {
      console.error(error);
      alert("청년 정책을 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  useEffect(() => {
    localStorage.setItem("youthPolicyCurrentPage", currentPage.toString());
  }, [currentPage]);

  const processedPolicies = useMemo(() => {
    let tempPolicies = [...policies];

    // 검색 필터
    if (searchQuery) {
      tempPolicies = tempPolicies.filter(
        (policy) =>
          policy.plcyNm.toLowerCase().includes(searchQuery.toLowerCase()) ||
          policy.plcyExplnCn
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          policy.plcyKywdNm.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 카테고리 필터
    if (selectedCategory !== "all") {
      tempPolicies = tempPolicies.filter(
        (policy) =>
          policy.lclsfNm === selectedCategory ||
          policy.mclsfNm === selectedCategory
      );
    }

    // 최신 정책 우선 정렬
    tempPolicies.sort((a, b) => {
      const dateA = a.bizPrdEndYmd ? parseInt(a.bizPrdEndYmd) : 0;
      const dateB = b.bizPrdEndYmd ? parseInt(b.bizPrdEndYmd) : 0;
      return dateB - dateA;
    });

    return tempPolicies;
  }, [policies, searchQuery, selectedCategory]);

  const totalPages = Math.ceil(processedPolicies.length / policiesPerPage);
  const currentPolicies = useMemo(() => {
    const indexOfLastPolicy = currentPage * policiesPerPage;
    const indexOfFirstPolicy = indexOfLastPolicy - policiesPerPage;
    return processedPolicies.slice(indexOfFirstPolicy, indexOfLastPolicy);
  }, [processedPolicies, currentPage, policiesPerPage]);

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const handlePolicyClick = (policy: YouthPolicy) => {
    navigate(`/youth-policy/${policy.plcyNo}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white px-4 sm:px-6 lg:px-8"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">청년 정책</h1>
            <p className="text-primary-100">
              다양한 청년 지원 정책을 한눈에 확인하고 나에게 맞는 정책을
              찾아보세요!
            </p>
          </div>
        </div>
      </motion.div>

      {/* 검색 및 카테고리 필터 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8"
      >
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="정책명, 내용, 키워드로 검색해보세요..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2"></div>
      </motion.div>

      {/* 정책 목록 또는 스피너 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="min-h-[400px] flex items-center justify-center"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">
              정책 정보를 불러오는 중입니다...
            </p>
          </div>
        ) : currentPolicies.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200 w-full">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              일치하는 정책이 없습니다
            </h3>
            <p className="text-gray-500">
              검색 조건이나 필터를 변경하여 다시 시도해 보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {currentPolicies.map((policy, index) => (
              <motion.div
                key={policy.plcyNo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <YouthPolicyCard policy={policy} onClick={handlePolicyClick} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* 페이지네이션 컨트롤 */}
      {!isLoading && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center items-center space-x-2 py-8"
        >
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="이전 페이지"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          {getPageNumbers().map((number) => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                currentPage === number
                  ? "bg-accent-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              aria-current={currentPage === number ? "page" : undefined}
            >
              {number}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="다음 페이지"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default YouthPolicyList;
