export interface Comment {
  commentId: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt?: string; // ✅ 백엔드 DTO에 없으므로 선택적(optional)으로 변경
  authorNickname?: string; // 선택: 닉네임 표시 등
}

export interface CreateCommentDTO {
  postId: string;
  content: string;
}

export interface UpdateCommentDTO {
  content: string;
}
