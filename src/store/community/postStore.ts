import { create } from "zustand";
import { Post } from "../../types/community/community"; // Post 타입 정의 필요
import {
  fetchAllPosts,
  createPost as createPostApi, // createPost 이름 충돌 방지
  updatePost as updatePostApi, // updatePost 이름 충돌 방지
  deletePost as deletePostApi, // deletePost 이름 충돌 방지
  togglePostLike, // API 함수 추가
  togglePostBookmark, // API 함수 추가
} from "../../api/community/community"; // API 호출 함수 import

interface PostState {
  posts: Post[];
  lastFetched: number; // 마지막으로 데이터를 가져온 시간 (캐싱 목적)
  setPosts: (posts: Post[]) => void;
  // loadPosts 액션 추가
  loadPosts: () => Promise<void>;
  // addPost, updatePost, deletePost의 타입을 Promise를 반환하도록 수정
  addPost: (
    newPostData: Omit<
      Post,
      | "postId"
      | "createdAt"
      | "updatedAt"
      | "likeCount"
      | "reportCount"
      | "commentCount"
      | "userLiked"
      | "userBookmarked"
      | "authorNickname"
      | "authorProfileImageUrl"
      | "categoryName"
      | "comments"
    >,
    userId: string, // addPost에 필요한 userId, nickname, profileImageUrl 추가
    nickname: string,
    profileImageUrl: string
  ) => Promise<Post | undefined>; // Post를 반환하도록 수정
  updatePost: (
    postId: string,
    updatedData: Partial<Post>
  ) => Promise<Post | undefined>; // Post를 반환하도록 수정
  deletePost: (postId: string) => Promise<void>;
  setLastFetched: (timestamp: number) => void;
  // CommunityPage.tsx에서 사용하는 toggleLike, toggleBookmark 액션 추가
  toggleLike: (postId: string) => Promise<void>;
  toggleBookmark: (postId: string) => Promise<void>;
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  lastFetched: 0,
  setPosts: (newPosts) => set({ posts: newPosts, lastFetched: Date.now() }),

  // loadPosts 액션 구현
  loadPosts: async () => {
    const CACHE_DURATION = 5 * 60 * 1000; // 5분 캐시
    const { posts, lastFetched, setPosts, setLastFetched } = get();

    // 캐시된 데이터가 있고 유효 기간 내라면 API 호출을 건너뜁니다.
    // 하지만, 게시글 작성/수정/삭제 후에는 항상 새로고침해야 하므로 이 캐싱 로직은 주의해서 사용해야 합니다.
    // 여기서는 CommunityPage.tsx에서 명시적으로 loadPosts()를 호출하므로, 캐시 로직은 제거하거나 더 정교하게 구현해야 합니다.
    // 일단은 항상 API를 호출하도록 수정합니다.
    // if (posts.length > 0 && Date.now() - lastFetched < CACHE_DURATION) {
    //   console.log("[usePostStore: 캐시된 게시글 데이터 사용]");
    //   return;
    // }

    try {
      console.log("[usePostStore: 백엔드에서 게시글 로딩 시작]");
      const data: any[] = await fetchAllPosts();
      const mappedPosts: Post[] = data.map((item) => ({
        postId: item.postId,
        title: item.title,
        content: item.content,
        category: item.category,
        categoryName: item.categoryName,
        likeCount: item.likeCount,
        reportCount: item.reportCount,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt ?? item.createdAt, // updatedAt이 없을 경우 createdAt 사용
        authorId: item.authorId,
        authorNickname: item.authorNickname,
        authorProfileImageUrl: item.authorProfileImageUrl,
        userLiked: item.userLiked,
        commentCount: item.commentCount || 0,
        comments: item.comments || [],
        userBookmarked: item.userBookmarked || false,
      }));
      setPosts(mappedPosts);
      setLastFetched(Date.now());
      console.log("[usePostStore: 게시글 로딩 완료]");
    } catch (error) {
      console.error("[usePostStore: 게시글 로딩 실패]", error);
      // 오류 발생 시 posts를 비우거나 이전 상태를 유지할지 결정
      setPosts([]);
      throw error; // 오류를 다시 던져서 호출하는 쪽에서 처리할 수 있도록 합니다.
    }
  },

