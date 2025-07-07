import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Hash,
  Send,
  Users,
  Lightbulb,
  MessageSquare,
  HelpCircle,
  Star,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import { Post } from "../../types/community/community";
import { createPost, updatePost } from "../../api/community/community";

interface CreatePostModalProps {
  post?: Post | null;
  // ⭐ 여기에 Post 타입 또는 null/undefined를 인자로 받을 수 있도록 변경
  onClose: (postData?: Post | null) => void;
}

const frontendToBackendCategory: Record<string, string> = {
  roommate: "FIND_MATE",
  tip: "LIFE_TIPS",
  free: "FREE_BOARD",
  question: "QNA",
  policy: "POLICY",
};

const CreatePostModal: React.FC<CreatePostModalProps> = ({ post, onClose }) => {
  const { user } = useAuthStore();
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [category, setCategory] = useState(post?.category || "free");
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!post;

  const categories = [
    { id: "roommate", name: "메이트 구하기", icon: Users },
    { id: "tip", name: "생활팁", icon: Lightbulb },
    { id: "free", name: "자유게시판", icon: MessageSquare },
    { id: "question", name: "질문/답변", icon: HelpCircle },
    { id: "policy", name: "정책", icon: Star },
  ];

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

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
        category: frontendToBackendCategory[category],
        // tags는 백엔드에 보내는 데이터에 포함되지 않았으므로 제거하거나 백엔드 API에 맞게 추가해야 합니다.
        // tags: tags,
      };

      let resultPost: Post; // 성공적으로 생성 또는 수정된 게시글 데이터를 저장할 변수

      if (isEditing && post) {
        // ⭐ updatePost API는 수정된 게시글 객체를 반환한다고 가정
        const updated = await updatePost(post.postId, requestData);
        // API 응답 구조에 따라 Post 타입으로 매핑 필요
        resultPost = {
          ...post, // 기존 게시글 정보를 유지하면서
          ...updated, // API에서 반환된 최신 정보로 덮어쓰기
          // 필요한 경우 createdAt, updatedAt 등의 필드도 API 응답에 맞게 업데이트
          updatedAt: new Date().toISOString(), // 클라이언트에서 임시 업데이트 시간 설정
          // ⭐ API 응답에서 likeCount, commentCount 등이 누락될 수 있으니 주의
          // CommunityPage에서 사용하는 Post 타입에 따라 매핑 로직을 추가해야 함
          // 여기서는 간단히 updated 데이터를 Spread 했습니다.
        };
        toast.success("게시글이 수정되었습니다!");
      } else {
        // ⭐ createPost API는 새로 생성된 게시글 객체를 반환한다고 가정
        const created = await createPost(requestData);
        // API 응답 구조에 따라 Post 타입으로 매핑 필요
        resultPost = {
          postId: created.postId, // API에서 생성된 ID 사용
          title: created.title,
          content: created.content,
          category: created.category,
          categoryName: created.categoryName, // 백엔드에서 반환하는 경우
          likeCount: 0, // 새로 생성된 게시글의 초기 좋아요 수는 0
          reportCount: 0,
          createdAt: created.createdAt, // API에서 반환하는 생성 시간
          updatedAt: created.updatedAt || created.createdAt,
          userId: user.id, // 현재 로그인 사용자 ID
          authorNickname: user.nickname, // 현재 로그인 사용자 닉네임
          userLiked: false, // 새로 생성된 게시글은 좋아요 안됨
          commentCount: 0, // 새로 생성된 게시글은 댓글 0개
          comments: [],
          userBookmarked: false, // 새로 생성된 게시글은 북마크 안됨
        };
        toast.success("게시글이 성공적으로 작성되었습니다!");
      }

      // ⭐ 성공적으로 처리된 게시글 데이터를 onClose 콜백으로 전달
      onClose(resultPost);
    } catch (error: any) {
      console.error("게시글 처리 중 오류 발생:", error);
      toast.error(
        error.message ||
          (isEditing ? "게시글 수정 중 오류 발생" : "게시글 작성 중 오류 발생")
      );
      onClose(null); // 실패 시에는 null 또는 undefined 전달하여 상위 컴포넌트가 전체 로드하도록 유도 (선택 사항)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
                          ? "border-purple-500 bg-purple-50 text-purple-700"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  maxLength={2000}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {content.length}/2000
                </div>
              </div>

              {/* 태그 (현재 백엔드 API에 tags가 포함되지 않아 주석 처리) */}
              {/* <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   태그 (최대 5개)
                 </label>
                 <div className="space-y-3">
                   <div className="flex space-x-2">
                     <div className="relative flex-1">
                       <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                       <input
                         type="text"
                         value={tagInput}
                         onChange={(e) => setTagInput(e.target.value)}
                         onKeyDown={(e) =>
                           e.key === "Enter" &&
                           (e.preventDefault(), handleAddTag())
                         }
                         placeholder="태그 입력..."
                         className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                         maxLength={20}
                         disabled={tags.length >= 5}
                       />
                     </div>
                     <button
                       onClick={handleAddTag}
                       disabled={!tagInput.trim() || tags.length >= 5}
                       className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                     >
                       추가
                     </button>
                   </div>

                   {tags.length > 0 && (
                     <div className="flex flex-wrap gap-2">
                       {tags.map((tag, index) => (
                         <span
                           key={index}
                           className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                         >
                           #{tag}
                           <button
                             onClick={() => handleRemoveTag(tag)}
                             className="ml-2 text-purple-500 hover:text-purple-700"
                           >
                             ×
                           </button>
                         </span>
                       ))}
                     </div>
                   )}
                 </div>
               </div> */}
            </div>
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              {isEditing ? "게시글을 수정합니다" : "전체 공개"}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => onClose(null)} // ⭐ 취소 시에도 null 전달
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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
};

export default CreatePostModal;
