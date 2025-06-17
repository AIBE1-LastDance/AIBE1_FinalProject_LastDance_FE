import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Group, Task, Event, Expense, User, Post } from '../types';
import toast from 'react-hot-toast';

type AppMode = 'personal' | 'group';

interface AppState {
  mode: AppMode;
  currentGroup: Group | null;
  joinedGroups: Group[];
  tasks: Task[];
  events: Event[];
  expenses: Expense[];
  posts: Post[];
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
  
  // Calendar actions
  setCurrentDate: (date: Date) => void;
  setCurrentView: (view: 'year' | 'month' | 'week' | 'day') => void;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Event actions
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  
  // Expense actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  // Post actions
  addPost: (post: Omit<Post, 'id' | 'createdAt'>) => void;
  updatePost: (id: string, updates: Partial<Post>) => void;
  deletePost: (id: string) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);
const generateGroupCode = () => Math.random().toString(36).toUpperCase().substr(2, 6);

// 현재 스토어 버전
const STORE_VERSION = 4;

// 임시 게시글 데이터
const samplePosts: Post[] = [
  {
    id: 'post1',
    title: '룸메이트 구해요! 강남역 근처 원룸 쉐어하실 분',
    content: '안녕하세요! 강남역 도보 5분 거리 원룸에서 함께 살 룸메이트를 구하고 있습니다.\n\n- 위치: 강남역 도보 5분\n- 월세: 80만원 (2명이서 나눠내면 40만원)\n- 관리비: 별도 5만원\n- 입주 가능일: 3월 1일부터\n\n깔끔하고 조용한 분이면 좋겠어요. 관심 있으시면 댓글 남겨주세요!',
    category: 'roommate',
    tags: ['강남역', '룸메이트', '원룸쉐어'],
    userId: 'user1',
    author: { id: 'user1', name: '김민수', email: 'minsu@example.com' },
    likes: 12,
    likedBy: ['user2', 'user3', 'google_user_123'],
    bookmarkedBy: ['user2', 'google_user_123'],
    comments: [
      {
        id: 'comment1',
        content: '혹시 반려동물은 괜찮나요?',
        userId: 'user2',
        author: { id: 'user2', name: '이영희', email: 'younghee@example.com' },
        createdAt: new Date('2024-02-15T10:30:00')
      },
      {
        id: 'comment2',
        content: '위치가 정말 좋네요! 연락드리고 싶어요.',
        userId: 'user3',
        author: { id: 'user3', name: '박철수', email: 'chulsoo@example.com' },
        createdAt: new Date('2024-02-15T14:20:00')
      }
    ],
    createdAt: new Date('2024-02-15T09:00:00'),
    updatedAt: new Date('2024-02-15T09:00:00')
  },
  {
    id: 'post2',
    title: '전기요금 절약하는 꿀팁 공유합니다!',
    content: '겨울철 전기요금이 너무 많이 나와서 여러 방법을 시도해봤는데, 효과가 좋았던 방법들을 공유해요!\n\n1. 보일러 온도를 18-20도로 유지하기\n2. 문풍지 붙이기 (정말 효과 좋음!)\n3. 전기매트 대신 전기요 사용하기\n4. 대기전력 차단 (멀티탭 끄기)\n5. LED 전구로 교체하기\n\n이렇게 했더니 한 달에 3만원 정도 절약됐어요. 다들 한번 시도해보세요!',
    category: 'tip',
    tags: ['전기요금', '절약', '생활팁'],
    userId: 'user2',
    author: { id: 'user2', name: '이영희', email: 'younghee@example.com' },
    likes: 28,
    likedBy: ['user1', 'user3', 'user4', 'google_user_123'],
    bookmarkedBy: ['user1', 'user4', 'google_user_123'],
    comments: [
      {
        id: 'comment3',
        content: '문풍지 정말 효과 있어요! 저도 작년에 붙였는데 확실히 따뜻해졌어요.',
        userId: 'user1',
        author: { id: 'user1', name: '김민수', email: 'minsu@example.com' },
        createdAt: new Date('2024-02-14T16:45:00')
      },
      {
        id: 'comment4',
        content: '대기전력 차단 꿀팁이네요! 당장 실천해봐야겠어요.',
        userId: 'google_user_123',
        author: { id: 'google_user_123', name: '김우리', email: 'woori@gmail.com' },
        createdAt: new Date('2024-02-14T18:20:00')
      },
      {
        id: 'comment5',
        content: '전기요 추천 제품 있나요?',
        userId: 'user4',
        author: { id: 'user4', name: '정민지', email: 'minji@example.com' },
        createdAt: new Date('2024-02-14T20:10:00')
      }
    ],
    createdAt: new Date('2024-02-14T15:30:00'),
    updatedAt: new Date('2024-02-14T15:30:00')
  },
  {
    id: 'post3',
    title: '오늘 날씨 너무 좋네요!',
    content: '오랜만에 날씨가 따뜻해져서 기분이 좋아요 ☀️\n\n산책하기 딱 좋은 날씨인 것 같은데, 다들 어떻게 보내고 계신가요?\n\n저는 한강공원에 나들이 갔다 왔는데 사람들이 정말 많더라고요. 벚꽃은 아직 피지 않았지만 그래도 강바람이 시원해서 좋았어요.\n\n이런 날엔 집에만 있기 아까워요! 😊',
    category: 'free',
    tags: ['날씨', '산책', '한강공원'],
    userId: 'user3',
    author: { id: 'user3', name: '박철수', email: 'chulsoo@example.com' },
    likes: 8,
    likedBy: ['user2', 'google_user_123'],
    bookmarkedBy: [],
    comments: [
      {
        id: 'comment6',
        content: '저도 오늘 산책했어요! 정말 날씨 좋았죠.',
        userId: 'user2',
        author: { id: 'user2', name: '이영희', email: 'younghee@example.com' },
        createdAt: new Date('2024-02-13T19:30:00')
      }
    ],
    createdAt: new Date('2024-02-13T17:20:00'),
    updatedAt: new Date('2024-02-13T17:20:00')
  },
  {
    id: 'post4',
    title: '세탁기 소음 문제 어떻게 해결하나요?',
    content: '안녕하세요! 최근에 이사한 집의 세탁기에서 소음이 너무 심해서 고민이에요.\n\n특히 탈수할 때 진동이 심해서 아래층에 피해를 줄까 봐 걱정됩니다.\n\n혹시 세탁기 소음 줄이는 방법 아시는 분 계신가요?\n\n- 세탁기 받침대를 바꿔야 할까요?\n- 아니면 다른 방법이 있을까요?\n\n좋은 조언 부탁드려요! 🙏',
    category: 'question',
    tags: ['세탁기', '소음', '진동'],
    userId: 'user4',
    author: { id: 'user4', name: '정민지', email: 'minji@example.com' },
    likes: 5,
    likedBy: ['user1', 'user2'],
    bookmarkedBy: ['user1'],
    comments: [
      {
        id: 'comment7',
        content: '세탁기 밑에 고무패드 깔면 진동이 많이 줄어들어요!',
        userId: 'user1',
        author: { id: 'user1', name: '김민수', email: 'minsu@example.com' },
        createdAt: new Date('2024-02-12T21:15:00')
      },
      {
        id: 'comment8',
        content: '수평 맞추기도 중요해요. 세탁기 다리 높이를 조절해보세요.',
        userId: 'user2',
        author: { id: 'user2', name: '이영희', email: 'younghee@example.com' },
        createdAt: new Date('2024-02-12T22:00:00')
      }
    ],
    createdAt: new Date('2024-02-12T20:45:00'),
    updatedAt: new Date('2024-02-12T20:45:00')
  },
  {
    id: 'post5',
    title: '2024년 청년 주거지원 정책 정리',
    content: '올해 청년 주거지원 정책이 많이 바뀌어서 정리해봤어요!\n\n**🏠 청년 전세임대주택**\n- 지원대상: 만 19~39세 청년\n- 소득기준: 도시근로자 월평균소득 100% 이하\n- 임대료: 시세의 30~40% 수준\n\n**🏡 청년 매입임대주택**\n- 지원대상: 만 19~39세 청년\n- 소득기준: 도시근로자 월평균소득 80% 이하\n- 임대료: 시세의 60~80% 수준\n\n**💰 청년 월세 한시 특별지원**\n- 지원금액: 월 20만원 (최대 12개월)\n- 신청조건: 부모와 별거, 소득 등 조건 충족\n\n자세한 내용은 국토교통부 홈페이지에서 확인하세요!',
    category: 'policy',
    tags: ['청년정책', '주거지원', '전세임대'],
    userId: 'google_user_123',
    author: { id: 'google_user_123', name: '김우리', email: 'woori@gmail.com' },
    likes: 35,
    likedBy: ['user1', 'user2', 'user3', 'user4'],
    bookmarkedBy: ['user1', 'user2', 'user3', 'user4'],
    comments: [
      {
        id: 'comment9',
        content: '정말 유용한 정보네요! 감사합니다.',
        userId: 'user1',
        author: { id: 'user1', name: '김민수', email: 'minsu@example.com' },
        createdAt: new Date('2024-02-11T14:20:00')
      },
      {
        id: 'comment10',
        content: '월세 지원 신청 방법도 알려주세요!',
        userId: 'user3',
        author: { id: 'user3', name: '박철수', email: 'chulsoo@example.com' },
        createdAt: new Date('2024-02-11T15:45:00')
      }
    ],
    createdAt: new Date('2024-02-11T13:00:00'),
    updatedAt: new Date('2024-02-11T13:00:00')
  },
  {
    id: 'post6',
    title: '집에서 키우기 좋은 공기정화 식물 추천',
    content: '미세먼지 때문에 집에서 공기정화 식물을 키우고 싶어서 여러 가지 알아봤어요!\n\n**키우기 쉬운 공기정화 식물들:**\n\n🌱 **스파티필름**\n- 그늘에서도 잘 자람\n- 물을 좋아해서 관리 쉬움\n- 포름알데히드 제거 효과\n\n🌿 **산세베리아**\n- 물을 적게 줘도 됨\n- 밤에도 산소 방출\n- 초보자에게 최고\n\n🍃 **아이비**\n- 벤젠, 포름알데히드 제거\n- 습도 조절 효과\n- 예쁘게 늘어져서 인테리어 효과\n\n모두 관리하기 쉬워서 식물 초보자에게 추천해요!',
    category: 'tip',
    tags: ['식물', '공기정화', '인테리어'],
    userId: 'user2',
    author: { id: 'user2', name: '이영희', email: 'younghee@example.com' },
    likes: 22,
    likedBy: ['user1', 'user3', 'user4', 'google_user_123'],
    bookmarkedBy: ['user3', 'google_user_123'],
    comments: [
      {
        id: 'comment11',
        content: '산세베리아 정말 키우기 쉬워요! 물도 한 달에 한 번만 주면 돼요.',
        userId: 'google_user_123',
        author: { id: 'google_user_123', name: '김우리', email: 'woori@gmail.com' },
        createdAt: new Date('2024-02-10T11:30:00')
      }
    ],
    createdAt: new Date('2024-02-10T09:15:00'),
    updatedAt: new Date('2024-02-10T09:15:00')
  }
];

