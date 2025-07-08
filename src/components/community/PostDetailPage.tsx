import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore"; // Zustand 스토어
import PostDetail from "./PostDetail";
import CreatePostModal from "./CreatePostModal";
import { Post, PostDetailProps } from "../../types/community/community";
import {
  fetchPostById,
  deletePost as deletePostApi,
} from "../../api/community/community"; // API 함수 임포트
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  // Zustand 스토어에서 필요한 액션들을 가져옵니다.
  const { deletePost: deletePostFromStore, updatePost: updatePostInStore } =
    useAppStore();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // 데이터 강제 새로고침을 위한 키

  // 게시글 데이터를 백엔드에서 불러오는 함수
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
        authorId: data.authorId, // 이미 Post 타입에서 authorId를 가질 것이므로 별도 수정 불필요
      };
      setPost(fetchedPost);
      // 게시글 불러오기 성공 시, 전역 스토어에도 업데이트 (옵션: 목록 업데이트 시 필요)
      updatePostInStore(fetchedPost.postId, fetchedPost);
    } catch (error: any) {
      console.error("게시글 불러오기 실패:", error);
      setNotFound(true);
      toast.error("게시글을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [postId, updatePostInStore]); // 의존성 추가

  // 컴포넌트 마운트 시 또는 postId/refreshKey 변경 시 게시글 로드
  useEffect(() => {
    loadPost();
  }, [loadPost, refreshKey]); // refreshKey가 변경되면 loadPost가 다시 호출됩니다.

  // handleEdit 함수 정의
  const handleEdit = () => {
    if (post) {
      // 수정 모달에 현재 게시글 데이터를 전달합니다.
      setIsEditModalOpen(true);
    }
  };

  // 삭제 처리
  const handleDelete = async () => {
    if (!post) {
      toast.error("삭제할 게시글 정보가 없습니다.");
      return;
    }

    if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      // 백엔드 API를 호출하여 게시글 삭제
      await deletePostApi(post.postId); // api/community/community.ts의 deletePost 함수
      deletePostFromStore(post.postId); // Zustand 스토어에서 게시글 삭제
      toast.success("게시글이 성공적으로 삭제되었습니다.");
      navigate("/community"); // 삭제 후 목록 페이지로 이동
    } catch (error: any) {
      console.error("게시글 삭제 실패:", error);
      toast.error(
        "게시글 삭제에 실패했습니다: " +
          (error.response?.data?.message || error.message || "알 수 없는 오류")
      );
    }
  };

  const handleBack = () => {
    navigate("/community");
  };

  // CreatePostModal에서 게시글 수정이 완료되었을 때 호출될 콜백
  const handlePostUpdated = (updatedPost?: Post | null) => {
    setIsEditModalOpen(false); // 모달 닫기
    if (updatedPost) {
      setPost(updatedPost); // PostDetail 컴포넌트에 표시되는 게시글 상태 즉시 업데이트
      updatePostInStore(updatedPost.postId, updatedPost); // Zustand 스토어의 게시글 업데이트
      toast.success("게시글이 성공적으로 수정되었습니다.");
    } else {
      setRefreshKey((prev) => prev + 1); // refreshKey를 증가시켜 useEffect 재실행 유도
    }
  };

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
        // PostDetail에 onToggleLike, onToggleBookmark prop이 있다면 여기에 추가
        // PostDetail 컴포넌트가 좋아요/북마크 상태를 업데이트할 책임이 있습니다.
        // 예를 들어: onToggleLike={() => setRefreshKey(prev => prev + 1)}
        // 또는 PostDetail 내부에서 직접 API 호출 및 상태 관리
      />
      {isEditModalOpen && (
        <CreatePostModal
          post={post} // 현재 post 상태를 모달에 전달
          onClose={handlePostUpdated} // 수정 성공/실패 모두 이 핸들러로 처리
        />
      )}
    </>
  );
};

export default PostDetailPage;
