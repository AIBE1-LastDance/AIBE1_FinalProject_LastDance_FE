import React, {useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {Plus, PieChart, BarChart3, TrendingUp, Receipt, Calendar, Filter, Search, Bot, Sparkles, AlertTriangle, CheckCircle, TrendingDown} from 'lucide-react';
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
    Tooltip
} from 'recharts';
import {useAppStore} from '../../store/appStore';
import {useAuthStore} from '../../store/authStore';
import {format, startOfMonth, endOfMonth, isWithinInterval, subMonths} from 'date-fns';
import {ko} from 'date-fns/locale';
import ExpenseModal from './ExpenseModal';

const ExpensesPage: React.FC = () => {
    const {expenses, mode, currentGroup} = useAppStore();
    const {user} = useAuthStore();
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [currentMonth] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [analysisLoading, setAnalysisLoading] = useState(false);

    const filteredExpenses = expenses.filter(expense => {
        const isModeMatch = mode === 'personal' ? !expense.groupId : expense.groupId;
        const isCurrentMonth = isWithinInterval(new Date(expense.date), {
            start: startOfMonth(currentMonth),
            end: endOfMonth(currentMonth)
        });
        const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.memo?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;

        return isModeMatch && isCurrentMonth && matchesSearch && matchesCategory;
    });

    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const avgAmount = filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0;
    const maxAmount = Math.max(...filteredExpenses.map(e => e.amount), 0);

    const categoryData = [
        {category: 'food', label: '식비', color: '#FF6B6B'},
        {category: 'utilities', label: '공과금', color: '#4ECDC4'},
        {category: 'transport', label: '교통비', color: '#45B7D1'},
        {category: 'shopping', label: '쇼핑', color: '#96CEB4'},
        {category: 'entertainment', label: '유흥', color: '#FFEAA7'},
        {category: 'other', label: '기타', color: '#DDA0DD'},
    ];

    // Category breakdown data (전체 데이터, 필터와 무관)
    const allCategoryExpenses = expenses.filter(expense => {
        const isModeMatch = mode === 'personal' ? !expense.groupId : expense.groupId;
        const isCurrentMonth = isWithinInterval(new Date(expense.date), {
            start: startOfMonth(currentMonth),
            end: endOfMonth(currentMonth)
        });
        return isModeMatch && isCurrentMonth;
    });

    const allCategoryData = categoryData.map(cat => {
        const amount = allCategoryExpenses
            .filter(expense => expense.category === cat.category)
            .reduce((sum, expense) => sum + expense.amount, 0);
        return {
            name: cat.label,
            value: amount,
            color: cat.color,
        };
    }).filter(item => item.value > 0);

    // Monthly trend data (카테고리 필터 적용하되 카테고리별 색상 유지)
    const monthlyData = Array.from({length: 6}, (_, i) => {
        const monthDate = subMonths(currentMonth, 5 - i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        const monthExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const isModeMatch = mode === 'personal' ? !expense.groupId : expense.groupId;
            return expenseDate >= monthStart && expenseDate <= monthEnd && isModeMatch;
        });

        const monthData = { month: format(monthDate, 'M월') };
        
        if (categoryFilter === 'all') {
            // 전체 카테고리별로 분리
            categoryData.forEach(cat => {
                const categoryAmount = monthExpenses
                    .filter(expense => expense.category === cat.category)
                    .reduce((sum, expense) => sum + expense.amount, 0);
                monthData[cat.category] = categoryAmount;
            });
        } else {
            // 선택된 카테고리만
            const categoryAmount = monthExpenses
                .filter(expense => expense.category === categoryFilter)
                .reduce((sum, expense) => sum + expense.amount, 0);
            monthData[categoryFilter] = categoryAmount;
        }

        return monthData;
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW',
        }).format(amount);
    };

    const categories = [
        {value: 'all', label: '전체'},
        ...categoryData.map(cat => ({value: cat.category, label: cat.label}))
    ];

    // Analytics data (전체 카테고리 데이터 사용)
    const analytics = {
        totalAmount,
        avgAmount,
        maxAmount,
        totalCount: filteredExpenses.length,
        categoryBreakdown: categoryData.map(cat => {
            const catExpenses = allCategoryExpenses.filter(e => e.category === cat.category);
            const amount = catExpenses.reduce((sum, e) => sum + e.amount, 0);
            const totalAllAmount = allCategoryExpenses.reduce((sum, e) => sum + e.amount, 0);
            return {
                category: cat.category,
                label: cat.label,
                amount,
                count: catExpenses.length,
                percentage: totalAllAmount > 0 ? (amount / totalAllAmount) * 100 : 0,
                color: cat.color,
            };
        }).filter(item => item.amount > 0).sort((a, b) => b.amount - a.amount),
    };

    const handleExpenseClick = (expense) => {
        setSelectedExpense(expense);
        setShowExpenseModal(true);
    };

    // 그룹 모드에서 개인 분담금 계산
    const calculatePersonalShare = () => {
        if (mode !== 'group' || !currentGroup || !user) return null;

        const groupExpenses = allCategoryExpenses.filter(expense => expense.groupId);
        const personalShares = [];

        groupExpenses.forEach(expense => {
            let personalAmount = 0;

            if (expense.splitType === 'equal') {
                // 균등 분할
                personalAmount = expense.amount / currentGroup.members.length;
            } else if (expense.splitType === 'specific' && expense.splitData) {
                // 특정 분할
                personalAmount = expense.splitData[user.id] || 0;
            } else if (expense.splitType === 'custom' && expense.splitData) {
                // 사용자 정의 분할
                personalAmount = expense.splitData[user.id] || 0;
            } else {
                // 기본적으로 균등 분할
                personalAmount = expense.amount / currentGroup.members.length;
            }

            if (personalAmount > 0) {
                personalShares.push({
                    ...expense,
                    personalAmount,
                    percentage: (personalAmount / expense.amount) * 100
                });
            }
        });

        return personalShares;
    };

    const personalShares = calculatePersonalShare();

    // AI 분석 생성 함수
    const generateAIAnalysis = () => {
        setAnalysisLoading(true);
        
        // 실제로는 LLM API를 호출하지만, 여기서는 시뮬레이션
        setTimeout(() => {
            setAnalysisLoading(false);
            setShowAnalysis(true);
        }, 2000);
    };

    // AI 분석 데이터 생성
    const getAIAnalysis = () => {
        const totalBudget = 2000000; // 200만원 예산 가정
        const spendingRate = (totalAmount / totalBudget) * 100;
        const previousMonthAmount = totalAmount * 0.85; // 이전 달 대비 가정
        const changeRate = ((totalAmount - previousMonthAmount) / previousMonthAmount) * 100;
        
        const insights = [];
        const recommendations = [];
        const warnings = [];

        // 지출 분석
        if (spendingRate > 90) {
            warnings.push({
                type: 'budget',
                title: '예산 초과 위험',
                message: `이번 달 예산의 ${spendingRate.toFixed(1)}%를 사용했습니다. 예산 관리가 필요해 보입니다.`,
                severity: 'high'
            });
        } else if (spendingRate > 70) {
            warnings.push({
                type: 'budget',
                title: '예산 사용량 주의',
                message: `현재 예산의 ${spendingRate.toFixed(1)}%를 사용했습니다. 남은 기간 지출에 주의하세요.`,
                severity: 'medium'
            });
        }

        // 카테고리별 분석
        analytics.categoryBreakdown.forEach(cat => {
            if (cat.percentage > 40) {
                insights.push({
                    type: 'category',
                    title: `${cat.label} 지출 집중`,
                    message: `전체 지출의 ${cat.percentage.toFixed(1)}%가 ${cat.label}에 집중되어 있습니다.`,
                    icon: AlertTriangle,
                    color: 'text-orange-600'
                });
            }
        });

        // 변화율 분석
        if (changeRate > 20) {
            insights.push({
                type: 'trend',
                title: '지출 증가 추세',
                message: `이전 달 대비 ${changeRate.toFixed(1)}% 지출이 증가했습니다.`,
                icon: TrendingUp,
                color: 'text-red-600'
            });
        } else if (changeRate < -10) {
            insights.push({
                type: 'trend',
                title: '지출 절약 성공',
                message: `이전 달 대비 ${Math.abs(changeRate).toFixed(1)}% 지출을 절약했습니다.`,
                icon: TrendingDown,
                color: 'text-green-600'
            });
        }

        // 추천사항 생성
        if (analytics.categoryBreakdown[0]?.category === 'food' && analytics.categoryBreakdown[0]?.percentage > 35) {
            recommendations.push({
                title: '식비 절약 팁',
                message: '집에서 요리하는 횟수를 늘리고, 배달음식 대신 직접 조리해보세요.',
                impact: '월 15-20만원 절약 가능',
                difficulty: '쉬움'
            });
        }

        if (analytics.categoryBreakdown.find(cat => cat.category === 'entertainment')?.percentage > 25) {
            recommendations.push({
                title: '유흥비 관리',
                message: '월 유흥비 한도를 설정하고, 무료 문화활동을 활용해보세요.',
                impact: '월 10-15만원 절약 가능',
                difficulty: '보통'
            });
        }

        recommendations.push({
            title: '자동 저축 설정',
            message: '매월 고정 금액을 자동으로 저축하는 습관을 만들어보세요.',
            impact: '연간 목표 달성률 40% 향상',
            difficulty: '쉬움'
        });

        return {
            insights,
            recommendations,
            warnings,
            summary: {
                totalAmount,
                spendingRate,
                changeRate,
                topCategory: analytics.categoryBreakdown[0]?.label || '없음',
                avgDaily: totalAmount / new Date().getDate(),
                prediction: totalAmount * (new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate() / new Date().getDate())
            }
        };
    };

    const aiAnalysis = getAIAnalysis();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {mode === 'personal' ? '내 가계부' : '공동 가계부'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {format(currentMonth, 'yyyy년 M월', {locale: ko})} 지출 현황
                    </p>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
                        <input
                            type="text"
                            placeholder="지출 검색..."
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
                        <select
                            className="pl-10 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* AI Analysis Button */}
                    <motion.button
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                        whileHover={{scale: 1.05}}
                        whileTap={{scale: 0.95}}
                        onClick={generateAIAnalysis}
                        disabled={analysisLoading}
                    >
                        {analysisLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Bot className="w-5 h-5"/>
                        )}
                        <span>{analysisLoading ? '분석 중...' : 'AI 분석'}</span>
                    </motion.button>

                    {/* Add Expense Button */}
                    <motion.button
                        className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                        whileHover={{scale: 1.05}}
                        whileTap={{scale: 0.95}}
                        onClick={() => {
                            setSelectedExpense(null);
                            setShowExpenseModal(true);
                        }}
                    >
                        <Plus className="w-5 h-5"/>
                        <span>지출 추가</span>
                    </motion.button>
                </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3"
                    whileHover={{y: -5, transition: {duration: 0.2}}}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div
                            className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                            <Receipt className="w-4 h-4"/>
                        </div>
                        <div className="text-lg font-bold text-gray-900">{analytics.totalCount}건</div>
                    </div>
                    <div className="text-xs font-medium text-gray-700 mb-1">총 지출</div>
                    <div className="text-lg font-bold text-gray-900">{formatCurrency(analytics.totalAmount)}</div>
                </motion.div>

                <motion.div
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3"
                    whileHover={{y: -5, transition: {duration: 0.2}}}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div
                            className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                            <BarChart3 className="w-4 h-4"/>
                        </div>
                        <TrendingUp className="w-3 h-3 text-green-500" />
                    </div>
                    <div className="text-xs font-medium text-gray-700 mb-1">평균 지출</div>
                    <div className="text-lg font-bold text-gray-900">{formatCurrency(analytics.avgAmount)}</div>
                </motion.div>

                <motion.div
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3"
                    whileHover={{y: -5, transition: {duration: 0.2}}}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div
                            className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                            <TrendingUp className="w-4 h-4"/>
                        </div>
                        <div className="text-green-500 text-xs font-medium">최고</div>
                    </div>
                    <div className="text-xs font-medium text-gray-700 mb-1">최대 지출</div>
                    <div className="text-lg font-bold text-gray-900">{formatCurrency(analytics.maxAmount)}</div>
                </motion.div>

                <motion.div
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3"
                    whileHover={{y: -5, transition: {duration: 0.2}}}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div
                            className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                            <PieChart className="w-4 h-4"/>
                        </div>
                        <div className="text-xs font-medium" style={{color: analytics.categoryBreakdown[0]?.color}}>
                            {analytics.categoryBreakdown[0]?.percentage.toFixed(1)}%
                        </div>
                    </div>
                    <div className="text-xs font-medium text-gray-700 mb-1">주요 카테고리</div>
                    {analytics.categoryBreakdown.length > 0 ? (
                        <div className="text-lg font-bold text-gray-900">
                            {analytics.categoryBreakdown[0].label}
                        </div>
                    ) : (
                        <div className="text-lg font-bold text-gray-900">데이터 없음</div>
                    )}
                </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Breakdown */}
                <motion.div
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5}}
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">카테고리별 지출</h3>
                    {allCategoryData.length > 0 ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie
                                        data={allCategoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {allCategoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color}/>
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => [formatCurrency(value), '금액']}
                                    />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center">
                            <p className="text-gray-500">데이터가 없습니다</p>
                        </div>
                    )}
                    <div className="mt-4 space-y-2">
                        {analytics.categoryBreakdown.map((cat) => (
                            <div key={cat.category} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: cat.color}}></div>
                                    <span className="text-sm text-gray-700">{cat.label}</span>
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                    {formatCurrency(cat.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 0.1}}
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                        월별 지출 추이 
                        {categoryFilter !== 'all' && (
                            <span className="text-sm font-normal text-gray-500">
                                ({categories.find(c => c.value === categoryFilter)?.label})
                            </span>
                        )}
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                <XAxis dataKey="month" axisLine={false} tickLine={false}/>
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `${value / 10000}만`}
                                />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length > 0) {
                                            return (
                                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                                    <p className="font-medium">{label}</p>
                                                    {payload.map((entry, index) => {
                                                        const categoryInfo = categoryData.find(cat => cat.category === entry.dataKey);
                                                        return (
                                                            <p key={index} className="text-sm" style={{ color: entry.color }}>
                                                                {categoryInfo?.label || '기타'}: {formatCurrency(entry.value)}
                                                            </p>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                {categoryFilter === 'all' ? (
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
                                        fill={categoryData.find(cat => cat.category === categoryFilter)?.color || '#df6d14'}
                                        radius={[4, 4, 0, 0]}
                                    />
                                )}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 justify-center">
                        {(categoryFilter === 'all' ? categoryData : categoryData.filter(cat => cat.category === categoryFilter)).map((cat) => (
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

            {/* Personal Share in Group Mode */}
            {mode === 'group' && personalShares && personalShares.length > 0 && (
                <motion.div
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.5, delay: 0.15}}
                >
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">내 분담금</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            그룹 지출에서 내가 부담해야 할 금액입니다
                        </p>
                    </div>

                    <div className="p-6">
                        <div className="mb-6">
                            <div className="text-2xl font-bold text-primary-600">
                                총 분담금: {formatCurrency(personalShares.reduce((sum, share) => sum + share.personalAmount, 0))}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                {personalShares.length}건의 그룹 지출
                            </div>
                        </div>

                        <div className="space-y-4">
                            {personalShares.map((share) => (
                                <div key={share.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{
                                                backgroundColor: categoryData.find(cat => cat.category === share.category)?.color + '20'
                                            }}
                                        >
                                            <Receipt
                                                className="w-5 h-5"
                                                style={{
                                                    color: categoryData.find(cat => cat.category === share.category)?.color || '#df6d14'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{share.title}</h4>
                                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                <span>{categoryData.find(cat => cat.category === share.category)?.label}</span>
                                                <span>•</span>
                                                <span>전체: {formatCurrency(share.amount)}</span>
                                                <span>•</span>
                                                <span>
                                                    {share.splitType === 'equal' ? '균등분할' : 
                                                     share.splitType === 'specific' ? '지정분할' : '사용자정의'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-primary-600">
                                            {formatCurrency(share.personalAmount)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            ({share.percentage.toFixed(1)}%)
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Expenses List */}
            <motion.div
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5, delay: 0.2}}
            >
                <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">지출 내역</h3>
                </div>

                <div className="divide-y divide-gray-100">
                    {filteredExpenses.length > 0 ? (
                        filteredExpenses.map((expense) => (
                            <motion.div
                                key={expense.id}
                                className="p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
                                whileHover={{x: 5}}
                                onClick={() => handleExpenseClick(expense)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110`}
                                            style={{
                                                backgroundColor: categoryData.find(cat => cat.category === expense.category)?.color + '20'
                                            }}
                                        >
                                            <Receipt
                                                className="w-6 h-6"
                                                style={{
                                                    color: categoryData.find(cat => cat.category === expense.category)?.color || '#df6d14'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 group-hover:text-[#df6d14] transition-colors">{expense.title}</h4>
                                            <div className="flex items-center space-x-3 text-sm text-gray-500">
                                                <span>{categoryData.find(cat => cat.category === expense.category)?.label}</span>
                                                <span>•</span>
                                                <div className="flex items-center space-x-1">
                                                    <Calendar className="w-3 h-3"/>
                                                    <span>{format(new Date(expense.date), 'M월 d일 HH:mm', {locale: ko})}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-gray-900">{formatCurrency(expense.amount)}</p>
                                        {expense.memo && (
                                            <p className="text-sm text-gray-500 truncate max-w-32">{expense.memo}</p>
                                        )}
                                        <div className="text-xs text-[#df6d14] mt-1">
                                            전체의 {((expense.amount / (allCategoryExpenses.reduce((sum, e) => sum + e.amount, 0) || 1)) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-16">
                            <div
                                className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Receipt className="w-10 h-10 text-gray-400"/>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">지출 내역이 없습니다</h3>
                            <p className="text-gray-600 mb-6">새로운 지출을 추가해보세요!</p>
                            <motion.button
                                className="px-6 py-3 bg-[#df6d14] text-white rounded-xl font-medium hover:bg-[#df6d14]/90 transition-colors"
                                whileHover={{scale: 1.05}}
                                whileTap={{scale: 0.95}}
                                onClick={() => setShowExpenseModal(true)}
                            >
                                첫 지출 추가하기
                            </motion.button>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* AI Analysis Modal */}
            <AnimatePresence>
                {showAnalysis && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">AI 가계부 분석</h2>
                                            <p className="text-purple-100">
                                                {format(currentMonth, 'yyyy년 M월', {locale: ko})} 지출 패턴 분석 결과
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowAnalysis(false)}
                                        className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-blue-600 font-medium">예산 사용률</span>
                                            <TrendingUp className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="text-2xl font-bold text-blue-800">
                                            {aiAnalysis.summary.spendingRate.toFixed(1)}%
                                        </div>
                                        <div className="text-sm text-blue-600">
                                            {formatCurrency(aiAnalysis.summary.totalAmount)} / {formatCurrency(2000000)}
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-green-600 font-medium">일평균 지출</span>
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
                                            <span className="text-purple-600 font-medium">월말 예상</span>
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
                                            <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                                            주의사항
                                        </h3>
                                        <div className="space-y-3">
                                            {aiAnalysis.warnings.map((warning, index) => (
                                                <div
                                                    key={index}
                                                    className={`p-4 rounded-xl border-l-4 ${
                                                        warning.severity === 'high' 
                                                            ? 'bg-red-50 border-red-500' 
                                                            : 'bg-orange-50 border-orange-500'
                                                    }`}
                                                >
                                                    <h4 className={`font-semibold ${
                                                        warning.severity === 'high' ? 'text-red-800' : 'text-orange-800'
                                                    }`}>
                                                        {warning.title}
                                                    </h4>
                                                    <p className={`text-sm mt-1 ${
                                                        warning.severity === 'high' ? 'text-red-600' : 'text-orange-600'
                                                    }`}>
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
                                            <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                                                <insight.icon className={`w-5 h-5 mt-0.5 ${insight.color}`} />
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
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
                                            <div key={index} className="p-4 bg-green-50 rounded-xl border border-green-200">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-green-800 mb-2">{rec.title}</h4>
                                                        <p className="text-sm text-green-700 mb-3">{rec.message}</p>
                                                        <div className="flex items-center space-x-4 text-xs">
                                                            <div className="flex items-center space-x-1">
                                                                <span className="text-green-600 font-medium">예상 효과:</span>
                                                                <span className="text-green-800">{rec.impact}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <span className="text-green-600 font-medium">난이도:</span>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                    rec.difficulty === '쉬움' ? 'bg-green-100 text-green-700' :
                                                                    rec.difficulty === '보통' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-red-100 text-red-700'
                                                                }`}>
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
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">카테고리별 상세 분석</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {analytics.categoryBreakdown.slice(0, 4).map((cat) => (
                                            <div key={cat.category} className="p-4 border border-gray-200 rounded-xl">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        <div 
                                                            className="w-4 h-4 rounded-full" 
                                                            style={{ backgroundColor: cat.color }}
                                                        />
                                                        <span className="font-medium text-gray-900">{cat.label}</span>
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
                                                            width: `${cat.percentage}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-gray-50 p-6 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                        * 이 분석은 AI가 생성한 것으로 참고용입니다.
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => setShowAnalysis(false)}
                                            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            닫기
                                        </button>
                                        <button
                                            onClick={() => {
                                                // 분석 결과를 PDF로 저장하거나 다른 액션
                                                alert('분석 결과를 저장했습니다!');
                                            }}
                                            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                        >
                                            결과 저장
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Expense Modal */}
            {showExpenseModal && (
                <ExpenseModal
                    expense={selectedExpense}
                    onClose={() => {
                        setShowExpenseModal(false);
                        setSelectedExpense(null);
                    }}
                />
            )}
        </div>
    );
};

export default ExpensesPage;
