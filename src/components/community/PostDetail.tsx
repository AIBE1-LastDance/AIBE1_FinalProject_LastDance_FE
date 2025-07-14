import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Send,
  Clock,
  Share2,
  Users,
  Lightbulb,
  MessageSquare,
  HelpCircle,
  FileText,
  Trash2,
  MoreVertical,
  Pencil,
  Bookmark,
  GraduationCap,
  ScrollText,
  Handshake,
  Megaphone,
  BellRing, // Added BellRing for report icon
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
  updateComment,
} from "../../api/community/comment";
import { usePostStore } from "../../store/community/postStore";

interface PostDetailProps {
  post: Post;
  onBack: () => void;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
  onCommentCreated?: () => void;
  onCommentDeleted?: () => void;
}

const PostDetail: React.FC<PostDetailProps> = ({
  post,
  onBack,
  onEdit,
  onDelete,
  onCommentCreated,
  onCommentDeleted,
}) => {
  const { user } = useAuthStore();
  const { toggleLike, toggleBookmark } = usePostStore();
  const [localPost, setLocalPost] = useState<Post>(post);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");

  useEffect(() => {
    setLocalPost(post);
  }, [post]);

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

  const handleToggleLike = async () => {
    if (!user) {
      toast.error("로그인 후 좋아요를 누를 수 있습니다.");
      return;
    }

    try {
      await toggleLike(localPost.postId);
      setLocalPost((prev) => ({
        ...prev,
        userLiked: !prev.userLiked,
        likeCount: prev.userLiked ? prev.likeCount - 1 : prev.likeCount + 1,
      }));
    } catch (error) {
      toast.error("좋아요 처리 중 오류가 발생했습니다.");
    }
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      toast.error("로그인 후 북마크할 수 있습니다.");
      return;
    }

    try {
      await toggleBookmark(localPost.postId);
      setLocalPost((prev) => ({
        ...prev,
        userBookmarked: !prev.userBookmarked,
      }));
    } catch (error) {
      toast.error("북마크 처리 중 오류가 발생했습니다.");
    }
  };

  const handleSaveEditedComment = async (commentId: string) => {
    if (!editingContent.trim()) {
      toast.error("수정할 내용을 입력해주세요.");
      return;
    }

    try {
      await updateComment(commentId, { content: editingContent.trim() });

      setComments((prev) =>
        prev.map((c) =>
          c.commentId === commentId
            ? {
                ...c,
                content: editingContent,
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );

      toast.success("댓글이 수정되었습니다.");
      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      toast.error("댓글 수정 중 오류가 발생했습니다.");
    }
  };

  const { isDeleting: isDeletingPost, handleDelete: triggerDeletePost } =
    useDeleteConfirmation({
      onConfirm: () => {
        onDelete?.(post.postId);
      },
      message: "정말로 이 게시글을 삭제하시겠습니까?",
    });

  const isAuthor = user?.id === post.authorId;

  useEffect(() => {
    const loadComments = async () => {
      try {
        const fetchedComments = await fetchCommentsByPostId(post.postId);
        const processedComments = fetchedComments.map((comment) => {
          const isCommentDeletedUser =
            comment.authorNickname?.startsWith("deleted_");
          return {
            ...comment,
            authorNickname: isCommentDeletedUser
              ? "탈퇴한 회원입니다."
              : comment.authorNickname,
            authorProfileImageUrl: isCommentDeletedUser
              ? ""
              : comment.authorProfileImageUrl,
          };
        });
        setComments(processedComments);
      } catch (error) {
        console.error("댓글 로드 실패:", error);
        toast.error("댓글을 불러오는 데 실패했습니다.");
        setComments([]);
      }
    };
    loadComments();
  }, [post.postId]);

  const getCategoryInfo = (category: string) => {
    const categories: Record<
      string,
      { name: string; icon: any; borderColor: string; textColor: string }
    > = {
      LIFE_TIPS: {
        name: "생활팁",
        icon: GraduationCap,
        borderColor: "border-primary-500",
        textColor: "text-primary-600",
      },
      FREE_BOARD: {
        name: "자유게시판",
        icon: MessageSquare,
        borderColor: "border-primary-600",
        textColor: "text-primary-700",
      },
      FIND_MATE: {
        name: "메이트구하기",
        icon: Megaphone,
        borderColor: "border-primary-700",
        textColor: "text-primary-800",
      },
      QNA: {
        name: "질문답변",
        icon: Handshake,
        borderColor: "border-primary-800",
        textColor: "text-primary-900",
      },
      POLICY: {
        name: "정책게시판",
        icon: ScrollText,
        borderColor: "border-primary-900",
        textColor: "text-primary-950",
      },
    };

    return (
      categories[category] || {
        name: "기타",
        icon: FileText,
        borderColor: "border-gray-500",
        textColor: "text-gray-800",
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

      onCommentCreated?.();

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
          onCommentDeleted?.();

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

  // 삭제된 게시글 처리
  if (!post) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">게시글을 불러오는 중입니다...</span>
        </div>
      </div>
    );
  }

  if (post.deleted) {
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-2xl border border-gray-200 p-12 text-center"
        >
          <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">
            신고로 인해 삭제된 게시글입니다
          </h2>
          <p className="text-gray-500">
            운영정책을 위반하여 관리자에 의해 삭제되었습니다.
          </p>
          <div className="mt-4 text-sm text-gray-400">
            작성일:{" "}
            {formatDistanceToNow(new Date(post.createdAt), {
              addSuffix: true,
              locale: ko,
            })}
          </div>
        </motion.div>
      </div>
    );
  }

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
            {post.authorNickname === "탈퇴한 회원입니다." ? (
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-gray-500" />
              </div>
            ) : post.authorProfileImageUrl ? (
              <img
                src={post.authorProfileImageUrl}
                alt={`${post.authorNickname || "익명"}`}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-r from-primary-400 to-amber-500 rounded-full flex items-center justify-center">
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
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${categoryInfo.borderColor} ${categoryInfo.textColor}`}
                >
                  <categoryInfo.icon className="w-3 h-3" />
                  <span>{categoryInfo.name}</span>
                </div>
              );
            })()}
          </div>
        </div>

        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">
          {post.content}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleLike}
              className={`flex items-center space-x-2 transition-colors ${
                localPost.userLiked
                  ? "text-primary-500"
                  : "text-gray-500 hover:text-primary-600"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${
                  localPost.userLiked ? "fill-current" : ""
                }`}
              />
              <span>{localPost.likeCount || 0}</span>
            </motion.button>

            <div className="flex items-center space-x-2 text-gray-500">
              <MessageCircle className="w-5 h-5" />
              <span>{comments.length || 0}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleBookmark}
              className={`transition-colors p-2 rounded-lg ${
                localPost.userBookmarked
                  ? "text-yellow-500 bg-yellow-50"
                  : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
              }`}
            >
              <Bookmark
                className={`w-5 h-5 ${
                  localPost.userBookmarked ? "fill-current" : ""
                }`}
              />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="flex items-center space-x-1 px-3 py-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">공유</span>
            </motion.button>
            {isAuthor && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEditPost}
                  className="flex items-center space-x-1 px-3 py-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-sm" // 추가: text-sm
                  disabled={isDeletingPost}
                >
                  <Pencil className="w-4 h-4" />
                  <span>편집</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={triggerDeletePost}
                  className="flex items-center space-x-1 px-3 py-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors text-sm" // 추가: text-sm
                  disabled={isDeletingPost}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>삭제</span>
                </motion.button>
              </>
            )}

            {!isAuthor && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReportPost}
                  className="flex items-center space-x-1 px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <BellRing className="w-4 h-4" />
                  <span className="text-sm">신고</span>
                </motion.button>
              </>
            )}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
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
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmittingComment ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
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
                const isCommentDeletedUser =
                  comment.authorNickname === "탈퇴한 회원입니다.";

                // 삭제된 댓글 처리
                if (comment.deleted) {
                  return (
                    <motion.div
                      key={comment.commentId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex space-x-4 p-4 bg-gray-50 rounded-xl border-l-4 border-gray-300 opacity-75"
                    >
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <HelpCircle className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-600">
                            신고로 인해 삭제된 댓글입니다
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                            locale: ko,
                          })}
                        </div>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={comment.commentId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex space-x-4 p-4 bg-gray-50 rounded-xl"
                  >
                    {isCommentDeletedUser ? (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <HelpCircle className="w-5 h-5 text-gray-500" />
                      </div>
                    ) : comment.authorProfileImageUrl ? (
                      <img
                        src={comment.authorProfileImageUrl}
                        alt={`${comment.authorNickname || "익명"}`}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-400 to-amber-500 rounded-full flex items-center justify-center">
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
                            <>
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

                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setEditingCommentId(comment.commentId);
                                  setEditingContent(comment.content);
                                }}
                                className="flex items-center space-x-1 px-2 py-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                              >
                                <Pencil className="w-3 h-3" />
                                <span className="text-xs">수정</span>
                              </motion.button>
                            </>
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
                              <BellRing className="w-3 h-3" />
                              <span className="text-xs">신고</span>
                            </motion.button>
                          )}
                        </div>
                      </div>

                      {editingCommentId === comment.commentId ? (
                        <div>
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            rows={2}
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                            maxLength={500}
                          />
                          <div className="flex justify-end space-x-2 mt-2">
                            <button
                              onClick={() =>
                                handleSaveEditedComment(comment.commentId)
                              }
                              className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
                            >
                              저장
                            </button>
                            <button
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditingContent("");
                              }}
                              className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {comment.content}
                        </p>
                      )}
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
