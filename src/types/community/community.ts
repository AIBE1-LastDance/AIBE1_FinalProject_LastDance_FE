// src/types/community/community.ts

// 게시글 카테고리 예시 (서버 enum과 맞춰야 함)
export type PostCategory =
  | "LIFE_TIPS" // 백엔드 enum과 동일하게 대문자로 변경
  | "FREE_BOARD"
  | "FIND_MATE"
  | "QNA"
  | "POLICY";

// 게시글(Post) 데이터 타입
export interface Post {
  postId: string; // UUID (✅ postId 사용)
  title: string;
  content: string;
  category: PostCategory;
  likeCount: number; // ✅ likeCount 사용 (백엔드와 일치)
  reportCount: number;
  createdAt: string; // ISO 형식 문자열
  updatedAt?: string; // ✅ 백엔드 DTO에 없으므로 선택적(optional)으로 변경
  userId: string; // 작성자 UUID
  authorNickname: string; // ✅ 작성자 닉네임 (백엔드의 'authorNickname' 필드와 매핑)
  commentCount: number; // ✅ 댓글 수 (백엔드의 PostResponseDTO에 없으므로, 백엔드에서 추가하거나 frontend에서 임시 처리 필요)
  // comments?: Comment[]; // 백엔드 PostResponseDTO에 comments 배열이 없으므로 주석 처리 또는 백엔드에서 추가 필요
  likedBy?: string[]; // 좋아요 누른 사용자 ID 목록 (API 응답에 따라 추가)
  bookmarkedBy?: string[]; // 북마크한 사용자 ID 목록 (API 응답에 따라 추가)
  // images?: string[]; // PostResponseDTO에 없으므로, 백엔드에서 추가하거나 frontend에서 임시 처리 필요
  // tags?: string[]; // PostResponseDTO에 없으므로, 백엔드에서 추가하거나 frontend에서 임시 처리 필요
  // groupId?: string; // PostResponseDTO에 없으므로, 백엔드에서 추가하거나 frontend에서 임시 처리 필요
}

// Comment 타입은 이미 정의되어 있다고 가정합니다 (예: types/community/comment.ts)
/* 예시:
export interface Comment {
  id: string; // commentId
  postId: string;
  userId: string;
  username: string; // 댓글 작성자의 사용자명/닉네임
  content: string;
  createdAt: string;
  updatedAt?: string; // 백엔드에서 항상 제공되지 않을 경우 선택적
  reportCount?: number;
}
*/
