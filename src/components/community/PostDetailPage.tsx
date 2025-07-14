// 기존 코드 유지
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
  const [notFound, setNotFound] = useState(false); // 이 상태를 사용하여 메시지를 띄우는 방식은 이제 필요 없습니다.
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadPost = useCallback(async () => {
    if (!postId) {
      // postId가 없을 때 바로 토스트 메시지를 띄우고 커뮤니티로 이동
      toast.error("유효하지 않은 게시글 ID입니다.");
      navigate("/community"); // 게시글 목록 페이지로 리다이렉트
      return;
    }

    setLoading(true);
    // setNotFound(false); // 이제 필요 없음
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
      // 게시글을 찾을 수 없거나 에러 발생 시 토스트 메시지를 띄우고 커뮤니티로 이동
      toast.error("게시글을 찾을 수 없거나 불러오는 데 실패했습니다.");
      navigate("/community"); // 게시글 목록 페이지로 리다이렉트
    } finally {
      setLoading(false);
    }
  }, [postId, navigate]); // navigate를 의존성 배열에 추가

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
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">게시글을 불러오는 중...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">게시글을 찾을 수 없습니다.</p>
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