  // addPost 액션 구현 (비동기)
  addPost: async (newPostData, userId, nickname, profileImageUrl) => {
    try {
      // createPostApi의 인자 타입이 더 넓은 객체를 받지 않을 경우를 대비해 'as any' 캐스팅
      const createdPostResponse = await createPostApi({
        ...newPostData,
        authorId: userId,
        authorNickname: nickname,
        authorProfileImageUrl: profileImageUrl,
      } as any); // <-- 이 부분에 'as any' 캐스팅을 추가합니다.

      // 서버 응답으로 받은 게시글 정보를 Post 타입에 맞게 매핑
      const createdPost: Post = {
        postId: createdPostResponse.postId,
        title: createdPostResponse.title,
        content: createdPostResponse.content,
        category: createdPostResponse.category,
        categoryName: createdPostResponse.categoryName,
        likeCount: createdPostResponse.likeCount || 0,
        reportCount: createdPostResponse.reportCount || 0,
        createdAt: createdPostResponse.createdAt,
        updatedAt:
          createdPostResponse.updatedAt || createdPostResponse.createdAt,
        authorId: createdPostResponse.authorId,
        authorNickname: createdPostResponse.authorNickname,
        authorProfileImageUrl: createdPostResponse.authorProfileImageUrl,
        userLiked: createdPostResponse.userLiked || false,
        commentCount: createdPostResponse.commentCount || 0,
        comments: createdPostResponse.comments || [],
        userBookmarked: createdPostResponse.userBookmarked || false,
      };

      // 게시글 생성 성공 후, 목록을 다시 로드하여 최신 상태 반영
      await get().loadPosts();
      return createdPost;
    } catch (error) {
      console.error("[usePostStore: 게시글 추가 실패]", error);
      throw error;
    }
  },

  // updatePost 액션 구현 (비동기)
  updatePost: async (postId, updatedData) => {
    try {
      const response = await updatePostApi(postId, updatedData as any); // <-- 이 부분에 'as any' 캐스팅 추가
      const updatedPost: Post = {
        postId: response.postId,
        title: response.title,
        content: response.content,
        category: response.category,
        categoryName: response.categoryName,
        likeCount: response.likeCount,
        reportCount: response.reportCount,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
        authorId: response.authorId,
        authorNickname: response.authorNickname,
        authorProfileImageUrl: response.authorProfileImageUrl,
        userLiked: response.userLiked,
        commentCount: response.commentCount,
        comments: response.comments,
        userBookmarked: response.userBookmarked,
      };
      await get().loadPosts(); // 업데이트 후 게시글 목록 새로고침
      return updatedPost;
    } catch (error) {
      console.error("[usePostStore: 게시글 업데이트 실패]", error);
      throw error;
    }
  },

  // deletePost 액션 구현 (비동기)
  deletePost: async (postId) => {
    try {
      await deletePostApi(postId);
      await get().loadPosts(); // 삭제 후 게시글 목록 새로고침
    } catch (error) {
      console.error("[usePostStore: 게시글 삭제 실패]", error);
      throw error;
    }
  },

  setLastFetched: (timestamp) => set({ lastFetched: timestamp }),

  // toggleLike 액션 구현
  toggleLike: async (postId) => {
    try {
      await togglePostLike(postId);
      set((state) => ({
        posts: state.posts.map((post) =>
          post.postId === postId
            ? {
                ...post,
                userLiked: !post.userLiked,
                likeCount: post.userLiked
                  ? (post.likeCount || 1) - 1
                  : (post.likeCount || 0) + 1,
              }
            : post
        ),
      }));
    } catch (error) {
      console.error(
        `[usePostStore: 좋아요 토글 실패] PostId: ${postId}`,
        error
      );
      throw error;
    }
  },

  // toggleBookmark 액션 구현
  toggleBookmark: async (postId) => {
    try {
      await togglePostBookmark(postId);
      set((state) => ({
        posts: state.posts.map((post) =>
          post.postId === postId
            ? { ...post, userBookmarked: !post.userBookmarked }
            : post
        ),
      }));
    } catch (error) {
      console.error(
        `[usePostStore: 북마크 토글 실패] PostId: ${postId}`,
        error
      );
      throw error;
    }
  },
}));
