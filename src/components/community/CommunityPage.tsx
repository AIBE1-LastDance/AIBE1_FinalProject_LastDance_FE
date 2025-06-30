// 커뮤니티 게시글
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  MessageCircle,
  Heart,
  Bookmark,
  Users,
  Lightbulb,
  MessageSquare,
  HelpCircle,
  FileText,
  Clock,
  ThumbsUp, // 좋아요 아이콘
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import { Post } from "../../types/community/community"; // Assuming this points to src/types/community/community.ts
import { fetchAllPosts } from "../../api/community/community";

const CommunityPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"latest" | "likes" | "comments">(
    "latest"
  );
  const [filterBy, setFilterBy] = useState<"all" | "bookmarked" | "liked">(
    "all"
  );
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [totalLikes, setTotalLikes] = useState<number>(0); // ✅ 좋아요 총 개수 상태 추가

  // 게시글 불러오기
  useEffect(() => {
    fetchAllPosts()
      .then((data: any[]) => {
        const mappedPosts: Post[] = data.map((item) => ({
          postId: item.postId,
          title: item.title,
          content: item.content,
          category: item.category,
          likeCount: item.likeCount,
          reportCount: item.reportCount,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt ?? item.createdAt,
          userId: item.userId,
          authorNickname: item.authorNickname,
          commentCount: item.commentCount,
          comments: item.comments || [],
          likedBy: item.likedBy || [],
          bookmarkedBy: item.bookmarkedBy || [],
        }));
        setPosts(mappedPosts);
      })
      .catch((err) => console.error("[❌ 게시글 로딩 실패]", err));
  }, []);

  // ✅ posts 상태가 업데이트될 때마다 totalLikes 계산
  useEffect(() => {
    const calculatedTotalLikes = posts.reduce(
      (sum, post) => sum + (post.likeCount || 0),
      0
    );
    setTotalLikes(calculatedTotalLikes);
  }, [posts]); // posts 배열이 변경될 때마다 실행

  const categories = [
    { id: "all", name: "전체", icon: Filter, color: "text-gray-600" },
    {
      id: "FIND_MATE",
      name: "메이트구하기",
      icon: Users,
      color: "text-blue-600",
    },
    {
      id: "LIFE_TIPS",
      name: "생활팁",
      icon: Lightbulb,
      color: "text-yellow-600",
    },
    {
      id: "FREE_BOARD",
      name: "자유게시판",
      icon: MessageSquare,
      color: "text-purple-600",
    },
    {
      id: "QNA",
      name: "질문답변",
      icon: HelpCircle,
      color: "text-red-600",
    },
    {
      id: "POLICY",
      name: "정책게시판",
      icon: FileText,
      color: "text-green-600",
    },
  ];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;

    let matchesFilter = true;
    if (filterBy === "bookmarked") {
      matchesFilter = post.bookmarkedBy?.includes(user?.id || "") || false;
    } else if (filterBy === "liked") {
      matchesFilter = post.likedBy?.includes(user?.id || "") || false;
    }

    return matchesSearch && matchesCategory && matchesFilter;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "likes":
        return (b.likeCount || 0) - (a.likeCount || 0);
      case "comments":
        return (b.commentCount || 0) - (a.commentCount || 0);
      case "latest":
      default:
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });

  const handlePostEdit = (post: Post) => {
    setEditingPost(post);
    setIsCreateModalOpen(true);
  };

  const handlePostDelete = (postId: string) => {
    // 삭제 로직
    console.log(`Deleting post with ID: ${postId}`);
    // 실제 API 호출 및 상태 업데이트 로직 추가 필요
    // 예: deletePost(postId).then(() => setPosts(prev => prev.filter(p => p.postId !== postId)));
  };

  const handlePostClick = (post: Post) => {
    navigate(`/community/${post.postId}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">커뮤니티</h1>
              <p className="text-primary-100">
                다양한 생활 정보를 공유하고 소통해보세요!
              </p>
              {/* ✅ 총 좋아요 개수 표시 추가 */}
              <div className="flex items-center mt-2 text-primary-50">
                <ThumbsUp className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">
                  총 좋아요: {totalLikes}개
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingPost(null); // Ensure no post is being edited when opening for create
              setIsCreateModalOpen(true);
            }}
            className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">글쓰기</span>
          </button>
        </div>
      </motion.div>

      {/* 검색 및 필터 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="게시글을 검색해보세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
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

      {/* 정렬 및 필터 옵션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex justify-end items-center space-x-4"
      >
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              setFilterBy(filterBy === "bookmarked" ? "all" : "bookmarked")
            }
            className={`p-2 rounded-lg transition-colors ${
              filterBy === "bookmarked"
                ? "bg-blue-100 text-blue-700 border border-blue-300"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Bookmark
              className={`w-5 h-5 ${
                filterBy === "bookmarked" ? "fill-current" : ""
              }`}
            />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilterBy(filterBy === "liked" ? "all" : "liked")}
            className={`p-2 rounded-lg transition-colors ${
              filterBy === "liked"
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Heart
              className={`w-5 h-5 ${
                filterBy === "liked" ? "fill-current" : ""
              }`}
            />
          </motion.button>
        </div>

        <div className="flex items-center space-x-2 bg-gray-50 rounded-xl p-1">
          {[
            { key: "latest", label: "최신순", icon: Clock },
            { key: "likes", label: "좋아요순", icon: ThumbsUp },
            { key: "comments", label: "댓글순", icon: MessageCircle },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setSortBy(option.key as any)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === option.key
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <option.icon className="w-4 h-4" />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* 게시글 목록 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {sortedPosts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              게시글이 없습니다
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedCategory !== "all" || filterBy !== "all"
                ? "검색 조건에 맞는 게시글을 찾을 수 없습니다."
                : "첫 번째 게시글을 작성해보세요!"}
            </p>
            <button
              onClick={() => {
                setEditingPost(null); // Ensure no post is being edited when opening for create
                setIsCreateModalOpen(true);
              }}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              글쓰기
            </button>
          </div>
        ) : (
          sortedPosts.map((post, index) => (
            <motion.div
              key={post.postId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PostCard
                post={post}
                onClick={() => handlePostClick(post)}
                onEdit={handlePostEdit}
                onDelete={handlePostDelete}
              />
            </motion.div>
          ))
        )}
      </motion.div>

      {/* 글쓰기 모달 */}
      {isCreateModalOpen && (
        <CreatePostModal
          post={editingPost}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingPost(null);
            // 게시글 작성/수정 후 목록을 새로고침하려면 여기에서 fetchAllPosts를 다시 호출
            fetchAllPosts()
              .then((data: any[]) => {
                const mappedPosts: Post[] = data.map((item) => ({
                  postId: item.postId,
                  title: item.title,
                  content: item.content,
                  category: item.category,
                  likeCount: item.likeCount,
                  reportCount: item.reportCount,
                  createdAt: item.createdAt,
                  updatedAt: item.updatedAt ?? item.createdAt,
                  userId: item.userId,
                  authorNickname: item.authorNickname,
                  commentCount: item.commentCount,
                  comments: item.comments || [],
                  likedBy: item.likedBy || [],
                  bookmarkedBy: item.bookmarkedBy || [],
                }));
                setPosts(mappedPosts);
              })
              .catch((err) => console.error("[❌ 게시글 로딩 실패]", err));
          }}
        />
      )}
    </div>
  );
};

export default CommunityPage;
