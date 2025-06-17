import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Plus, CheckCircle, Circle, Calendar, User, Clock, Flag } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { Task } from '../../types';
import TaskModal from './TaskModal';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import toast from 'react-hot-toast';

const TasksPage: React.FC = () => {
  const { tasks, toggleTask, mode, currentGroup, reorderTasks, joinedGroups } = useAppStore();
  // const { user } = useAuthStore(); // Commented out as it's not used
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredTasks = tasks.filter(task => {
    const isModeMatch = mode === 'personal' ? !task.groupId : task.groupId;
    const isFilterMatch = filter === 'all' || 
                         (filter === 'pending' && !task.completed) ||
                         (filter === 'completed' && task.completed);
    return isModeMatch && isFilterMatch;
  });

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const handleToggleTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTask(taskId);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      toast.success(task.completed ? '할일을 미완료로 변경했습니다' : '할일을 완료했습니다!');
    }
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    reorderTasks(startIndex, endIndex);
    toast.success('할일 순서가 변경되었습니다');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      default: return '보통';
    }
  };

  const filterOptions = [
    { value: 'all', label: '전체', count: filteredTasks.length },
    { value: 'pending', label: '진행중', count: filteredTasks.filter(t => !t.completed).length },
    { value: 'completed', label: '완료', count: filteredTasks.filter(t => t.completed).length },
  ];

  const completionRate = filteredTasks.length > 0 
    ? Math.round((filteredTasks.filter(t => t.completed).length / filteredTasks.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === 'personal' ? '내 할일' : '공용 할일'}
            </h1>
            <p className="text-gray-600 mt-1">
              {mode === 'personal' ? '개인 할일을 관리하세요' : '그룹 할일을 함께 관리하세요'}
            </p>
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
          {/* Filter Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            {filterOptions.map((option) => (
              <motion.button
                key={option.value}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === option.value
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
          <motion.button
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddTask}
          >
            <Plus className="w-5 h-5" />
            <span>할일 추가</span>
          </motion.button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredTasks.length === 0 ? (
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
              className="px-6 py-3 bg-[#df6d14] text-white rounded-xl font-medium hover:bg-[#df6d14]/90 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddTask}
            >
              첫 할일 추가하기
            </motion.button>
          </motion.div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="divide-y divide-gray-100">
                  {filteredTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`p-6 hover:bg-gray-50 transition-all duration-200 cursor-pointer relative ${
                            task.completed ? 'opacity-75' : ''
                          } ${snapshot.isDragging ? 'shadow-lg rounded-xl bg-white z-50' : ''}`}
                          onClick={() => handleTaskClick(task)}
                        >
                          {/* Priority indicator */}
                          <div 
                            className={`absolute left-0 top-0 w-1 h-full ${
                              task.priority === 'high' ? 'bg-red-500' : 
                              task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                          />

                          <div className="flex items-start space-x-4">
                            {/* Checkbox */}
                            <motion.button
                              className={`mt-1 ${task.completed ? 'text-green-600' : 'text-gray-400 hover:text-green-500'}`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => handleToggleTask(task.id, e)}
                            >
                              {task.completed ? (
                                <CheckCircle className="w-6 h-6" />
                              ) : (
                                <Circle className="w-6 h-6" />
                              )}
                            </motion.button>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-3">
                                <h3 className={`text-lg font-semibold ${
                                  task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                                }`}>
                                  {task.title}
                                </h3>
                                <div className="flex items-center space-x-2 ml-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                    <Flag className="w-3 h-3 inline mr-1" />
                                    {getPriorityLabel(task.priority)}
                                  </span>
                                  {/* 개인모드에서 그룹 할일인 경우 그룹명 표시 */}
                                  {mode === 'personal' && task.groupId && (
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                      {joinedGroups.find(g => g.id === task.groupId)?.name || '그룹'}
                                    </span>
                                  )}
                                  {task.completed && (
                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                      <CheckCircle className="w-3 h-3 inline mr-1" />
                                      완료
                                    </span>
                                  )}
                                </div>
                              </div>

                              {task.description && (
                                <p className={`text-sm mb-4 ${
                                  task.completed ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {task.description}
                                </p>
                              )}

                              {/* Meta Info */}
                              <div className="flex items-center space-x-6 text-sm text-gray-500">
                                {task.dueDate && (
                                  <div className={`flex items-center space-x-1 ${
                                    new Date(task.dueDate) < new Date() && !task.completed ? 'text-red-500' : ''
                                  }`}>
                                    <Calendar className="w-4 h-4" />
                                    <span>{format(new Date(task.dueDate), 'M월 d일', { locale: ko })}</span>
                                    {new Date(task.dueDate) < new Date() && !task.completed && (
                                      <span className="text-red-500 font-medium">(지연)</span>
                                    )}
                                  </div>
                                )}
                                {task.assignedTo && currentGroup && (
                                  <div className="flex items-center space-x-1">
                                    <User className="w-4 h-4" />
                                    <span>
                                      {currentGroup.members.find(m => m.id === task.assignedTo)?.name || '알 수 없음'}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>
                                    {task.completed && task.completedAt 
                                      ? `${format(new Date(task.completedAt), 'M월 d일 완료', { locale: ko })}`
                                      : `${format(new Date(task.createdAt), 'M월 d일 생성', { locale: ko })}`
                                    }
                                  </span>
                                </div>
                              </div>

                              {/* Progress indicator for tasks with subtasks */}
                              {task.subtasks && task.subtasks.length > 0 && (
                                <div className="mt-3">
                                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                    <span>하위 작업</span>
                                    <span>{task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className="bg-[#df6d14] h-1.5 rounded-full transition-all duration-300"
                                      style={{ 
                                        width: `${task.subtasks.length > 0 ? (task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100 : 0}%` 
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          task={selectedTask}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};

export default TasksPage;
