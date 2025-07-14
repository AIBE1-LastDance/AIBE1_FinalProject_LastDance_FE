import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Megaphone, // FIND_MATE
  GraduationCap, // LIFE_TIPS
  MessageSquare, // FREE_BOARD
  Handshake, // QNA
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import { Post } from "../../types/community/community";
import { createPost, updatePost } from "../../api/community/community";
import {createPortal} from "react-dom";

interface CreatePostModalProps {
  post?: Post | null;
  onClose: (postData?: Post | null) => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ post, onClose }) => {
  const { user } = useAuthStore();
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [category, setCategory] = useState(post?.category || "FREE_BOARD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!post;

  const categories = [
    {
      id: "FIND_MATE",
      name: "메이트 구하기",
      icon: Megaphone,
    },
    { id: "LIFE_TIPS", name: "생활팁", icon: GraduationCap },
    {
      id: "FREE_BOARD",
      name: "자유게시판",
      icon: MessageSquare,
    },
    { id: "QNA", name: "질문/답변", icon: Handshake },
  ];

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 모두 입력해주세요.");
      return;
    }

    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        title: title.trim(),
        content: content.trim(),
        category: category,
      };

      console.log("게시글 요청 데이터:", requestData);

      let resultPost: Post;

      if (isEditing && post) {
        const updated = await updatePost(post.postId, requestData);
        resultPost = {
          ...post,
          ...updated,
          updatedAt: new Date().toISOString(),
        };
        toast.success("게시글이 성공적으로 수정되었습니다!");
      } else {
        const created = await createPost(requestData);
        resultPost = {
          postId: created.postId,
          title: created.title,
          content: created.content,
          category: created.category,
          categoryName: created.categoryName,
          likeCount: 0,
          reportCount: 0,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt || created.createdAt,
          authorId: user.id,
          authorNickname: user.nickname,
          userLiked: false,
          commentCount: 0,
          comments: [],
          userBookmarked: false,
        };
        toast.success("게시글이 성공적으로 작성되었습니다!");
      }

      onClose(resultPost);
    } catch (error: any) {
      console.error("게시글 처리 중 오류 발생:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          (isEditing ? "게시글 수정 중 오류 발생" : "게시글 작성 중 오류 발생")
      );
      onClose(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent =  (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? "게시글 수정" : "새 게시글 작성"}
            </h2>
            <button
              onClick={() => onClose(null)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* 내용 */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-6">
              {/* 카테고리 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  카테고리
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center p-3 rounded-xl border-2 transition-colors ${
                        category === cat.id
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <cat.icon className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  maxLength={100}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {title.length}/100
                </div>
              </div>

              {/* 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내용
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="내용을 입력하세요..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  maxLength={2000}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {content.length}/2000
                </div>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              {isEditing ? "게시글을 수정합니다" : "전체 공개"}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => onClose(null)}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isEditing ? "수정 중..." : "작성 중..."}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{isEditing ? "수정하기" : "게시하기"}</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
  return createPortal(modalContent, document.body);
};

export default CreatePostModal;
