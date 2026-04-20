import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import axios from "axios";
import { Camera } from "lucide-react";
import { API_URL } from "../config/config";
import { useNavigate } from "react-router-dom";
import { showToast } from "../utils/toast";

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Registration page for creating a new user account

const Register = () => {
  //Schema validation

  const validationSchema = yup.object({
    firstName: yup.string().required("First Name is required"),
    lastName: yup.string(),
    email: yup
      .string()
      .email("Invalid email format")
      .required("Email is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords must match")
      .required("Confirm Password is required"),
  });

  const navigate = useNavigate();
  // image uploading
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Preview and store the selected registration avatar image
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  // Submit registration data and create a new user account
  const handleRegister = async (values: RegisterFormValues) => {
    try {
      const formData = new FormData();
      formData.append("firstName", values.firstName);
      formData.append("lastName", values.lastName || "");
      formData.append("email", values.email);
      formData.append("password", values.password);
      if (imageFile) {
        formData.append("avatar", imageFile);
      }

      const response = await axios.post(`${API_URL}/register`, formData);

      if (response.status === 200 || response.status === 201) {
        showToast.success("Account created successfully!");
        navigate("/login");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      showToast.error(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    }
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-theme-accent/20 rounded-full blur-[120px] animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-blob [animation-delay:2s]"></div>

      <header className="fixed top-0 left-0 w-full p-8 z-50">
        <h1 className="text-2xl font-black tracking-tighter text-gradient">
          ConnectHub
        </h1>
      </header>

      <main
        data-aos="zoom-in"
        className="glass-panel w-full max-w-[500px] p-10 rounded-[40px] shadow-premium relative z-10 my-20"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black tracking-tight mb-2">
            Join the Network
          </h2>
          <p className="text-theme-text-muted font-bold text-sm uppercase tracking-widest">
            Create your digital identity
          </p>
        </div>

        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={validationSchema}
          onSubmit={handleRegister}
        >
          <Form className="flex flex-col gap-6">
            {/* Avatar Section */}
            <div className="flex justify-center mb-4">
              <label className="relative group cursor-pointer">
                <div
                  className={`h-28 w-28 rounded-[32px] border-2 border-dashed border-theme-accent/50 flex flex-col items-center justify-center overflow-hidden transition-all duration-500 group-hover:border-theme-accent group-hover:bg-theme-accent/10 ${image ? "border-solid border-theme-accent shadow-lg shadow-theme-accent/20" : ""}`}
                >
                  {image ? (
                    <img
                      src={image}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <Camera
                        className="text-theme-accent opacity-50 mb-1"
                        size={24}
                      />
                      <span className="text-[8px] font-black uppercase tracking-widest text-theme-text-muted">
                        Profile
                      </span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="hidden"
                />
                <div className="absolute -bottom-2 -right-2 bg-theme-accent text-white p-2 rounded-xl shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                  <Camera size={14} />
                </div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-text-muted ml-1">
                  First Name
                </label>
                <Field
                  type="text"
                  placeholder="First"
                  name="firstName"
                  className="w-full bg-theme-input/40 border border-theme-border p-3.5 rounded-2xl focus:ring-2 focus:ring-theme-accent/50 focus:outline-none text-theme-text transition-all duration-300 font-bold placeholder:text-theme-text-muted/40"
                />
                <ErrorMessage
                  name="firstName"
                  component="div"
                  className="text-rose-500 text-[8px] font-black uppercase tracking-widest mt-1 ml-1"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-text-muted ml-1">
                  Last Name
                </label>
                <Field
                  type="text"
                  placeholder="Last"
                  name="lastName"
                  className="w-full bg-theme-input/40 border border-theme-border p-3.5 rounded-2xl focus:ring-2 focus:ring-theme-accent/50 focus:outline-none text-theme-text transition-all duration-300 font-bold placeholder:text-theme-text-muted/40"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-text-muted ml-1">
                Email
              </label>
              <Field
                type="text"
                placeholder="Enter your email"
                name="email"
                className="w-full bg-theme-input/40 border border-theme-border p-3.5 rounded-2xl focus:ring-2 focus:ring-theme-accent/50 focus:outline-none text-theme-text transition-all duration-300 font-bold placeholder:text-theme-text-muted/40"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-rose-500 text-[8px] font-black uppercase tracking-widest mt-1 ml-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-text-muted ml-1">
                  Password
                </label>
                <Field
                  type="password"
                  placeholder="••••••••"
                  name="password"
                  className="w-full bg-theme-input/40 border border-theme-border p-3.5 rounded-2xl focus:ring-2 focus:ring-theme-accent/50 focus:outline-none text-theme-text transition-all duration-300 font-bold placeholder:text-theme-text-muted/40"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-rose-500 text-[8px] font-black uppercase tracking-widest mt-1 ml-1"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-text-muted ml-1">
                  Confirm Password
                </label>
                <Field
                  type="password"
                  placeholder="••••••••"
                  name="confirmPassword"
                  className="w-full bg-theme-input/40 border border-theme-border p-3.5 rounded-2xl focus:ring-2 focus:ring-theme-accent/50 focus:outline-none text-theme-text transition-all duration-300 font-bold placeholder:text-theme-text-muted/40"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-rose-500 text-[8px] font-black uppercase tracking-widest mt-1 ml-1"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-theme-accent to-indigo-600 text-white rounded-2xl font-black tracking-widest uppercase text-xs shadow-lg shadow-theme-accent/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 mt-4"
            >
              Register
            </button>

            <p className="text-center text-xs font-bold text-theme-text-muted mt-2">
              Already have account?{" "}
              <Link
                to="/login"
                className="text-theme-accent hover:underline decoration-2 underline-offset-4"
              >
                Login
              </Link>
            </p>
          </Form>
        </Formik>
      </main>
    </div>
  );
};

export default Register;
