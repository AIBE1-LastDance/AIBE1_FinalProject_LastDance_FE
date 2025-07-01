import { Post } from "../../types/community/community"; // Post 타입 임포트

//전체 게시글 목록 가져오기
export const fetchAllPosts = async (): Promise<Post[]> => {
  const res = await fetch("/api/v1/community", {
    credentials: "include", // ✅ 쿠키 포함
  });
  const json = await res.json();
  if (!res.ok)
    throw new Error(json.message || "게시글 목록을 불러오지 못했습니다.");
  return json.data;
};

// 게시글 상세 가져오기
export const fetchPostById = async (postId: string): Promise<Post> => {
  const res = await fetch(`/api/v1/community/${postId}`, {
    credentials: "include", // ✅
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "게시글을 조회하지 못했습니다.");
  return json.data;
};

// 게시글 작성
export const createPost = async (data: {
  title: string;
  content: string;
  category: string;
}): Promise<Post> => {
  const res = await fetch("/api/v1/community", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // ✅ 쿠키 포함
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "게시글 작성에 실패했습니다.");
  return json.data;
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
  const res = await fetch(`/api/v1/community/${postId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // ✅
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "게시글 수정에 실패했습니다.");
  return json.data;
};

// 게시글 삭제
export const deletePost = async (postId: string): Promise<void> => {
  const res = await fetch(`/api/v1/community/${postId}`, {
    method: "DELETE",
    credentials: "include", // ✅
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "게시글 삭제에 실패했습니다.");
};

// 게시글 좋아요/좋아요 취소
export const togglePostLike = async (postId: string): Promise<boolean> => {
  const res = await fetch(`/api/v1/community/${postId}/likes`, {
    method: "POST", // 좋아요/취소는 POST로 처리합니다.
    credentials: "include", // ✅ 쿠키 포함
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "좋아요 처리에 실패했습니다.");
  return json.data; // 좋아요 상태(true: 좋아요, false: 좋아요 취소)를 반환합니다.
};

// 게시글 북마크/북마크 취소
export const togglePostBookmark = async (postId: string): Promise<boolean> => {
  const res = await fetch(`/api/v1/community/${postId}/bookmarks`, {
    method: "POST",
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "북마크 처리에 실패했습니다.");
  return json.data;
};
