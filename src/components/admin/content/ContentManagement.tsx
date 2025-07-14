import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  EyeOff, 
  Trash2, 
  Heart,
  MessageCircle,
  AlertTriangle,
  Calendar,
  User
} from 'lucide-react';

// 가상 게시글 데이터
const mockPosts = [
  {
    id: '1',
    title: '전기요금 절약하는 팁 공유합니다',
    content: '여름철 전기요금을 줄이는 다양한 방법들을 소개해드리겠습니다...',
    author: '홍길동',
    category: '생활팁',
    createdAt: '2024-01-20',
    likes: 15,
    comments: 8,
    reports: 0,
    status: 'public',
    views: 234
  },
  {
    id: '2',
    title: '같이 장보러 갈 사람 구해요',
    content: '주말에 대형마트 가실 분 계신가요? 차량 쉐어 가능합니다.',
    author: '김영희',
    category: '메이트구하기',
    createdAt: '2024-01-19',
    likes: 7,
    comments: 12,
    reports: 1,
    status: 'public',
    views: 156
  },
  {
    id: '3',
    title: '이상한 게시글입니다',
    content: '부적절한 내용이 포함된 게시글입니다...',
    author: '신고대상',
    category: '자유게시판',
    createdAt: '2024-01-18',
    likes: 2,
    comments: 1,
    reports: 5,
    status: 'hidden',
    views: 45
  }
];

// 가상 댓글 데이터
const mockComments = [
  {
    id: '1',
    content: '정말 유용한 정보네요! 감사합니다.',
    author: '사용자A',
    postTitle: '전기요금 절약하는 팁 공유합니다',
    createdAt: '2024-01-20',
    reports: 0,
    status: 'public'
  },
  {
    id: '2',
    content: '저도 참여하고 싶어요!',
    author: '사용자B',
    postTitle: '같이 장보러 갈 사람 구해요',
    createdAt: '2024-01-19',
    reports: 0,
    status: 'public'
  },
  {
    id: '3',
    content: '이런 댓글은 부적절합니다.',
    author: '문제사용자',
    postTitle: '이상한 게시글입니다',
    createdAt: '2024-01-18',
    reports: 3,
    status: 'hidden'
  }
];

type ContentType = 'posts' | 'comments';
type PostCategory = 'all' | '생활팁' | '자유게시판' | '메이트구하기' | 'Q&A' | '정책';
type ContentStatus = 'all' | 'public' | 'hidden';

const ContentManagement: React.FC = () => {
  const [contentType, setContentType] = useState<ContentType>('posts');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PostCategory>('all');
  const [statusFilter, setStatusFilter] = useState<ContentStatus>('all');
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [showContentDetail, setShowContentDetail] = useState(false);

  const filteredPosts = mockPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredComments = mockComments.filter(comment => {
    const matchesSearch = comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comment.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || comment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'public':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">공개</span>;
      case 'hidden':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">숨김</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">알 수 없음</span>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: { [key: string]: string } = {
      '생활팁': 'bg-blue-100 text-blue-800',
      '자유게시판': 'bg-green-100 text-green-800',
      '메이트구하기': 'bg-purple-100 text-purple-800',
      'Q&A': 'bg-yellow-100 text-yellow-800',
      '정책': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[category] || 'bg-gray-100 text-gray-800'}`}>
        {category}
      </span>
    );
  };

  const ContentDetailModal = () => {
    if (!selectedContent) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {contentType === 'posts' ? '게시글' : '댓글'} 상세
              </h2>
              <button
                onClick={() => setShowContentDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {contentType === 'posts' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">게시글 정보</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">제목:</span>
                        <p className="text-sm font-medium mt-1">{selectedContent.title}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">작성자:</span>
                        <p className="text-sm font-medium mt-1">{selectedContent.author}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">카테고리:</span>
                        <div className="mt-1">{getCategoryBadge(selectedContent.category)}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">작성일:</span>
                        <p className="text-sm font-medium mt-1">{selectedContent.createdAt}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">상태:</span>
                        <div className="mt-1">{getStatusBadge(selectedContent.status)}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">통계</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">조회수:</span>
                        <span className="text-sm font-medium">{selectedContent.views}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">좋아요:</span>
                        <span className="text-sm font-medium">{selectedContent.likes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">댓글:</span>
                        <span className="text-sm font-medium">{selectedContent.comments}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">신고:</span>
                        <span className={`text-sm font-medium ${selectedContent.reports > 0 ? 'text-red-600' : ''}`}>
                          {selectedContent.reports}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">내용</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-800">{selectedContent.content}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">댓글 정보</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-600">작성자:</span>
                        <p className="text-sm font-medium mt-1">{selectedContent.author}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">원본 게시글:</span>
                        <p className="text-sm font-medium mt-1">{selectedContent.postTitle}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">작성일:</span>
                        <p className="text-sm font-medium mt-1">{selectedContent.createdAt}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">상태:</span>
                        <div className="mt-1">{getStatusBadge(selectedContent.status)}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">신고:</span>
                        <span className={`text-sm font-medium ml-2 ${selectedContent.reports > 0 ? 'text-red-600' : ''}`}>
                          {selectedContent.reports}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">댓글 내용</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-800">{selectedContent.content}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 액션 버튼 */}
            <div className="flex space-x-3 pt-6 border-t">
              {selectedContent.status === 'public' ? (
                <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                  <EyeOff className="w-4 h-4 mr-2" />
                  숨기기
                </button>
              ) : (
                <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  <Eye className="w-4 h-4 mr-2" />
                  공개하기
                </button>
              )}
              <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                <Trash2 className="w-4 h-4 mr-2" />
                삭제하기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">콘텐츠 관리</h1>
          <p className="text-gray-600 mt-1">게시글 및 댓글 관리</p>
        </div>
      </div>

      {/* Content Type Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setContentType('posts')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              contentType === 'posts'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            게시글 관리
          </button>
          <button
            onClick={() => setContentType('comments')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              contentType === 'comments'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            댓글 관리
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={contentType === 'posts' ? '제목/작성자 검색' : '내용/작성자 검색'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {contentType === 'posts' && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as PostCategory)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">모든 카테고리</option>
              <option value="생활팁">생활팁</option>
              <option value="자유게시판">자유게시판</option>
              <option value="메이트구하기">메이트구하기</option>
              <option value="Q&A">Q&A</option>
              <option value="정책">정책</option>
            </select>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ContentStatus)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">모든 상태</option>
            <option value="public">공개</option>
            <option value="hidden">숨김</option>
          </select>

          <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            필터 적용
          </button>
        </div>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {contentType === 'posts' ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      제목
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작성자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작성일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      반응
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      신고수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      댓글 내용
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작성자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      원본 게시글
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작성일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      신고수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contentType === 'posts' ? (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {post.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCategoryBadge(post.category)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {post.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-4">
                        <span className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {post.likes}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {post.comments}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${post.reports > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {post.reports}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(post.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedContent(post);
                          setShowContentDetail(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                filteredComments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {comment.content}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {comment.author}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {comment.postTitle}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {comment.createdAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${comment.reports > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {comment.reports}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(comment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedContent(comment);
                          setShowContentDetail(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showContentDetail && <ContentDetailModal />}
    </div>
  );
};

export default ContentManagement;