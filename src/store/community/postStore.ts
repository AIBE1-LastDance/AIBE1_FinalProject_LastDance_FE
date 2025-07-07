import { create } from "zustand";
import { Post } from "../../types/community/community"; // Post 타입 정의 필요

interface PostState {
  posts: Post[];
  lastFetched: number; // 마지막으로 데이터를 가져온 시간 (캐싱 목적)
  setPosts: (posts: Post[]) => void;
  addPost: (post: Post) => void;
  updatePost: (postId: string, updatedPost: Partial<Post>) => void;
  deletePost: (postId: string) => void;
  setLastFetched: (timestamp: number) => void;
}

export const usePostStore = create<PostState>((set) => ({
  posts: [],
  lastFetched: 0,
  setPosts: (newPosts) => set({ posts: newPosts, lastFetched: Date.now() }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })), // 새 게시글은 보통 맨 위에 추가
  updatePost: (postId, updatedPost) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.postId === postId ? { ...post, ...updatedPost } : post
      ),
    })),
  deletePost: (postId) =>
    set((state) => ({
      posts: state.posts.filter((post) => post.postId !== postId),
    })),
  setLastFetched: (timestamp) => set({ lastFetched: timestamp }),
}));
