// src/components/youthPolicy/YouthPolicyList.tsx
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  FileText,
  Briefcase,
  GraduationCap,
  Home,
  Heart,
  Users,
  Clock,
  Calendar,
  CalendarCheck,
  CalendarX,
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
  const [tempSearchQuery, setTempSearchQuery] = useState(""); // 실제 검색이 적용되지 않은 임시 입력값
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("current"); // 기본값을 'current'로 설정
  const [currentPage, setCurrentPage] = useState(() => {
    // 페이지 방문 경로 확인
    const lastVisitedPath = sessionStorage.getItem("lastVisitedPath");
    const currentPath = "/youth-policy";
    
    // 이전 방문 경로가 청년정책 상세페이지가 아닌 경우 1페이지로 초기화
    if (lastVisitedPath && !lastVisitedPath.startsWith("/youth-policy/")) {
      localStorage.removeItem("youthPolicyCurrentPage");
      return 1;
    }
    
    // 상세페이지에서 돌아온 경우 저장된 페이지 유지
    const savedPage = localStorage.getItem("youthPolicyCurrentPage");
    return savedPage ? parseInt(savedPage, 10) : 1;
  });
  const policiesPerPage = 9;

  const categories = [
    { id: "all", name: "전체", icon: Filter, color: "text-primary-600" },
    { id: "일자리", name: "일자리", icon: Briefcase, color: "text-blue-600" },
    { id: "교육", name: "교육", icon: GraduationCap, color: "text-purple-600" },
    { id: "주거", name: "주거", icon: Home, color: "text-orange-600" },
    { id: "복지문화", name: "복지문화", icon: Heart, color: "text-pink-600" },
    { id: "참여권리", name: "참여권리", icon: Users, color: "text-red-600" },
  ];

  const periods = [
    { id: "current", name: "신청 가능", icon: Calendar },
    { id: "upcoming", name: "신청 예정", icon: Clock },
    { id: "ended", name: "신청 마감", icon: CalendarX },
    { id: "all", name: "전체 기간", icon: CalendarCheck },
  ];

  // 날짜 파싱 함수 (YYYYMMDD를 Date로 변환)
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr || dateStr.length !== 8) return null;
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6)) - 1; // 월은 0부터 시작
    const day = parseInt(dateStr.substring(6, 8));
    return new Date(year, month, day);
  };

  // 신청 기간 파싱 함수 ("20240205 ~ 20240222" -> {start: Date, end: Date})
  const parseApplicationPeriod = (periodString: string): { start: Date | null; end: Date | null } => {
    if (!periodString) return { start: null, end: null };
    
    const dates = periodString.split(' ~ ');
    if (dates.length === 2) {
      return {
        start: parseDate(dates[0].trim()),
        end: parseDate(dates[1].trim())
      };
    }
    
    // 단일 날짜인 경우
    if (periodString.length === 8) {
      const date = parseDate(periodString);
      return { start: date, end: date };
    }
    
    return { start: null, end: null };
  };

  // 신청 기간 상태 확인 함수
  const getApplicationStatus = (policy: YouthPolicy): "current" | "upcoming" | "ended" => {
    const { start, end } = parseApplicationPeriod(policy.aplyYmd);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정하여 날짜만 비교
    
    if (!start || !end) return "ended"; // 날짜 정보가 없으면 마감으로 처리
    
    if (today < start) return "upcoming"; // 신청 시작 전
    if (today >= start && today <= end) return "current"; // 신청 기간 중
    return "ended"; // 신청 마감
  };

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
    
    // 현재 경로를 세션 스토리지에 저장
    sessionStorage.setItem("lastVisitedPath", "/youth-policy");
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
        (policy) => policy.lclsfNm === selectedCategory
      );
    }

    // 신청 기간 필터
    if (selectedPeriod !== "all") {
      tempPolicies = tempPolicies.filter((policy) => {
        const status = getApplicationStatus(policy);
        return status === selectedPeriod;
      });
    }

    // 최신 정책 우선 정렬
    tempPolicies.sort((a, b) => {
      const dateA = a.bizPrdEndYmd ? parseInt(a.bizPrdEndYmd) : 0;
      const dateB = b.bizPrdEndYmd ? parseInt(b.bizPrdEndYmd) : 0;
      return dateB - dateA;
    });

    return tempPolicies;
  }, [policies, searchQuery, selectedCategory, selectedPeriod]);

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

  // 검색 실행 함수
  const handleSearch = () => {
    setSearchQuery(tempSearchQuery);
    setCurrentPage(1);
  };

  // Enter 키 검색 처리
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePolicyClick = (policy: YouthPolicy) => {
    navigate(`/youth-policy/${policy.plcyNo}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">

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
              value={tempSearchQuery}
              onChange={(e) => setTempSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none"
            />
          </div>
          <button
              onClick={handleSearch}
              className="ml-2 px-6 py-3 bg-accent-500 text-white rounded-2xl font-medium hover:bg-accent-600 transition-colors shadow-md hover:shadow-lg whitespace-nowrap flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            검색
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setCurrentPage(1);
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? "bg-primary-100 text-primary-700 border-2 border-primary-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <category.icon
                className={`w-4 h-4 ${
                  selectedCategory === category.id
                    ? category.color
                    : "text-gray-500"
                }`}
              />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* 신청 기간 필터 - 커뮤니티 스타일 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex justify-between items-center"
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-50 rounded-xl p-1">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => {
                  setSelectedPeriod(period.id);
                  setCurrentPage(1);
                }}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period.id
                    ? "bg-white text-accent-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <period.icon className="w-4 h-4" />
                <span>{period.name}</span>
              </button>
            ))}
          </div>
        </div>
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
          {/* 맨 첫 페이지 */}
          <button
            onClick={() => paginate(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="첫 페이지"
          >
            <ChevronsLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* 이전 페이지 */}
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="이전 페이지"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* 페이지 번호들 */}
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
          
          {/* 다음 페이지 */}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="다음 페이지"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* 맨 끝 페이지 */}
          <button
            onClick={() => paginate(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="마지막 페이지"
          >
            <ChevronsRight className="w-5 h-5 text-gray-600" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default YouthPolicyList;