// 임시 그룹 데이터
const sampleGroups: Group[] = [
  {
    id: 'group1',
    name: '우리 가족',
    code: 'FAM123',
    createdBy: 'user1', // 현재 로그인한 사용자로 변경
    createdAt: new Date('2024-01-01'),
    members: [
      { id: 'google_user_123', name: '김우리', email: 'woori@gmail.com' },
      { id: 'user1', name: '김아빠', email: 'dad@family.com' },
      { id: 'user2', name: '김엄마', email: 'mom@family.com' },
      { id: 'user3', name: '김딸', email: 'daughter@family.com' },
    ]
  },
  {
    id: 'group2',
    name: '우리집 하우스메이트',
    code: 'HOUSE2024',
    createdBy: 'google_user_123',
    createdAt: new Date('2024-02-01'),
    members: [
      { id: 'google_user_123', name: '김우리', email: 'woori@gmail.com' },
      { id: 'user4', name: '이룸메', email: 'roommate1@example.com' },
      { id: 'user5', name: '박하우스', email: 'roommate2@example.com' },
    ]
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      mode: 'personal',
      currentGroup: null,
      joinedGroups: sampleGroups,
      tasks: [],
      events: [],
      expenses: [],
      posts: samplePosts,
      currentDate: new Date(),
      currentView: 'month',
      version: STORE_VERSION,

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
          code: groupCode,
          createdBy: 'other_user',
          createdAt: new Date(),
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

      // Expense actions
      addExpense: (expenseData) => {
        const newExpense: Expense = {
          ...expenseData,
          id: generateId(),
          createdAt: new Date(),
        };
        
        set((state) => ({
          expenses: [...state.expenses, newExpense]
        }));
      },

      updateExpense: (id, updates) => {
        set((state) => ({
          expenses: state.expenses.map(expense =>
            expense.id === id ? { ...expense, ...updates } : expense
          )
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter(expense => expense.id !== id)
        }));
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
        currentDate: state.currentDate,
        currentView: state.currentView,
        version: state.version,
      }),
      // Date 객체 직렬화/역직렬화 처리
      serialize: (state) => {
        const serialized = JSON.stringify({
          ...state,
          state: {
            ...state.state,
            currentDate: state.state.currentDate?.toISOString(),
            version: state.state.version,
            joinedGroups: state.state.joinedGroups?.map((group: Group) => ({
              ...group,
              createdAt: group.createdAt?.toISOString(),
            })),
            tasks: state.state.tasks?.map((task: Task) => ({
              ...task,
              createdAt: task.createdAt?.toISOString(),
              dueDate: task.dueDate?.toISOString(),
            })),
            events: state.state.events?.map((event: Event) => ({
              ...event,
              date: event.date?.toISOString(),
              endDate: event.endDate?.toISOString(),
            })),
            expenses: state.state.expenses?.map((expense: Expense) => ({
              ...expense,
              createdAt: expense.createdAt?.toISOString(),
              date: expense.date?.toISOString(),
            })),
            posts: state.state.posts?.map((post: Post) => ({
              ...post,
              createdAt: post.createdAt?.toISOString(),
              comments: post.comments?.map((comment) => ({
                ...comment,
                createdAt: comment.createdAt?.toISOString(),
              })),
            })),
          },
        });
        return serialized;
      },
      deserialize: (str) => {
        const parsed = JSON.parse(str);
        
        // 버전 체크 및 마이그레이션
        const dataVersion = parsed.state.version || 1;
        if (dataVersion < STORE_VERSION) {
          console.log(`Migrating app store from version ${dataVersion} to ${STORE_VERSION}`);
          // 새로운 샘플 그룹 데이터로 교체
          parsed.state.joinedGroups = sampleGroups;
          parsed.state.currentGroup = null; // 현재 그룹 초기화
          parsed.state.posts = samplePosts; // 새로운 샘플 포스트 데이터 적용
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
            })) || sampleGroups, // 폴백으로 새 샘플 데이터 사용
            tasks: parsed.state.tasks?.map((task: any) => ({
              ...task,
              createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
              dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            })) || [],
            events: parsed.state.events?.map((event: any) => ({
              ...event,
              date: event.date ? new Date(event.date) : new Date(),
              endDate: event.endDate ? new Date(event.endDate) : undefined,
            })) || [],
            expenses: parsed.state.expenses?.map((expense: any) => ({
              ...expense,
              createdAt: expense.createdAt ? new Date(expense.createdAt) : new Date(),
              date: expense.date ? new Date(expense.date) : new Date(),
            })) || [],
            posts: parsed.state.posts?.map((post: any) => ({
              ...post,
              createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
              comments: post.comments?.map((comment: any) => ({
                ...comment,
                createdAt: comment.createdAt ? new Date(comment.createdAt) : new Date(),
              })) || [],
            })) || samplePosts, // 폴백으로 새 샘플 데이터 사용
            version: STORE_VERSION, // 항상 최신 버전으로 설정
          },
        };
      },
    }
  )
);
