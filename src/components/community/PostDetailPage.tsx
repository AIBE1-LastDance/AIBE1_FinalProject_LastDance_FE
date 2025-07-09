import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
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
  const { deletePost: deletePostFromStore, updatePost: updatePostInStore } =
    useAppStore();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
      // authorNickname이 "deleted_"로 시작하는 경우 탈퇴한 회원으로 간주
      const isDeletedUser = data.authorNickname?.startsWith("deleted_");

      const fetchedPost: Post = {
        ...data,
        likedBy: data.likedBy || [],
        bookmarkedBy: data.bookmarkedBy || [],
        comments: data.comments || [],
        authorId: data.authorId,
        // 탈퇴한 회원인 경우 닉네임을 "탈퇴한 회원입니다."로 설정
        authorNickname: isDeletedUser
          ? "탈퇴한 회원입니다."
          : data.authorNickname,
        // 탈퇴한 회원인 경우 프로필 이미지 URL을 비워둠.
        // 이렇게 하면 PostCard에서 이 값을 받아 기본 이미지 로직을 따르게 됩니다.
        authorProfileImageUrl: isDeletedUser ? "" : data.authorProfileImageUrl,
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

    try {
      await deletePostApi(post.postId);
      deletePostFromStore(post.postId);
      toast.success("게시글이 성공적으로 삭제되었습니다!");
      navigate("/community");
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
        setPost(updatedPost);
        updatePostInStore(updatedPost.postId, updatedPost);
      } else {
        setRefreshKey((prev) => prev + 1);
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
      />
      {isEditModalOpen && (
        <CreatePostModal post={post} onClose={handlePostUpdated} />
      )}
    </>
  );
};

export default PostDetailPage;
