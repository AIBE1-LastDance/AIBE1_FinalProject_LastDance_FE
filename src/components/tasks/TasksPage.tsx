import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, CheckCircle, Circle, Calendar, User, Clock, Flag, RefreshCw } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useChecklist } from '../../hooks/useChecklist';
import { ChecklistResponseDTO } from '../../types/checklist';
import { useLocation, useNavigate } from 'react-router-dom';
import TaskModal from './TaskModal';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import toast from 'react-hot-toast';

const TasksPage: React.FC = () => {
  const { mode, currentGroup, joinedGroups } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  const { checklists, loading, error, fetchChecklists, toggleChecklist, deleteChecklist } = useChecklist();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ChecklistResponseDTO | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

  // URL 쿼리 파라미터에서 taskId 확인하여 상세 모달 열기
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const taskId = urlParams.get('taskId');
    
    if (taskId && checklists.length > 0 && !showTaskModal) {
      // 해당 할일 찾기
      const targetTask = checklists.find(task => task.checklistId === parseInt(taskId));
      if (targetTask) {
        setSelectedTask(targetTask);
        setShowTaskModal(true);
        
        // URL에서 taskId 파라미터 제거 (모달을 닫았을 때 재열리지 않도록)
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('taskId');
        navigate(newUrl.pathname + newUrl.search, { replace: true });
      }
    }
  }, [checklists, location.search, showTaskModal, navigate]);

  // 필터링된 체크리스트 목록 (마감일 역순 정렬)
  const filteredChecklists = checklists
    .filter(checklist => {
      const isFilterMatch = filter === 'all' || 
                           (filter === 'pending' && !checklist.isCompleted) ||
                           (filter === 'completed' && checklist.isCompleted);
      return isFilterMatch;
    })
    .sort((a, b) => {
      // 마감일이 없는 것은 맨 아래로
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      
      // 마감일이 늦은 순으로 정렬 (역순)
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    });

  const handleTaskClick = (checklist: ChecklistResponseDTO) => {
    setSelectedTask(checklist);
    setShowTaskModal(true);
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const handleToggleTask = (checklistId: number, isCompleted: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleChecklist(checklistId, isCompleted);
  };

  const handleRefresh = () => {
    fetchChecklists();
    toast.success('체크리스트를 새로고침했습니다');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-transparent text-priority-high border-priority-high';
      case 'medium': return 'bg-transparent text-priority-medium border-priority-medium';
      case 'low': return 'bg-transparent text-priority-low border-priority-low';
      default: return 'bg-transparent text-gray-600 border-gray-300';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return '보통';
    }
  };

  const filterOptions = [
    { value: 'all', label: '전체', count: checklists.length },
    { value: 'pending', label: '진행중', count: checklists.filter(t => !t.isCompleted).length },
    { value: 'completed', label: '완료', count: checklists.filter(t => t.isCompleted).length },
  ];

  const completionRate = checklists.length > 0 
    ? Math.round((checklists.filter(t => t.isCompleted).length / checklists.length) * 100)
    : 0;

  // 로딩 중일 때
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">체크리스트를 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }

  // 에러 발생시
  if (error) {
    return (
        <div className="space-y-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-500 text-center">
            <p className="mb-4">체크리스트를 불러오는데 실패했습니다</p>
            <p className="text-sm text-gray-600 mb-6">{error}</p>
            <motion.button
              className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
            >
              다시 시도
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-6">
          <div className="lg:w-80">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-500">
              {mode === "personal" ? (
                  "내 할일"
              ) : (
                  <div className="space-y-1">
                    <div className="text-base font-medium text-gray-500">
                      공용 할일
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

          {/* Progress Ring */}
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-primary-600"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${completionRate}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-900">{completionRate}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Refresh Button */}
          <motion.button
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            title="새로고침"
          >
            <RefreshCw className="w-5 h-5" />
          </motion.button>

          {/* Filter Tabs */}
          <div className="flex bg-gray-100 rounded-2xl p-1 shadow-md">
            {filterOptions.map((option) => (
              <motion.button
                key={option.value}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                  filter === option.value
                    ? 'bg-white text-primary-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setFilter(option.value as 'all' | 'pending' | 'completed')}
              >
                <span>{option.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  filter === option.value ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-600'
                }`}>
                  {option.count}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Add Task Button */}
          {(mode === 'personal' || currentGroup) && (
            <motion.button
              className="flex items-center space-x-2 px-6 py-3 bg-accent-500 text-white rounded-2xl font-medium hover:bg-accent-600 transition-colors shadow-md hover:shadow-lg whitespace-nowrap"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddTask}
            >
              <Plus className="w-5 h-5" />
              <span>할일 추가</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* 그룹 모드인데 그룹이 선택되지 않은 경우 */}
      {mode === 'group' && !currentGroup && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">그룹을 선택해주세요</h3>
          <p className="text-gray-600">그룹 할일을 관리하려면 먼저 그룹을 선택해야 합니다.</p>
        </motion.div>
      )}

      {/* Tasks List */}
      {(mode === 'personal' || currentGroup) && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredChecklists.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">할일이 없습니다</h3>
              <p className="text-gray-600 mb-6">새로운 할일을 추가해서 시작해보세요!</p>
              <motion.button
                className="px-6 py-3 bg-accent-500 text-white rounded-2xl font-medium hover:bg-accent-600 transition-colors shadow-md hover:shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddTask}
              >
                첫 할일 추가하기
              </motion.button>
            </motion.div>
          ) : (
            // <DragDropContext onDragEnd={onDragEnd}>
            //   <Droppable droppableId="tasks">
            //     {(provided) => (
            //       <div {...provided.droppableProps} ref={provided.innerRef} className="divide-y divide-gray-100">
                    <div className="divide-y divide-gray-100">
                      {filteredChecklists.map((checklist, index) => (
                        // <Draggable key={checklist.checklistId} draggableId={checklist.checklistId.toString()} index={index}>
                        //   {(provided, snapshot) => (
                            <motion.div
                              key={checklist.checklistId}
                              // ref={provided.innerRef}
                              // {...provided.draggableProps}
                              // {...provided.dragHandleProps}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className={`p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer relative ${
                                checklist.isCompleted ? 'opacity-75' : ''
                              }`}
                              onClick={() => handleTaskClick(checklist)}
                            >
                            {/* Priority indicator */}
                            <div 
                              className={`absolute left-0 top-0 w-1 h-full ${
                                checklist.dueDate && new Date(checklist.dueDate) < new Date() && !checklist.isCompleted
                                  ? 'bg-status-error animate-pulse' // 마감일 지난 것은 빨간색 + 깜빡임
                                  : checklist.priority?.toLowerCase() === 'high' ? 'bg-priority-high' : 
                                    checklist.priority?.toLowerCase() === 'medium' ? 'bg-priority-medium' : 'bg-priority-low'
                              }`}
                            />

                            <div className="flex items-start space-x-4">
                              {/* Checkbox */}
                              <motion.button
                                className={`mt-1 ${checklist.isCompleted ? 'text-accent-500' : 'text-gray-400 hover:text-accent-500'}`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => handleToggleTask(checklist.checklistId, checklist.isCompleted, e)}
                              >
                                {checklist.isCompleted ? (
                                  <CheckCircle className="w-6 h-6" />
                                ) : (
                                  <Circle className="w-6 h-6" />
                                )}
                              </motion.button>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-3">
                                  <h3 className={`text-lg font-semibold ${
                                    checklist.isCompleted ? 'line-through text-gray-500' : 'text-gray-900'
                                  }`}>
                                    {checklist.title}
                                  </h3>
                                  <div className="flex items-center space-x-2 ml-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(checklist.priority)}`}>
                                      <Flag className="w-3 h-3 inline mr-1" />
                                      {getPriorityLabel(checklist.priority)}
                                    </span>
                                    {/* 그룹 체크리스트인 경우 그룹명 표시 */}
                                    {checklist.type === 'GROUP' && checklist.groupName && (
                                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-transparent text-primary-600 border border-primary-300">
                                        {checklist.groupName}
                                      </span>
                                    )}
                                    {/* 상태 태그 */}
                                    {checklist.isCompleted ? (
                                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-transparent text-status-success border border-status-success">
                                        <CheckCircle className="w-3 h-3 inline mr-1" />
                                        완료
                                      </span>
                                    ) : checklist.dueDate && new Date(checklist.dueDate) < new Date() ? (
                                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-transparent text-status-error border border-status-error animate-pulse">
                                        <Clock className="w-3 h-3 inline mr-1" />
                                        지연
                                      </span>
                                    ) : (
                                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-transparent text-accent-600 border border-accent-300">
                                        <Circle className="w-3 h-3 inline mr-1" />
                                        진행중
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {checklist.description && (
                                  <p className={`text-sm mb-4 ${
                                    checklist.isCompleted ? 'text-gray-400' : 'text-gray-600'
                                  }`}>
                                    {checklist.description}
                                  </p>
                                )}

                                {/* Meta Info */}
                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                  {checklist.dueDate && (
                                    <div className={`flex items-center space-x-1 ${
                                      new Date(checklist.dueDate) < new Date() && !checklist.isCompleted ? 'text-status-error' : ''
                                    }`}>
                                      <Calendar className="w-4 h-4" />
                                      <span>{format(new Date(checklist.dueDate), 'M월 d일', { locale: ko })}</span>
                                      {new Date(checklist.dueDate) < new Date() && !checklist.isCompleted && (
                                        <span className="text-status-error font-medium">(지연)</span>
                                      )}
                                    </div>
                                  )}
                                  {checklist.assignee && (
                                    <div className="flex items-center space-x-1">
                                      <User className="w-4 h-4" />
                                      <span>{checklist.assignee.nickname}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                      {checklist.isCompleted 
                                        ? (checklist.completedAt 
                                            ? `${format(new Date(checklist.completedAt), 'M월 d일 완료', { locale: ko })}`
                                            : '완료됨'
                                          )
                                        : (checklist.dueDate 
                                            ? (() => {
                                                // 오늘 날짜를 00:00:00으로 설정
                                                const today = new Date();
                                                today.setHours(0, 0, 0, 0);
                                                
                                                // 마감일을 00:00:00으로 설정
                                                const dueDate = new Date(checklist.dueDate);
                                                dueDate.setHours(0, 0, 0, 0);
                                                
                                                // 일수 차이 계산
                                                const diffTime = dueDate.getTime() - today.getTime();
                                                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                                
                                                if (diffDays === 0) {
                                                  return '오늘 마감';
                                                } else if (diffDays === 1) {
                                                  return '내일 마감';
                                                } else if (diffDays > 0) {
                                                  return `D-${diffDays}`;
                                                } else {
                                                  return `${Math.abs(diffDays)}일 지연`;
                                                }
                                              })()
                                            : '마감일 없음'
                                          )
                                      }
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            </motion.div>
                        //   )}
                        // </Draggable>
                      ))}
                      {/* {provided.placeholder} */}
                    </div>
                //     )}
                //   </Droppable>
                // </DragDropContext>
          )}
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          task={selectedTask}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onSave={() => {
            fetchChecklists(); // 저장 후 목록 새로고침
          }}
        />
      )}
    </div>
  );
};

export default TasksPage;
