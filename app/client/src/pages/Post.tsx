import React, { useState, useEffect } from "react";
import { MessageCircle, Heart, Share2, Bookmark, Trash2 } from "lucide-react";
import api from "../services/api";
import { showToast } from "../utils/toast";
import CommentModal from "../components/CommentModal";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import type { CommentItem, PostItem, User } from "../types";

// Card component to display a single post and its actions
interface PostCardProps {
  post: PostItem;
  onPostDeleted?: (postId: string) => void;
}

// Post card that renders post details, likes, comments, and save/delete actions
function PostCard({ post, onPostDeleted }: PostCardProps) {
  const emptyUser: User = {};
  const user = useSelector((state: RootState) => state.user.user) ?? emptyUser;
  const [likes, setLikes] = useState<string[]>(post?.likes || []);
  const [comments, setComments] = useState<CommentItem[]>(post?.comments || []);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  if (!post) return null;

  const { authorName, authorId, caption, image, createdAt, _id, userId } = post;
  const [isSaved, setIsSaved] = useState(false);
  const timeAgo = createdAt
    ? new Date(createdAt).toLocaleDateString()
    : "Just now";
  const isLiked = likes.includes(user.email || "");

  // Check if post is saved by the user on mount
  useEffect(() => {
    // Verify whether the current user has saved this post
    const checkSaved = async () => {
      if (user._id && _id) {
        try {
          const response = await api.get(`/posts/saved/${user._id}`);
          const savedPosts = response.data.posts || [];
          const typedSavedPosts: PostItem[] = savedPosts;
          setIsSaved(typedSavedPosts.some((p: PostItem) => p._id === _id));
        } catch (error) {
          console.error("Error checking saved status:", error);
        }
      }
    };
    checkSaved();
  }, [_id, user._id]);

  // Toggle like status for this post and update the UI
  const handleLike = async () => {
    if (!_id || !user.email) return;

    // Optimistic UI update
    const newLikes = isLiked
      ? likes.filter((id: string) => id !== user.email)
      : [...likes, user.email];
    setLikes(newLikes);

    try {
      const response = await api.put(`/posts/${_id}/like`, {
        userId: user.email,
      });
      if (response.data.likes) {
        setLikes(response.data.likes);
      }
    } catch (error) {
      console.error("Error liking post:", error);
      setLikes(likes); // Revert on error
    }
  };

  // Delete the post and refresh the feed or fallback to reload
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/posts/${_id}`);
      if (onPostDeleted) onPostDeleted(_id || "");
      else window.location.reload(); // Fallback
      showToast.success("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
      showToast.error("Failed to delete post");
    }
  };

  // Save or unsave the post for the current user
  const handleSave = async () => {
    if (!_id || !user._id) return;
    try {
      const response = await api.post(`/posts/save`, {
        userId: user._id,
        postId: _id,
      });
      setIsSaved(response.data.saved);
    } catch (error) {
      console.error("Error saving post:", error);
    }
  };

  return (
    <div className="glass-panel rounded-[32px] overflow-hidden mb-10 shadow-premium transition-all duration-500 hover:border-theme-accent/40 w-full max-w-[600px] min-w-[600px] h-[650px] flex flex-col animate-fade-in group">
      <div className="p-7">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link
              to={userId ? `/profile/${userId}` : "/profile"}
              className="h-12 w-12 rounded-2xl bg-gradient-to-br from-theme-accent to-indigo-600 flex items-center justify-center text-white font-black shadow-lg transform group-hover:rotate-6 transition-transform duration-500"
            >
              {authorName ? (
                <span className="text-lg">{authorName.charAt(0)}</span>
              ) : (
                <span className="text-lg">U</span>
              )}
            </Link>
            <div>
              <Link
                to={userId ? `/profile/${userId}` : "/profile"}
                className="font-black text-theme-text hover:text-theme-accent transition-colors text-sm tracking-tight"
              >
                {authorName || "Anonymous Explorer"}
              </Link>
              <p className="text-[10px] text-theme-text-muted font-black uppercase tracking-[0.2em] opacity-80">
                {timeAgo}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {(userId === user._id || authorId === user.email) && (
              <button
                onClick={handleDelete}
                className="text-theme-text-muted hover:text-rose-500 transition-all duration-300 p-2.5 rounded-xl hover:bg-rose-500/10 active:scale-90"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        {caption && (
          <p className="text-theme-text-secondary text-sm leading-relaxed mb-4 font-medium tracking-tight line-clamp-2 min-h-[40px]">
            {caption}
          </p>
        )}

        {image && (
          <div className="rounded-[24px] overflow-hidden border border-theme-border flex-1 mb-6 bg-theme-input/40 relative group/img min-h-[400px] max-h-[400px]">
            <img
              src={image}
              alt="Post content"
              className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500"></div>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-theme-divider">
          <div className="flex gap-8">
            <div
              className="flex items-center gap-2.5 cursor-pointer group/stat p-2 rounded-xl hover:bg-theme-accent/10 transition-all duration-300"
              onClick={handleLike}
            >
              <Heart
                size={22}
                className={`${isLiked ? "fill-rose-500 text-rose-500" : "text-theme-text-muted group-hover/stat:text-rose-500"} transition-all active:scale-150 duration-300`}
              />
              {likes.length > 0 && (
                <span className="text-xs font-black text-theme-text-muted group-hover/stat:text-rose-500">
                  {likes.length}
                </span>
              )}
            </div>
            <div
              className="flex items-center gap-2.5 cursor-pointer group/stat p-2 rounded-xl hover:bg-theme-accent/10 transition-all duration-300"
              onClick={() => setIsCommentModalOpen(true)}
            >
              <MessageCircle
                size={22}
                className="text-theme-text-muted group-hover/stat:text-theme-accent transition-all active:scale-150 duration-300"
              />
              {comments.length > 0 && (
                <span className="text-xs font-black text-theme-text-muted group-hover/stat:text-theme-accent">
                  {comments.length}
                </span>
              )}
            </div>
            <div className="p-2 rounded-xl hover:bg-theme-accent/10 transition-all duration-300 cursor-pointer group/stat">
               <Share2
                size={22}
                className="text-theme-text-muted group-hover/stat:text-emerald-500 transition-all active:scale-150 duration-300"
               />
            </div>
          </div>
          <div className="cursor-pointer group/save p-2 rounded-xl hover:bg-theme-accent/10 transition-all duration-300" onClick={handleSave}>
            <Bookmark
              size={22}
              className={`${isSaved ? "fill-theme-accent text-theme-accent" : "text-theme-text-muted group-hover/save:text-theme-accent"} transition-all active:scale-150 duration-300`}
            />
          </div>
        </div>
      </div>

      <CommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        postId={_id || ""}
        existingComments={comments}
        onCommentAdded={(newComments: CommentItem[]) =>
          setComments(newComments)
        }
      />
    </div>
  );
}

export default PostCard;
