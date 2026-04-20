import React, { useState } from "react";
import { Button, Avatar, IconButton } from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import api from "../services/api";
import { showToast } from "../utils/toast";
import { useNavigate } from "react-router-dom";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";
import Header from "../components/Header";
import SideBar from "../components/SideBar";

import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import type { User } from "../types";

interface CreatePostFormValues {
  caption: string;
}

// Create post page for composing and submitting a new post
// Create post page for composing and submitting a new post
const CreatePost = () => {
  const emptyUser: User = {};
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const user = useSelector((state: RootState) => state.user.user) ?? emptyUser;

  const validationSchema = Yup.object({
    caption: Yup.string().required("Caption is required"),
  });
  // Preview the uploaded image for the new post

  // Preview the uploaded image for the new post
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
    // Submit the new post form and upload the post to the server
  };

  // Submit the new post form and upload the post to the server
  const handleSubmit = async (values: CreatePostFormValues) => {
    try {
      const formData = new FormData();
      formData.append("caption", values.caption);
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
        showToast.success("Post shared successfully!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      showToast.error("Failed to share post. Please try again.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-theme-bg overflow-x-hidden">
      <Header />
      <div className="flex max-w-[1400px] mx-auto mt-8 px-4 gap-8">
        <aside className="w-[280px] hidden xl:block shrink-0">
          <SideBar />
        </aside>

        <main className="flex-1 pb-20 mt-10">
          <div 
            data-aos="zoom-in"
            className="glass-panel max-w-5xl mx-auto rounded-[40px] overflow-hidden flex flex-col md:flex-row shadow-premium border-none relative group"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-theme-accent/10 rounded-full blur-[100px] pointer-events-none transition-all duration-1000 group-hover:bg-theme-accent/20"></div>

            {/* Image Section */}
            <div className="w-full md:w-1/2 min-h-[400px] md:h-auto flex items-center justify-center bg-theme-input/20 border-r border-theme-divider relative overflow-hidden">
              {imagePreview ? (
                <div className="relative w-full h-full animate-fade-in group/preview">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/preview:opacity-100 transition-opacity"></div>
                  <IconButton
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    className="absolute top-6 right-6 bg-black/60 hover:bg-rose-500 text-white transition-all duration-300 scale-100 group-hover/preview:scale-110"
                    sx={{ color: 'white', backgroundColor: 'rgba(0,0,0,0.5)' }}
                  >
                    <CloseIcon />
                  </IconButton>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 p-10 text-center animate-fade-in">
                  <input
                    accept="image/*"
                    style={{ display: "none" }}
                    id="icon-button-file"
                    type="file"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="icon-button-file">
                    <div className="w-24 h-24 rounded-[32px] bg-theme-accent/10 border-2 border-dashed border-theme-accent/50 flex items-center justify-center cursor-pointer hover:bg-theme-accent/20 hover:border-theme-accent transition-all duration-500 group/icon active:scale-90">
                      <PhotoCamera sx={{ fontSize: 40, color: 'var(--theme-accent)' }} className="group-hover/icon:rotate-12 transition-transform" />
                    </div>
                  </label>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-theme-text mb-1 uppercase tracking-widest text-xs">Upload Image</h3>
                    <p className="text-theme-text-muted text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Upload your transmission</p>
                  </div>
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 p-10 flex flex-col bg-theme-input/10 backdrop-blur-md">
              <Formik
                initialValues={{ caption: "" }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, isValid, values }) => (
                  <Form className="h-full flex flex-col">
                    <header className="flex justify-between items-center mb-12">
                      <h1 className="text-2xl font-black tracking-tighter text-gradient">
                        Broadcast New Signal
                      </h1>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting || !isValid || !imagePreview}
                        sx={{
                          background: 'linear-gradient(135deg, var(--theme-accent) 0%, #4c1d95 100%)',
                          borderRadius: '16px',
                          color: 'white',
                          px: 4,
                          py: 1.2,
                          fontWeight: 'black',
                          textTransform: 'none',
                          fontSize: '14px',
                          letterSpacing: '0.05em',
                          boxShadow: '0 10px 15px -3px var(--theme-accent-glow)',
                          "&:hover": { 
                            transform: 'translateY(-2px)',
                            boxShadow: '0 15px 20px -3px var(--theme-accent-glow)',
                            background: 'linear-gradient(135deg, var(--theme-accent-hover) 0%, var(--theme-accent) 100%)',
                          },
                          "&:disabled": {
                            background: 'rgba(255,255,255,0.05)',
                            color: 'rgba(255,255,255,0.2)',
                          },
                          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                      >
                        {isSubmitting ? "Posting..." : "Post"}
                      </Button>
                    </header>

                    <div className="flex-1 flex flex-col gap-8">
                      <div className="flex items-center gap-5 p-4 rounded-3xl bg-theme-input/20 border border-theme-border/50">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-theme-accent to-indigo-600 flex items-center justify-center text-white font-black overflow-hidden shadow-lg">
                          {user.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl">{user.firstName?.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <h2 className="text-sm font-black text-theme-text uppercase tracking-tight">
                            {user.firstName || "Explorer"} {user.lastName || ""}
                          </h2>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-theme-text-muted opacity-50">Signal Active</span>
                          </div>
                        </div>
                      </div>

                      <div className="relative flex-1">
                        <Field
                          as="textarea"
                          name="caption"
                          placeholder="Message here..."
                          className="w-full h-full min-h-[300px] bg-transparent border-none text-theme-text text-lg focus:ring-0 resize-none font-bold placeholder:text-theme-text-muted/30 p-2 custom-scrollbar transition-all duration-300"
                        />
                        <div className="absolute bottom-4 right-4 text-[10px] font-black uppercase tracking-widest text-theme-text-muted opacity-30">
                          {values.caption.length} Characters
                        </div>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreatePost;
