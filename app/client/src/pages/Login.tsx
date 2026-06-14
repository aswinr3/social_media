import React from "react";
import { Link } from "react-router-dom";
import LoginButton from "../components/LoginButton";
import { Formik, ErrorMessage, Field, Form } from "formik";
import * as yup from "yup";
import axios from "axios";
import { API_URL } from "../config/config";
import { useNavigate } from "react-router-dom";
import { showToast } from "../utils/toast";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import type { AppDispatch } from "../redux/store";

interface LoginFormValues {
  email: string;
  password: string;
}

// Login page component for user authentication
// Login page component for user authentication
const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const schemaValidation = yup.object({
    email: yup.string().email("invalid Email").required("Email is required"),
    password: yup.string().required("Password is required"),
  });
  // Authenticate the user and store auth state on success

  // Authenticate the user and store auth state on success
  const handleLogin = async (values: LoginFormValues) => {
    try {
      const response = await axios.post(`${API_URL}/login`, values);
      if (response.status === 200 && response.data.user) {
        localStorage.setItem("token", response.data.token);
        dispatch(setUser(response.data.user));
        showToast.success("Login successful!");
        navigate("/dashboard");
      } else {
        showToast.error(response.data.message || "Login failed");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      showToast.error(
        err.response?.data?.message || "Invalid credentials. Please try again.",
      );
    }
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-theme-accent/20 rounded-full blur-[120px] animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-blob [animation-delay:2s]"></div>

      <header className="fixed top-0 left-0 w-full p-8 z-50">
        <h1 className="text-2xl font-black tracking-tighter text-gradient">
          ConnectHub
        </h1>
      </header>

      <main 
        data-aos="zoom-in"
        className="glass-panel w-full max-w-[450px] p-10 rounded-[40px] shadow-premium relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-theme-accent to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-theme-accent/20 transform -rotate-6">
            <h1 className="text-2xl font-black text-white">C</h1>
          </div>
          <h2 className="text-3xl font-black tracking-tight mb-2">Welcome Back</h2>
          <p className="text-theme-text-muted font-bold text-sm uppercase tracking-widest">
            Identity verification required
          </p>
        </div>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={schemaValidation}
          onSubmit={handleLogin}
        >
          <Form className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-text-muted ml-1"
              >
                Access ID (Email)
              </label>
              <Field
                type="email"
                id="email"
                placeholder="Enter your Email"
                name="email"
                className="w-full bg-theme-input/40 border border-theme-border p-4 rounded-2xl focus:ring-2 focus:ring-theme-accent/50 focus:outline-none text-theme-text transition-all duration-300 font-bold placeholder:text-theme-text-muted/40"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label 
                htmlFor="password" 
                className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-text-muted ml-1"
              >
                Password
              </label>
              <Field
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                className="w-full bg-theme-input/40 border border-theme-border p-4 rounded-2xl focus:ring-2 focus:ring-theme-accent/50 focus:outline-none text-theme-text transition-all duration-300 font-bold placeholder:text-theme-text-muted/40"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1"
              />
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  id="remember-me" 
                  className="w-4 h-4 rounded border-theme-border bg-theme-input focus:ring-theme-accent text-theme-accent" 
                />
                <span className="text-xs font-bold text-theme-text-muted group-hover:text-theme-text transition-colors">
                  Stay Connected
                </span>
              </label>
              <Link to="/" className="text-xs font-bold text-theme-accent hover:text-white transition-colors">
                Reset Keys?
              </Link>
            </div>

            <button 
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-theme-accent to-indigo-600 text-white rounded-2xl font-black tracking-widest uppercase text-xs shadow-lg shadow-theme-accent/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 mt-4"
            >
              Login
            </button>

            <p className="text-center text-xs font-bold text-theme-text-muted mt-4">
              New Explorer?{" "}
              <Link
                to="/"
                className="text-theme-accent hover:underline decoration-2 underline-offset-4"
              >
                Register
              </Link>
            </p>
          </Form>
        </Formik>
      </main>
    </div>  );
};

export default Login;
