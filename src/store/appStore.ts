import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Group, Task, Event, Expense, Post, GroupResponse, GroupMember } from '../types';
import { groupsAPI } from '../api/groups';
import { expenseAPI } from "../api/expense";
import toast from 'react-hot-toast';

type AppMode = 'personal' | 'group';

interface AppState {
  mode: AppMode;
  currentGroup: Group | null;
  joinedGroups: Group[];
  tasks: Task[];
  events: Event[];
  expenses: Expense[];
  groupShares: [];
  posts: Post[];
  savedAnalyses: any[]; // AI 분석 결과 저장
  currentDate: Date;
  currentView: 'year' | 'month' | 'week' | 'day';
  version?: number; // 버전 관리용
  
  // Actions
  setMode: (mode: AppMode) => void;
  setCurrentGroup: (group: Group | null) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  createGroup: (group: Omit<Group, 'id' | 'createdAt'>) => void;
  joinGroup: (groupCode: string) => void;
  leaveGroup: (groupId: string) => void;
  deleteGroup: (groupId: string) => void;
  
  // Group API actions
  loadMyGroups: () => Promise<void>;
  refreshCurrentGroup: () => Promise<void>; // 추가
  
  // Calendar actions
  setCurrentDate: (date: Date) => void;
  setCurrentView: (view: 'year' | 'month' | 'week' | 'day') => void;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  reorderTasks: (startIndex: number, endIndex: number) => void;
  
  // Event actions
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  deleteEventSeries: (eventId: string) => void;
  deleteFutureEvents: (eventId: string) => void;
  
  // Expense actions
  loadExpenses: (params: any) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<Expense>;
  updateExpense: (id: number, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
  loadGroupShares: (params: any) => Promise<void>;
  
  // Post actions
  addPost: (post: Omit<Post, 'id' | 'createdAt'>) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;

  // Analysis actions
  saveAnalysis: (analysis: any) => void;
  deleteAnalysis: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);
const generateGroupCode = () => Math.random().toString(36).toUpperCase().substr(2, 6);

// 현재 스토어 버전
const STORE_VERSION = 4;


export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // ==== UI 상태만 유지 ====
      mode: 'personal',
      currentGroup: null,
      currentDate: new Date(),
      currentView: 'month',
      version: STORE_VERSION,

      // ==== 실제 데이터 ====
      joinedGroups: [],
      events: [],
      posts: [],
      tasks: [],
      expenses: [],
      groupShares: [],
      savedAnalyses: [],

      setMode: (mode) => {
        set({ mode });
        // 그룹 모드로 변경 시 첫 번째 그룹을 선택
        if (mode === 'group') {
          const { joinedGroups, currentGroup } = get();
          if (joinedGroups.length > 0 && !currentGroup) {
            set({ currentGroup: joinedGroups[0] });
          }
        }
      },

      setCurrentGroup: (group) => set({ currentGroup: group }),

      // Calendar actions
      setCurrentDate: (date) => set({ currentDate: date }),
      setCurrentView: (view) => set({ currentView: view }),

      updateGroup: (groupId, updates) => {
        set((state) => ({
          joinedGroups: state.joinedGroups.map(group =>
            group.id === groupId ? { ...group, ...updates } : group
          ),
          currentGroup: state.currentGroup?.id === groupId 
            ? { ...state.currentGroup, ...updates }
            : state.currentGroup
        }));
      },

      createGroup: (groupData) => {
        const newGroup: Group = {
          ...groupData,
          id: generateId(),
          code: generateGroupCode(),
          createdAt: new Date(),
        };
        
        set((state) => ({
          joinedGroups: [...state.joinedGroups, newGroup],
          currentGroup: newGroup,
          mode: 'group'
        }));
        
        toast.success('그룹이 생성되었습니다!');
      },

      joinGroup: (groupCode) => {
        // 실제로는 서버에서 그룹 코드로 그룹을 찾아옴
        const mockGroup: Group = {
          id: generateId(),
          name: '새로운 그룹',
          description: '새로 가입한 그룹',
          code: groupCode,
          createdBy: 'other_user',
          createdAt: new Date(),
          maxMembers: 10,
          monthlyBudget: 300000, // 기본 30만원
          members: [
            { id: 'other_user', name: '그룹장', email: 'leader@group.com' },
            { id: 'current_user', name: '나', email: 'me@example.com' }
          ]
        };
        
        set((state) => ({
          joinedGroups: [...state.joinedGroups, mockGroup],
          currentGroup: mockGroup,
          mode: 'group'
        }));
        
        toast.success('그룹에 참여했습니다!');
      },

      leaveGroup: (groupId) => {
        set((state) => {
          const newJoinedGroups = state.joinedGroups.filter(group => group.id !== groupId);
          return {
            joinedGroups: newJoinedGroups,
            currentGroup: state.currentGroup?.id === groupId 
              ? (newJoinedGroups.length > 0 ? newJoinedGroups[0] : null)
              : state.currentGroup,
            mode: newJoinedGroups.length === 0 ? 'personal' : state.mode
          };
        });
        
        toast.success('그룹에서 탈퇴했습니다.');
      },

      deleteGroup: (groupId) => {
        set((state) => {
          const newJoinedGroups = state.joinedGroups.filter(group => group.id !== groupId);
          return {
            joinedGroups: newJoinedGroups,
            currentGroup: state.currentGroup?.id === groupId 
              ? (newJoinedGroups.length > 0 ? newJoinedGroups[0] : null)
              : state.currentGroup,
            mode: newJoinedGroups.length === 0 ? 'personal' : state.mode
          };
        });
        
        toast.success('그룹이 삭제되었습니다.');
      },

      // Group API actions
      loadMyGroups: async () => {
        try {
          const groupResponses = await groupsAPI.getMyGroups();
          
          // API 응답을 Group 타입으로 변환
          const groups: Group[] = groupResponses.map((response: GroupResponse) => ({
            id: response.groupId,
            name: response.groupName,
            description: '', // API에 없으므로 빈 문자열
            code: response.inviteCode,
            members: response.members, // 이미 GroupMember[] 타입이므로 직접 사용
            createdBy: response.ownerId,
            createdAt: new Date(), // API에 없으므로 현재 시간
            maxMembers: response.maxMembers,
            monthlyBudget: response.groupBudget,
          }));

          set({ joinedGroups: groups });
          
          // 현재 그룹이 없거나, 현재 그룹이 업데이트된 목록에 없으면 첫 번째 그룹을 설정
          const { currentGroup } = get();
          if (!currentGroup || !groups.find(g => g.id === currentGroup.id)) {
            if (groups.length > 0) {
              set({ currentGroup: groups[0] });
            }
          } else {
            // 현재 그룹이 있으면 업데이트된 정보로 교체
            const updatedCurrentGroup = groups.find(g => g.id === currentGroup.id);
            if (updatedCurrentGroup) {
              set({ currentGroup: updatedCurrentGroup });
            }
          }
        } catch (error: any) {
          console.error('그룹 목록 로드 오류:', error);
          toast.error('그룹 목록을 불러오는데 실패했습니다.');
        }
      },

      refreshCurrentGroup: async () => {
        const { currentGroup } = get();
        if (!currentGroup) return;

        try {
          const groupResponse = await groupsAPI.getGroup(currentGroup.id);
          
          // API 응답을 Group 타입으로 변환
          const updatedGroup: Group = {
            id: groupResponse.groupId,
            name: groupResponse.groupName,
            description: currentGroup.description, // 기존 설명 유지
            code: groupResponse.inviteCode,
            members: groupResponse.members,
            createdBy: groupResponse.ownerId,
            createdAt: currentGroup.createdAt, // 기존 생성일 유지
            maxMembers: groupResponse.maxMembers,
            monthlyBudget: groupResponse.groupBudget,
          };

          // 현재 그룹과 그룹 목록 모두 업데이트
          set((state) => ({
            currentGroup: updatedGroup,
            joinedGroups: state.joinedGroups.map(group => 
              group.id === updatedGroup.id ? updatedGroup : group
            )
          }));

        } catch (error: any) {
          console.error('현재 그룹 새로고침 오류:', error);
          toast.error('그룹 정보를 새로고침하는데 실패했습니다.');
        }
      },

