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
  Users,
  MessageSquare,
  HelpCircle,
  FileText,
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
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onClick,
  onEdit,
  onDelete,
  onToggleLike,
  onToggleBookmark,
}) => {
  const { user } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);

  const getCategoryDisplayInfo = (category: string) => {
    const categories: Record<string, { icon: any; color: string }> = {
      LIFE_TIPS: {
        icon: Lightbulb,
        color: "bg-yellow-100 text-yellow-800",
      },
      FREE_BOARD: {
        icon: MessageSquare,
        color: "bg-purple-100 text-purple-800",
      },
      FIND_MATE: {
        icon: Users,
        color: "bg-blue-100 text-blue-800",
      },
      QNA: {
        icon: HelpCircle,
        color: "bg-red-100 text-red-800",
      },
      POLICY: {
        icon: FileText,
        color: "bg-green-100 text-green-800",
      },
    };
    return (
      categories[category] || {
        icon: FileText,
        color: "bg-gray-100 text-gray-800",
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

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleCardClick}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {post.authorProfileImageUrl ? (
            <img
              src={post.authorProfileImageUrl}
              alt={`${post.authorNickname || "익명"} 프로필`}
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {post.authorNickname?.charAt(0) || "U"}
              </span>
            </div>
          )}

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">
                {post.authorNickname || "익명"}
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
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${categoryDisplayInfo.color}`}
          >
            <categoryDisplayInfo.icon className="w-3 h-3" />
            <span>{post.categoryName}</span>
          </div>

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
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className={`flex items-center space-x-2 ${
              isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
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
