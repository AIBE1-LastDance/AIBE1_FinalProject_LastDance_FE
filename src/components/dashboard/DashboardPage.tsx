import React, {useState, useEffect} from 'react';
import {motion} from 'framer-motion';
import {
    Calendar,
    CheckSquare,
    CreditCard,
    TrendingUp,
    Clock,
    Target,
    BarChart3,
    Activity,
    PieChart,
    ChevronLeft,
    ChevronRight,
    Circle,
    Flag,
    Users,
    Plus
} from 'lucide-react';
import {useAuthStore} from '../../store/authStore';
import {useAppStore} from '../../store/appStore';
import {useChecklist} from '../../hooks/useChecklist';
import {useCalendar} from '../../hooks/useCalendar';
import {useNavigate} from 'react-router-dom';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts';
import {
    format,
    startOfMonth,
    endOfMonth,
    subMonths,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    isToday
} from 'date-fns';
import {ko} from 'date-fns/locale';

const DashboardPage: React.FC = () => {
    const {user} = useAuthStore();
    const {mode, currentGroup, expenses, events, loadExpenses} = useAppStore();
    const {checklists, toggleChecklist} = useChecklist(); // toggleChecklist 추가
    const {getEventsForDate: getCalendarEvents} = useCalendar({
        autoLoad: true,
        initialView: 'month',
        groupId: mode === 'group' && currentGroup ? currentGroup.id : undefined,
    });
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [calendarDate, setCalendarDate] = useState(new Date());

    // 가계부 데이터 로딩
    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const currentMonth = new Date();
                const params = {
                    mode,
                    year: currentMonth.getFullYear(),
                    month: currentMonth.getMonth() + 1,
                    groupId: mode === 'group' ? currentGroup?.id : null,
                };
                await loadExpenses(params);
            } catch (error) {
                console.error('대시보드 지출 로드 실패: ', error);
            }
        };

        fetchExpenses();
    }, [mode, currentGroup, loadExpenses]);

    // 대시보드에서 날짜 파라미터로 온 경우 처리
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const dateParam = urlParams.get('date');

        if (dateParam) { // showEventModal 조건 제거
            try {
                const targetDate = new Date(dateParam);
                if (!isNaN(targetDate.getTime())) {
                    setSelectedDate(targetDate);
                    const newUrl = new URL(window.location.href);
                    newUrl.searchParams.delete('date');
                    navigate(newUrl.pathname + newUrl.search, { replace: true });
                }
            } catch (error) {
                console.error('날짜 파싱 오류:', error);
            }
        }
    }, [location.search, navigate]); // showEventModal 의존성도 제거

    // Expense categories matching ExpensesPage
    const categoryData = [
        {category: 'FOOD', label: '식비', color: '#FF6B6B'},
        {category: 'UTILITIES', label: '공과금', color: '#4ECDC4'},
        {category: 'TRANSPORT', label: '교통비', color: '#45B7D1'},
        {category: 'SHOPPING', label: '쇼핑', color: '#96CEB4'},
        {category: 'ENTERTAINMENT', label: '유흥', color: '#FFEAA7'},
        {category: 'OTHER', label: '기타', color: '#DDA0DD'},
    ];

    // Filter expenses for current mode
    const filteredExpenses = expenses.filter(expense =>
        mode === 'personal' ? !expense.groupId : expense.groupId
    );

    // Expense chart data
    const expenseChartData = categoryData.map(cat => {
        const amount = filteredExpenses
            .filter(expense => expense.category === cat.category)
            .reduce((sum, expense) => sum + expense.amount, 0);
        return {
            name: cat.label,
            value: amount,
            color: cat.color,
        };
    }).filter(item => item.value > 0);

    // Monthly expense data with categories (last 6 months)
    const currentMonth = new Date();
    const monthlyExpenseData = Array.from({length: 6}, (_, i) => {
        const monthDate = subMonths(currentMonth, 5 - i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        const monthExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const isModeMatch = mode === 'personal' ? !expense.groupId : expense.groupId;
            return expenseDate >= monthStart && expenseDate <= monthEnd && isModeMatch;
        });

        // Calculate category amounts for this month
        const monthData = {month: format(monthDate, 'M월')};
        categoryData.forEach(cat => {
            const categoryAmount = monthExpenses
                .filter(expense => expense.category === cat.category)
                .reduce((sum, expense) => sum + expense.amount, 0);
            monthData[cat.category] = categoryAmount;
        });

        return monthData;
    });

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW',
        }).format(amount);
    };

    // Calendar functions
    const monthStart = startOfMonth(calendarDate);
    const monthEnd = endOfMonth(calendarDate);
    const calendarDays = eachDayOfInterval({start: monthStart, end: monthEnd});

    const handlePreviousMonth = () => {
        setCalendarDate(subMonths(calendarDate, 1));
    };

    const handleNextMonth = () => {
        setCalendarDate(addMonths(calendarDate, 1));
    };

    const getEventsForDate = React.useCallback((date: Date) => {
        // useCalendar 훅의 함수 사용
        const allEvents = getCalendarEvents(date);

        // 캘린더 페이지와 동일한 필터링 적용
        return allEvents.filter(event => {
            if (mode === 'personal') {
                return true; // 개인 모드: 모든 일정 표시 (개인 + 그룹)
            } else {
                // 그룹 모드: 현재 선택된 그룹의 일정만 표시
                return event.groupId === currentGroup?.id;
            }
        });
    }, [getCalendarEvents, mode, currentGroup]);

    const selectedDateEvents = React.useMemo(() => getEventsForDate(selectedDate), [getEventsForDate, selectedDate]);

    // Filter tasks for current mode (API 체크리스트 사용) - 마감일 순 정렬
    const filteredTasks = checklists
        .sort((a, b) => {
            // 마감일이 없는 것은 맨 아래로
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;

            // 마감일이 빠른 순으로 정렬
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        })
        .slice(0, 2); // Show only first 2 tasks

    const getPriorityColor = (priority: string) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'text-red-600';
            case 'medium':
                return 'text-yellow-600';
            case 'low':
                return 'text-green-600';
            default:
                return 'text-gray-600';
        }
    };

    const personalFeatures = [
        {
            icon: Calendar,
            title: '내 캘린더',
            description: '개인 일정 관리',
            color: 'from-primary-500 to-primary-600',
            path: '/calendar',
            count: events.filter(e => !e.groupId).length,
        },
        {
            icon: CheckSquare,
            title: '할 일 목록',
            description: '개인 할 일 관리',
            color: 'from-green-500 to-green-600',
            path: '/tasks',
            count: checklists.filter(t => !t.isCompleted).length, // API 체크리스트 사용
        },
        {
            icon: CreditCard,
            title: '가계부',
            description: '개인 지출 관리',
            color: 'from-purple-500 to-purple-600',
            path: '/expenses',
            count: expenses.filter(e => !e.groupId).length,
        },
    ];

    const groupFeatures = [];

    const features = mode === 'personal' ? personalFeatures : groupFeatures;

    // Calculate stats (API 체크리스트 사용)
    const completedTasks = checklists.filter(t => t.isCompleted).length;
    const totalTasks = checklists.length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const monthlyExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const upcomingEvents = events
        .filter(e => mode === 'personal' ? !e.groupId : e.groupId)
        .filter(e => new Date(e.date) >= new Date()).length;

    // Chart data - 실제 체크리스트 완료 데이터 기반으로 계산
    const activityData = React.useMemo(() => {
        const today = new Date();
        const weeklyData = [];

        // 지난 7일간의 데이터 생성
        for (let i = 6; i >= 0; i--) {
            const targetDate = new Date();
            targetDate.setDate(today.getDate() - i);

            // 해당 날짜에 완료된 체크리스트 개수 계산
            const completedTasks = checklists.filter(checklist => {
                if (!checklist.isCompleted || !checklist.completedAt) return false;

                const completedDate = new Date(checklist.completedAt);
                return (
                    completedDate.getFullYear() === targetDate.getFullYear() &&
                    completedDate.getMonth() === targetDate.getMonth() &&
                    completedDate.getDate() === targetDate.getDate()
                );
            }).length;

            // 해당 날짜의 지출 계산 (기존 로직 유지)
            const dayExpenses = filteredExpenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return (
                    expenseDate.getFullYear() === targetDate.getFullYear() &&
                    expenseDate.getMonth() === targetDate.getMonth() &&
                    expenseDate.getDate() === targetDate.getDate()
                );
            }).reduce((sum, expense) => sum + expense.amount, 0);

            weeklyData.push({
                day: format(targetDate, 'E', {locale: ko}), // 요일명 (월, 화, 수...)
                tasks: completedTasks,
                expenses: dayExpenses,
            });
        }

        return weeklyData;
    }, [checklists, filteredExpenses]);

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.6}}
                className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white"
            >
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-6 h-6"/>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">대시보드</h1>
                        <p className="text-primary-100">
                            {mode === 'personal'
                                ? `개인 활동 현황을 확인하세요`
                                : currentGroup
                                    ? `${currentGroup.name} 그룹의 현황을 확인하세요`
                                    : '그룹 현황을 확인하세요'
                            }
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{opacity: 0, scale: 0.8}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{duration: 0.6, delay: 0.1}}
                    className="bg-white rounded-2xl p-3 shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200"
                    whileHover={{scale: 1.05}}
                    whileTap={{scale: 0.95}}
                    onClick={() => navigate('/tasks')}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <CheckSquare className="w-4 h-4 text-primary-600"/>
                        </div>
                        <div className="text-lg font-bold text-gray-900">{completedTasks} / {totalTasks}</div>
                    </div>
                    <div className="text-xs font-medium text-gray-700 mb-2">완료된 할일</div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                            className="bg-primary-600 h-1 rounded-full transition-all duration-300"
                            style={{width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`}}
                        ></div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, scale: 0.8}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{duration: 0.6, delay: 0.2}}
                    className="bg-white rounded-2xl p-3 shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200"
                    whileHover={{scale: 1.05}}
                    whileTap={{scale: 0.95}}
                    onClick={() => navigate('/expenses')}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-primary-600"/>
                        </div>
                        <TrendingUp className="w-3 h-3 text-green-500"/>
                    </div>
                    <div className="text-lg font-bold text-gray-900 mb-1">
                        ₩{monthlyExpenses.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">이번 달 지출</div>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, scale: 0.8}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{duration: 0.6, delay: 0.3}}
                    className="bg-white rounded-2xl p-3 shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200"
                    whileHover={{scale: 1.05}}
                    whileTap={{scale: 0.95}}
                    onClick={() => {
                        const dateParam = format(selectedDate, 'yyyy-MM-dd');
                        navigate(`/calendar?date=${dateParam}`);
                    }}
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-primary-600"/>
                        </div>
                        <Clock className="w-3 h-3 text-primary-500"/>
                    </div>
                    <div className="text-lg font-bold text-gray-900 mb-1">{upcomingEvents}</div>
                    <div className="text-xs text-gray-500">다가오는 일정</div>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, scale: 0.8}}
                    animate={{opacity: 1, scale: 1}}
                    transition={{duration: 0.6, delay: 0.4}}
                    className="bg-white rounded-2xl p-3 shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200"
                    whileHover={{scale: 1.05}}
                    whileTap={{scale: 0.95}}
                    onClick={() => navigate('/tasks')} // 목표 달성률도 할일 페이지로 연결
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4 text-primary-600"/>
                        </div>
                        <div className={`text-xs font-medium ${
                            completionRate >= 80 ? 'text-green-500' :
                                completionRate >= 60 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                            {completionRate >= 80 ? '🎉' : completionRate >= 60 ? '📈' : '📊'}
                        </div>
                    </div>
                    <div className="text-lg font-bold text-gray-900 mb-1">{completionRate}%</div>
                    <div className="text-xs text-gray-500">목표 달성률</div>
                </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Activity Chart */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.3}}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex flex-col cursor-pointer hover:shadow-lg transition-all duration-200"
                    whileHover={{scale: 1.02}}
                    whileTap={{scale: 0.98}}
                    onClick={() => navigate('/tasks')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">주간 완료 현황</h3>
                        <Activity className="w-5 h-5 text-primary-600"/>
                    </div>
                    <div className="flex-1 min-h-[200px]">
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis dataKey="day"/>
                                <YAxis/>
                                <Tooltip formatter={(value, name) => [
                                    name === 'tasks' ? `${value}개` : `₩${value.toLocaleString()}`,
                                    name === 'tasks' ? '완료된 할일' : '지출'
                                ]}/>
                                <Area
                                    type="monotone"
                                    dataKey="tasks"
                                    stackId="1"
                                    stroke="#df6d14"
                                    fill="#df6d14"
                                    fillOpacity={0.3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Expense Categories */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.4}}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200"
                    whileHover={{scale: 1.02}}
                    whileTap={{scale: 0.98}}
                    onClick={() => navigate('/expenses')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">지출</h3>
                        <PieChart className="w-5 h-5 text-primary-600"/>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Pie Chart */}
                        <div className="h-48">
                            {expenseChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={180}>
                                    <RechartsPieChart>
                                        <Pie
                                            data={expenseChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={60}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {expenseChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color}/>
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [formatCurrency(value), '금액']}/>
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-gray-500 text-sm">데이터가 없습니다</p>
                                </div>
                            )}
                        </div>

                        {/* Monthly Trend Bar Chart */}
                        <div className="h-48">
                            {expenseChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart data={monthlyExpenseData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                        <XAxis dataKey="month" axisLine={false} tickLine={false}/>
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(value) => {
                                                if (value === 0) return '0';
                                                if (value < 10000) return `${(value / 1000).toFixed(0)}천`;
                                                return `${(value / 10000).toFixed(0)}만`;
                                            }}
                                        />
                                        <Tooltip
                                            content={({active, payload, label}) => {
                                                if (active && payload && payload.length > 0) {
                                                    const data = payload[0];
                                                    const categoryInfo = categoryData.find(cat => cat.category === data.dataKey);
                                                    return (
                                                        <div
                                                            className="bg-white p-2 border border-gray-200 rounded-lg shadow-lg">
                                                            <p className="font-medium text-sm">{label}</p>
                                                            <p className="text-xs" style={{color: data.color}}>
                                                                {categoryInfo?.label}: {formatCurrency(data.value)}
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        {categoryData.map((cat) => (
                                            <Bar
                                                key={cat.category}
                                                dataKey={cat.category}
                                                stackId="expense"
                                                fill={cat.color}
                                                radius={cat === categoryData[categoryData.length - 1] ? [2, 2, 0, 0] : [0, 0, 0, 0]}
                                            />
                                        ))}
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <p className="text-gray-500 text-sm">월별 지출 데이터가 없습니다</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Category Legend with percentages */}
                    <div className="mt-3 grid grid-cols-2 gap-1">
                        {expenseChartData.map((category, index) => {
                            const totalAmount = expenseChartData.reduce((sum, item) => sum + item.value, 0);
                            const percentage = totalAmount > 0 ? (category.value / totalAmount) * 100 : 0;
                            return (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-1">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{backgroundColor: category.color}}
                                        />
                                        <span className="text-xs text-gray-700">{category.name}</span>
                                    </div>
                                    <div className="text-xs font-medium text-gray-900">
                                        {formatCurrency(category.value)} ({percentage.toFixed(1)}%)
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>


            {/* Calendar and Tasks Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Mini Calendar with Events */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.5}}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200"
                    whileHover={{scale: 1.02}}
                    whileTap={{scale: 0.98}}
                    onClick={() => navigate('/calendar')}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">캘린더</h3>
                        <div className="flex items-center space-x-2">
                            <motion.button
                                whileHover={{scale: 1.1}}
                                whileTap={{scale: 0.9}}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePreviousMonth();
                                }}
                                className="p-1 rounded-lg hover:bg-gray-100"
                            >
                                <ChevronLeft className="w-4 h-4"/>
                            </motion.button>
                            <span className="text-sm font-medium text-gray-700 min-w-[80px] text-center">
                {format(calendarDate, 'yyyy년 M월', {locale: ko})}
              </span>
                            <motion.button
                                whileHover={{scale: 1.1}}
                                whileTap={{scale: 0.9}}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNextMonth();
                                }}
                                className="p-1 rounded-lg hover:bg-gray-100"
                            >
                                <ChevronRight className="w-4 h-4"/>
                            </motion.button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Mini Calendar */}
                        <div>
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((day) => {
                                    const dayEvents = getEventsForDate(day);
                                    const isCurrentMonth = isSameMonth(day, calendarDate);
                                    const isDayToday = isToday(day);
                                    const isSelected = isSameDay(day, selectedDate);

                                    return (
                                        <motion.button
                                            key={day.toString()}
                                            className={`
                        text-xs p-1 rounded transition-colors relative
                        ${isCurrentMonth ? 'text-gray-800' : 'text-gray-300'}
                        ${isDayToday ? 'bg-primary-100 text-primary-600 font-bold' : ''}
                        ${isSelected ? 'bg-primary-600 text-white' : 'hover:bg-gray-100'}
                      `}
                                            whileHover={{scale: 1.1}}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedDate(day);
                                            }}
                                        >
                                            {format(day, 'd')}
                                            {dayEvents.length > 0 && (
                                                <div
                                                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-500 rounded-full"></div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Events for Selected Date */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                {format(selectedDate, 'M월 d일 일정', {locale: ko})}
                            </h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {selectedDateEvents.length > 0 ? (
                                    selectedDateEvents.map((event) => (
                                        <motion.div
                                            key={event.id}
                                            className={`text-xs p-2 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                                                event.category === 'bill' ? 'bg-red-100 text-red-800' :
                                                    event.category === 'cleaning' ? 'bg-green-100 text-green-800' :
                                                        event.category === 'meeting' ? 'bg-blue-100 text-blue-800' :
                                                            event.category === 'appointment' ? 'bg-purple-100 text-purple-800' :
                                                                event.category === 'health' ? 'bg-pink-100 text-pink-800' :
                                                                    event.category === 'shopping' ? 'bg-yellow-100 text-yellow-800' :
                                                                        event.category === 'travel' ? 'bg-indigo-100 text-indigo-800' :
                                                                            'bg-gray-100 text-gray-800'
                                            }`}
                                            whileHover={{scale: 1.02}}
                                            whileTap={{scale: 0.98}}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/calendar?eventId=${event.id}`);
                                            }}
                                        >
                                            <div className="font-medium">{event.title}</div>
                                            <div className="text-xs opacity-75">
                                                {event.startTime} - {event.endTime}
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-xs text-gray-500 text-center py-4">
                                        일정이 없습니다
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tasks Section */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.6}}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200"
                    whileHover={{scale: 1.02}}
                    whileTap={{scale: 0.98}}
                    onClick={() => navigate('/tasks')}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">할일</h3>
                        <CheckSquare className="w-6 h-6 text-primary-600"/>
                    </div>

                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((checklist) => (
                                <motion.div
                                    key={checklist.checklistId}
                                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                    whileHover={{x: 4}}
                                >
                                    <motion.button
                                        className={`w-4 h-4 mt-0.5 rounded-sm border-2 flex items-center justify-center transition-all ${
                                            checklist.isCompleted
                                                ? 'bg-green-600 border-green-600 text-white'
                                                : 'bg-white border-gray-300 hover:border-green-500'
                                        }`}
                                        whileHover={{scale: 1.1}}
                                        whileTap={{scale: 0.9}}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleChecklist(checklist.checklistId, checklist.isCompleted);
                                        }}
                                    >
                                        {checklist.isCompleted && (
                                            <motion.svg
                                                initial={{scale: 0}}
                                                animate={{scale: 1}}
                                                className="w-2.5 h-2.5"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path fillRule="evenodd"
                                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                      clipRule="evenodd"/>
                                            </motion.svg>
                                        )}
                                    </motion.button>
                                    <div
                                        className="flex-1 min-w-0 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate('/tasks');
                                        }}
                                    >
                                        <div
                                            className={`text-sm font-medium transition-all ${checklist.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                            {checklist.title}
                                        </div>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <Flag className={`w-3 h-3 ${getPriorityColor(checklist.priority)}`}/>
                                            <span className={`text-xs ${getPriorityColor(checklist.priority)}`}>
                        {checklist.priority?.toLowerCase() === 'high' ? '높음' :
                            checklist.priority?.toLowerCase() === 'medium' ? '보통' : '낮음'}
                      </span>
                                            {checklist.dueDate && (
                                                <>
                                                    <span className="text-gray-300">•</span>
                                                    <Clock className="w-3 h-3 text-gray-400"/>
                                                    <span className="text-xs text-gray-500">
                            {format(new Date(checklist.dueDate), 'M월 d일', {locale: ko})}
                          </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
                                <p className="text-sm text-gray-500">할일이 없습니다</p>
                            </div>
                        )}
                    </div>

                    {checklists.length > 2 && (
                        <motion.button
                            className="w-full mt-4 py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                            whileHover={{scale: 1.02}}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate('/tasks');
                            }}
                        >
                            더 많은 할일 보기 →
                        </motion.button>
                    )}
                </motion.div>
            </div>

            {/* Features Grid - 개인모드에서는 숨김 */}
            {mode === 'group' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.6, delay: index * 0.1}}
                            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                            whileHover={{scale: 1.02, y: -4}}
                            whileTap={{scale: 0.98}}
                            onClick={() => navigate(feature.path)}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div
                                    className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="w-7 h-7 text-white"/>
                                </div>
                                {feature.count > 0 && (
                                    <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                        {feature.count}
                                    </div>
                                )}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Group Management CTA */}
            {mode === 'group' && !currentGroup && (
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.6, delay: 0.5}}
                    className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-8 lg:p-12 text-white text-center"
                >
                    <div
                        className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10"/>
                    </div>
                    <h2 className="text-3xl font-bold mb-4">그룹에 참여하세요</h2>
                    <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
                        함께 생활할 그룹을 만들거나 참여 코드로 기존 그룹에 참여하세요.
                        더 체계적이고 재밌는 공동생활이 시작됩니다.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.button
                            className="flex items-center space-x-2 px-8 py-4 bg-white text-primary-600 rounded-2xl font-bold hover:bg-gray-50 transition-colors"
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            onClick={() => navigate('/groups/create')}
                        >
                            <Plus className="w-5 h-5"/>
                            <span>그룹 만들기</span>
                        </motion.button>
                        <motion.button
                            className="flex items-center space-x-2 px-8 py-4 bg-white bg-opacity-20 text-white rounded-2xl font-bold hover:bg-opacity-30 transition-colors"
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            onClick={() => navigate('/groups/join')}
                        >
                            <Users className="w-5 h-5"/>
                            <span>그룹 참여하기</span>
                        </motion.button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default DashboardPage;
