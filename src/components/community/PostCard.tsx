// src/components/community/PostCard.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Clock,
  MoreVertical,
  Edit,
  Trash2,
  Lightbulb,
  Users, // User 대신 Users 아이콘 사용
  MessageSquare,
  HelpCircle,
  FileText,
} from "lucide-react";
import { Post } from "../../types/community/community"; // Post 타입 임포트
import { useAuthStore } from "../../store/authStore";
// import { useAppStore } from "../../store/appStore"; // ✅ 더 이상 여기서 직접 사용하지 않음
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface PostCardProps {
  post: Post;
  onClick: (post: Post) => void; // ✅ post 객체를 인자로 받도록 수정 (navigate 등에 필요)
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  // ✅ 좋아요/북마크 토글 함수를 props로 전달받도록 추가
  onToggleLike: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onClick,
  onEdit,
  onDelete,
  onToggleLike, // ✅ props로 받은 함수
  onToggleBookmark, // ✅ props로 받은 함수
}) => {
  const { user } = useAuthStore();
  // ✅ useAppStore에서 직접 상태를 업데이트하는 로직은 CommunityPage로 이동했으므로 필요 없음
  // const { updatePost, deletePost } = useAppStore();
  const [showMenu, setShowMenu] = useState(false);

  // 게시글 카테고리 정보 가져오기
  const getCategoryInfo = (category: string) => {
    const categories: Record<
      string,
      { name: string; icon: any; color: string }
    > = {
      LIFE_TIPS: {
        name: "생활팁",
        icon: Lightbulb,
        color: "bg-yellow-100 text-yellow-800",
      },
      FREE_BOARD: {
        name: "자유게시판",
        icon: MessageSquare,
        color: "bg-purple-100 text-purple-800",
      },
      FIND_MATE: {
        name: "메이트구하기",
        icon: Users, // Users 아이콘 사용
        color: "bg-blue-100 text-blue-800",
      },
      QNA: {
        name: "질문/답변",
        icon: HelpCircle,
        color: "bg-red-100 text-red-800",
      },
      POLICY: {
        name: "정책게시판",
        icon: FileText,
        color: "bg-green-100 text-green-800",
      },
      // 필요하다면 다른 카테고리들도 백엔드 enum 값에 맞춰 추가
    };
    return (
      categories[category] || {
        name: "기타",
        icon: FileText,
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  // ✅ 좋아요 토글 핸들러: props로 받은 onToggleLike 함수 호출
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLike(post.postId); // postId 전달
  };

  // ✅ 북마크 토글 핸들러: props로 받은 onToggleBookmark 함수 호출
  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark(post.postId); // postId 전달
  };

  // ✅ 삭제 핸들러: props로 받은 onDelete 함수 호출
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      if (onDelete) onDelete(post.postId);
    }
    setShowMenu(false);
  };

  // ✅ 편집 핸들러: props로 받은 onEdit 함수 호출
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(post);
    setShowMenu(false);
  };

  const handleCardClick = () => {
    onClick(post); // ✅ 카드 클릭 시 post 객체를 전달
  };

  const categoryInfo = getCategoryInfo(post.category);
  // ✅ 백엔드에서 받은 userLiked, userBookmarked 값을 직접 사용
  const isLiked = post.userLiked;
  const isBookmarked = post.userBookmarked;
  const isAuthor = user?.id === post.userId; // `user.id`가 UUID 형식인지 확인

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleCardClick} // ✅ 수정된 클릭 핸들러
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {/* ✅ post.authorNickname의 첫 글자를 사용 */}
              {post.authorNickname?.charAt(0) || "U"}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {/* ✅ post.authorNickname을 사용, 없으면 "익명" */}
                {post.authorNickname || "익명"}
              </span>
              {/* post.groupId는 현재 Post 타입에 없으므로, 필요하다면 추가해야 합니다. */}
              {/* post.groupId && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                  그룹
                </span>
              )*/}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>
                {formatDistanceToNow(new Date(post.createdAt), {
                  addSuffix: true,
                  locale: ko,
                })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}
          >
            <categoryInfo.icon className="w-3 h-3" />
            <span>{categoryInfo.name}</span>
          </div>

          {/* 작성자만 보이는 메뉴 */}
          {isAuthor && (
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </motion.button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                  <button
                    onClick={handleEdit}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>편집</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>삭제</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 제목 및 내용 */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-600 line-clamp-3 leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* 이미지 (있는 경우) */}
      {/* post.images는 Post 타입에 없으므로, 필요하다면 추가해야 합니다. */}
      {/* {post.images && post.images.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2">
            {post.images.slice(0, 4).map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`게시글 이미지 ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                {index === 3 && post.images!.length > 4 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <span className="text-white font-medium">
                      +{post.images!.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* 태그 */}
      {/* post.tags는 Post 타입에 없으므로, 필요하다면 추가해야 합니다. */}
      {/* {post.tags && post.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded-lg"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-sm text-gray-500">
                +{post.tags.length - 3}개
              </span>
            )}
          </div>
        </div>
      )} */}

      {/* 액션 버튼들 */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className={`flex items-center space-x-2 ${
              isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
            } transition-colors`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            {/* ✅ post.likeCount 사용 */}
            <span className="text-sm font-medium">{post.likeCount || 0}</span>
          </motion.button>

          <div className="flex items-center space-x-2 text-gray-500">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              {/* ✅ post.commentCount 사용 */}
              {post.commentCount || 0}
            </span>
          </div>

          <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">공유</span>
          </button>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleBookmark}
          className={`${
            isBookmarked
              ? "text-yellow-500"
              : "text-gray-400 hover:text-yellow-500"
          } transition-colors`}
        >
          <Bookmark
            className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`}
          />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PostCard;
