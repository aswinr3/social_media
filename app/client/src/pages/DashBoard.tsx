import React, { useState, useEffect } from "react";
import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
  Card,
  CardContent,
  Divider,
  CircularProgress,
} from "@mui/material";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import SideBar from "../components/SideBar";
import PostCard from "./Post";
import api from "../services/api";
import { showToast } from "../utils/toast";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import type { ContactItem, PostItem, User } from "../types";

// Dashboard page showing the feed, create-post box, and suggestions

const DashBoard = () => {
  const emptyUser: User = {};
  // selector
  const user = useSelector((state: RootState) => state.user.user) ?? emptyUser;
  // navigate
  const navigate = useNavigate();
  // UseState
  const [value, setValue] = useState("");
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [connections, setConnections] = useState<ContactItem[]>([]);
  const [isLoadingConnections, setIsLoadingConnections] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [followingList, setFollowingList] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  // Update the post input text when the user types

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  // Preview the selected image for a new post
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Send a new dashboard post to the server
  const handlePost = async () => {
    if (!value && !imagePreview) {
      showToast.error("Please enter some text or select an image");
      return;
    }

    setIsPosting(true);
    try {
      const formData = new FormData();
      formData.append("caption", value);
      formData.append(
        "authorName",
        `${user.firstName || "User"} ${user.lastName || ""}`,
      );
      formData.append("authorId", user.email || "user123");
      formData.append("userId", user._id || "");

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await api.post(`/posts`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201 || response.status === 200) {
        setValue(""); // Reset Description
        setImagePreview(null); // Reset ImagePreview
        setImageFile(null); // Reset Image
        getPost(); // Refresh feed
        showToast.success("Post created successfully!");
      }
    } catch (error) {
      console.error("Error creating dashboard post:", error);
      showToast.error("Failed to create post. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  // Load feed posts for the dashboard
  const getPost = async () => {
    try {
      const response = await api.get(`/posts`);
      const fetchedPosts: PostItem[] = response.data.posts || [];
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // Fetch initial data

  useEffect(() => {
    getPost();
    // Fetch suggested connections and following status
    getConnections();
  }, []);

  const getConnections = async () => {
    setIsLoadingConnections(true);

    try {
      const response = await api.get(`/register?exclude=${user.email}`);
      const users: ContactItem[] = response.data.users || [];
      const following: string[] = response.data.following || [];
      setConnections(users); // check the user profile
      setFollowingList(following); // listing the following list
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      // Toggle following state for a suggested user
      setIsLoadingConnections(false);
    }
  };

  // Toggle following state for a suggested user
  const handleFollow = async (targetEmail: string) => {
    try {
      const response = await api.post(`/register/follow`, {
        followerEmail: user.email,
        followingEmail: targetEmail,
      });

      if (response.data.following) {
        setFollowingList([...followingList, targetEmail]);
      } else {
        setFollowingList(
          followingList.filter((email: string) => email !== targetEmail),
        );
      }
    } catch (error: any) {
      console.error("Error toggling follow:", error);
    }
  };

  return (
    <div className="w-full h-screen app-shell overflow-hidden flex flex-col">
      <Header />

      <div className="flex flex-1 w-full mt-[40px] gap-6 overflow-hidden">
        {/* Left Sidebar - Standalone Pinned */}
        <aside className="w-[15%] ml-[60px] shrink-0 hidden xl:block h-full">
          <SideBar />
        </aside>

        {/* Center Feed - Independent Scroll */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto custom-scrollbar pb-20">
          <div className="w-full max-w-[600px] mx-auto">
            {/* Create Post Section */}
            <div className="glass-panel p-6 rounded-[32px] mb-10 animate-fade-in shadow-premium border-none relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-theme-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="flex gap-5 items-start mb-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-theme-accent to-indigo-600 flex items-center justify-center font-bold text-white shrink-0 shadow-lg relative overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xl">
                      {user.firstName ? user.firstName.charAt(0) : "U"}
                    </span>
                  )}
                  <div className="bg-emerald-500 w-3 h-3 rounded-full absolute bottom-0 right-0 border-2 border-theme-bg"></div>
                </div>

                <div className="flex-1 flex flex-col gap-4">
                  <textarea
                    onChange={handleChange}
                    value={value}
                    placeholder="Share something interesting..."
                    className="w-full bg-theme-input/40 backdrop-blur-sm border border-theme-border p-4 rounded-2xl focus:ring-2 focus:ring-theme-accent/30 focus:outline-none text-theme-text resize-none transition-all duration-300 min-h-[100px]"
                  />

                  {imagePreview && (
                    <div className="relative w-full max-h-[400px] overflow-hidden rounded-[24px] border border-theme-border shadow-2xl animate-fade-in">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-contain bg-black/40"
                      />
                      <button
                        onClick={() => setImagePreview(null)}
                        className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-full hover:bg-rose-500 transition-all duration-300 hover:scale-110"
                      >
                        <svg
                          xmlns="http://www.w3.org/2001/XMLSchema-instance"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-5 border-t border-theme-divider">
                <div className="flex gap-4">
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="dashboard-post-image"
                    type="file"
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor="dashboard-post-image"
                    className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-theme-input/40 text-theme-text-secondary hover:bg-theme-accent hover:text-white transition-all duration-500 cursor-pointer font-bold text-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2001/XMLSchema"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                    <span>Gallery</span>
                  </label>
                </div>

                <Button
                  onClick={handlePost}
                  variant="contained"
                  disabled={(!value && !imagePreview) || isPosting}
                  sx={{
                    background:
                      "linear-gradient(135deg, var(--theme-accent) 0%, #4c1d95 100%)",
                    borderRadius: "16px",
                    color: "white",
                    px: 4,
                    py: 1.2,
                    fontWeight: "bold",
                    textTransform: "none",
                    boxShadow: "0 10px 15px -3px var(--theme-accent-glow)",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 15px 20px -3px var(--theme-accent-glow)",
                    },
                    "&:disabled": {
                      background: "rgba(255,255,255,0.05)",
                      color: "rgba(255,255,255,0.2)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  {isPosting ? "Posting..." : "Post"}
                </Button>
              </div>
            </div>

            {/* Feed Section */}
            <div className="flex flex-col gap-8 justify-center items-center">
              {posts.length > 0 ? (
                posts.map((post: PostItem, index: number) => (
                  <div key={post._id || index}>
                    <PostCard
                      post={post}
                      onPostDeleted={(deletedId: string) => {
                        setPosts(
                          posts.filter((p: PostItem) => p._id !== deletedId),
                        );
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="w-full glass-panel p-12 text-center rounded-[32px]">
                  <div className="w-20 h-20 bg-theme-input/40 rounded-full flex items-center justify-center mx-auto mb-6 text-theme-accent">
                    <svg
                      xmlns="http://www.w3.org/2001/XMLSchema-instance"
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <line x1="10" y1="9" x2="8" y2="9"></line>
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold mb-2">Silence is golden?</h2>
                  <p className="text-theme-text-muted">
                    But sharing is better. Be the first to post something
                    amazing!
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        <aside className="w-[320px] shrink-0 hidden lg:block sticky top-0 h-fit z-20 mr-[200px]">
          <div
            className={`glass-panel rounded-[32px] overflow-hidden shadow-premium border-none transition-all duration-700 ease-in-out ${isExpanded ? "h-[calc(100vh-140px)]" : "h-[400px]"}`}
          >
            <div className="p-6 pb-2 border-b border-theme-divider">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-black uppercase tracking-widest bg-gradient-to-r from-theme-accent to-theme-accent-hover bg-clip-text text-transparent">
                  Network
                </h3>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="px-3 py-1.5 rounded-xl bg-theme-accent/10 border border-theme-accent/20 text-[10px] font-black uppercase tracking-widest text-theme-accent hover:bg-theme-accent hover:text-white transition-all duration-300 active:scale-95 shadow-lg shadow-theme-accent/5"
                >
                  {isExpanded ? "Minimize" : "See All"}
                </button>
              </div>
            </div>

            <div
              className={`overflow-y-auto custom-scrollbar  px-2 ${isExpanded ? "max-h-[calc(100vh-280px)]" : "max-h-[280px]"}`}
            >
              {isLoadingConnections ? (
                <div className="flex flex-col items-center justify-center p-12 gap-4">
                  <CircularProgress
                    size={40}
                    thickness={5}
                    sx={{ color: "var(--theme-accent)" }}
                  />
                  <p className="text-xs font-bold text-theme-text-muted animate-pulse">
                    Syncing data...
                  </p>
                </div>
              ) : (
                <div className="p-2 flex flex-col gap-1">
                  {connections.length > 0 ? (
                    connections.map((conn: ContactItem, index: number) => {
                      const isFollowing = followingList.includes(
                        conn.email || "",
                      );
                      return (
                        <div
                          key={conn._id || index}
                          onClick={() =>
                            navigate(
                              conn._id ? `/profile/${conn._id}` : "/profile",
                            )
                          }
                          className="flex items-center gap-4 p-3 rounded-2xl hover:bg-theme-accent/10 transition-all duration-300 cursor-pointer group border border-transparent hover:border-theme-divider"
                        >
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-theme-accent to-indigo-600 flex items-center justify-center font-bold text-white shrink-0 shadow-md transform group-hover:scale-110 transition-transform duration-300">
                            {conn.avatar ? (
                              <img
                                src={conn.avatar}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{conn.firstName?.charAt(0)}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm truncate group-hover:text-theme-accent transition-colors">
                              {conn.firstName} {conn.lastName}
                            </h4>
                            <p className="text-[10px] text-theme-text-muted font-bold truncate">
                              @{conn.email?.split("@")[0]}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFollow(conn.email || "");
                            }}
                            className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all duration-300 ${isFollowing ? "bg-theme-input text-theme-text-muted" : "bg-theme-accent text-white hover:scale-105 shadow-lg shadow-theme-accent/20"}`}
                          >
                            {isFollowing ? "Following" : "Follow"}
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-theme-text-muted text-sm italic">
                      No explorers found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DashBoard;
