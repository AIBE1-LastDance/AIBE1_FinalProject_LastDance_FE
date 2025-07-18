import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Plus,
  PieChart,
  BarChart3,
  TrendingUp,
  Receipt,
  Calendar,
  Filter,
  Search,
  Bot,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Share2,
  RefreshCw,
  Users,
  Image,
  X,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Sector,
} from "recharts";
import { useAppStore } from "../../store/appStore";
import { useAuthStore } from "../../store/authStore";
import { useLocation, useNavigate } from "react-router-dom";
import {
  format,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import ExpenseModal from "./ExpenseModal";
import { expenseAPI } from "../../api/expense";
import toast from "react-hot-toast";
import Pagination from "../common/Pagination";
import {createPortal} from "react-dom";

interface GroupSummary {
  groupId: string;
  groupName: string;
  myShareAmount: number;
  totalAmount: number;
  expenseCount: number;
}

const Portal = ({children}) => {
  return createPortal(children, document.body)
}

const ExpensesPage: React.FC = () => {
  const {
    expenses,
    mode,
    currentGroup,
    savedAnalyses = [],
    saveAnalysis,
    groupShares,
    loadGroupShares,
    loadMyGroups,
    combinedExpenses,
    currentPage,
    totalPages,
    loadCombinedExpenses,
    setCurrentPage,
    summary,
    groupSharesCurrentPage,
    groupSharesTotalPages,
    loadGroupSharesPaginated,
    groupSharesSummary,
    aiAnalysesCurrentPage, // New
    aiAnalysesTotalPages, // New
    aiAnalysesTotalElements,
    setAiAnalysesCurrentPage, // New
    loadSavedAnalysesPaginated, // New
    setGroupSharesCurrentPage,
  } = useAppStore();
  const { user } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<"expenses" | "analyses">(
    "expenses"
  );
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalysisSaved, setIsAnalysisSaved] = useState(false); // New state
  const [loading, setLoading] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentReceiptUrl, setCurrentReceiptUrl] = useState<string | null>(
    null
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [monthlyTrendData, setMonthlyTrendData] = useState<any>({});
  const [pageLoading, setPageLoading] = useState(false);
  const [sharePageLoading, setSharePageLoading] = useState(false); // New state for group shares loading
  const [isInitialLoad, setIsInitialLoad] = useState(true); // New state for initial load
  const [analysisHistoryLoading, setAnalysisHistoryLoading] = useState(false);

  // URL 쿼리 파라미터에서 splitId 확인하여 상세 모달 열기
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const splitId = urlParams.get("splitId");

    if (
      splitId &&
      (expenses.length > 0 || groupShares.length > 0) &&
      !showExpenseModal
    ) {
      // 해당 지출/분담금 찾기
      const allExpenses = [...expenses, ...groupShares];
      const targetExpense = allExpenses.find(
        (expense) =>
          expense.id === splitId ||
          expense.originalExpenseId === splitId ||
          expense.expenseId === splitId
      );

      if (targetExpense) {
        setSelectedExpense(targetExpense);
        setShowExpenseModal(true);

        // URL에서 splitId 파라미터 제거 (모달을 닫았을 때 재열리지 않도록)
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("splitId");
        navigate(newUrl.pathname + newUrl.search, { replace: true });
      }
    }
  }, [expenses, groupShares, location.search, showExpenseModal, navigate]);

  // 월별 추이 데이터 로드
  const loadMonthlyTrendData = React.useCallback(async () => {
    try {
      const params = {
        year: currentMonth.getFullYear(),
        month: currentMonth.getMonth() + 1,
        months: 6,
        category: categoryFilter === "all" ? undefined : categoryFilter,
      };

      let response;
      if (mode === "personal") {
        response = await expenseAPI.getPersonalExpensesTrend(params);
      } else if (mode === "group" && currentGroup?.id) {
        response = await expenseAPI.getGroupExpensesTrend(
          currentGroup.id,
          params
        );
      }

      if (response?.monthlyData) {
        setMonthlyTrendData(response.monthlyData);
      } else if (response?.data?.monthlyData) {
        setMonthlyTrendData(response.data.monthlyData);
      } else {
        console.log("❌ monthlyData를 찾을 수 없음. 전체 응답:", response);
      }
    } catch (error) {
      console.error("❌ 월별 추이 데이터 로드 실패: ", error);
      setMonthlyTrendData({});
    }
  }, [currentMonth, categoryFilter, mode, currentGroup?.id]);

  const refreshAllData = React.useCallback(async () => {
    if (!isInitialLoad) {
      setPageLoading(true);
    } else {
      setLoading(false);
    }
    try {
      const promises = [];

      if (mode === "group") {
        promises.push(loadMyGroups());

        promises.push(
          loadGroupSharesPaginated({
            year: currentMonth.getFullYear(),
            month: currentMonth.getMonth() + 1,
            groupId: currentGroup?.id,
            page: groupSharesCurrentPage,
            size: 5,
          })
        );
      }

      // 통합 조회 API
      const expenseParams = {
        mode,
        year: currentMonth.getFullYear(),
        month: currentMonth.getMonth() + 1,
        page: currentPage,
        size: 10,
        groupId: mode === "group" ? currentGroup?.id : null,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        search: searchTerm || undefined,
      };
      promises.push(loadCombinedExpenses(expenseParams));

      if (mode === "personal") {
        promises.push(
          loadGroupShares({
            year: currentMonth.getFullYear(),
            month: currentMonth.getMonth() + 1,
          })
        );
      }

      // 월별 추이 데이터
      promises.push(loadMonthlyTrendData());

      await Promise.all(promises);
    } catch (error) {
      console.error("지출 로드 실패: ", error);
    } finally {
      if (!isInitialLoad) {
        setPageLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, [
    mode,
    currentMonth,
    currentGroup?.id,
    categoryFilter,
    searchTerm,
    loadCombinedExpenses,
    loadMyGroups,
    loadMonthlyTrendData,
    currentPage,
    groupSharesCurrentPage,
    loadGroupSharesPaginated,
    pageLoading,
  ]);

  const refreshCurrentPageData = async () => {
    setPageLoading(true);

    try {
      const expenseParams = {
        mode,
        year: currentMonth.getFullYear(),
        month: currentMonth.getMonth() + 1,
        page: currentPage,
        size: 10,
        groupId: mode === "group" ? currentGroup?.id : null,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        search: searchTerm || undefined,
      };
      await loadCombinedExpenses(expenseParams);

      // 분담금도 필요시 새로고침
      if (mode === "personal") {
        await loadGroupShares({
          year: currentMonth.getFullYear(),
          month: currentMonth.getMonth() + 1,
        });
      }
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    // 마운트 시 초기화
    setCurrentPage(0);
    setGroupSharesCurrentPage(0);

    // 언마운트 시에도 초기화
    return () => {
      setCurrentPage(0);
      setGroupSharesCurrentPage(0);
    }
  }, []);

  useEffect(() => {
    if (isInitialLoad) {
      // Only run refreshAllData on initial load
      refreshAllData();
      // AI 분석 내역도 함께 로드
      const loadAnalyses = async () => {
        setAnalysisHistoryLoading(true);
        try {
          await loadSavedAnalysesPaginated({ page: 0, size: 10 }); // 초기 페이지 로드
        } finally {
          setAnalysisHistoryLoading(false);
        }
      };
      loadAnalyses();
      setIsInitialLoad(false); // Set to false after initial load
    }
    // AI 분석 내역도 함께 로드
  }, [refreshAllData, isInitialLoad, loadSavedAnalysesPaginated]);

  useEffect(() => {
    if (Object.keys(monthlyTrendData).length > 0) {
      loadMonthlyTrendData();
    }
  }, [categoryFilter, loadMonthlyTrendData]);

  // 모드 또는 현재 그룹이 변경될 때 데이터 새로고침
  useEffect(() => {
    if (!isInitialLoad) {
      setCurrentPage(0);
      setCategoryFilter("all");
      setSearchTerm("");
      setActiveTab("expenses");
      setShowAnalysis(false);
      setSelectedAnalysis(null);
      setAnalysisResult(null);

      const refreshModeData = async () => {
        setPageLoading(true);
        try {
          const promises = [];

          // 1. 통합 지출 데이터 로드
          const expenseParams = {
            mode,
            year: currentMonth.getFullYear(),
            month: currentMonth.getMonth() + 1,
            page: currentPage,
            size: 10,
            groupId: mode === "group" ? currentGroup?.id : null,
            category: undefined,
            search: undefined,
          };
          promises.push(loadCombinedExpenses(expenseParams));

          // 2. 그룹 모드일 때 추가 데이터
          if (mode === "group") {
            promises.push(loadMyGroups());
            promises.push(
              loadGroupSharesPaginated({
                year: currentMonth.getFullYear(),
                month: currentMonth.getMonth() + 1,
                groupId: currentGroup?.id,
                page: groupSharesCurrentPage,
                size: 5,
              })
            );
          }

          // 3. 개인 모드일 때 분담금 데이터
          if (mode === "personal") {
            promises.push(
              loadGroupShares({
                year: currentMonth.getFullYear(),
                month: currentMonth.getMonth() + 1,
              })
            );
          }

          await Promise.all(promises);
        } catch (error) {
          console.error("모드 변경 시 데이터 로드 실패:", error);
        } finally {
          setPageLoading(false);
        }
      };

      refreshModeData();
    }
  }, [mode, currentGroup?.id]);

  // 필터나 검색어 변경 시 데이터 새로고침
  useEffect(() => {
    if (!isInitialLoad) {
      const refreshFilteredData = async () => {
        setPageLoading(true);
        try {
          const commonParams = {
            mode,
            year: currentMonth.getFullYear(),
            month: currentMonth.getMonth() + 1,
            page: 0, // 필터 변경 시 첫 페이지부터
            size: 10,
            groupId: mode === "group" ? currentGroup?.id : null,
            category: categoryFilter === "all" ? undefined : categoryFilter,
            search: searchTerm || undefined,
          };

          const promises = [loadCombinedExpenses(commonParams)];

          if (mode === "group" && currentGroup?.id) {
            promises.push(
              loadGroupSharesPaginated({
                ...commonParams,
                size: 5, // 분담금은 사이즈 5
              })
            );
          }

          await Promise.all(promises);
        } catch (error) {
          console.error("필터링된 데이터 로드 실패:", error);
        } finally {
          setPageLoading(false);
        }
      };

      refreshFilteredData();
    }
  }, [categoryFilter, searchTerm]); // 의존성에 필터와 검색어 추가

  // 월별 추이 그래프 새로고침 이벤트 리스너
  useEffect(() => {
    const handleRefresh = () => {
      loadMonthlyTrendData();
    };

    window.addEventListener('refreshMonthlyTrend', handleRefresh);

    return () => {
      window.removeEventListener('refreshMonthlyTrend', handleRefresh);
    };
  }, [loadMonthlyTrendData]);

  const categoryData = [
    { category: "FOOD", label: "식비", color: "#FF6B6B" },
    { category: "UTILITIES", label: "공과금", color: "#4ECDC4" },
    { category: "TRANSPORT", label: "교통비", color: "#45B7D1" },
    { category: "SHOPPING", label: "쇼핑", color: "#96CEB4" },
    { category: "ENTERTAINMENT", label: "유흥", color: "#FFEAA7" },
    { category: "OTHER", label: "기타", color: "#DDA0DD" },
  ];

  // Category breakdown data (전체 데이터, 필터와 무관)
  const allCategoryExpenses = (() => {
    // monthlyTrendData에서 현재 달 데이터 가져오기
    const currentMonthKey = format(currentMonth, "yyyy-MM");
    const currentMonthData = monthlyTrendData[currentMonthKey] || [];

    return currentMonthData.filter((expense) => {
      if (mode === "personal") {
        return (
          expense.expenseType === "PERSONAL" || expense.expenseType === "SHARE"
        );
      } else {
        return expense.expenseType === "GROUP";
      }
    });
  })();

  // 백엔드 summary 데이터가 있으면 그걸 사용, 없으면 기존 로직
  const categoryBreakdown = summary?.categoryStats
    ? Object.entries(summary.categoryStats)
        .map(([category, stats]: [string, any]) => {
          const categoryInfo = categoryData.find(
            (cat) => cat.category === category
          );
          return {
            category,
            label: categoryInfo?.label || category,
            amount: stats.amount,
            count: stats.count,
            percentage: stats.percentage,
            color: categoryInfo?.color || "#df6d14",
            // 파이차트 필수 필드들
            name: categoryInfo?.label || category,
            value: stats.amount, // 이게 중요!
          };
        })
        .filter((item) => item.amount > 0)
        .sort((a, b) => b.amount - a.amount)
    : [];
  // 백업용 기존 로직 (summary가 없을 때만)
  categoryData
    .map((cat) => {
      const amount = allCategoryExpenses
        .filter((expense) => expense.category === cat.category)
        .reduce((sum, expense) => sum + expense.amount, 0);
      return {
        ...cat,
        amount,
      };
    })
    .filter((item) => item.amount > 0);

  const allCategoryData = categoryBreakdown;

  // Monthly trend data (카테고리 필터 적용하되 카테고리별 색상 유지)
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const monthDate = subMonths(currentMonth, 5 - i);
    const monthKey = format(monthDate, "yyyy-MM");
    const monthLabel = format(monthDate, "M월");

    const apiMonthData = monthlyTrendData[monthKey] || [];

    const monthExpenses = apiMonthData.filter((expense) => {
      if (mode === "personal") {
        return (
          expense.expenseType === "PERSONAL" || expense.expenseType === "SHARE"
        );
      } else {
        return expense.expenseType === "GROUP";
      }
    });

    const monthData: { [key: string]: any } = { month: monthLabel };

    if (categoryFilter === "all") {
      categoryData.forEach((cat) => {
        const categoryAmount = monthExpenses
          .filter((expense) => expense.category === cat.category)
          .reduce((sum, expense) => sum + expense.amount, 0);
        monthData[cat.category] = categoryAmount;
      });
    } else {
      const categoryAmount = monthExpenses
        .filter((expense) => expense.category === categoryFilter)
        .reduce((sum, expense) => sum + expense.amount, 0);
      monthData[categoryFilter] = categoryAmount;
    }

    return monthData;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const categories = [
    { value: "all", label: "전체" },
    ...categoryData.map((cat) => ({ value: cat.category, label: cat.label })),
  ];

  const handleExpenseClick = (expense) => {
    // console.log("expense.id: ", expense.id);
    setSelectedExpense(expense);
    setShowExpenseModal(true);

    // 그룹 분담금인 경우 수정 불가 - 조회만 가능
    if (expense.isGroupShare) {
      toast("그룹 지출은 그룹 페이지에서만 수정할 수 있습니다.", {
        duration: 3000,
      });
      return;
    }
  };

  // 영수증 조회 함수
  const handleReceiptClick = async (expense: any, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const targetId = expense.originalExpenseId || expense.id;
      const response = await expenseAPI.getReceiptUrl(targetId);
      if (response.data) {
        setCurrentReceiptUrl(response.data);
        setShowReceiptModal(true);
      } else {
        toast.error("영수증이 없습니다.");
      }
    } catch (error) {
      console.error("영수증 조회 실패: ", error);
      toast.error("영수증을 불러 올 수 없습니다.");
    }
  };

  const filteredExpenses = combinedExpenses || [];

  const totalAmount = summary?.totalAmount || 0;
  const avgAmount = summary?.averageAmount || 0;
  const maxAmount = summary?.maxAmount || 0;

  // 그룹별 분담금 요약 계산
  const groupSummary: GroupSummary[] =
    mode === "personal"
      ? (() => {
          const groups: { [key: string]: GroupSummary } = {};
          groupShares.forEach((share: any) => {
            if (!groups[share.groupId]) {
              groups[share.groupId] = {
                groupId: share.groupId,
                groupName: share.groupName,
                myShareAmount: 0,
                totalAmount: 0,
                expenseCount: 0,
              };
            }
            groups[share.groupId].myShareAmount += share.myShareAmount;
            groups[share.groupId].totalAmount += share.amount;
            groups[share.groupId].expenseCount += 1;
          });
          return Object.values(groups);
        })()
      : [];

  const totalGroupShares = groupSummary.reduce(
    (sum, group) => sum + group.myShareAmount,
    0
  );

  // Analytics data (전체 카테고리 데이터 사용)
  const analytics = {
    totalAmount,
    avgAmount,
    maxAmount,
    totalCount: filteredExpenses.length,
    categoryBreakdown: categoryBreakdown,
  };

  // AI 분석 생성 함수
  const handleAnalysis = async () => {
    setAnalysisLoading(true);
    setSelectedAnalysis(null); // Clear selected analysis
    setAnalysisResult(null); // Clear previous analysis result
    setIsAnalysisSaved(false); // Reset save state for new analysis
    try {
      const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd");
      const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd");
      console.log("AI 분석 요청 시작. 기간:", startDate, "~", endDate);
      const result = await expenseAPI.analyze({ startDate, endDate });
      console.log("AI 분석 API 응답 (result.data):", result.data);
      setAnalysisResult({ ...result.data, feedback: null }); // feedback 초기화
      console.log("analysisResult 상태 설정 완료:", {
        ...result.data,
        feedback: null,
      }); // Log the value being set
      setShowAnalysis(true);
    } catch (error: any) {
      console.error("AI 분석 실패:", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("AI 분석 중 알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setAnalysisLoading(false);
    }
  };

  // 이전/다음 달 이동
  const handlePreviousMonth = async () => {
    setLoading(true);
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    setCurrentPage(0);

    try {
      const promises = [];

      // 1. 통합 지출 데이터 로드
      const expenseParams = {
        mode,
        year: newMonth.getFullYear(),
        month: newMonth.getMonth() + 1,
        page: 0,
        size: 10,
        groupId: mode === "group" ? currentGroup?.id : null,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        search: searchTerm || undefined,
      };
      promises.push(loadCombinedExpenses(expenseParams));

      // 2. 분담금 데이터 로드 (중요!)
      if (mode === "group" && currentGroup?.id) {
        promises.push(
          loadGroupSharesPaginated({
            year: newMonth.getFullYear(),
            month: newMonth.getMonth() + 1,
            groupId: currentGroup.id,
            page: 0,
            size: 5,
          })
        );
      }

      if (mode === "personal") {
        promises.push(
          loadGroupShares({
            year: newMonth.getFullYear(),
            month: newMonth.getMonth() + 1,
          })
        );
      }

      await Promise.all(promises);
    } finally {
      setLoading(false);
    }
  };

  const handleNextMonth = async () => {
    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    );
    const today = new Date();
    if (nextMonth <= today) {
      setLoading(true);
      setCurrentMonth(nextMonth);
      setCurrentPage(0);

      try {
        const promises = [];

        // 1. 통합 지출 데이터 로드
        const expenseParams = {
          mode,
          year: nextMonth.getFullYear(),
          month: nextMonth.getMonth() + 1,
          page: 0,
          size: 10,
          groupId: mode === "group" ? currentGroup?.id : null,
          category: categoryFilter === "all" ? undefined : categoryFilter,
          search: searchTerm || undefined,
        };
        promises.push(loadCombinedExpenses(expenseParams));

        // 2. 분담금 데이터 로드 (중요!)
        if (mode === "group" && currentGroup?.id) {
          promises.push(
            loadGroupSharesPaginated({
              year: nextMonth.getFullYear(),
              month: nextMonth.getMonth() + 1,
              groupId: currentGroup.id,
              page: 0,
              size: 5,
            })
          );
        }

        if (mode === "personal") {
          promises.push(
            loadGroupShares({
              year: nextMonth.getFullYear(),
              month: nextMonth.getMonth() + 1,
            })
          );
        }

        await Promise.all(promises);
      } finally {
        setLoading(false);
      }
    }
  };

  // categoryFilter 변경 핸들러 추가
  const handleCategoryChange = (newCategory: string) => {
    setCategoryFilter(newCategory);
    setCurrentPage(0); // 첫 페이지로 리셋
    setShowCategoryDropdown(false);
  };

  // searchTerm 변경 핸들러 추가
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(0); // 첫 페이지로 리셋
  };

  const handleFeedback = async (historyId: number, type: "up" | "down") => {
    console.log("handleFeedback 호출됨:", { historyId, type }); // 디버깅 로그

    try {
      const response = await expenseAPI.submitFeedback(historyId, type);

      // 현재 표시된 분석 결과의 피드백 상태 업데이트
      const newFeedbackState =
        response.data === "CANCELED" ? null : type.toUpperCase();
      if (selectedAnalysis && selectedAnalysis.historyId === historyId) {
        setSelectedAnalysis((prev) => ({
          ...prev,
          feedback: newFeedbackState,
        }));
        console.log("selectedAnalysis 업데이트됨:", selectedAnalysis); // 디버깅 로그
      } else if (analysisResult && analysisResult.historyId === historyId) {
        setAnalysisResult((prev) => ({ ...prev, feedback: newFeedbackState }));
        console.log("analysisResult 업데이트됨:", analysisResult); // 디버깅 로그
      }

      // 토스트 메시지 분리
      if (response.data === "CANCELED") {
        toast.success("피드백이 취소되었습니다.");
      } else {
        toast.success("피드백이 성공적으로 제출되었습니다!");
      }

      await loadSavedAnalysesPaginated({
        page: aiAnalysesCurrentPage,
        size: 10,
      }); // Refresh the list after feedback
    } catch (error) {
      console.error("피드백 제출 실패:", error);
      toast.error("피드백 제출에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // AI 분석 데이터 생성 (현재 또는 선택된 분석)
  const getAIAnalysis = () => {
    // 선택된 분석이 있으면 그것을 반환
    if (selectedAnalysis) {
      const result = {
        historyId: undefined, // 히스토리에서는 피드백 버튼을 표시하지 않으므로 undefined로 설정
        feedback: undefined, // 히스토리에서는 피드백 상태를 표시하지 않으므로 undefined로 설정
        insights: [
          {
            type: "mainFinding",
            title: selectedAnalysis.mainFinding || "분석 결과 없음",
            message: "",
            icon: Bot,
            color: "text-blue-500",
          },
        ],
        recommendations: [
          {
            title: selectedAnalysis.suggestionTitle || "제안 없음",
            message: selectedAnalysis.suggestionDescription || "",
            impact: selectedAnalysis.suggestionEffect || "",
            difficulty: selectedAnalysis.suggestionDifficulty || "보통",
          },
        ],
        warnings: [],
        summary: {
          totalAmount: selectedAnalysis.budgetUsageCurrentSpending || 0,
          spendingRate: selectedAnalysis.budgetUsagePercentage || 0,
          totalBudget: selectedAnalysis.budgetUsageTotalBudget || 0,
          changeRate: 0,
          topCategory: selectedAnalysis.mainFinding?.split(" ")[0] || "없음",
          avgDaily: selectedAnalysis.dailySpendingAverageSoFar || 0,
          prediction: selectedAnalysis.dailySpendingEstimatedEom || 0,
        },
        categoryBreakdown: [],
      };
      console.log("aiAnalysis (selectedAnalysis) 결과:", result); // 디버깅 로그
      return result;
    }

    // 새로운 분석 생성
    const totalBudget =
      parseFloat(analysisResult?.budgetUsage?.totalBudget) || 0;
    const spendingRate = (totalAmount / totalBudget) * 100;
    const previousMonthAmount = totalAmount * 0.85; // 이전 달 대비 가정
    const changeRate =
      ((totalAmount - previousMonthAmount) / previousMonthAmount) * 100;

    const insights = [];
    const recommendations = [];
    const warnings = [];

    // 지출 분석
    if (spendingRate > 90) {
      warnings.push({
        type: "budget",
        title: "예산 초과 위험",
        message: `이번 달 예산의 ${spendingRate.toFixed(
          1
        )}%를 사용했습니다. 예산 관리가 필요해 보입니다.`,
        severity: "high",
      });
    } else if (spendingRate > 70) {
      warnings.push({
        type: "budget",
        title: "예산 사용량 주의",
        message: `현재 예산의 ${spendingRate.toFixed(
          1
        )}%를 사용했습니다. 남은 기간 지출에 주의하세요.`,
        severity: "medium",
      });
    }

    // 카테고리별 분석
    analytics.categoryBreakdown.forEach((cat) => {
      if (cat.percentage > 40) {
        insights.push({
          type: "category",
          title: `${cat.label} 지출 집중`,
          message: `전체 지출의 ${cat.percentage.toFixed(1)}%가 ${
            cat.label
          }에 집중되어 있습니다.`,
          icon: AlertTriangle,
          color: "text-primary-600",
        });
      }
    });

    // 변화율 분석
    if (changeRate > 20) {
      insights.push({
        type: "trend",
        title: "지출 증가 추세",
        message: `이전 달 대비 ${changeRate.toFixed(1)}% 지출이 증가했습니다.`,
        icon: TrendingUp,
        color: "text-red-600",
      });
    } else if (changeRate < -10) {
      insights.push({
        type: "trend",
        title: "지출 절약 성공",
        message: `이전 달 대비 ${Math.abs(changeRate).toFixed(
          1
        )}% 지출을 절약했습니다.`,
        icon: TrendingDown,
        color: "text-green-600",
      });
    }

    // 추천사항 생성
    if (
      analytics.categoryBreakdown[0]?.category === "food" &&
      analytics.categoryBreakdown[0]?.percentage > 35
    ) {
      recommendations.push({
        title: "식비 절약 팁",
        message:
          "집에서 요리하는 횟수를 늘리고, 배달음식 대신 직접 조리해보세요.",
        impact: "월 15-20만원 절약 가능",
        difficulty: "쉬움",
      });
    }

    if (
      analytics.categoryBreakdown.find(
        (cat) => cat.category === "entertainment"
      )?.percentage > 25
    ) {
      recommendations.push({
        title: "유흥비 관리",
        message: "월 유흥비 한도를 설정하고, 무료 문화활동을 활용해보세요.",
        impact: "월 10-15만원 절약 가능",
        difficulty: "보통",
      });
    }

    recommendations.push({
      title: "자동 저축 설정",
      message: "매월 고정 금액을 자동으로 저축하는 습관을 만들어보세요.",
      impact: "연간 목표 달성률 40% 향상",
      difficulty: "쉬움",
    });

    return {
      insights,
      recommendations,
      warnings,
      summary: {
        totalAmount,
        spendingRate,
        changeRate,
        topCategory: analytics.categoryBreakdown[0]?.label || "없음",
        avgDaily: totalAmount / new Date().getDate(),
        prediction:
          totalAmount *
          (new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + 1,
            0
          ).getDate() /
            new Date().getDate()),
      },
    };
  };

  const aiAnalysis = (() => {
    const source = selectedAnalysis || analysisResult;
    console.log("aiAnalysis 계산 중 - source:", source); // 디버깅 로그
    if (!source) return null;

    // If it's a saved analysis (ExpenseAnalysisHistoryDTO)
    if (selectedAnalysis) {
      const result = {
        historyId: source.historyId,
        feedback: source.feedback, // Use feedback from selectedAnalysis
        insights: [
          {
            type: "mainFinding",
            title: source.mainFinding || "분석 결과 없음",
            message: "",
            icon: Bot,
            color: "text-blue-500",
          },
        ],
        recommendations: [
          {
            title: source.suggestionTitle || "제안 없음",
            message: source.suggestionDescription || "",
            impact: source.suggestionEffect || "",
            difficulty: source.suggestionDifficulty || "보통",
          },
        ],
        warnings: [],
        summary: {
          totalAmount: source.budgetUsageCurrentSpending || 0,
          spendingRate: source.budgetUsagePercentage || 0,
          totalBudget: source.budgetUsageTotalBudget || 0,
          changeRate: 0,
          topCategory: source.mainFinding?.split(" ")[0] || "없음",
          avgDaily: source.dailySpendingAverageSoFar || 0,
          prediction: source.dailySpendingEstimatedEom || 0,
        },
        categoryBreakdown: [],
      };
      console.log("aiAnalysis (selectedAnalysis) 결과:", result); // 디버깅 로그
      return result;
    } else {
      // If it's a new analysis (AnalyzeExpenseResponseDTO)
      const analysisResultData = source.analysisResult;
      const budgetUsageData = source.budgetUsage;
      const dailySpendingData = source.dailySpending;
      const categoryDetailsData = source.categoryDetails;

      const result = {
        historyId: source.historyId,
        feedback: analysisResult?.feedback, // analysisResult의 feedback을 직접 참조
        insights: [
          {
            type: "mainFinding",
            title: analysisResultData?.mainFinding || "분석 결과 없음",
            message: "",
            icon: Bot,
            color: "text-blue-500",
          },
        ],
        recommendations: [
          {
            title: analysisResultData?.suggestion?.title || "제안 없음",
            message: analysisResultData?.suggestion?.description || "",
            impact: analysisResultData?.suggestion?.effect || "",
            difficulty: analysisResultData?.suggestion?.difficulty || "보통",
          },
        ],
        warnings: [],
        summary: {
          totalAmount: budgetUsageData?.currentSpending || 0,
          spendingRate: budgetUsageData?.percentage || 0,
          totalBudget: budgetUsageData?.totalBudget || 0,
          changeRate: 0,
          topCategory: categoryDetailsData?.[0]?.category || "없음",
          avgDaily: dailySpendingData?.averageSoFar || 0,
          prediction: dailySpendingData?.estimatedEom || 0,
        },
        categoryBreakdown:
          categoryDetailsData?.map((cat) => ({
            category: cat.category,
            label:
              categoryData.find((c) => c.category === cat.category)?.label ||
              cat.category,
            amount: cat.totalAmount,
            count: cat.transactionCount,
            percentage: cat.percentage,
            color:
              categoryData.find((c) => c.category === cat.category)?.color ||
              "#df6d14",
            name:
              categoryData.find((c) => c.category === cat.category)?.label ||
              cat.category,
            value: cat.totalAmount,
          })) || [],
      };
      console.log("aiAnalysis (analysisResult) 결과:", result); // 디버깅 로그
      return result;
    }
  })();

  // 메인 지출 목록 페이징 핸들러
  const handlePageChange = async (newPage: number) => {
    // newPage는 1-based이므로 0-based로 변환
    const zeroBasedPage = newPage - 1;

    // 이미 현재 페이지면 리턴
    if (zeroBasedPage === currentPage) {
      return;
    }

    if (
      zeroBasedPage >= 0 &&
      zeroBasedPage < totalPages &&
      zeroBasedPage !== currentPage
    ) {
      setCurrentPage(zeroBasedPage);
      setPageLoading(true);

      try {
        const expenseParams = {
          mode,
          year: currentMonth.getFullYear(),
          month: currentMonth.getMonth() + 1,
          page: zeroBasedPage,
          size: 10,
          groupId: mode === "group" ? currentGroup?.id : null,
          category: categoryFilter === "all" ? undefined : categoryFilter,
          search: searchTerm || undefined,
        };
        await loadCombinedExpenses(expenseParams);
      } catch (error) {
        console.error("페이지 로드 실패:", error);
      } finally {
        setPageLoading(false);
      }
    }
  };

  // 분담금 목록 페이징 핸들러
  const handleSharePageChange = async (newPage: number) => {
    // newPage는 1-based이므로 0-based로 변환
    const zeroBasedPage = newPage - 1;

    setSharePageLoading(true);

    try {
      await loadGroupSharesPaginated({
        year: currentMonth.getFullYear(),
        month: currentMonth.getMonth() + 1,
        groupId: currentGroup?.id,
        page: zeroBasedPage,
        size: 5,
        category: categoryFilter === "all" ? undefined : categoryFilter,
        search: searchTerm || undefined,
      });
    } finally {
      setSharePageLoading(false);
    }
  };

  // AI 분석 내역 페이징 핸들러
  const handleAiAnalysisPageChange = async (newPage: number) => {
    const zeroBasedPage = newPage - 1;
    if (
      zeroBasedPage >= 0 &&
      zeroBasedPage < aiAnalysesTotalPages &&
      zeroBasedPage !== aiAnalysesCurrentPage
    ) {
      setAiAnalysesCurrentPage(zeroBasedPage);
      // Optionally show loading state for AI analyses
      // setPageLoading(true); // If you want a loading spinner for AI analyses

      try {
        await loadSavedAnalysesPaginated({
          page: zeroBasedPage,
          size: 10, // Assuming 10 items per page for AI analyses
          sortBy: "createdAt", // Default sort
          sortDirection: "desc", // Default sort
        });
      } catch (error) {
        console.error("AI 분석 내역 페이지 로드 실패:", error);
      } finally {
        // setPageLoading(false); // If you want a loading spinner for AI analyses
      }
    }
  };

  const renderActiveShape = (props) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? "start" : "end";

    return (
      <g>
        <text
          x={cx}
          y={cy}
          dy={-10}
          textAnchor="middle"
          fill="#333"
          style={{ fontSize: "16px", fontWeight: "bold" }}
        >
          {payload.name}
        </text>
        <text
          x={cx}
          y={cy}
          dy={15}
          textAnchor="middle"
          fill="#666"
          style={{ fontSize: "14px" }}
        >
          {formatCurrency(value)}
        </text>
        <text
          x={cx}
          y={cy}
          dy={40}
          textAnchor="middle"
          fill={fill}
          style={{ fontSize: "18px", fontWeight: "bold" }}
        >
          {`${(percent * 100).toFixed(1)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5} // 활성 조각을 더 크게
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          stroke="#fff"
          strokeWidth={2}
        />
      </g>
    );
  };

  const categoryCount = allCategoryData.length;
  const dynamicHeight = categoryCount <= 3 ? 280 : Math.max(320, categoryCount * 60 + 200);
  const chartHeight = dynamicHeight - 50; // 여백 비율 조정

  if (
    loading &&
    combinedExpenses.length === 0 &&
    !pageLoading &&
    !sharePageLoading
  ) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">지출 내역을 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
    {/* Header */}
    <div className="flex flex-col xl:flex-row xl:items-center justify-between space-y-4 xl:space-y-0">
      <div>
        <div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4">
          <div className="lg:w-48">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-500">
              {mode === "personal" ? (
                "내 가계부"
              ) : (
                <div className="space-y-1">
                  <div className="text-base font-medium text-gray-500">
                    공동 가계부
                  </div>
                  <div
                    className="text-2xl lg:text-3xl font-bold text-primary-600 truncate"
                    title={currentGroup?.name || "그룹 선택 필요"}
                  >
                    {currentGroup?.name || "그룹 선택 필요"}
                  </div>
                </div>
              )}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePreviousMonth}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            <h2 className="text-sm sm:text-lg font-medium text-gray-700 min-w-[160px] sm:min-w-[200px] text-center px-2 whitespace-nowrap">
              {format(currentMonth, "yyyy년 M월", {locale: ko})}
            </h2>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNextMonth}
              className="p-2 rounded-lg hover:bg-gray-100"
              disabled={
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1,
                  1
                ) > new Date()
              }
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="지출 검색..."
            className="pl-10 pr-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors font-medium text-gray-700 placeholder-gray-400 shadow-sm w-full sm:w-auto"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <motion.button
            className="flex items-center space-x-3 pl-4 pr-4 py-3 border border-gray-200 rounded-2xl text-sm bg-white hover:bg-gray-50 transition-colors font-medium text-gray-700 cursor-pointer shadow-md hover:shadow-lg w-full sm:w-auto whitespace-nowrap"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="flex-1 text-left">
              {categories.find((cat) => cat.value === categoryFilter)?.label}
            </span>
              <motion.svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: showCategoryDropdown ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </motion.svg>
            </motion.button>

            {/* Dropdown은 그대로 유지 */}
            <AnimatePresence>
              {showCategoryDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowCategoryDropdown(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-lg border border-gray-200 py-2 z-20"
                  >
                    {categories.map((cat, index) => (
                      <motion.button
                        key={cat.value}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex items-center space-x-3 ${
                          categoryFilter === cat.value
                            ? "bg-primary-50 text-primary-600 font-medium"
                            : "text-gray-700"
                        }`}
                        whileHover={{ x: 4 }}
                        onClick={() => {
                          setCategoryFilter(cat.value);
                          setShowCategoryDropdown(false);
                        }}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            cat.value === "all"
                              ? "bg-gray-400"
                              : cat.value === "FOOD"
                              ? "bg-red-400"
                              : cat.value === "UTILITIES"
                              ? "bg-accent-400"
                              : cat.value === "TRANSPORT"
                              ? "bg-blue-400"
                              : cat.value === "SHOPPING"
                              ? "bg-green-400"
                              : cat.value === "ENTERTAINMENT"
                              ? "bg-yellow-400"
                              : "bg-purple-400"
                          }`}
                        />
                        <span>{cat.label}</span>
                        {categoryFilter === cat.value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto"
                          >
                            <svg
                              className="w-4 h-4 text-primary-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="flex space-x-4">
            {/* AI Analysis Button */}
            <motion.button
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-medium transition-colors shadow-md hover:shadow-lg whitespace-nowrap ${
                mode === "group"
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-primary-500 text-white hover:bg-primary-600"
              }`}
              whileHover={mode === "personal" ? { scale: 1.02 } : {}}
              whileTap={mode === "personal" ? { scale: 0.98 } : {}}
              onClick={handleAnalysis}
              disabled={mode === "group" || analysisLoading}
              title={
                mode === "group"
                  ? "AI 분석은 개인 가계부에서만 사용할 수 있습니다."
                  : "AI 지출 분석"
              }
            >
              {analysisLoading && mode === "personal" ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Bot className="w-5 h-5" />
              )}
              <span>
                {analysisLoading && mode === "personal"
                  ? "분석 중..."
                  : "AI 분석"}
              </span>
            </motion.button>

            {/* Add Expense Button */}
            <motion.button
              className="flex items-center space-x-2 px-6 py-3 bg-accent-500 text-white rounded-2xl font-medium hover:bg-accent-600 transition-colors shadow-md hover:shadow-lg whitespace-nowrap"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedExpense(null);
                setShowExpenseModal(true);
              }}
            >
              <Plus className="w-5 h-5" />
              <span>지출 추가</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Analytics Cards - 버튼식 슬라이더 */}
      {(() => {
        // 최대 지출 내역 찾기 (analytics 카드 생성 전에 추가)
        const maxExpense = summary?.maxExpenseId
          ? {
              id: summary.maxExpenseId,
              title: summary.maxExpenseTitle,
              amount: summary.maxAmount || analytics.maxAmount,
            }
          : combinedExpenses.reduce((max, expense) => {
              return expense.amount > (max?.amount || 0) ? expense : max;
            }, null);
        // 카드 데이터 준비 (동일)
        const analyticsCards = [
          {
            id: "total",
            icon: Receipt,
            bgColor: "bg-primary-100",
            textColor: "text-primary-600",
            badgeText: `${summary?.totalCount || filteredExpenses.length}건`,
            title: "총 지출",
            value: formatCurrency(analytics.totalAmount),
            extra: (() => {
              const budget =
                mode === "personal"
                  ? user?.monthlyBudget
                  : currentGroup?.monthlyBudget;
              if (budget) {
                const isOverBudget = analytics.totalAmount > budget;
                return (
                  <div
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      isOverBudget
                        ? "text-red-600 bg-red-50 border border-red-200"
                        : "text-blue-600 bg-blue-50 border border-blue-200"
                    }`}
                  >
                    예산: {formatCurrency(budget)}
                  </div>
                );
              }
              return null;
            })(),
          },
          {
            id: "average",
            icon: BarChart3,
            bgColor: "bg-primary-100",
            textColor: "text-primary-600",
            badgeIcon: TrendingUp,
            badgeIconColor: "text-green-500",
            title: "평균 지출",
            value: formatCurrency(analytics.avgAmount),
          },
          {
            id: "max",
            icon: TrendingUp,
            bgColor: "bg-primary-100",
            textColor: "text-primary-600",
            badgeText: maxExpense?.title
              ? maxExpense.title.substring(0, 8) + "..."
              : "최고",
            badgeTextColor: "text-green-500",
            title: "최대 지출",
            value: formatCurrency(analytics.maxAmount),
            extra: maxExpense?.title ? (
              <div
                className="text-xs text-gray-500 truncate max-w-24"
                title={maxExpense.title}
              >
                {maxExpense.title}
              </div>
            ) : null,
          },
          {
            id: "category",
            icon: PieChart,
            bgColor: "bg-primary-100",
            textColor: "text-primary-600",
            badgeText:
              analytics.categoryBreakdown.length > 0
                ? `${analytics.categoryBreakdown[0].percentage.toFixed(1)}%`
                : "0%",
            badgeTextColor:
              analytics.categoryBreakdown[0]?.color || "text-gray-500",
            title: "주요 카테고리",
            value:
              analytics.categoryBreakdown.length > 0
                ? analytics.categoryBreakdown[0].label
                : "데이터 없음",
          },
        ];

        // 그룹 분담금 카드 추가 (개인 모드)
        if (mode === "personal" && totalGroupShares > 0) {
          analyticsCards.push({
            id: "groupShare",
            icon: Users,
            bgColor: "bg-blue-100",
            textColor: "text-blue-600",
            badgeText: `${groupSummary.length}개 그룹`,
            badgeTextColor: "text-blue-500",
            title: "그룹 분담금",
            value: formatCurrency(totalGroupShares),
          });
        }

        const cardsPerPage = 4;
        const totalPages = Math.ceil(analyticsCards.length / cardsPerPage);
        const canGoPrev = currentCardIndex > 0;
        const canGoNext = currentCardIndex < totalPages - 1;

        const handlePrev = () => {
          if (canGoPrev) {
            setCurrentCardIndex(currentCardIndex - 1);
          }
        };

        const handleNext = () => {
          if (canGoNext) {
            setCurrentCardIndex(currentCardIndex + 1);
          }
        };

        const visibleCards = analyticsCards.slice(
          currentCardIndex * cardsPerPage,
          (currentCardIndex + 1) * cardsPerPage
        );

        return (
          <div className="relative">
            {/* 좌측 버튼 */}
            {canGoPrev && (
              <motion.button
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePrev}
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </motion.button>
            )}

            {/* 우측 버튼 */}
            {canGoNext && (
              <motion.button
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNext}
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </motion.button>
            )}

            {/* 카드 컨테이너 */}
            <div>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                key={currentCardIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {visibleCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-8 h-8 rounded-lg ${card.bgColor} flex items-center justify-center ${card.textColor}`}
                      >
                        <card.icon className="w-4 h-4" />
                      </div>
                      {card.badgeIcon ? (
                        <card.badgeIcon
                          className={`w-3 h-3 ${card.badgeIconColor}`}
                        />
                      ) : card.badgeText ? (
                        <div
                          className={`text-xs font-medium ${
                            card.badgeTextColor || "text-gray-900"
                          }`}
                          style={
                            card.badgeTextColor?.startsWith("#")
                              ? { color: card.badgeTextColor }
                              : {}
                          }
                        >
                          {card.badgeText}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-xs font-medium text-gray-700 mb-1">
                      {card.title}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-gray-900">
                        {card.value}
                      </div>
                      {card.extra}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* 페이지 인디케이터 (5개 이상일 때만) */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2 mt-4">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentCardIndex
                        ? "bg-primary-600"
                        : "bg-gray-300"
                    }`}
                    onClick={() => setCurrentCardIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          style={{ minHeight: `${dynamicHeight}px` }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            카테고리별 지출
          </h3>
          {allCategoryData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={allCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      onMouseEnter={(_, index) => setActiveIndex(index)}
                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      {allCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 pr-4">
                {analytics.categoryBreakdown.map((cat, index) => (
                  <motion.div
                    key={cat.category}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                      activeIndex === index
                        ? "bg-gray-100 shadow-md"
                        : "bg-white"
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                    whileHover={{ scale: 1.03 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        ></div>
                        <span className="text-sm font-medium text-gray-800">
                          {cat.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(cat.amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {cat.percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{
                          backgroundColor: cat.color,
                          width: `${cat.percentage}%`,
                        }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500">데이터가 없습니다</p>
            </div>
          )}
        </motion.div>

        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          style={{ minHeight: `${dynamicHeight}px` }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            월별 지출 추이
            {categoryFilter !== "all" && (
              <span className="text-sm font-normal text-gray-500">
                ({categories.find((c) => c.value === categoryFilter)?.label})
              </span>
            )}
          </h3>
          <div style={{ height: `${chartHeight}px` }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => {
                    if (value >= 10000) {
                      return `${Math.round(value / 10000)}만`;
                    } else {
                      return `${Math.round(value / 1000)}천`;
                    }
                  }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length > 0) {
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-medium">{label}</p>
                          {payload.map((entry, index) => {
                            const categoryInfo = categoryData.find(
                              (cat) => cat.category === entry.dataKey
                            );
                            return (
                              <p
                                key={index}
                                className="text-sm"
                                style={{ color: entry.color }}
                              >
                                {categoryInfo?.label || "기타"}:{" "}
                                {new Intl.NumberFormat("ko-KR", {
                                  style: "currency",
                                  currency: "KRW",
                                }).format(entry.value)}
                              </p>
                            );
                          })}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {categoryFilter === "all" ? (
                  categoryData.map((cat) => (
                    <Bar
                      key={cat.category}
                      dataKey={cat.category}
                      stackId="expense"
                      fill={cat.color}
                    />
                  ))
                ) : (
                  <Bar
                    dataKey={categoryFilter}
                    fill={
                      categoryData.find(
                        (cat) => cat.category === categoryFilter
                      )?.color || "#df6d14"
                    }
                    radius={[4, 4, 0, 0]}
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center mt-3">
            {(categoryFilter === "all"
              ? categoryData
              : categoryData.filter((cat) => cat.category === categoryFilter)
            ).map((cat) => (
              <div key={cat.category} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm text-gray-600">{cat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {mode === "personal" && groupSummary.length > 0 && (
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="p-4 border-b-2 border-primary-600 bg-primary-50 rounded-t-2xl">
            <h3 className="text-lg font-semibold text-primary-600">
              그룹별 분담금 현황
            </h3>
            <p className="text-sm text-primary-500 mt-1">
              이번 달 참여 중인 그룹에서의 분담금입니다
            </p>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <div className="text-2xl font-bold text-blue-600">
                총 분담금: {formatCurrency(totalGroupShares)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {groupSummary.length}개 그룹에서{" "}
                {groupSummary.reduce(
                  (sum, group) => sum + group.expenseCount,
                  0
                )}
                건의 지출
              </div>
            </div>

            <div className="space-y-4">
              {groupSummary.map((group) => (
                <div
                  key={group.groupId}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {group.groupName}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{group.expenseCount}건의 지출</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {formatCurrency(group.myShareAmount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      전체: {formatCurrency(group.totalAmount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-bold text-gray-700 mb-3">
                그룹별 분담 비율
              </h4>
              <div className="space-y-2">
                {groupSummary.map((group) => (
                  <div
                    key={group.groupId}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600">
                      {group.groupName}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (group.myShareAmount / totalGroupShares) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">
                        {(
                          (group.myShareAmount / totalGroupShares) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Personal Share in Group Mode */}
      {mode === "group" &&
        currentGroup &&
        (summary?.myTotalShareAmount > 0 || groupShares.length > 0) && (
          <motion.div
            className="relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {/* 분담금 페이징 로딩 오버레이 추가 */}
            {sharePageLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-2xl">
                <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            <div className="p-4 border-b-2 border-primary-600 bg-primary-50 rounded-t-2xl">
              <h3 className="text-lg font-semibold text-primary-600">
                내 분담금
              </h3>
              <p className="text-sm text-primary-500 mt-1">
                그룹 지출에서 내가 부담해야 할 금액입니다
              </p>
            </div>

            <div className="p-6">
              {(() => {
                const currentGroupShares = groupShares;
                const totalShare =
                  groupSharesSummary?.myTotalShareAmount ||
                  currentGroupShares.reduce(
                    (sum, share) => sum + share.myShareAmount,
                    0
                  );
                const shareCount =
                  groupSharesSummary?.myShareCount || currentGroupShares.length;

                return (
                  <>
                    <div className="mb-6">
                      <div className="text-2xl font-bold text-primary-600">
                        총 분담금: {formatCurrency(totalShare)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {shareCount}건의 그룹 지출
                      </div>
                    </div>

                    <div className="space-y-4">
                      {currentGroupShares.map((share) => (
                        <div
                          key={share.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{
                                backgroundColor:
                                  categoryData.find(
                                    (cat) => cat.category === share.category
                                  )?.color + "20",
                              }}
                            >
                              <Receipt
                                className="w-5 h-5"
                                style={{
                                  color:
                                    categoryData.find(
                                      (cat) => cat.category === share.category
                                    )?.color || "#df6d14",
                                }}
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {share.title}
                              </h4>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span>
                                  {
                                    categoryData.find(
                                      (cat) => cat.category === share.category
                                    )?.label
                                  }
                                </span>
                                <span>•</span>
                                <span>
                                  전체: {formatCurrency(share.amount)}
                                </span>
                                <span>•</span>
                                <span>
                                  {share.splitType === "EQUAL"
                                    ? "균등분할"
                                    : share.splitType === "SPECIFIC"
                                      ? "지정분할"
                                      : "사용자정의"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary-600">
                              {formatCurrency(share.myShareAmount)}
                            </div>
                            <div className="text-xs text-gray-500">
                              (
                              {(
                                (share.myShareAmount / share.amount) *
                                100
                              ).toFixed(1)}
                              %)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
            {/* 페이징 컴포넌트 */}
            <div className="p-4 border-gray-200">
              <Pagination
                currentPage={groupSharesCurrentPage + 1}
                totalPages={groupSharesTotalPages}
                onPageChange={handleSharePageChange}
              />
            </div>
          </motion.div>
        )}

      {/* Expenses List with Tabs */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "expenses"
                  ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("expenses")}
            >
              지출 내역
            </button>
            {mode === "personal" && (
              <button
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "analyses"
                    ? "text-accent-600 border-b-2 border-accent-600 bg-accent-50"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("analyses")}
              >
                AI 분석 내역{" "}
                {aiAnalysesTotalElements > 0 && (
                  <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-600 rounded-full text-xs">
                    {aiAnalysesTotalElements}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {activeTab === "expenses" ? (
          <>
            {/* 페이징 로딩시에는 반투명 오버레이 */}
            <div className="relative">
              {pageLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10 rounded-2xl">
                  <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              {filteredExpenses.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredExpenses.map((expense) => {
                    const uniqueKey = expense.id
                      ? `expense-${expense.id}`
                      : `temp-${expense.title}-${expense.date}`;
                    return (
                      <motion.div
                        key={uniqueKey}
                        className="p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
                        whileHover={{ x: 5 }}
                        onClick={() => handleExpenseClick(expense)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110`}
                              style={{
                                backgroundColor:
                                  categoryData.find(
                                    (cat) => cat.category === expense.category
                                  )?.color + "20",
                              }}
                            >
                              {mode === "personal" && expense.groupId ? (
                                <Users className="w-6 h-6 text-blue-600" />
                              ) : (
                                <Receipt
                                  className="w-6 h-6"
                                  style={{
                                    color:
                                      categoryData.find(
                                        (cat) =>
                                          cat.category === expense.category
                                      )?.color || "#df6d14",
                                  }}
                                />
                              )}
                            </div>
                            <div>
                              <h4 className="font-middle text-gray-900 group-hover:text-[#df6d14] transition-colors">
                                {expense.title}
                              </h4>
                              <div className="flex items-center space-x-3 text-sm text-gray-500">
                                <span>
                                  {
                                    categoryData.find(
                                      (cat) => cat.category === expense.category
                                    )?.label
                                  }
                                </span>
                                {mode === "personal" &&
                                  expense.groupId &&
                                  expense.groupName && (
                                    <>
                                      <span>•</span>
                                      <span className="text-blue-600">
                                        {expense.groupName}
                                      </span>
                                    </>
                                  )}
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    {format(
                                      new Date(expense.date),
                                      "M월 d일 (E)",
                                      { locale: ko }
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {expense.hasReceipt && (
                              <motion.button
                                className="p-2 bg-gray-100 hover:bg-blue-100 rounded-lg transition-colors group"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => handleReceiptClick(expense, e)}
                                title="영수증 보기"
                              >
                                <Image className="w-4 h-4 text-gray-600 group-hover:text-blue-600" />
                              </motion.button>
                            )}

                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                {formatCurrency(
                                  expense.myShareAmount || expense.amount
                                )}
                              </p>
                              {mode === "personal" && expense.groupId && (
                                <p className="text-xs text-blue-600">
                                  그룹 지출
                                </p>
                              )}
                              {expense.memo && (
                                <p className="text-sm text-gray-500 truncate max-w-32">
                                  {expense.memo}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Receipt className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    지출 내역이 없습니다
                  </h3>
                  <p className="text-gray-600 mb-6">
                    새로운 지출을 추가해보세요!
                  </p>
                  <motion.button
                    className="px-6 py-3 bg-accent-500 text-white rounded-xl font-medium hover:bg-accent-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowExpenseModal(true)}
                  >
                    첫 지출 추가하기
                  </motion.button>
                </div>
              )}
            </div>

            {/* 페이징 컴포넌트 */}
            <Pagination
              currentPage={currentPage + 1}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {analysisHistoryLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">AI 분석 내역을 불러오는 중입니다...</p>
        </div>
      ) : savedAnalyses.length > 0 ? (
                savedAnalyses.map((analysis) => (
                  <motion.div
                    key={analysis.id}
                    className="p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
                    whileHover={{ x: 5 }}
                    onClick={() => {
                      setSelectedAnalysis(analysis);
                      setShowAnalysis(true);
                      console.log("Selected Analysis from History:", analysis); // 디버깅 로그
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center transition-all group-hover:scale-110">
                          <Sparkles className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                            {analysis.suggestionTitle}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{analysis.createdAt.split("T")[0]}</span>
                            <span>•</span>
                            <span>
                              {analysis.budgetUsagePercentage.toFixed(1)}% 사용
                            </span>
                          </div>{" "}
                        </div>{" "}
                      </div>{" "}
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mt-1">예산</div>
                        <p className="text-lg font-bold text-purple-600">
                          {analysis.budgetUsagePercentage.toFixed(1)}% 사용
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Bot className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    AI 분석 내역이 없습니다
                  </h3>
                  <p className="text-gray-600 mb-6">
                    AI 분석을 실행하고 결과를 저장해보세요!
                  </p>
                  <motion.button
                    className="px-6 py-3 bg-accent-600 text-white rounded-xl font-medium hover:bg-accent-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAnalysis}
                  >
                    AI 분석 실행하기
                  </motion.button>
                </div>
              )}
            </div>
            {/* 페이징 컴포넌트 */}
            <Pagination
              currentPage={aiAnalysesCurrentPage + 1}
              totalPages={aiAnalysesTotalPages}
              onPageChange={handleAiAnalysisPageChange}
            />
          </>
        )}
      </motion.div>

      {/* AI Analysis Modal */}
      <AnimatePresence>
        {showAnalysis && (
          <Portal>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-400 text-white p-6 flex-shrink-0 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-100">
                          AI 지출 분석 결과
                        </h2>
                      </div>
                      <p className="text-purple-100">
                        {analysisResult
                          ? `${format(currentMonth, "yyyy년 M월", {
                              locale: ko,
                            })} 지출 패턴 분석 결과`
                          : "분석 결과"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAnalysis(false)}
                    className="w-10 h-10 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center hover:bg-opacity-30 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              {aiAnalysis ? (
                <div className="p-6 overflow-y-auto flex-1">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-600 font-medium">
                          예산 사용률
                        </span>
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-800">
                        {aiAnalysis.summary.spendingRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-blue-600">
                        {formatCurrency(aiAnalysis.summary.totalAmount)} /{" "}
                        {formatCurrency(aiAnalysis.summary.totalBudget)}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-green-600 font-medium">
                          일평균 지출
                        </span>
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-800">
                        {formatCurrency(aiAnalysis.summary.avgDaily)}
                      </div>
                      <div className="text-sm text-green-600">
                        현재까지 평균
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-600 font-medium">
                          월말 예상
                        </span>
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-purple-800">
                        {formatCurrency(aiAnalysis.summary.prediction)}
                      </div>
                      <div className="text-sm text-purple-600">
                        현재 패턴 기준
                      </div>
                    </div>
                  </div>

                  {/* Warnings */}
                  {aiAnalysis.warnings.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <AlertTriangle className="w-5 h-5 text-primary-500 mr-2" />
                        주의사항
                      </h3>
                      <div className="space-y-3">
                        {aiAnalysis.warnings.map((warning, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-xl border-l-4 ${
                              warning.severity === "high"
                                ? "bg-red-50 border-red-500"
                                : "bg-primary-50 border-primary-500"
                            }`}
                          >
                            <h4
                              className={`font-semibold ${
                                warning.severity === "high"
                                  ? "text-red-800"
                                  : "text-primary-800"
                              }`}
                            >
                              {warning.title}
                            </h4>
                            <p
                              className={`text-sm mt-1 ${
                                warning.severity === "high"
                                  ? "text-red-600"
                                  : "text-primary-600"
                              }`}
                            >
                              {warning.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Insights */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Bot className="w-5 h-5 text-blue-500 mr-2" />
                      분석 결과
                    </h3>
                    <div className="space-y-3">
                      {aiAnalysis.insights.map((insight, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl"
                        >
                          <insight.icon
                            className={`w-5 h-5 mt-0.5 ${insight.color}`}
                          />
                          <div className="flex-1">
                            <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-strong:text-gray-800 prose-li:text-gray-600 prose-table:border-gray-300 prose-th:bg-gray-100 prose-td:border-gray-200 prose-blockquote:border-gray-300 prose-code:text-gray-800 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-a:text-blue-600">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {`**${insight.title}**${
                                  insight.message
                                    ? `\n\n${insight.message}`
                                    : ""
                                }`}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      개선 제안
                    </h3>
                    <div className="space-y-4">
                      {aiAnalysis.recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className="p-4 bg-green-50 rounded-xl border border-green-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="prose prose-green max-w-none prose-headings:text-green-800 prose-p:text-green-700 prose-strong:text-green-800 prose-li:text-green-700 prose-table:border-green-300 prose-th:bg-green-100 prose-td:border-green-200 prose-blockquote:border-green-300 prose-code:text-green-800 prose-code:bg-green-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-a:text-green-600">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {`### ${rec.title}\n\n${rec.message}`}
                                </ReactMarkdown>
                              </div>
                              <hr className="my-4 border-green-200" />
                              <div className="flex items-center space-x-4 text-xs mt-3">
                                <div className="flex items-center space-x-1">
                                  <span className="text-green-600 font-medium">
                                    예상 효과:
                                  </span>
                                  <span className="text-green-800">
                                    {rec.impact}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <span className="text-green-600 font-medium">
                                    난이도:
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      rec.difficulty === "쉬움"
                                        ? "bg-green-100 text-green-700"
                                        : rec.difficulty === "보통"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {rec.difficulty}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Category Analysis */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      카테고리별 상세 분석
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analytics.categoryBreakdown.slice(0, 4).map((cat) => (
                        <div
                          key={cat.category}
                          className="p-4 border border-gray-200 rounded-xl"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: cat.color }}
                              />
                              <span className="font-medium text-gray-900">
                                {cat.label}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-600">
                              {cat.percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="text-lg font-bold text-gray-900 mb-1">
                            {formatCurrency(cat.amount)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {cat.count}건의 지출
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                backgroundColor: cat.color,
                                width: `${cat.percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-600">
                  <RefreshCw className="w-12 h-12 animate-spin text-primary-600 mb-4" />
                  <p className="text-lg font-medium">
                    AI 분석 결과를 불러오는 중입니다...
                  </p>
                  <p className="text-sm mt-2">잠시만 기다려 주세요.</p>
                </div>
              )}

              {/* Modal Footer */}
              <div className="bg-gray-50 p-6 border-t border-gray-200 flex-shrink-0 rounded-b-3xl">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    * 이 분석은 AI가 생성한 것으로 참고용입니다.
                  </div>
                  <div className="flex space-x-3">
                    {aiAnalysis?.historyId && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`p-2 rounded-full ${
                            aiAnalysis.feedback === "UP"
                              ? "bg-green-100 text-green-600"
                              : "hover:bg-gray-100 text-gray-500"
                          }`}
                          onClick={() => {
                            console.log(
                              "UP 버튼 클릭됨. aiAnalysis.historyId:",
                              aiAnalysis.historyId,
                              "aiAnalysis.feedback:",
                              aiAnalysis.feedback
                            ); // 디버깅 로그
                            handleFeedback(aiAnalysis.historyId, "up");
                          }}
                        >
                          <ThumbsUp className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`p-2 rounded-full ${
                            aiAnalysis.feedback === "DOWN"
                              ? "bg-red-100 text-red-600"
                              : "hover:bg-gray-100 text-gray-500"
                          }`}
                          onClick={() => {
                            console.log(
                              "DOWN 버튼 클릭됨. aiAnalysis.historyId:",
                              aiAnalysis.historyId,
                              "aiAnalysis.feedback:",
                              aiAnalysis.feedback
                            ); // 디버깅 로그
                            handleFeedback(aiAnalysis.historyId, "down");
                          }}
                        >
                          <ThumbsDown className="w-5 h-5" />
                        </motion.button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setShowAnalysis(false);
                        setSelectedAnalysis(null);
                      }}
                      className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          </Portal>
        )}
      </AnimatePresence>

      {/* Expense Modal */}
      {showExpenseModal && (
        <ExpenseModal
          expense={selectedExpense}
          onClose={() => {
            setShowExpenseModal(false);
            setSelectedExpense(null);
            refreshCurrentPageData();
          }}
        />
      )}

      {/* Receipt Modal */}
      {showReceiptModal && currentReceiptUrl && (
        <Portal>
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{opacity: 0, scale: 0.8}}
              animate={{opacity: 1, scale: 1}}
              exit={{opacity: 0, scale: 0.8}}
              className="bg-white rounded-2xl max-w-4xl max-h-[90vh] overflow-hidden"
            >
              {/* 모달 헤더 */}
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">영수증</h3>
                <button
                  onClick={() => {
                    setShowReceiptModal(false);
                    setCurrentReceiptUrl(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5"/>
                </button>
              </div>

              {/* 영수증 이미지 */}
              <div className="p-4">
                <img
                  src={currentReceiptUrl}
                  alt="영수증"
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
              </div>
            </motion.div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default ExpensesPage;
