import { apiClient } from "../../utils/api";
import { Post } from "../../types/community/community"; // Post 타입 임포트

//전체 게시글 목록 가져오기
export const fetchAllPosts = async (): Promise<Post[]> => {
  const response = await apiClient.get("/api/v1/community");
  return response.data.data;
};

// 게시글 상세 가져오기
export const fetchPostById = async (postId: string): Promise<Post> => {
  const response = await apiClient.get(`/api/v1/community/${postId}`);
  return response.data.data;
};

// 게시글 작성
export const createPost = async (data: {
  title: string;
  content: string;
  category: string;
}): Promise<Post> => {
  const response = await apiClient.post("/api/v1/community", data);
  return response.data.data;
};

// 게시글 수정
export const updatePost = async (
  postId: string,
  data: {
    title: string;
    content: string;
    category: string;
  }
): Promise<Post> => {
  const response = await apiClient.patch(`/api/v1/community/${postId}`, data);
  return response.data.data;
};

// 게시글 삭제
export const deletePost = async (postId: string): Promise<void> => {
  await apiClient.delete(`/api/v1/community/${postId}`);
};

// 게시글 좋아요/좋아요 취소
export const togglePostLike = async (postId: string): Promise<boolean> => {
  const response = await apiClient.post(`/api/v1/community/${postId}/likes`);
  return response.data.data; // 좋아요 상태(true: 좋아요, false: 좋아요 취소)를 반환합니다.
};

// 게시글 북마크/북마크 취소
export const togglePostBookmark = async (postId: string): Promise<boolean> => {
  const response = await apiClient.post(
    `/api/v1/community/${postId}/bookmarks`
  );
  return response.data.data;
};
