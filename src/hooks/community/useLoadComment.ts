import { useQuery } from "@tanstack/react-query";
import { fetchCommentsByPost } from "../../api/community/comment";

export const useLoadCommentsByPostId = (postId: string) => {
  return useQuery({
    queryKey: ["comments", postId],
    queryFn: () => fetchCommentsByPost(postId),
  });
};
