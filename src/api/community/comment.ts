// src/api/commentApi.ts

import { Comment } from "../../types/community/comment"; // Comment 타입 임포트

// 댓글 목록 가져오기 (특정 게시글에 대한)
// GET /api/v1/comments/post/{postId}
export const fetchCommentsByPostId = async (
  postId: string
): Promise<Comment[]> => {
  const res = await fetch(`/api/v1/comments/post/${postId}`, {
    credentials: "include", // 쿠키 포함
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "댓글 목록 불러오기 실패");
  return json; // 컨트롤러 응답이 List<CommentResponseDTO>이므로 json.data가 아닐 수 있습니다.
};

// 댓글 작성
// POST /api/v1/comments
export const createComment = async (data: {
  postId: string; // 댓글을 작성할 게시글의 ID
  content: string; // 댓글 내용
}): Promise<Comment> => {
  const res = await fetch("/api/v1/comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // 쿠키 포함
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "댓글 작성 실패");
  return json; // 컨트롤러 응답이 CommentResponseDTO이므로 json.data가 아닐 수 있습니다.
};

// 댓글 수정
// PATCH /api/v1/comments/{commentId}
export const updateComment = async (
  commentId: string,
  data: {
    content: string; // 수정할 댓글 내용
  }
): Promise<Comment> => {
  const res = await fetch(`/api/v1/comments/${commentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // 쿠키 포함
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "댓글 수정 실패");
  return json; // 컨트롤러 응답이 CommentResponseDTO이므로 json.data가 아닐 수 있습니다.
};

// 댓글 삭제
// DELETE /api/v1/comments/{commentId}
export const deleteComment = async (commentId: string): Promise<void> => {
  const res = await fetch(`/api/v1/comments/${commentId}`, {
    method: "DELETE",
    credentials: "include", // 쿠키 포함
  });
  // 204 No Content 응답이므로 body가 없습니다.
  if (!res.ok) {
    const json = await res.json(); // 에러 메시지를 얻기 위해 시도
    throw new Error(json.message || "댓글 삭제 실패");
  }
};
