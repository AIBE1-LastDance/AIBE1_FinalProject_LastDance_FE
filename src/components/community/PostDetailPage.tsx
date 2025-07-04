import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import PostDetail from "./PostDetail";
import CreatePostModal from "./CreatePostModal";
import { Post } from "../../types/community/community";
import { fetchPostById } from "../../api/community/community";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { posts, deletePost } = useAppStore();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    // 로컬 스토어의 posts에서 먼저 찾기 (선택 사항, API 호출이 우선이라면 제거 가능)
    const localPost = posts.find((p) => p.postId === postId); // `p.id` 대신 `p.postId` 사용 (타입에 맞춰)
    if (localPost) {
      setPost(localPost);
      setLoading(false);
    } else if (postId) {
      fetchPostById(postId)
        .then((data) => {
          // ✅ 백엔드 응답(data)이 이미 Post 타입에 맞게 comments와 authorNickname을 가지고 있다고 가정합니다.
          // 따라서 여기서는 `author` 객체를 수동으로 만들 필요가 없습니다.
          // data 자체를 Post 타입으로 타입 캐스팅하여 사용합니다.
          const fetchedPost: Post = {
            ...data,
            // 백엔드에서 내려주는 필드를 여기에 명시적으로 적지 않습니다.
            // data에 이미 포함되어 있을 것으로 예상합니다.
            // 만약 likedBy, bookmarkedBy가 백엔드 응답에 없다면 아래처럼 기본값 설정
            likedBy: data.likedBy || [],
            bookmarkedBy: data.bookmarkedBy || [],
            comments: data.comments || [],
          };
          setPost(fetchedPost);
        })
        .catch((error) => {
          console.error("게시글 불러오기 실패:", error);
          setNotFound(true);
        })
        .finally(() => setLoading(false));
    }
  }, [postId, posts]); // 의존성 배열에 posts 추가 (로컬 스토어 사용 시)

  if (loading) {
    return <div className="text-center py-20">로딩 중...</div>;
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
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            커뮤니티로 돌아가기
          </button>
        </motion.div>
      </div>
    );
  }

  const handleEdit = (postToEdit: Post) => {
    // 매개변수 이름을 겹치지 않게 변경
    setEditingPost(postToEdit);
    setIsEditModalOpen(true);
  };

  const handleDelete = (idToDelete: string) => {
    // 매개변수 이름을 겹치지 않게 변경
    deletePost(idToDelete);
    navigate("/community");
  };

  const handleBack = () => {
    navigate("/community");
  };

  return (
    <>
      <PostDetail
        post={post}
        onBack={handleBack}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      {isEditModalOpen && (
        <CreatePostModal
          post={editingPost}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingPost(null);
          }}
        />
      )}
    </>
  );
};

export default PostDetailPage;
