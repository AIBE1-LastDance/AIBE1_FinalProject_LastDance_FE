import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import PostDetail from "./PostDetail";
import CreatePostModal from "./CreatePostModal";
import { Post } from "../../types";
import { fetchPostById } from "../../api/community/community"; // ✅ API 불러오기
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
    const localPost = posts.find((p) => p.id === postId);
    if (localPost) {
      setPost(localPost);
      setLoading(false);
    } else if (postId) {
      fetchPostById(postId)
        .then((data) => {
          // ✅ author 직접 추가 (백엔드 응답에는 없으므로)
          const postWithAuthor: Post = {
            ...data,
            author: {
              id: data.userId,
              username: data.username,
              nickname: data.username,
              email: "",
              provider: "google",
            },
            likedBy: [],
            bookmarkedBy: [],
            comments: [],
          };
          setPost(postWithAuthor);
        })
        .catch(() => setNotFound(true))
        .finally(() => setLoading(false));
    }
  }, [postId, posts]);

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

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  const handleDelete = (postId: string) => {
    deletePost(postId);
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
