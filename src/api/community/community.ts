import { Post } from "../../types/community/community"; // Comment 타입 임포트

//전체 게시글 목록 가져오기
export const fetchAllPosts = async (): Promise<Post[]> => {
  const res = await fetch("/api/v1/community", {
    credentials: "include", // ✅ 쿠키 포함
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "게시글 목록 불러오기 실패");
  return json.data;
};

// 게시글 상세 가져오기
export const fetchPostById = async (postId: string): Promise<Post> => {
  const res = await fetch(`/api/v1/community/${postId}`, {
    credentials: "include", // ✅
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "게시글 조회 실패");
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
  if (!res.ok) throw new Error(json.message || "게시글 작성 실패");
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
  if (!res.ok) throw new Error(json.message || "게시글 수정 실패");
  return json.data;
};

// 게시글 삭제
export const deletePost = async (postId: string): Promise<void> => {
  const res = await fetch(`/api/v1/community/${postId}`, {
    method: "DELETE",
    credentials: "include", // ✅
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "게시글 삭제 실패");
};
