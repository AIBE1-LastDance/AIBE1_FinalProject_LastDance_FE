// src/types/community/community.ts
export interface Post {
  postId: string;
  title: string;
  content: string;
  category: string;
  likeCount: number;
  reportCount: number;
  createdAt: string;
  updatedAt?: string;
  userId: string;
  authorNickname: string;
  commentCount: number;
  comments: Comment[];
  likedBy?: string[]; // ✅ 백엔드에서 주지 않으면 optional로
  bookmarkedBy?: string[]; // ✅ 백엔드에서 주지 않으면 optional로
  userLiked: boolean; // ✅ 백엔드에서 이 값을 직접 제공하므로 필수 유지
  userBookmarked: boolean; // ✅ 백엔드에서 이 값도 제공한다고 가정하고 필수 유지
}
