import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Send,
  Clock,
  Share2,
  Flag,
  Users,
  Lightbulb,
  MessageSquare,
  HelpCircle,
  FileText,
  Trash2,
  MoreVertical,
  Pencil,
} from "lucide-react";
import { Comment } from "../../types/community/comment";
import { Post } from "../../types/community/community";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { useDeleteConfirmation } from "../../hooks/useDeleteConfirmation";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import toast from "react-hot-toast";
import ReportModal from "./ReportModal";
// commentApi 함수들을 임포트합니다.
import {
  fetchCommentsByPostId,
  createComment,
  deleteComment,
  // updateComment // 댓글 수정 기능을 사용하지 않으므로 필요하지 않습니다.
} from "../../api/community/comment";

interface PostDetailProps {
  post: Post;
  onBack: () => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
}

const PostDetail: React.FC<PostDetailProps> = ({
  post: initialPost,
  onBack,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuthStore();
  const { updatePost, deletePost, posts } = useAppStore();
  const [post, setPost] = useState<Post>(initialPost); // 게시글 자체의 상태
  const [comments, setComments] = useState<Comment[]>([]); // 댓글 목록을 별도로 관리하는 상태
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [reportModal, setReportModal] = useState<{
    isOpen: boolean;
    type: "post" | "comment";
    targetId: string;
    targetTitle?: string;
  }>({
    isOpen: false,
    type: "post",
    targetId: "",
    targetTitle: "",
  });
  const [showPostActions, setShowPostActions] = useState(false);
  const postActionsRef = useRef<HTMLDivElement>(null);

  // 삭제 확인 훅 사용
  const { isDeleting: isDeletingPost, handleDelete: triggerDeletePost } =
    useDeleteConfirmation({
      onConfirm: () => {
        deletePost(post.postId); // post.id 대신 post.postId 사용
        toast.success("게시글이 삭제되었습니다.");
        onBack();
      },
      message: "정말로 이 게시글을 삭제하시겠습니까?",
    });

  // posts 상태가 변경될 때마다 현재 post를 업데이트
  useEffect(() => {
    const updatedPost = posts.find((p) => p.postId === post.postId);
    if (updatedPost) {
      setPost(updatedPost);
      // 이 시점에서는 댓글을 업데이트하지 않습니다. 댓글은 아래의 별도 useEffect에서 불러옵니다.
    }
  }, [posts, post.postId]);

  // 게시글 ID가 변경될 때마다 댓글을 백엔드에서 불러오는 useEffect
  useEffect(() => {
    const loadComments = async () => {
      try {
        const fetchedComments = await fetchCommentsByPostId(post.postId);
        setComments(fetchedComments); // 불러온 댓글로 comments 상태 업데이트
      } catch (error) {
        console.error("댓글 로드 실패:", error);
        toast.error("댓글을 불러오는 데 실패했습니다.");
        setComments([]); // 오류 발생 시 댓글 목록을 비웁니다.
      }
    };
    loadComments();
  }, [post.postId]); // post.postId가 변경될 때마다 실행

  // 외부 클릭 시 액션 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        postActionsRef.current &&
        !postActionsRef.current.contains(event.target as Node)
      ) {
        setShowPostActions(false);
      }
    };

    if (showPostActions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPostActions]);

  const getCategoryInfo = (category: string) => {
    const categories: Record<
      string,
      { name: string; icon: any; color: string }
    > = {
      FIND_MATE: {
        name: "메이트구하기",
        icon: Users,
        color: "bg-blue-100 text-blue-800",
      },
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
      QNA: {
        name: "질문답변",
        icon: HelpCircle,
        color: "bg-red-100 text-red-800",
      },
      POLICY: {
        name: "정책게시판",
        icon: FileText,
        color: "bg-green-100 text-green-800",
      },
    };

    return (
      categories[category] || {
        name: "기타",
        icon: FileText,
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) {
      toast.error("댓글 내용을 입력하거나, 로그인 후 이용해주세요.");
      return;
    }

    setIsSubmittingComment(true);

    try {
      // 백엔드 API 호출하여 댓글 생성
      const createdComment = await createComment({
        postId: post.postId,
        content: newComment.trim(),
      });

      // 백엔드에서 받은 댓글 정보로 프론트엔드 comments 상태 업데이트
      setComments((prevComments) => [...prevComments, createdComment]);

      // 게시글의 commentCount도 업데이트 (useAppStore의 updatePost 활용)
      updatePost(post.postId, { commentCount: (post.commentCount || 0) + 1 });

      setNewComment("");
      toast.success("댓글이 작성되었습니다.");
    } catch (error) {
      console.error("댓글 작성 중 오류:", error);
      toast.error("댓글 작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    // 즉시 실행하지 않고 다음 렌더링 사이클에서 실행 (requestAnimationFrame)
    requestAnimationFrame(async () => {
      // async 추가
      if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
        try {
          // 백엔드 API 호출하여 댓글 삭제
          await deleteComment(commentId);

          // 성공 시 프론트엔드 comments 상태 업데이트
          setComments((prevComments) =>
            prevComments.filter((c) => c.id !== commentId)
          );
          // 게시글의 commentCount도 업데이트 (useAppStore의 updatePost 활용)
          updatePost(post.postId, {
            commentCount: Math.max(0, (post.commentCount || 0) - 1),
          });

          toast.success("댓글이 삭제되었습니다.");
        } catch (error) {
          console.error("댓글 삭제 중 오류:", error);
          toast.error("댓글 삭제 중 오류가 발생했습니다.");
        }
      }
    });
  };

  const handleShare = async () => {
    if (isDeletingPost) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.content.substring(0, 100) + "...",
          url: window.location.href,
        });
      } else {
        // 폴백: URL을 클립보드에 복사
        await navigator.clipboard.writeText(window.location.href);
        toast.success("링크가 클립보드에 복사되었습니다.");
      }
    } catch (error) {
      // 클립보드 복사 시도
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("링크가 클립보드에 복사되었습니다.");
      } catch (clipboardError) {
        toast.error("공유하기를 실행할 수 없습니다.");
      }
    }
  };

  const handleReportPost = () => {
    if (isDeletingPost) return;

    setReportModal({
      isOpen: true,
      type: "post",
      targetId: post.postId, // post.id 대신 post.postId 사용
      targetTitle: post.title,
    });
  };

  const handleReportComment = (commentId: string) => {
    setReportModal({
      isOpen: true,
      type: "comment",
      targetId: commentId,
      targetTitle: `${post.title}의 댓글`,
    });
  };

  const handleEditPost = () => {
    if (isDeletingPost) return;
    setShowPostActions(false);
    onEdit?.(post);
  };

  const closeReportModal = () => {
    setReportModal({
      isOpen: false,
      type: "post",
      targetId: "",
      targetTitle: "",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 뒤로가기 헤더 */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center space-x-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>목록으로</span>
        </motion.button>
      </motion.div>

      {/* 게시글 상세 */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {post.authorNickname?.charAt(0) || "U"}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900">
                {post.authorNickname || "익명"}
              </span>
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
            {(() => {
              const categoryInfo = getCategoryInfo(post.category);
              return (
                <div
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}
                >
                  <categoryInfo.icon className="w-3 h-3" />
                  <span>{categoryInfo.name}</span>
                </div>
              );
            })()}

            {/* 작성자 본인인 경우 편집/삭제 버튼 */}
            {user?.id === post.userId && (
              <div className="relative" ref={postActionsRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (isDeletingPost) return;
                    setShowPostActions(!showPostActions);
                  }}
                  className="post-actions-button p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isDeletingPost}
                >
                  <MoreVertical className="w-4 h-4" />
                </motion.button>

                {showPostActions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="post-actions-dropdown absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[100px]"
                  >
                    <button
                      onClick={() => {
                        if (isDeletingPost) return;
                        handleEditPost();
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      disabled={isDeletingPost}
                    >
                      <Pencil className="w-3 h-3" />
                      <span>편집</span>
                    </button>
                    <button
                      onClick={() => {
                        if (isDeletingPost) return;
                        setShowPostActions(false);
                        triggerDeletePost();
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      disabled={isDeletingPost}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>삭제</span>
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">
          {post.content}
        </p>

        {/* 태그 (Post 타입에 tags 속성이 없으므로 주석 처리하거나 타입에 추가 필요) */}
        {/* {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )} */}

        {/* 액션 버튼들 */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-gray-500">
              <Heart className="w-5 h-5" />
              <span>{post.likeCount || 0}</span>{" "}
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <MessageCircle className="w-5 h-5" />
              {/* comments 상태의 길이를 사용합니다. */}
              <span>{comments.length || 0}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex items-center space-x-1 px-3 py-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">공유</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReportPost}
              className="flex items-center space-x-1 px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Flag className="w-4 h-4" />
              <span className="text-sm">신고</span>
            </motion.button>
          </div>
        </div>
      </motion.article>

      {/* 댓글 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          댓글 {comments.length || 0}개{" "}
          {/* comments 상태의 길이를 사용합니다. */}
        </h3>

        {/* 댓글 작성 */}
        <div className="flex space-x-4 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user?.username?.charAt(0) || "U"}{" "}
            </span>
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 작성해보세요..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-gray-500">
                {newComment.length}/500
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmitComment}
                disabled={isSubmittingComment || !newComment.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmittingComment ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>작성 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>댓글 작성</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* 댓글 목록 */}
        <div className="space-y-4">
          {comments && comments.length > 0 ? ( // comments 상태를 사용합니다.
            comments
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((comment, index) => {
                const isCommentAuthor = user?.id === comment.userId;

                return (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex space-x-4 p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-xs">
                        {comment.authorNickname?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 text-sm">
                            {comment.authorNickname || "익명"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                              locale: ko,
                            })}
                          </span>
                          {comment.updatedAt &&
                            new Date(comment.updatedAt).getTime() !==
                              new Date(comment.createdAt).getTime() && (
                              <span className="text-xs text-gray-400">
                                (수정됨)
                              </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {isCommentAuthor && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeleteComment(comment.id)}
                              className="flex items-center space-x-1 px-2 py-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span className="text-xs">삭제</span>
                            </motion.button>
                          )}
                          {!isCommentAuthor && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleReportComment(comment.id)}
                              className="flex items-center space-x-1 px-2 py-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                            >
                              <Flag className="w-3 h-3" />
                              <span className="text-xs">신고</span>
                            </motion.button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </motion.div>
                );
              })
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">첫 번째 댓글을 작성해보세요!</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* 신고 모달 */}
      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={closeReportModal}
        type={reportModal.type}
        targetId={reportModal.targetId}
        targetTitle={reportModal.targetTitle}
      />
    </div>
  );
};

export default PostDetail;
