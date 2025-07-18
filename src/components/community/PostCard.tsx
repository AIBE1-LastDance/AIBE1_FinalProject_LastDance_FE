// 기존 코드 유지
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
  MessageSquare,
  HelpCircle,
  FileText,
  Megaphone,
  GraduationCap,
  Handshake,
} from "lucide-react";
import { Post } from "../../types/community/community";
import { useAuthStore } from "../../store/authStore";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface PostCardProps {
  post: Post;
  onClick: (post: Post) => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onToggleLike: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
  showActions?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onClick,
  onEdit,
  onDelete,
  onToggleLike,
  onToggleBookmark,
  showActions = true,
}) => {
  const { user } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);

  const getCategoryDisplayInfo = (category: string) => {
    const categories: Record<
      string,
      { icon: any; borderColor: string; textColor: string }
    > = {
      LIFE_TIPS: {
        icon: GraduationCap,
        borderColor: "border-primary-600",
        textColor: "text-primary-700",
      },
      FREE_BOARD: {
        icon: MessageSquare,
        borderColor: "border-primary-700",
        textColor: "text-primary-800",
      },
      FIND_MATE: {
        icon: Megaphone,
        borderColor: "border-primary-500",
        textColor: "text-primary-600",
      },
      QNA: {
        icon: Handshake,
        borderColor: "border-primary-800",
        textColor: "text-primary-900",
      },
    };
    return (
      categories[category] || {
        icon: FileText,
        borderColor: "border-gray-400",
        textColor: "text-gray-600",
      }
    );
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLike(post.postId);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark(post.postId);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      if (onDelete) onDelete(post.postId);
    }
    setShowMenu(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(post);
    setShowMenu(false);
  };

  const handleCardClick = () => {
    onClick(post);
  };

  const categoryDisplayInfo = getCategoryDisplayInfo(post.category);
  const isLiked = post.userLiked;
  const isBookmarked = post.userBookmarked;
  const isAuthor = user?.id === post.authorId;

  const isDeletedUser = post.authorNickname?.startsWith("deleted_");
  const displayAuthorNickname = isDeletedUser
    ? "탈퇴한 회원입니다."
    : post.authorNickname || "익명";

  // 삭제된 게시글 처리
  if (post.deleted) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-500">삭제된 게시글</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
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
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border border-gray-300 text-gray-500`}
            >
              <FileText className="w-3 h-3" />
              <span>{post.categoryName}</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-500 mb-2 line-clamp-2">
            신고로 인해 삭제된 게시글입니다
          </h3>
          <p className="text-gray-400 line-clamp-3 leading-relaxed">
            운영정책을 위반하여 관리자에 의해 삭제되었습니다.
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6 text-gray-400">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <span className="text-sm font-medium">0</span>
            </div>
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">0</span>
            </div>
            <div className="flex items-center space-x-2">
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">공유</span>
            </div>
          </div>
          <Bookmark className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleCardClick}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {isDeletedUser ? (
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-gray-600" />
            </div>
          ) : post.authorProfileImageUrl ? (
            <img
              src={post.authorProfileImageUrl}
              alt={`${displayAuthorNickname} 프로필`}
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-r from-primary-400 to-amber-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {displayAuthorNickname.charAt(0)}
              </span>
            </div>
          )}

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {displayAuthorNickname}
              </span>
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
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${categoryDisplayInfo.borderColor} ${categoryDisplayInfo.textColor}`}
          >
            <categoryDisplayInfo.icon className="w-3 h-3" />
            <span>{post.categoryName}</span>
          </div>

          
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-600 line-clamp-3 leading-relaxed">
          {post.content}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          {/* 좋아요 버튼 추가 및 수정된 부분 */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className={`flex items-center space-x-2 ${
              isLiked
                ? "text-primary-500"
                : "text-gray-500 hover:text-primary-500"
            } transition-colors`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            <span className="text-sm font-medium">{post.likeCount || 0}</span>
          </motion.button>

          <div className="flex items-center space-x-2 text-gray-500">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              {post.commentCount || 0}
            </span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleBookmark}
          className={`${
            post.userBookmarked
              ? "text-yellow-500"
              : "text-gray-400 hover:text-yellow-500"
          } transition-colors`}
        >
          <Bookmark
            className={`w-5 h-5 ${post.userBookmarked ? "fill-current" : ""}`}
          />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default PostCard;
