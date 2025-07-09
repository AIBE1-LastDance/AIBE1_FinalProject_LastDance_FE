// PostDetailPage.tsx

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore"; // 필요 여부 재검토 가능
import PostDetail from "./PostDetail";
import CreatePostModal from "./CreatePostModal";
import { Post } from "../../types/community/community";
import {
  fetchPostById,
  deletePost as deletePostApi,
} from "../../api/community/community";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  // `deletePost`는 스토어에서 게시글을 제거하는 데 사용. `updatePost`는 모달에서 수정 후 스토어 업데이트에 사용.
  const { deletePost: deletePostFromStore, updatePost: updatePostInStore } =
    useAppStore();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // 게시글 새로고침 트리거

  const loadPost = useCallback(async () => {
    if (!postId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setNotFound(false);
    try {
      const data = await fetchPostById(postId);
      const fetchedPost: Post = {
        ...data,
        likedBy: data.likedBy || [],
        bookmarkedBy: data.bookmarkedBy || [],
        comments: data.comments || [],
        authorId: data.authorId,
      };
      setPost(fetchedPost);
    } catch (error: any) {
      console.error("게시글 불러오기 실패:", error);
      setNotFound(true);
      toast.error("게시글을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadPost();
  }, [loadPost, refreshKey]);

  const handleEdit = useCallback(() => {
    if (post) {
      setIsEditModalOpen(true);
    }
  }, [post]);

  const handleDelete = useCallback(async () => {
    if (!post) {
      toast.error("삭제할 게시글 정보가 없습니다.");
      return;
    }

    // PostDetail 컴포넌트의 useDeleteConfirmation 훅에서 이미 확인 처리
    try {
      await deletePostApi(post.postId);
      deletePostFromStore(post.postId); // 전역 스토어에서 게시글 삭제
      toast.success("게시글이 성공적으로 삭제되었습니다!");
      navigate("/community"); // 목록 페이지로 이동
    } catch (error: any) {
      console.error("게시글 삭제 실패:", error);
      toast.error(
        "게시글 삭제에 실패했습니다: " +
          (error.response?.data?.message || error.message || "알 수 없는 오류")
      );
    }
  }, [post, deletePostFromStore, navigate]);

  const handleBack = useCallback(() => {
    navigate("/community");
  }, [navigate]);

  const handlePostUpdated = useCallback(
    (updatedPost?: Post | null) => {
      setIsEditModalOpen(false);
      if (updatedPost) {
        setPost(updatedPost); // 현재 상세 페이지의 게시글 상태 업데이트
        updatePostInStore(updatedPost.postId, updatedPost); // 전역 스토어 업데이트
      } else {
        setRefreshKey((prev) => prev + 1); // 게시글이 수정되지 않았지만 새로고침이 필요한 경우
      }
    },
    [updatePostInStore]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        <p className="ml-4 text-lg text-gray-700">게시글 로딩 중...</p>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowLeft className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            게시글을 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 mb-6">
            요청하신 게시글이 삭제되었거나 존재하지 않습니다.
          </p>
          <button
            onClick={() => navigate("/community")}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            커뮤니티로 돌아가기
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <PostDetail
        post={post}
        onBack={handleBack}
        onEdit={handleEdit}
        onDelete={handleDelete}
        // 댓글 생성/삭제 시 PostDetail에서 자체적으로 댓글을 새로 불러오므로
        // onCommentCreated, onCommentDeleted는 여기서는 특별한 추가 로직이 없어도 됩니다.
      />
      {isEditModalOpen && (
        <CreatePostModal post={post} onClose={handlePostUpdated} />
      )}
    </>
  );
};

export default PostDetailPage;
