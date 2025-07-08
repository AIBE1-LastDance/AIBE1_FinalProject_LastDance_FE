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
import {
  fetchCommentsByPostId,
  createComment,
  deleteComment,
} from "../../api/community/comment";

interface PostDetailProps {
  post: Post; // 👈 이 prop을 직접 사용합니다.
  onBack: () => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
}

const PostDetail: React.FC<PostDetailProps> = ({
  post, // 👈 initialPost 대신 직접 post prop을 받습니다.
  onBack,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuthStore();
  const { updatePost: updatePostInStore } = useAppStore(); // updatePost만 사용, deletePost는 onDelete prop으로 처리

  const [comments, setComments] = useState<Comment[]>([]);
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

  // 🔴 PostDetail 내부에 로컬 post 상태를 두는 대신, prop으로 받은 post를 직접 사용합니다.
  // const [post, setPost] = useState<Post>(initialPost); // 이 줄은 제거합니다.
  // useEffect(() => { // 이 useEffect도 제거합니다.
  //   setPost(initialPost);
  // }, [initialPost]);

  const { isDeleting: isDeletingPost, handleDelete: triggerDeletePost } =
    useDeleteConfirmation({
      onConfirm: () => {
        // onDelete prop을 통해 부모 컴포넌트(PostDetailPage)에서 삭제를 처리합니다.
        // PostDetail 컴포넌트가 직접 스토어를 건드리지 않도록 합니다.
        // PostDetailPage의 handleDelete는 deletePostFromStore를 호출합니다.
        onDelete?.(post.postId);
        // 삭제 성공 토스트 메시지는 PostDetailPage에서 띄우는 것이 더 일관성 있습니다.
        // onBack(); // PostDetailPage에서 navigate를 처리하므로 여기서는 필요 없습니다.
      },
      message: "정말로 이 게시글을 삭제하시겠습니까?",
    });

  const isAuthor = user?.id === post.authorId;

  // 작성자 여부 로그 (디버깅용 - 배포 시 제거 권장)
  useEffect(() => {
    console.log("로그인한 사용자 ID (user?.id):", user?.id);
    console.log("게시글 작성자 ID (post.authorId):", post.authorId);
    console.log("작성자 여부 (isAuthor):", isAuthor);
    if (user?.id && post.authorId) {
      console.log("ID 타입 비교:", typeof user.id, typeof post.authorId);
      console.log(
        "ID 값 일치 여부 (user?.id === post.authorId):",
        user.id === post.authorId
      );
    }
  }, [user?.id, post.authorId, isAuthor]);

  // 🔴 이 useEffect는 더 이상 필요 없습니다. PostDetailPage에서 최신 post prop을 직접 넘겨주기 때문입니다.
  // useEffect(() => {
  //   const updatedPost = posts.find((p) => p.postId === post.postId);
  //   if (updatedPost) {
  //     setPost(updatedPost);
  //   }
  // }, [posts, post.postId]);

  useEffect(() => {
    const loadComments = async () => {
      try {
        const fetchedComments = await fetchCommentsByPostId(post.postId);
        setComments(fetchedComments);
      } catch (error) {
        console.error("댓글 로드 실패:", error);
        toast.error("댓글을 불러오는 데 실패했습니다.");
        setComments([]);
      }
    };
    loadComments();
  }, [post.postId]); // 게시글 ID가 변경될 때만 댓글을 다시 불러옵니다.

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
      await createComment({
        postId: post.postId,
        content: newComment.trim(),
      });

      const refreshedComments = await fetchCommentsByPostId(post.postId);
      setComments(refreshedComments);

      // 댓글 수 업데이트는 부모의 updatePostInStore를 사용합니다.
      updatePostInStore(post.postId, {
        commentCount: (post.commentCount || 0) + 1,
      });

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
    requestAnimationFrame(async () => {
      if (window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
        try {
          await deleteComment(commentId);

          setComments((prevComments) =>
            prevComments.filter((c) => c.commentId !== commentId)
          );
          // 댓글 수 업데이트는 부모의 updatePostInStore를 사용합니다.
          updatePostInStore(post.postId, {
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
        await navigator.clipboard.writeText(window.location.href);
        toast.success("링크가 클립보드에 복사되었습니다.");
      }
    } catch (error) {
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
      targetId: post.postId,
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

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {post.authorProfileImageUrl ? (
              <img
                src={post.authorProfileImageUrl}
                alt={`${post.authorNickname || "익명"}의 프로필`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {post.authorNickname?.charAt(0) || "U"}
                </span>
              </div>
            )}
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

            {/* 작성자 본인인 경우 편집/삭제 버튼을 항상 노출 */}
            {isAuthor && (
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEditPost}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  disabled={isDeletingPost}
                >
                  <Pencil className="w-4 h-4" />
                  <span className="sr-only">편집</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={triggerDeletePost}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  disabled={isDeletingPost}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sr-only">삭제</span>
                </motion.button>
              </div>
            )}
            {!isAuthor && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReportPost}
                className="flex items-center space-x-1 px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Flag className="w-4 h-4" />
                <span className="text-sm">신고</span>
              </motion.button>
            )}
          </div>
        </div>

        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">
          {post.content}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-gray-500">
              <Heart className="w-5 h-5" />
              <span>{post.likeCount || 0}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <MessageCircle className="w-5 h-5" />
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
          </div>
        </div>
      </motion.article>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          댓글 {comments.length || 0}개
        </h3>

        <div className="flex space-x-4 mb-6">
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

        <div className="space-y-4">
          {comments && comments.length > 0 ? (
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
                    key={comment.commentId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex space-x-4 p-4 bg-gray-50 rounded-xl"
                  >
                    {comment.authorProfileImageUrl ? (
                      <img
                        src={comment.authorProfileImageUrl}
                        alt={`${comment.authorNickname || "익명"}의 프로필`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-xs">
                          {comment.authorNickname?.charAt(0) || "U"}
                        </span>
                      </div>
                    )}
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
                              onClick={() =>
                                handleDeleteComment(comment.commentId)
                              }
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
                              onClick={() =>
                                handleReportComment(comment.commentId)
                              }
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
