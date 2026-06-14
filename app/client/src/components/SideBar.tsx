import React from "react";
import { nav } from "../data/dashboard";
import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";

import { useNavigate } from "react-router-dom";

import { useDispatch } from "react-redux";
import { logout } from "../redux/userSlice";

// Sidebar navigation panel with logout action
const SideBar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Log out user by clearing stored auth data and redirecting to login
  const handleLogout = () => {
    const isConfirmed = confirm("Are you sure you want to logout?");

    if (isConfirmed) {
      setTimeout(() => {
        localStorage.removeItem("token");
        dispatch(logout());
        navigate("/login");
      }, 2000);
    }
  };
  return (
    <div className="flex flex-col gap-6 glass-panel w-full p-6 rounded-[32px] shadow-2xl h-[calc(100vh-140px)] animate-fade-in relative z-10">
      <div className="flex flex-col gap-2 flex-1">
        <p className="px-4 text-[10px] font-black uppercase tracking-widest text-theme-text-muted mb-2">Main Menu</p>
        {nav.map((x, i) => (
          <Link to={x.path} key={i}>
            <div className="flex gap-4 h-[60px] items-center px-5 rounded-[20px] transition-all duration-500 cursor-pointer group hover:bg-theme-accent hover:translate-x-3 shadow-sm hover:shadow-theme-accent/30 bg-theme-input/20 border border-theme-divider hover:border-transparent">
              <span className="text-theme-accent group-hover:text-white transition-all duration-300 transform group-hover:scale-110">
                {<x.name size={22} />}
              </span>
              <h3 className="font-bold text-sm text-theme-text group-hover:text-white transition-colors">
                {x.label}
              </h3>
            </div>
          </Link>
        ))}
      </div>

      <div className="pt-4 border-t border-theme-divider">
        <div
          onClick={handleLogout}
          className="flex gap-4 h-[60px] items-center px-5 rounded-[20px] bg-rose-500/10 border border-rose-500/20 transition-all duration-500 cursor-pointer group hover:bg-rose-500 hover:translate-x-3 shadow-sm hover:shadow-rose-500/30"
        >
          <span className="text-rose-500 group-hover:text-white transition-all duration-300">
            <LogOut size={22} />
          </span>
          <h3 className="font-bold text-sm text-rose-500 group-hover:text-white transition-colors">
            Logout
          </h3>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
