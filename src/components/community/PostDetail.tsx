import React, {useState, useEffect, useRef} from 'react';
import {motion} from 'framer-motion';
import {
    ArrowLeft, Heart, MessageCircle, Send, Clock, Share2, Flag,
    Users, Lightbulb, MessageSquare, HelpCircle, FileText,
    Edit, Trash2, X, Check, MoreVertical, Pencil
} from 'lucide-react';
import {Post, Comment} from '../../types';
import {useAuthStore} from '../../store/authStore';
import {useAppStore} from '../../store/appStore';
import {useDeleteConfirmation} from '../../hooks/useDeleteConfirmation';
import {formatDistanceToNow} from 'date-fns';
import {ko} from 'date-fns/locale';
import toast from 'react-hot-toast';
import ReportModal from './ReportModal';

interface PostDetailProps {
    post: Post;
    onBack: () => void;
    onEdit?: (post: Post) => void;
    onDelete?: (postId: string) => void;
}

const PostDetail: React.FC<PostDetailProps> = ({post: initialPost, onBack, onEdit, onDelete}) => {
    const {user} = useAuthStore();
    const {updatePost, deletePost, posts} = useAppStore();
    const [post, setPost] = useState<Post>(initialPost);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editCommentText, setEditCommentText] = useState('');
    const [reportModal, setReportModal] = useState<{
        isOpen: boolean;
        type: 'post' | 'comment';
        targetId: string;
        targetTitle?: string;
    }>({
        isOpen: false,
        type: 'post',
        targetId: '',
        targetTitle: ''
    });
    const [showPostActions, setShowPostActions] = useState(false);
    const postActionsRef = useRef<HTMLDivElement>(null);

    // 삭제 확인 훅 사용
    const { isDeleting: isDeletingPost, handleDelete: triggerDeletePost } = useDeleteConfirmation({
        onConfirm: () => {
            deletePost(post.id);
            toast.success('게시글이 삭제되었습니다.');
            onBack();
        },
        message: '정말로 이 게시글을 삭제하시겠습니까?'
    });

    // posts 상태가 변경될 때마다 현재 post를 업데이트
    useEffect(() => {
        const updatedPost = posts.find(p => p.id === post.id);
        if (updatedPost) {
            setPost(updatedPost);
        }
    }, [posts, post.id]);

    // 외부 클릭 시 액션 메뉴 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (postActionsRef.current && !postActionsRef.current.contains(event.target as Node)) {
                setShowPostActions(false);
            }
        };

        if (showPostActions) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPostActions]);

    const getCategoryInfo = (category: string) => {
        const categories: Record<string, { name: string; icon: any; color: string }> = {
            roommate: {name: '메이트 구하기', icon: Users, color: 'bg-blue-100 text-blue-800'},
            tip: {name: '생활팁', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-800'},
            free: {name: '자유게시판', icon: MessageSquare, color: 'bg-purple-100 text-purple-800'},
            question: {name: '질문/답변', icon: HelpCircle, color: 'bg-red-100 text-red-800'},
            policy: {name: '정책', icon: FileText, color: 'bg-green-100 text-green-800'},
        };
        return categories[category] || {name: '기타', icon: FileText, color: 'bg-gray-100 text-gray-800'};
    };

    const handleSubmitComment = async () => {
        if (!newComment.trim() || !user) return;

        setIsSubmittingComment(true);

        try {
            const comment: Comment = {
                id: Date.now().toString(),
                content: newComment.trim(),
                userId: user.id,
                author: user,
                createdAt: new Date(),
            };

            const updatedComments = [...(post.comments || []), comment];
            updatePost(post.id, {comments: updatedComments});

            setNewComment('');
            toast.success('댓글이 작성되었습니다.');
        } catch (error) {
            toast.error('댓글 작성 중 오류가 발생했습니다.');
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleDeleteComment = (commentId: string) => {
        // 즉시 실행하지 않고 다음 렌더링 사이클에서 실행
        requestAnimationFrame(() => {
            if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
                const updatedComments = post.comments?.filter(c => c.id !== commentId) || [];
                updatePost(post.id, {comments: updatedComments});
                toast.success('댓글이 삭제되었습니다.');
            }
        });
    };

    const handleEditComment = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditCommentText(comment.content);
    };

    const handleSaveEditComment = () => {
        if (!editCommentText.trim()) return;

        const updatedComments = post.comments?.map(c =>
            c.id === editingCommentId
                ? {...c, content: editCommentText.trim(), updatedAt: new Date()}
                : c
        ) || [];

        updatePost(post.id, {comments: updatedComments});
        setEditingCommentId(null);
        setEditCommentText('');
        toast.success('댓글이 수정되었습니다.');
    };

    const handleCancelEditComment = () => {
        setEditingCommentId(null);
        setEditCommentText('');
    };

    const handleShare = async () => {
        if (isDeletingPost) return;

        try {
            if (navigator.share) {
                await navigator.share({
                    title: post.title,
                    text: post.content.substring(0, 100) + '...',
                    url: window.location.href,
                });
            } else {
                // 폴백: URL을 클립보드에 복사
                await navigator.clipboard.writeText(window.location.href);
                toast.success('링크가 클립보드에 복사되었습니다.');
            }
        } catch (error) {
            // 클립보드 복사 시도
            try {
                await navigator.clipboard.writeText(window.location.href);
                toast.success('링크가 클립보드에 복사되었습니다.');
            } catch (clipboardError) {
                toast.error('공유하기를 실행할 수 없습니다.');
            }
        }
    };

    const handleReportPost = () => {
        if (isDeletingPost) return;

        setReportModal({
            isOpen: true,
            type: 'post',
            targetId: post.id,
            targetTitle: post.title
        });
    };

    const handleReportComment = (commentId: string) => {
        setReportModal({
            isOpen: true,
            type: 'comment',
            targetId: commentId,
            targetTitle: `${post.title}의 댓글`
        });
    };

    const handleDeletePost = () => {
        if (isDeletingPost) {
            return;
        }

        setIsDeletingPost(true);
        setShowPostActions(false);

        // 모든 이벤트 리스너를 임시로 정리
        const allElements = document.querySelectorAll('*');
        const listeners: Array<{ element: Element, type: string, listener: EventListener }> = [];

        // 확인 다이얼로그 실행
        const confirmed = window.confirm('정말로 이 게시글을 삭제하시겠습니까?');

        if (confirmed) {
            deletePost(post.id);
            toast.success('게시글이 삭제되었습니다.');
            onBack();
        }

        setIsDeletingPost(false);
    };

    const handleEditPost = () => {
        if (isDeletingPost) return;
        setShowPostActions(false);
        onEdit?.(post);
    };

    const closeReportModal = () => {
        setReportModal({
            isOpen: false,
            type: 'post',
            targetId: '',
            targetTitle: ''
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* 뒤로가기 헤더 */}
            <motion.div
                initial={{opacity: 0, x: -20}}
                animate={{opacity: 1, x: 0}}
                className="flex items-center space-x-4"
            >
                <motion.button
                    whileHover={{scale: 1.05}}
                    whileTap={{scale: 0.95}}
                    onClick={onBack}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5"/>
                    <span>목록으로</span>
                </motion.button>
            </motion.div>

            {/* 게시글 상세 */}
            <motion.article
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
            >
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div
                            className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {post.author?.name?.charAt(0) || 'U'}
              </span>
                        </div>
                        <div>
              <span className="font-medium text-gray-900">
                {post.author?.name || '익명'}
              </span>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Clock className="w-4 h-4"/>
                                <span>{formatDistanceToNow(new Date(post.createdAt), {
                                    addSuffix: true,
                                    locale: ko
                                })}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {(() => {
                            const categoryInfo = getCategoryInfo(post.category);
                            return (
                                <div
                                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                                    <categoryInfo.icon className="w-3 h-3"/>
                                    <span>{categoryInfo.name}</span>
                                </div>
                            );
                        })()}

                        {/* 작성자 본인인 경우 편집/삭제 버튼 */}
                        {user?.id === post.author?.id && (
                            <div className="relative" ref={postActionsRef}>
                                <motion.button
                                    whileHover={{scale: 1.05}}
                                    whileTap={{scale: 0.95}}
                                    onClick={() => {
                                        if (isDeletingPost) return;
                                        setShowPostActions(!showPostActions);
                                    }}
                                    className="post-actions-button p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    disabled={isDeletingPost}
                                >
                                    <MoreVertical className="w-4 h-4"/>
                                </motion.button>

                                {showPostActions && (
                                    <motion.div
                                        initial={{opacity: 0, scale: 0.95}}
                                        animate={{opacity: 1, scale: 1}}
                                        exit={{opacity: 0, scale: 0.95}}
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
                                            <Pencil className="w-3 h-3"/>
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
                                            <Trash2 className="w-3 h-3"/>
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

                {/* 태그 */}
                {post.tags && post.tags.length > 0 && (
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
                )}

                {/* 액션 버튼들 */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2 text-gray-500">
                            <Heart className="w-5 h-5"/>
                            <span>{post.likes || 0}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-500">
                            <MessageCircle className="w-5 h-5"/>
                            <span>{post.comments?.length || 0}</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <motion.button
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            onClick={handleShare}
                            className="flex items-center space-x-1 px-3 py-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            <Share2 className="w-4 h-4"/>
                            <span className="text-sm">공유</span>
                        </motion.button>

                        <motion.button
                            whileHover={{scale: 1.05}}
                            whileTap={{scale: 0.95}}
                            onClick={handleReportPost}
                            className="flex items-center space-x-1 px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <Flag className="w-4 h-4"/>
                            <span className="text-sm">신고</span>
                        </motion.button>
                    </div>
                </div>
            </motion.article>

            {/* 댓글 섹션 */}
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.2}}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    댓글 {post.comments?.length || 0}개
                </h3>

                {/* 댓글 작성 */}
                <div className="flex space-x-4 mb-6">
                    <div
                        className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user?.name?.charAt(0) || 'U'}
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
                                whileHover={{scale: 1.02}}
                                whileTap={{scale: 0.98}}
                                onClick={handleSubmitComment}
                                disabled={isSubmittingComment || !newComment.trim()}
                                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmittingComment ? (
                                    <>
                                        <div
                                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                                        <span>작성 중...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4"/>
                                        <span>댓글 작성</span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* 댓글 목록 */}
                <div className="space-y-4">
                    {post.comments && post.comments.length > 0 ? (
                        post.comments
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .map((comment, index) => {
                                const isCommentAuthor = user?.id === comment.userId;
                                const isEditing = editingCommentId === comment.id;

                                return (
                                    <motion.div
                                        key={comment.id}
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        transition={{delay: index * 0.1}}
                                        className="flex space-x-4 p-4 bg-gray-50 rounded-xl"
                                    >
                                        <div
                                            className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-xs">
                        {comment.author?.name?.charAt(0) || 'U'}
                      </span>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 text-sm">
                            {comment.author?.name || '익명'}
                          </span>
                                                    <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), {addSuffix: true, locale: ko})}
                          </span>
                                                    {comment.updatedAt && new Date(comment.updatedAt).getTime() !== new Date(comment.createdAt).getTime() && (
                                                        <span className="text-xs text-gray-400">(수정됨)</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    {isCommentAuthor && !isEditing && (
                                                        <>
                                                            <motion.button
                                                                whileHover={{scale: 1.05}}
                                                                whileTap={{scale: 0.95}}
                                                                onClick={() => handleEditComment(comment)}
                                                                className="flex items-center space-x-1 px-2 py-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                                            >
                                                                <Edit className="w-3 h-3"/>
                                                                <span className="text-xs">편집</span>
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{scale: 1.05}}
                                                                whileTap={{scale: 0.95}}
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                className="flex items-center space-x-1 px-2 py-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                            >
                                                                <Trash2 className="w-3 h-3"/>
                                                                <span className="text-xs">삭제</span>
                                                            </motion.button>
                                                        </>
                                                    )}
                                                    {!isCommentAuthor && (
                                                        <motion.button
                                                            whileHover={{scale: 1.05}}
                                                            whileTap={{scale: 0.95}}
                                                            onClick={() => handleReportComment(comment.id)}
                                                            className="flex items-center space-x-1 px-2 py-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                        >
                                                            <Flag className="w-3 h-3"/>
                                                            <span className="text-xs">신고</span>
                                                        </motion.button>
                                                    )}
                                                </div>
                                            </div>

                                            {isEditing ? (
                                                <div className="space-y-2">
                          <textarea
                              value={editCommentText}
                              onChange={(e) => setEditCommentText(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                              rows={2}
                              maxLength={500}
                          />
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-xs text-gray-500">
                                                            {editCommentText.length}/500
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <motion.button
                                                                whileHover={{scale: 1.05}}
                                                                whileTap={{scale: 0.95}}
                                                                onClick={handleCancelEditComment}
                                                                className="flex items-center space-x-1 px-2 py-1 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                                                            >
                                                                <X className="w-3 h-3"/>
                                                                <span className="text-xs">취소</span>
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{scale: 1.05}}
                                                                whileTap={{scale: 0.95}}
                                                                onClick={handleSaveEditComment}
                                                                disabled={!editCommentText.trim()}
                                                                className="flex items-center space-x-1 px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-300 transition-colors"
                                                            >
                                                                <Check className="w-3 h-3"/>
                                                                <span className="text-xs">저장</span>
                                                            </motion.button>
                                                        </div>
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
                            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
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