      // Task actions
      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: generateId(),
          createdAt: new Date(),
        };
        
        set((state) => ({
          tasks: [...state.tasks, newTask]
        }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map(task =>
            task.id === id ? { ...task, ...updates } : task
          )
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter(task => task.id !== id)
        }));
      },

      toggleTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map(task =>
            task.id === id 
              ? { 
                  ...task, 
                  completed: !task.completed,
                  completedAt: !task.completed ? new Date() : undefined
                } 
              : task
          )
        }));
      },

      reorderTasks: (startIndex, endIndex) => {
        set((state) => {
          const result = Array.from(state.tasks);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          return { tasks: result };
        });
      },

      // Event actions
      addEvent: (eventData) => {
        const newEvent: Event = {
          ...eventData,
          id: generateId(),
        };
        
        set((state) => ({
          events: [...state.events, newEvent]
        }));
      },

      updateEvent: (id, updates) => {
        set((state) => ({
          events: state.events.map(event =>
            event.id === id ? { ...event, ...updates } : event
          )
        }));
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter(event => event.id !== id)
        }));
      },

      deleteEventSeries: (eventId) => {
        set((state) => {
          const event = state.events.find(e => e.id === eventId);
          if (!event) return state;

          // 원본 이벤트 ID를 찾기
          const originalId = event.originalEventId || eventId;
          
          // 같은 시리즈의 모든 이벤트 삭제
          return {
            events: state.events.filter(e => 
              e.id !== originalId && 
              e.originalEventId !== originalId &&
              e.id !== eventId
            )
          };
        });
      },

      deleteFutureEvents: (eventId) => {
        set((state) => {
          const event = state.events.find(e => e.id === eventId);
          if (!event) return state;

          const eventDate = new Date(event.date);
          const originalId = event.originalEventId || eventId;
          
          // 해당 날짜 이후의 반복 이벤트들만 삭제
          return {
            events: state.events.filter(e => {
              if (e.id === originalId || e.originalEventId === originalId) {
                const compareDate = new Date(e.date);
                return compareDate < eventDate;
              }
              return e.id !== eventId;
            })
          };
        });
      },

      // Expense actions
      loadExpenses: async (params) => {
        try {
          console.log('🔍 지출 조회 요청 파라미터:', params);

          let response;

          // mode에 따른 적절한 API 호출
          if (params.mode === 'personal') {
            response = await expenseAPI.getPersonalExpenses({
              year: params.year,
              month: params.month,
              category: params.category,
              search: params.search,
            });
          } else if(params.mode === 'group') {
            // 특정 그룹 지출 조회
            response = await expenseAPI.getGroupExpensesById(params.groupId, {
              year: params.year,
              month: params.month,
              category: params.category,
              search: params.search,
            })
          } else {
            // 전체 그룹 지출 조회
            response = await expenseAPI.getGroupExpenses({
              year: params.year,
              month: params.month,
              category: params.category,
              search: params.search,
            })
          }

          console.log('📡 백엔드 응답:', response);
          console.log('📊 응답 데이터 개수:', response.data.length);
          console.log('📋 응답 데이터 상세:', response.data);

          // 각 지출 항목의 splitType과 splitData 확인
          response.data.forEach((expense: any, index: number) => {
            console.log(`지출 ${index + 1}:`, {
              title: expense.title,
              splitType: expense.splitType,
              splitData: expense.splitData,
              expenseType: expense.expenseType
            });
          });

          const expenses = response.data.map((expense: any) => ({
            id: expense.expenseId,
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            date: expense.date,
            memo: expense.memo,
            groupId: expense.groupId,
            userId: expense.userId,
            splitType: expense.splitType,
            splitData: expense.splitData,
            expenseType: expense.expenseType,
            createdAt: expense.createdAt,
            hasReceipt: expense.hasReceipt
          }));

          // 중복 데이터 체크
          const uniqueExpenses = expenses.filter((expense, index, arr) =>
              arr.findIndex(e => e.id === expense.id) === index
          );
          if (uniqueExpenses.length > 0) {
            console.warn('⚠️ 중복 데이터 발견:', uniqueExpenses);
          }

          set({ expenses });
        } catch (error: any) {
          console.error('지출 목록 로드 실패:', error);
          toast.error('지출 목록을 불러오는데 실패했습니다.');
        }
      },

      loadGroupShares: async (params) => {
        try {
          const response = await expenseAPI.getGroupShares(params);

          const groupShares = response.data.map((share: any) => ({
            id: share.expenseId,
            originalId: share.originalExpenseId,
            title: share.title,
            amount: share.amount,
            myShareAmount: share.myShareAmount, // 내 분담금
            category: share.category,
            date: share.date,
            memo: share.memo,
            groupId: share.groupId,
            groupName: share.groupName,
            splitType: share.splitType,
            isGroupShare: true, // 구분용 플래그
            hasReceipt: share.hasReceipt,
          }));

          set({ groupShares });
        } catch (error) {
          console.error('그룹 분담금 로드 실패: ', error);
        }
      },

      addExpense: async (expenseData: any) => {
        try {
          const expenseRequest = {
            title: expenseData.title,
            amount: expenseData.amount,
            category: expenseData.category,
            date: expenseData.date,
            memo: expenseData.memo,
            groupId: expenseData.groupId || null,
            splitType: expenseData.splitType,
            splitData: expenseData.splitData && Object.keys(expenseData.splitData).length > 0
                ? Object.entries(expenseData.splitData).map(([userId, amount]) => ({
                  userId: userId,
                  amount: Number(amount)
                }))
                : undefined,
            receipt: expenseData.receipt,
          };

          const response = await expenseAPI.create(expenseRequest);
          const newExpense = {
            id: response.data.expenseId,
            title: response.data.title,
            amount: response.data.amount,
            category: response.data.category,
            date: response.data.date,
            memo: response.data.memo,
            groupId: response.data.groupId,
            userId: response.data.userId,
            splitType: response.data.splitType,
            splitData: response.data.splitData,
            expenseType: response.data.expenseType,
            createdAt: response.data.createdAt,
            hasReceipt: response.data.hasReceipt
          };

          set((state) => ({
            expenses: [...state.expenses, newExpense]
          }));

          toast.success('지출이 추가되었습니다!');
          return newExpense;
        } catch (error: any) {
          console.error('지출 추가 실패:', error);
          toast.error('지출 추가에 실패했습니다.');
          throw error;
        }
      },

      updateExpense: async (id, updates) => {
        try {
          await expenseAPI.update(id, updates);

          // 전체 새로고침으로 확실히 업데이트
          const state = get();
          await state.loadExpenses({
            mode: state.mode,
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            groupId: state.mode === 'group' ? state.currentGroup?.id : null
          });


          toast.success('지출이 수정되었습니다!');
        } catch (error: any) {
          console.error('지출 수정 실패:', error);
          toast.error('지출 수정에 실패했습니다.');
          throw error;
        }
      },

      deleteExpense: async (id) => {
        try {
          await expenseAPI.delete(id);

          set((state) => ({
            expenses: state.expenses.filter(expense => expense.id !== id)
          }));

          toast.success('지출이 삭제되었습니다!');
        } catch (error: any) {
          console.error('지출 삭제 실패:', error);
          toast.error('지출 삭제에 실패했습니다.');
          throw error;
        }
      },

      // Post actions
      addPost: (postData) => {
        const newPost: Post = {
          ...postData,
          id: generateId(),
          createdAt: new Date(),
        };
        
        set((state) => ({
          posts: [...state.posts, newPost]
        }));
      },

      updatePost: (id, updates) => {
        set((state) => ({
          posts: state.posts.map(post =>
            post.id === id ? { ...post, ...updates } : post
          )
        }));
      },

      deletePost: (id) => {
        set((state) => ({
          posts: state.posts.filter(post => post.id !== id)
        }));
      },

      // Analysis actions
      saveAnalysis: (analysis) => {
        set((state) => ({
          savedAnalyses: [analysis, ...state.savedAnalyses]
        }));
      },

      deleteAnalysis: (id) => {
        set((state) => ({
          savedAnalyses: state.savedAnalyses.filter(analysis => analysis.id !== id)
        }));
      },
    }),
    {
      name: 'app-storage-v4', // 키 이름 변경으로 강제 리셋
      partialize: (state) => ({
        mode: state.mode,
        currentGroup: state.currentGroup,
        joinedGroups: state.joinedGroups,
        tasks: state.tasks,
        events: state.events,
        expenses: state.expenses,
        posts: state.posts,
        savedAnalyses: state.savedAnalyses,
        currentDate: state.currentDate,
        currentView: state.currentView,
        version: state.version,
      }),
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;

          try {
            const parsed = JSON.parse(str);
            
            // 버전 체크 및 마이그레이션
            const dataVersion = parsed.state.version || 1;
            if (dataVersion < STORE_VERSION) {
              console.log(`Migrating app store from version ${dataVersion} to ${STORE_VERSION}`);
              // 새로운 샘플 그룹 데이터로 교체
              parsed.state.joinedGroups = sampleGroups;
              parsed.state.currentGroup = null; // 현재 그룹 초기화
              parsed.state.posts = samplePosts; // 새로운 샘플 포스트 데이터 적용
              parsed.state.events = sampleEvents; // 새로운 샘플 이벤트 데이터 적용
              parsed.state.version = STORE_VERSION;
            }
            
            return {
              ...parsed,
              state: {
                ...parsed.state,
                currentDate: parsed.state.currentDate ? new Date(parsed.state.currentDate) : new Date(),
                joinedGroups: parsed.state.joinedGroups?.map((group: any) => ({
                  ...group,
                  createdAt: group.createdAt ? new Date(group.createdAt) : new Date(),
                })) || sampleGroups,
                tasks: parsed.state.tasks?.map((task: any) => ({
                  ...task,
                  createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
                  dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                })) || [],
                events: parsed.state.events?.map((event: any) => ({
                  ...event,
                  date: event.date ? new Date(event.date) : new Date(),
                  endDate: event.endDate ? new Date(event.endDate) : undefined,
                  repeatEndDate: event.repeatEndDate ? new Date(event.repeatEndDate) : undefined,
                })) || sampleEvents,
                expenses: parsed.state.expenses?.map((expense: any) => ({
                  ...expense,
                  createdAt: expense.createdAt ? new Date(expense.createdAt) : new Date(),
                  date: expense.date ? new Date(expense.date) : new Date(),
                })) || [],
                savedAnalyses: parsed.state.savedAnalyses?.map((analysis: any) => ({
                  ...analysis,
                  date: analysis.date ? new Date(analysis.date) : new Date(),
                })) || [],
                posts: parsed.state.posts?.map((post: any) => ({
                  ...post,
                  createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
                  comments: post.comments?.map((comment: any) => ({
                    ...comment,
                    createdAt: comment.createdAt ? new Date(comment.createdAt) : new Date(),
                  })) || [],
                })) || samplePosts,
                version: STORE_VERSION,
              },
            };
          } catch (error) {
            console.error('Error parsing stored data:', error);
            return null;
          }
        },
        setItem: (name, value) => {
          const serializedValue = JSON.stringify({
            ...value,
            state: {
              ...value.state,
              currentDate: value.state.currentDate?.toISOString(),
              joinedGroups: value.state.joinedGroups?.map((group: Group) => ({
                ...group,
                createdAt: group.createdAt?.toISOString(),
              })),
              tasks: value.state.tasks?.map((task: Task) => ({
                ...task,
                createdAt: task.createdAt?.toISOString(),
                dueDate: task.dueDate?.toISOString(),
              })),
              events: value.state.events?.map((event: Event) => ({
                ...event,
                date: event.date?.toISOString(),
                endDate: event.endDate?.toISOString(),
                repeatEndDate: event.repeatEndDate?.toISOString(),
              })),
              expenses: value.state.expenses?.map((expense: Expense) => ({
                ...expense,
                createdAt: expense.createdAt,
                date: expense.date,
              })),
              savedAnalyses: value.state.savedAnalyses?.map((analysis: any) => ({
                ...analysis,
                date: analysis.date?.toISOString(),
              })),
              posts: value.state.posts?.map((post: Post) => ({
                ...post,
                createdAt: post.createdAt?.toISOString(),
                comments: post.comments?.map((comment) => ({
                  ...comment,
                  createdAt: comment.createdAt?.toISOString(),
                })),
              })),
            },
          });
          localStorage.setItem(name, serializedValue);
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
