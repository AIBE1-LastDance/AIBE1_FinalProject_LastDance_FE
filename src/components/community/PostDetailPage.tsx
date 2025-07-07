import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import PostDetail from "./PostDetail";
import CreatePostModal from "./CreatePostModal";
import { Post } from "../../types/community/community";
import { fetchPostById } from "../../api/community/community";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast"; // 토스트 메시지를 위해 추가

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  // `addPost`도 필요할 수 있어 추가, `updatePost`는 `handlePostUpdated`에서 사용 예정
  const { posts, deletePost, updatePost, addPost } = useAppStore(); // updatePost, addPost 추가
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    // postId가 없으면 처리 중단
    if (!postId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    // 로컬 스토어의 posts에서 먼저 찾기 (옵션: 항상 API 호출이 최신이라면 이 부분 제거 가능)
    const localPost = posts.find((p) => p.postId === postId);
    if (localPost) {
      setPost(localPost);
      setLoading(false);
    } else {
      // 로컬에 없으면 API 호출
      fetchPostById(postId)
        .then((data) => {
          // 백엔드 응답 `data`가 이미 `Post` 인터페이스와 일치한다고 가정
          const fetchedPost: Post = {
            ...data,
            // 백엔드에서 null이나 undefined로 올 수 있는 필드에 대한 기본값 설정
            likedBy: data.likedBy || [],
            bookmarkedBy: data.bookmarkedBy || [],
            comments: data.comments || [],
            // userLiked, userBookmarked는 백엔드에서 정확한 boolean 값으로 오도록 보장되어야 합니다.
          };
          setPost(fetchedPost);
          // 전역 스토어에도 추가 (만약 목록에서 이전에 없던 게시글을 상세 조회한 경우)
          // 또는 기존 게시글을 업데이트 (이미 목록에 있다면)
          if (!localPost) {
            // 로컬 스토어에 없던 게시글이라면 추가
            addPost(fetchedPost); // appStore에 addPost 액션이 없다면 추가
          } else {
            // 이미 있던 게시글이라면 업데이트 (불필요한 업데이트 방지를 위해 조건부 사용)
            // updatePost(fetchedPost.postId, fetchedPost); // useEffect의 의존성 때문에 주석 처리
          }
        })
        .catch((error) => {
          console.error("게시글 불러오기 실패:", error);
          setNotFound(true);
          toast.error("게시글을 불러오는 데 실패했습니다.");
        })
        .finally(() => setLoading(false));
    }
  }, [postId, posts, addPost]); // addPost도 의존성 추가 (useCallback으로 감싸지 않았다면)

  // handleEdit 함수 정의
  const handleEdit = (postToEdit: Post) => {
    setEditingPost(postToEdit);
    setIsEditModalOpen(true);
  };

  // 삭제 처리
  const handleDelete = (idToDelete: string) => {
    deletePost(idToDelete); // useAppStore의 deletePost 액션 호출
    toast.success("게시글이 성공적으로 삭제되었습니다.");
    navigate("/community"); // 삭제 후 목록 페이지로 이동
  };

  const handleBack = () => {
    navigate("/community");
  };

  // handlePostUpdated 함수 (CreatePostModal의 onSuccess prop을 위해 필요)
  const handlePostUpdated = (updatedPost: Post) => {
    setPost(updatedPost); // PostDetail에 표시되는 게시글 업데이트
    updatePost(updatedPost.postId, updatedPost); // ⭐ 전역 스토어의 게시글 업데이트
    setIsEditModalOpen(false);
    setEditingPost(null);
    toast.success("게시글이 성공적으로 수정되었습니다.");
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
            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors" // 색상 통일
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
        // PostDetail에 onToggleLike, onToggleBookmark prop이 있다면 여기에 추가해야 합니다.
        // PostDetail의 구현을 확인해보고 필요시 추가해주세요.
      />
      {isEditModalOpen && (
        <CreatePostModal
          post={editingPost} // editingPost를 prop으로 전달하여 수정 모드로
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingPost(null);
          }}
          onSuccess={handlePostUpdated} // 모달에서 게시글 수정 성공 시 호출될 콜백
        />
      )}
    </>
  );
};

export default PostDetailPage;
