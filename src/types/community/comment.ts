export interface Comment {
  commentId: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  authorNickname?: string;
  authorProfileImageUrl?: string; // ⭐ 이 줄을 추가합니다.
}

export interface CreateCommentDTO {
  postId: string;
  content: string;
}

export interface UpdateCommentDTO {
  content: string;
}
