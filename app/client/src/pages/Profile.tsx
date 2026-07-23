import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import {
  User,
  MessageCircle,
  Mail,
  Camera,
  Heart,
  Users,
  UserPlus,
  UserMinus,
} from "lucide-react";
import Header from "../components/Header";
import SideBar from "../components/SideBar";
import api from "../services/api";
import { showToast } from "../utils/toast";

import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import type { AppDispatch, RootState } from "../redux/store";
import type { ContactItem, PostItem, User as UserType } from "../types";

interface ProfileStats {
  postCount: number;
  followers: number;
  following: number;
  posts: PostItem[];
}

interface FriendsData {
  followers: ContactItem[];
  following: ContactItem[];
}

interface EditData {
  firstName: string;
  lastName: string;
  bio: string;
}

// Profile page showing user details, friends, and edit actions
const Profile = () => {
  // Trigger avatar file chooser for profile image upload
  const openAvatarPicker = () => {
    const input = document.getElementById("avatar-upload");
    if (input instanceof HTMLInputElement) {
      input.click();
    }
  };
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const emptyUser: UserType = {};
  const loggedInUser =
    useSelector((state: RootState) => state.user.user) ?? emptyUser;
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(
    !id || id === loggedInUser._id,
  );
  const [isFollowing, setIsFollowing] = useState(false);
  const [open, setOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [galleryTab, setGalleryTab] = useState("posts");
  const [savedPosts, setSavedPosts] = useState<PostItem[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState<ProfileStats>({
    postCount: 0,
    followers: 0,
    following: 0,
    posts: [],
  });

  const [friendsData, setFriendsData] = useState<FriendsData>({
    followers: [],
    following: [],
  });

  const [editData, setEditData] = useState<EditData>({
    firstName: "",
    lastName: "",
    bio: "",
  });

  // Get saved posts for the logged-in user
  const fetchSavedPosts = async () => {
    try {
      const response = await api.get(`/posts/saved/${loggedInUser._id}`);
      const saved: PostItem[] = response.data.posts || [];
      setSavedPosts(saved);
    } catch (err) {
      console.error("Error fetching saved posts:", err);
    }
  };

  // Load profile and stats for either the current or selected user
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      if (isOwnProfile) {
        // Fetch own profile stats using email (current pattern)
        const response = await api.get(
          `/profile/stats?email=${loggedInUser.email}`,
        );
        setStats(response.data);
        setProfileUser(loggedInUser);
        setEditData({
          firstName: loggedInUser.firstName || "",
          lastName: loggedInUser.lastName || "",
          bio: loggedInUser.bio || "",
        });
        fetchSavedPosts(); // Fetch saved posts for own profile
      } else {
        // Fetch other user profile by ID
        const response = await api.get(`/profile/${id}`);
        const data = response.data;
        setProfileUser(data.user);
        setStats({
          postCount: data.postCount,
          followers: data.followers,
          following: data.following,
          posts: data.posts,
        });

        // Check if following
        await api.get(`/register?exclude=`); // We need a way to check following status
        // Optimized way: get local user's following list
        const myStats = await api.get(
          `/register?exclude=null&search=${loggedInUser.email}`,
        );
        const followingList = myStats.data.following || [];
        setIsFollowing(followingList.includes(data.user.email));
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsOwnProfile(!id || id === loggedInUser._id);
  }, [id, loggedInUser._id]);

  useEffect(() => {
    fetchProfileData();
  }, [id, isOwnProfile]);

  // Follow or unfollow the profile user
  const handleFollow = async () => {
    if (!profileUser?.email) return;
    try {
      const response = await api.post(`/register/follow`, {
        followerEmail: loggedInUser.email,
        followingEmail: profileUser.email,
      });
      setIsFollowing(response.data.following);
      setStats((prev: ProfileStats) => ({
        ...prev,
        followers: response.data.following
          ? prev.followers + 1
          : prev.followers - 1,
      }));
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  // Navigate to chat with the profile user
  const handleMessage = () => {
    navigate("/chat", { state: { selectedUser: profileUser } });
  };

  // Load the profile user's friends and followers list
  const fetchFriends = async () => {
    if (!profileUser?.email) return;
    try {
      const response = await api.get(
        `/profile/friends?email=${profileUser.email}`,
      );
      setFriendsData(response.data);
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  };

  // Open the profile edit dialog
  const handleOpen = () => setOpen(true);

  // Open the friends dialog and fetch friend data
  const handleFriendsOpen = () => {
    fetchFriends();
    setFriendsOpen(true);
  };
  // Close the profile edit modal and reset avatar selection
  const handleClose = () => {
    setOpen(false);
    setAvatarFile(null);
  };

  // Update edit form state when input values change  };

  // Update edit form state when input values change
  // Save selected avatar image file for upload
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEditData({ ...editData, [e.target.name]: e.target.value });
  // Save selected avatar image file for upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      // Persist updated profile details and avatar to the server
    }
  };

  // Persist updated profile details and avatar to the server
  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("firstName", editData.firstName);
      formData.append("lastName", editData.lastName);
      formData.append("bio", editData.bio);
      if (avatarFile) formData.append("avatar", avatarFile);

      const response = await api.put(`/profile/${loggedInUser._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.user) {
        const updatedUser = response.data.user;
        setProfileUser(updatedUser);
        dispatch(setUser(updatedUser));
        handleClose();
        showToast.success("Profile updated successfully!");
      }
    } catch (err) {
      console.error(err);
      showToast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profileUser)
    return (
      <div className="w-full h-screen app-shell flex items-center justify-center text-theme-text">
        Loading Profile...
      </div>
    );
  if (!profileUser)
    return (
      <div className="w-full h-screen app-shell flex items-center justify-center text-theme-text">
        User not found
      </div>
    );

  return (
    <div className="w-full min-h-screen app-shell overflow-x-hidden">
      <Header />
      <div className="flex w-full mt-[40px] gap-8">
        <aside className="w-[15%] ml-[60px] hidden xl:block shrink-0">
          <SideBar />
        </aside>

        <main className="flex-1">
          <div className="max-w-5xl mx-auto pb-20">
            {/* Profile Header Panel */}
            <div className="glass-panel p-10 rounded-[40px] shadow-premium mb-10 animate-fade-in relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-theme-accent/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors duration-500 group-hover:bg-theme-accent/10"></div>

              <div className="flex flex-col md:flex-row items-center md:items-start gap-12 relative z-10">
                <div className="shrink-0">
                  <div className="relative group/avatar">
                    <div className="h-44 w-44 rounded-[32px] bg-gradient-to-br from-theme-accent to-indigo-600 flex items-center justify-center text-6xl font-black border-4 border-white/10 shadow-2xl overflow-hidden transform group-hover/avatar:scale-105 transition-transform duration-500">
                      {profileUser.avatar ? (
                        <img
                          src={profileUser.avatar}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-white drop-shadow-lg">
                          {profileUser.firstName?.charAt(0) || "U"}
                        </span>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-2xl border-4 border-[#0f172a] shadow-lg animate-pulse"></div>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                    <h1 className="text-4xl font-black tracking-tight drop-shadow-sm">
                      {profileUser.firstName} {profileUser.lastName}
                    </h1>
                    <span className="px-4 py-1.5 bg-theme-accent/20 border border-theme-accent/30 rounded-xl text-[10px] font-black tracking-[0.2em] text-theme-accent uppercase">
                      {isOwnProfile ? "Core Identity" : "Identity Verified"}
                    </span>
                  </div>

                  <p className="text-theme-text-muted flex items-center justify-center md:justify-start gap-2 mb-8 font-bold text-sm bg-theme-input/40 py-2 px-4 rounded-xl w-fit">
                    <Mail size={16} className="text-theme-accent" />{" "}
                    {profileUser.email}
                  </p>

                  <div className="flex flex-wrap justify-center md:justify-start gap-10 mb-10">
                    <div className="text-center group/stat cursor-pointer">
                      <p className="text-3xl font-black group-hover:text-theme-accent transition-colors duration-300">
                        {stats.postCount}
                      </p>
                      <p className="text-[10px] font-black text-theme-text-muted uppercase tracking-[0.2em]">
                        Memories
                      </p>
                    </div>
                    <div
                      className="text-center group/stat cursor-pointer"
                      onClick={handleFriendsOpen}
                    >
                      <p className="text-3xl font-black group-hover:text-theme-accent transition-colors duration-300">
                        {stats.followers}
                      </p>
                      <p className="text-[10px] font-black text-theme-text-muted uppercase tracking-[0.2em]">
                        Followers
                      </p>
                    </div>
                    <div
                      className="text-center group/stat cursor-pointer"
                      onClick={handleFriendsOpen}
                    >
                      <p className="text-3xl font-black group-hover:text-theme-accent transition-colors duration-300">
                        {stats.following}
                      </p>
                      <p className="text-[10px] font-black text-theme-text-muted uppercase tracking-[0.2em]">
                        Following
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    {isOwnProfile ? (
                      <>
                        <button
                          onClick={handleOpen}
                          className="px-8 py-3.5 bg-theme-accent text-white rounded-2xl font-black tracking-tight shadow-lg shadow-theme-accent/20 hover:scale-105 transition-all duration-300 hover:shadow-theme-accent/40 active:scale-95 text-sm"
                        >
                          Modify Space
                        </button>
                        <button
                          onClick={handleFriendsOpen}
                          className="px-8 py-3.5 bg-theme-card glass-pressable text-theme-text rounded-2xl font-black tracking-tight transition-all duration-300 flex items-center gap-2 text-sm"
                        >
                          <Users className="w-4 h-4" />
                          Network
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleFollow}
                          className={`px-10 py-3.5 rounded-2xl font-black tracking-tight transition-all duration-500 shadow-lg text-sm active:scale-95 ${isFollowing ? "bg-theme-input text-theme-text-muted border border-theme-border" : "bg-theme-accent text-white shadow-theme-accent/20 hover:shadow-theme-accent/40 hover:scale-105"}`}
                        >
                          {isFollowing ? "Connected" : "Connect"}
                        </button>
                        <button
                          onClick={handleMessage}
                          className="px-8 py-3.5 bg-emerald-500 text-white rounded-2xl font-black tracking-tight shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all duration-300 hover:shadow-emerald-500/40 flex items-center gap-2 active:scale-95 text-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Bridge
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About & Gallery Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <div className="glass-panel p-8 rounded-[32px] shadow-premium sticky top-[0px]">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-theme-text-muted">
                    About
                  </h3>
                  <div className="bg-theme-input/40 p-5 rounded-2xl border border-theme-divider">
                    <p className="text-theme-text-secondary leading-relaxed text-sm font-bold">
                      {profileUser.bio ||
                        "This identity explorer hasn't broadcasted their bio yet."}
                    </p>
                  </div>

                  <div className="mt-8 pt-8 border-t border-theme-divider">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-theme-text-muted">
                      Digital footprint
                    </h4>
                    <p className="text-[10px] text-theme-text-muted font-bold">
                       Active since 2026
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="glass-panel p-8 rounded-[32px] shadow-premium h-fit">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-black tracking-tight">
                      {isOwnProfile ? "Personalized Feed" : "Shared Memories"}
                    </h3>
                    {isOwnProfile && (
                      <div className="flex gap-1.5 bg-theme-input/40 p-1.5 rounded-2xl border border-theme-border shadow-inner">
                        <button
                          onClick={() => setGalleryTab("posts")}
                          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${galleryTab === "posts" ? "bg-theme-accent text-white shadow-lg" : "text-theme-text-muted hover:text-white"}`}
                        >
                          Stream
                        </button>
                        <button
                          onClick={() => setGalleryTab("saved")}
                          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${galleryTab === "saved" ? "bg-theme-accent text-white shadow-lg" : "text-theme-text-muted hover:text-white"}`}
                        >
                          Archived
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(galleryTab === "posts" ? stats.posts : savedPosts)
                      .length > 0 ? (
                      (galleryTab === "posts" ? stats.posts : savedPosts).map(
                        (post: PostItem, i: number) => (
                          <div
                            key={i}
                            className="group flex flex-col glass-panel rounded-3xl border-transparent hover:border-theme-accent/30 overflow-hidden transition-all duration-500 hover:shadow-premium animate-fade-in"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          >
                            <div className="aspect-square overflow-hidden relative">
                              <img
                                src={post.image}
                                alt="post"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                                <div className="flex gap-4">
                                  <div className="flex items-center gap-1.5 text-white">
                                    <Heart
                                      size={16}
                                      className="fill-rose-500 text-rose-500"
                                    />
                                    <span className="text-xs font-black">
                                      {post.likes?.length || 0}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-white">
                                    <MessageCircle
                                      size={16}
                                      className="fill-theme-accent text-theme-accent"
                                    />
                                    <span className="text-xs font-black">
                                      {post.comments?.length || 0}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="p-4 bg-theme-input/20">
                              {post.caption && (
                                <p className="text-xs text-theme-text-secondary font-bold line-clamp-2 leading-relaxed">
                                  {post.caption}
                                </p>
                              )}
                            </div>
                          </div>
                        ),
                      )
                    ) : (
                      <div className="col-span-full text-center py-20 bg-theme-input/20 rounded-3xl border border-dashed border-theme-border">
                        <Camera className="w-12 h-12 text-theme-text-muted mx-auto mb-4 opacity-40" />
                        <p className="text-theme-text-muted font-bold text-sm italic">
                          {galleryTab === "posts"
                            ? "No streams broadcasted yet."
                            : "No archives found in this space."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Profile Modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "var(--theme-card-bg)",
            color: "var(--theme-text)",
            borderRadius: "24px",
            border: "1px solid var(--theme-border)",
            padding: "12px",
          },
        }}
      >
        <DialogTitle sx={{ fontSize: "24px", fontWeight: "bold" }}>
          Edit Profile
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <div
                className="relative group cursor-pointer"
                onClick={openAvatarPicker}
              >
                <div className="h-32 w-32 rounded-full border-4 border-theme-accent overflow-hidden bg-theme-bg flex items-center justify-center transition-all group-hover:brightness-50 shadow-xl">
                  {avatarFile ? (
                    <img
                      src={URL.createObjectURL(avatarFile)}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : profileUser.avatar ? (
                    <img
                      src={profileUser.avatar}
                      alt="Current"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-4xl text-theme-text-muted font-bold">
                      {profileUser.firstName?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={32} className="text-white" />
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="First Name"
                name="firstName"
                value={editData.firstName}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{
                  style: { color: "var(--theme-text-muted)" },
                }}
                inputProps={{ style: { color: "var(--theme-text)" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "var(--theme-border)" },
                    "&:hover fieldset": { borderColor: "var(--theme-accent)" },
                  },
                }}
              />
              <TextField
                label="Last Name"
                name="lastName"
                value={editData.lastName}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{
                  style: { color: "var(--theme-text-muted)" },
                }}
                inputProps={{ style: { color: "var(--theme-text)" } }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "var(--theme-border)" },
                    "&:hover fieldset": { borderColor: "var(--theme-accent)" },
                  },
                }}
              />
            </Box>
            <TextField
              label="Bio"
              name="bio"
              value={editData.bio}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              InputLabelProps={{ style: { color: "var(--theme-text-muted)" } }}
              inputProps={{ style: { color: "var(--theme-text)" } }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "var(--theme-border)" },
                  "&:hover fieldset": { borderColor: "var(--theme-accent)" },
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={handleClose}
            disabled={loading}
            sx={{ color: "black", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            variant="contained"
            sx={{
              bgcolor: "var(--theme-accent)",
              color: "white",
              textTransform: "none",
              px: 4,
              borderRadius: "12px",
              fontWeight: "bold",
              "&:hover": { bgcolor: "var(--theme-accent-hover)" },
            }}
          >
            {loading ? "Updating..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Friends Modal */}
      <Dialog
        open={friendsOpen}
        onClose={() => setFriendsOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "var(--theme-card-bg)",
            color: "var(--theme-text)",
            borderRadius: "24px",
            border: "1px solid var(--theme-border)",
          },
        }}
      >
        <DialogTitle sx={{ p: 0 }}>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            variant="fullWidth"
            sx={{
              "& .MuiTabs-indicator": { bgcolor: "var(--theme-accent)" },
              "& .MuiTab-root": {
                color: "var(--theme-text-muted)",
                textTransform: "none",
                fontSize: "16px",
                py: 2,
              },
              "& .Mui-selected": { color: "var(--theme-accent) !important" },
            }}
          >
            <Tab label={`Followers (${stats.followers || 0})`} />
            <Tab label={`Following (${stats.following || 0})`} />
          </Tabs>
        </DialogTitle>
        <DialogContent sx={{ minHeight: "300px", p: 2 }}>
          <List>
            {(tabValue === 0 ? friendsData.followers : friendsData.following)
              .length > 0 ? (
              (tabValue === 0
                ? friendsData.followers
                : friendsData.following
              ).map((friend: ContactItem, idx: number) => (
                <ListItem
                  key={idx}
                  sx={{ px: 0, cursor: "pointer" }}
                  onClick={() => {
                    navigate(`/profile/${friend._id}`);
                    setFriendsOpen(false);
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={friend.avatar}
                      sx={{ bgcolor: "var(--theme-accent)", color: "black" }}
                    >
                      {friend.firstName?.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${friend.firstName} ${friend.lastName}`}
                    secondary={friend.email}
                    primaryTypographyProps={{
                      sx: { color: "var(--theme-text)", fontWeight: "bold" },
                    }}
                    secondaryTypographyProps={{
                      sx: {
                        color: "var(--theme-text-muted)",
                        fontSize: "12px",
                      },
                    }}
                  />
                </ListItem>
              ))
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  mt: 8,
                  opacity: 0.5,
                }}
              >
                <Users size={48} />
                <p className="mt-2">No data yet</p>
              </Box>
            )}
          </List>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
