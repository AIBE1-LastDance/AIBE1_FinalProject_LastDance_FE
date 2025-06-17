import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Hash, Send, MapPin,
  Lightbulb, MessageSquare, HelpCircle, Star, Users
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { Post } from '../../types';
import toast from 'react-hot-toast';

interface CreatePostModalProps {
  post?: Post | null;
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ post, onClose }) => {
  const { addPost, updatePost, mode, currentGroup } = useAppStore();
  const { user } = useAuthStore();
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [category, setCategory] = useState(post?.category || 'free');
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!post;

  const categories = [
    { id: 'roommate', name: '메이트 구하기', icon: Users },
    { id: 'tip', name: '생활팁', icon: Lightbulb },
    { id: 'free', name: '자유게시판', icon: MessageSquare },
    { id: 'question', name: '질문/답변', icon: HelpCircle },
    { id: 'policy', name: '정책', icon: Star },
  ];

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('제목과 내용을 모두 입력해주세요.');
      return;
    }

    if (!user) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && post) {
        // 편집 모드
        updatePost(post.id, {
          title: title.trim(),
          content: content.trim(),
          category,
          tags: tags.length > 0 ? tags : undefined,
          updatedAt: new Date(),
        });
        toast.success('게시글이 수정되었습니다!');
      } else {
        // 새 게시글 작성
        const newPost: Omit<Post, 'id' | 'createdAt'> = {
          title: title.trim(),
          content: content.trim(),
          category,
          tags: tags.length > 0 ? tags : undefined,
          userId: user.id,
          author: user,
          groupId: mode === 'group' ? currentGroup?.id : undefined,
          likes: 0,
          likedBy: [],
          bookmarkedBy: [],
          comments: [],
          updatedAt: new Date(),
        };

        addPost(newPost);
        toast.success('게시글이 성공적으로 작성되었습니다!');
      }
      onClose();
    } catch (error) {
      toast.error(isEditing ? '게시글 수정 중 오류가 발생했습니다.' : '게시글 작성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? '게시글 수정' : '새 게시글 작성'}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* 내용 */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-6">
              {/* 카테고리 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  카테고리
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`flex flex-col items-center p-3 rounded-xl border-2 transition-colors ${
                        category === cat.id
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <cat.icon className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={100}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {title.length}/100
                </div>
              </div>

              {/* 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내용
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="내용을 입력하세요..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  maxLength={2000}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {content.length}/2000
                </div>
              </div>

              {/* 태그 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  태그 (최대 5개)
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        placeholder="태그 입력..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        maxLength={20}
                        disabled={tags.length >= 5}
                      />
                    </div>
                    <button
                      onClick={handleAddTag}
                      disabled={!tagInput.trim() || tags.length >= 5}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      추가
                    </button>
                  </div>
                  
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          #{tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-purple-500 hover:text-purple-700"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 공개 범위 */}
              {mode === 'group' && currentGroup && !isEditing && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 text-blue-700">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {currentGroup.name} 그룹에 게시됩니다
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 푸터 */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              {isEditing ? '게시글을 수정합니다' : (mode === 'personal' ? '전체 공개' : '그룹 내 공개')}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isEditing ? '수정 중...' : '작성 중...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{isEditing ? '수정하기' : '게시하기'}</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreatePostModal;