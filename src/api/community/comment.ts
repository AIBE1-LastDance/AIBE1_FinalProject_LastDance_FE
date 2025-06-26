import { Comment } from "../../types/community/comment";
import {
  CreateCommentDTO,
  UpdateCommentDTO,
} from "../../types/community/comment";
import { apiClient} from '../../utils/api'

const BASE_URL = "/api/v1/comment";

// 댓글 작성
export const createComment = async (
  data: CreateCommentDTO
): Promise<Comment> => {
  // const res = await fetch(BASE_URL, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${localStorage.getItem("token")}`, // 로그인 토큰
  //   },
  //   body: JSON.stringify(data),
  // });
  // const json = await res.json();
  // if (!res.ok) throw new Error(json.message || "댓글 작성 실패");
  // return json;
  const response = await apiClient.post(BASE_URL, data)
  return response.data;
};

// 댓글 목록 가져오기 (특정 게시글에 대한)
export const fetchCommentsByPost = async (
  postId: string
): Promise<Comment[]> => {
  // const res = await fetch(`${BASE_URL}/post/${postId}`, {
  //   headers: {
  //     Authorization: `Bearer ${localStorage.getItem("token")}`,
  //   },
  // });
  // const json = await res.json();
  // if (!res.ok) throw new Error(json.message || "댓글 목록 불러오기 실패");
  // return json;
  const response = await apiClient.get(`${BASE_URL}/post/${postId}`)
  return response.data;
};

// 댓글 수정
export const updateComment = async (
  commentId: string,
  data: UpdateCommentDTO
): Promise<Comment> => {
  // const res = await fetch(`${BASE_URL}/${commentId}`, {
  //   method: "PATCH",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${localStorage.getItem("token")}`,
  //   },
  //   body: JSON.stringify(data),
  // });
  // const json = await res.json();
  // if (!res.ok) throw new Error(json.message || "댓글 수정 실패");
  // return json;
  const response = await apiClient.patch(`${BASE_URL}/${commentId}`, data)
  return response.data;
};

// 댓글 삭제
export const deleteComment = async (commentId: string): Promise<void> => {
  // const res = await fetch(`${BASE_URL}/${commentId}`, {
  //   method: "DELETE",
  //   headers: {
  //     Authorization: `Bearer ${localStorage.getItem("token")}`,
  //   },
  // });
  // if (!res.ok) {
  //   const json = await res.json();
  //   throw new Error(json.message || "댓글 삭제 실패");
  // }
  await apiClient.delete(`${BASE_URL}/${commentId}`);
};
