export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorName?: string; // 선택: 닉네임 표시 등
}

export interface CreateCommentDTO {
  postId: string;
  content: string;
}

export interface UpdateCommentDTO {
  content: string;
}
